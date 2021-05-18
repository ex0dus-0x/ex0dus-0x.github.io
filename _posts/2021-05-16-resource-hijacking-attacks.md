---
title: An Excursion into AWS S3 Resource Hijacking Attacks
date: 2021-05-16
layout: post
tags:
- security
- web
- cloud
---

I did some independent bughunting work for a vendor, and wanted to highlight a particular set of attacks that affected components of their cloud infrastructure, specifically AWS S3, and how it was (mis)configured for adversarial takeovers and data exfiltration. These vulnerabilities are definitely not novel, but its always refreshing to highlight the importance of testing for inoperability between cloud vendors and their clients, and the type of security issues that arise as part of any security assessment.

The result of this security research was the creation of a Golang-based tool, [slamdunk](https://github.com/ex0dus-0x/slamdunk), which automates asset discovery for cloud storage buckets, and employing heuristics for detecting potential misconfigurations across them. We'll use it a bit throughout this post to demonstrate its efficacy in helping with the web/cloud-app hacking process.

### #1: Bucket Takeover

This is a simple and often low-severity attack, falling within the broader subcategory of subdomain takeovers, which often occurs when an organization conducts some type of en-masse infrastructure migration, deprecation or are undergoing acquisition.

If you're familiar with subdomain takeovers, the premise is simple: a vendor leaves dangling CNAME records for one of their subdomain to a S3 bucket, which has since been taken down. As a result, when visiting the actual subdomain, we see the following XML response:

![/assets/img/posts/AWSNoSuchBucket.png](/assets/img/posts/AWSNoSuchBucket.png)

The XML response luckily gives us the bucket name, and we need to check the CNAME record itself to see the specific region, as that's an important part of the final S3 URL as well. Many vendors will use a CDN / reverse proxy like AWS Cloudfront to serve content, which will also conveniently hide the original S3 URL:

```
$ dig +nocmd <SUB>.<VENDOR>.com cname +noall +answer
<SUB>.<VENDOR>.com.            3555    IN      CNAME   abcxyz.cloudfront.net.
```

so you may have do a little educated guessing to figure it out. Many bucket instances I've seen is typically in the `us-east-*` and `us-west-*` regions. Once you've figured out the name and region and have successfully squatted the bucket, revisiting the subdomain will change to a `AccessDenied` error in the XML response:

![/assets/img/posts/AWSDenied.png](/assets/img/posts/AWSDenied.png)

If you were operating under an offensive/red-team context, the impact of impersonating the subdomain as something else can be somewhat severe:

- Executing the usual phishing tactics for credential and sensitive info theft.
- Using the buckets as storage repositories for malware, or locations to store exfiltrated information, as detection agents might gloss over a GET request to somewhere like `[static.example.com/something_innocent](http://static.example.com/something_innocent)` as inconspicuous.

Given an aggregated list of subdomains from a host, we can throw them against slamdunk's resolver component, which will first fingerprint it to be a known cloud bucket, and then test for the presence of the `NoSuchBucket` identifier to validate that its indeed vulnerable to this takeover variant. For convenience, you can run slamdunk either against a single or couple URLs with `--url`, and/or a whole file of URLs with `--file`, as I've done against the vendor here:

![/assets/img/posts/resolver.png](/assets/img/posts/resolver.png)

Since the particular vendor I was testing was slowly migrating away from S3, I was able to see several instances of subdomains left behind, and instantly squatted the bucket names. slamdunk is also very useful for identifying bucket names from the given URLs, which can then be used to test for further vulnerabilities.

### #2. Open Read and Write

Storage buckets managed by S3 are gated through bucket and object permission policies and ACLs (which are considered depreciated, so we won't touch it as much), which describe how access is granted to other user entities. One classical set of vulnerabilities to look for is the capability to access and/or modify the contents of the buckets openly without being apart of the AWS organization that grants you that access.

These sets of techniques have slowly started to fade out over the years as AWS themselves have adapted their security measures to remind organizations to restrict access tightly and enforce zero-trust. However, I still wanted to touch base on this, especially with how slamdunk can automate the discovery of these bugs for you to further triage and exploit:

### Open Read

This is pretty simple, where you are able to actually to list the objects within a bucket when you are an unauthenticated user, or an authenticated user not associated with the organization hosting the asset. This is associated with the `ListObjects` and `GetObject` permissions, being inadvertently granted to anonymous users. A bucket policy that allows for this type of behavior may look like the following:

```json
{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Sid":"PublicRead",
      "Effect":"Allow",

      # don't do this!!!
      "Principal": "*",

      # allow ALL to list and get objects in the specific resource
      "Action":["s3:Listobjects","s3:GetObject"],

      # AWS Resource Names (ARNs) identify the asset we're configuring
      "Resource":["arn:aws:s3:::my-bucket/*"]
    }
  ]
}
```

When finding open buckets that you can read, pay attention to resources that leak some type of sensitive information, like credentials, or assets that belong to other users you shouldn't be able to touch. Stuff relating to source code and configurations are also interesting for further escalation, such as dotfiles like `.git*` resources, or `.env` files with secrets and other sensitive envvars.

For the given vendor under test, I was able to find one instance of this, but disclosed nothing of significance to report.

### Write/Upload

The severity of this attack depends on the scope set by the vendor, and also the underlying context its being executed under, so it may very much end up being low-impact. In the case where you can openly read AND also write to the bucket, that's highly detrimental, as you're able to actually modify content you shouldn't be able to, hence a high-impact variant of stored XSS, or even RCE if a site is being served with client-side logic.

In most instances, this will not be the case. One thing you can pay attention to is how resources are being uploaded and rendered to S3, such as profile picture or document uploads, where a presigned URL is (hopefully) created on their server-side, and used to upload the actual file to the bucket. A lack of strict `Content-Type` checks can lead to arbitrary content being served back to the user.

An example can be seen here with in the Burp Suite window, where a request is modified in transit to showcase how an arbitrary HTML and JS file replaces a profile picture upload that doesn't enforce strict content type checking.

Unfortunately this disclosure was labeled as informational, since the profile picture upload didn't actually serve the arbitrary contents' filetype. Nevertheless, still something to look out for in the future for potential instances of stored XSS attacks.

---

With all that said, slamdunk helps test for these misconfigured permissions, alongside a bunch of other permissions that may allow you to recon and enumerate further components of the bucket that the owner may not intend to. Simply provide a bucket name or multiple names, and/or a file with names, and slamdunk will by default test for read-based permissions, with additional options to provide if you wish to test for write-based permissions. Note that testing for write-based permissions may potentially modify the contents and behavior of the buckets, and should be done with discretion and after validating what read-based permissions are available. For example, using `[flaws.cloud](http://flaws.cloud)` as a smoke test reveals only one read-based permission, which is `ListObjects`:

![/assets/img/posts/auditor.png](/assets/img/posts/auditor.png)

### #3. IAM Privilege Escalation

I've mentioned that storage solutions and other cloud resources are managed through resource-based policies, and there are also IAM (Identity Access Management) policies that can be implemented that attach to *principals*, which are the different types of identities that can exist within an organization. These can exist as different types of users, like your root account, a service account your root creates for an application, or federated users authorized from another provider. There are also *roles,* which provide temporary access to an identity with elevated privileges, which can be escalated from any user. We'll come back to this in a bit, and see how this is done exactly.

A really nice diagram that showcases how IAM principals and resources all interact can be seen from AWS here:

![/assets/img/posts/AWS_IAM.png](/assets/img/posts/AWS_IAM.png)

All principals require AWS IAM credentials to be generated for them, which can then be hosted somewhere to provide interaction access with the cloud assets when needed. When configuring your AWS CLI, you would first had to retrieve access keys for your root account, and then add them to your config, often `~/.aws/credentials`.

In any case where there is an exposure of AWS IAM credentials, which comprises of a AWS key ID and access key, this provides a great opportunity to test for privilege escalation, which can be incredibly devastating if the identity-based permissions you enumerated turns out to actually affect sensitive internal cloud resources.

In my case, the vendor I was testing was serving an internal service on S3 that they were attempting to hide behind with enterprise SSO (single-sign on). I was able to parse out the webpage and its contents before it redirected to the SSO provider with a simple `wget` on the HTML and the JS resources:

```bash
$ wget <SUB>.<VENDOR>.com/index.html
$ wget <SUB>.<VENDOR>.com/static/js/main.5266c519.js
```

It was noted that the particular vendor was serving React on the client-side, but also incorporated S3 credentials as `REACT_APP_` constants, which are meant to be server-side environmental variables. Hmmm....

Through Burp Suite, I was able to observe that they were making a call using these credentials to the Amazon Security Token Service, specifically invoking `AssumeRole`:

![/assets/img/posts/burp.png](/assets/img/posts/burp.png)

This is basically equivalent to the following CLI call:

```bash
# first, add the leaked credentials as a new profile to ~/.aws/credentials,
# say, to `hacked`. We can then use it to do...
$ aws --profile hacked sts assume-role --role-arn arn:aws:iam::<NUM>:role/<USERNAME> --role-session-name s3Session
```

As mentioned, roles are like temporary identities a user can take upon for a set period of time to perform a set of operations, which start with `ASIA` as part of their access key, rather than the traditional `AKIA` string for user-based key. Through `AssumeRole`, the users get a new set of credentials plus a temporary token with a set expiration time, and they can use it as part of a new profile to access resources and perform operations they were normally unable to.

With this new role and its new credentials also added to `~/.aws/credentials`, we can enumerate its read/write permissions with slamdunk using its auditor component, but this time with `--list`, which we can now use to see exactly what bucket resources we have access to with our new profile:

![/assets/img/posts/creds.png](/assets/img/posts/creds.png)

Woah. Not only do we have open read and write access to the same bucket that was hosting the internal service, but a bunch of other ones that were storing sensitive logs, and *other* internal services! We can confirm with AWS CLI:

![/assets/img/posts/AWS_ls.png](/assets/img/posts/AWS_ls.png)

As a proof-of-concept, I uploaded a test file to staging bucket of the service to demonstrate impact.

Getting access to the buckets and being able to completely modify their contents is huge, but also further triaging for other IAM permissions for lateral movement across resources and privilege escalation is a huge plus. The `[enumerate-iam.py](http://enumerate-iam.py)` script is really nifty in helping this for initial triaging, but for more comprehensive exploitation, the [pacu](https://github.com/RhinoSecurityLabs/pacu) tool is especially useful given its nice selection of modules that can be tested against multiple cloud resources.

## Conclusion

Bucket storage solutions are nice targets for web/cloud pentesting and offensive security. Not only do insecured buckets lead to unintended information disclosure, but also create opportunities for takeovers by
adversaries in scaled campaigns against the host organization. Finding these vulnerabilities and escalating them are definitely not novel, but it's always fun to find them across large organizations and do fun
writeups like this.

### Timeline

2021-04-21 - Reported several S3-related vulnerabilities to the vendor.

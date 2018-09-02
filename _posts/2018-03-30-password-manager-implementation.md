---
title: Thoughts on a Password Manager Implementation
date: 2018-03-30 00:00:00 Z
layout: post
---

After getting much more into distributed systems and blockchains, I wondered about how we can build a new password management system for the modern user, with a focus on _security_, _portability_, _scalability_, and _integrity_.
<!--more-->

### Definitions

I will be using several key points throughout this post, so here is what we will assuming in the context of writing:

__security__ - where a password manager implements encryption standards that have proven not to be broken, or at least mitigate attacks

__portability__ - the ability for a manager to extend its release such that the user is able to access their keys with convenience

__integrity__ - the developers of the manager make sure that your sensitive data is not misused and ensures that others can't either.

__scalability__ - like portability, but in the sense where it is able to extend upon its storage of sensitive hashes without risking the other key points

## Problems with Current Password Management Systems

Today, most password managers are built either at the application-level or the web-level. We have already seen a ton of problems with web-based managers, such as the infamous [LastPass](https://www.theverge.com/2017/3/22/15023062/lastpass-security-flaw-passwords). Web-based managers such as LastPass are built with the intent of convenience, enabling users to store their keys, and get back to it on another device. However, since user keys are stored on one __centralized__ data center, there is no fault-tolerance when encountering security breaches and exploits. Even though we see aspects of _portability_, and _scalability_ (addition of new servers, addition of features, etc.), there is no _security_ or _integrity_, which is crucial when handling actual passwords.

Such issues then turn users towards application-based managers, with the most popular include __KeePass__ (and its variants), we see the opposite: while KeePass does implement [_security_](https://keepass.info/help/base/security.html), _scalability_ (as many passwords as you want) and _integrity_ (I mean, these ARE standalone applications that DON'T require network access), they don't have _portability_, which is key in the modern era. In order for a user to access a `.kdbx` (and other variants) database file, they MUST have KeePass installed on a device. This means that if a user stores passwords to a database, store it in a trusted server, retrieve it on another host, they must have a KeePass client to open it. And when you have tons of keys stored, it can be heavy.

## Questions to Address

1. How can we implement a manager that works hand-in-hand with distributed systems, such that one central host isn't holding and controlling your data?
2. Can we extend this manager, such that we are able to open-source it, create clients that work with database files?
3. How can we ensure that our sensitive database files remain intact during the chain of delivering data through the Internet?
4. And will this manager still uphold the same amount of security as modern pre-existing password managers?

## Ghostpass

Introducing Ghostpass, an implementation of a password manager I thought of a while ago. Ghostpass yearns to be an open-sourced password manager that takes sensitive passwords and create an inconspicuous database file. This database file will appear as if it was plaintext, relying on a document-key corpus file (i.e _The Adventures of Sherlock Homes.txt_) through (Markov chains)[https://github.com/linenoise/asemica]. Of course, the database file will undergo encryption through `base64` padding, and AES-256, before, as well as other fun stuff. The database file and corpus file is then placed onto [IPFS](https://ipfs.io/), ensuring that the server hosting the data is not malicious. Clients, whether it be an app, webapp, or CLI script, can decrypt it at ease through the IPFS gateway address.

Here is the process (still a rough design) of how Ghostpass would be implemented:

1. User obtains a client (i.e command line tool).
2. User obtains a document key (i.e a copy of _Dr. Strange and Mr. Hyde_ in `.txt`)
3. User supplies passwords and sensitive information to the client.
4. User seals the plaintext with a master password. The client encrypts the plaintext in AES-256 in CBC mode. The client incorporates padding and splicing as needed, and  The client utilizes Markov chains on the document key to create the final ciphertext.
5. The client distributes both the document key and the ciphertext onto IPFS. The gateway address is returned, and the user saves it.
6. User goes on vacation. Does not bring computer, and needs a password immediately. User goes onto open-sourced Ghostpass webapp client, supplies IPFS address, supplies his/her master password, and gets a copy of his information in cleartext, formatted and ready to use.

If the IPFS gateway is compromised, the attacker may be able to decrypt the ciphertext with the document key, but still has to face the challenge of decrypting the added layer of AES-256 encryption.

I'm not the best at cryptography, and certainly not that proficient at designing systems and protocols. If you have any questions or improvements you may suggestion, please send them my way!

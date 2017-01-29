---
layout:     post
comments:		true
title:      "Why You Should Switch to Linux"
subtitle:   "Exposing Windows"
date:       2016-11-03 12:00:00
author:     "ex0dus"
header-img: "img/PostBG/post-bg-13.jpg"
---

Windows and Mac OS X are both the most utilized operating system today. We see that there are benefits and disadvantages in using both (especially Windows) and how Linux (or a Linux-based distribution) closes these gaps. I will also bust some myths and legends that surround this operating system and how it operates.

# Windows vs OS X
Many hackers and programmers alike are quite despiteful towards Windows. Privacy enthusiasts and paranoid hacktivists all look at Windows as one of NSA's puppets [(click here to learn more)](www.privacytools.io). Many developers and coders I've met don't really enjoy using the Windows Command Prompt, especially for compiling and debugging. It's hard to diagnose DLL errors, and to some, they simply don't like Window's feel or look or its incorporation with a bunch of pre-installed BS software on a fresh boot. If you are a security expert, you should have a nice big book of the history of exploits that have devastated Windows. And on top of that, an avid computer builder can't appreciate a free copy of Windows without piracy.

OS X solves to eliminate a few of these problems, but not all. With __[Homebrew](http://brew.sh/)__ and Xcode, OS X is great for development. However, when we look at development, OS X is the ONLY platform where you can develop for iOS. Sure, Swift and Xcode can be ported to Ubuntu, but without a jailbreak (for unsigned applications) on iOS you can't really do much except for the learn native and vanilla Swift. And with Steve job's original design philosophy, we can see the uniquity of the Macbook and OS X, meaning that without some piracy and virtualization, OS X is not open source and free and available to everyone. Even if you do manage to virtualize Apple, SDKs for iOS development [aren't free](https://developer.apple.com/).

# My Experience
I've been an avid Windows user for the first half of my life. Later on, I would discover an operating system known as Ubuntu. It seemed as a very aesthetic operating system, and it was being praised as a very user-friendly operating system not only for developers, but anybody. Trying out the OS, I've found it to become a __very__ pleasurable experience. Soon, I've become adept with command line, finding it not so difficult to learn and navigate. In fact, I've later looked at the graphical interface as sometimes bothersome, installing i3 as a Windows Manager. Who needs mice?

I'm currently running Kali Linux rolling, Linux Kernel v4.6 (plz don't exploit me with Dirty Cow). How did I find out? `uname -a`. I didn't go into Control Panel and then navigate to find out my system information. One command. Simplistic.

What about my network interfaces? `ifconfig`. CPU info? `lscpu`. Block device info? `lsblk`. Don't know how `lsblk` works? `man lsblk`. The list goes on.

# What Linux is and how it functions
__MYTH #1:__ When people often refer to Linux, they may think of it as one standard operating system. Like you would need to download an ISO file called "Linux.iso", burn it onto a CD, and boot off it.

Linux can't be defined as an operating system fully. It is the name of the __kernel__ that the operating system would use. Many people, whether independent or commerical, would create "flavors", or more commonly known, distributions based off the Linux kernel. That's why a more orthodox term would be "linux-based distro" rather than just Linux. Each distribution has its own perks, desktops, features, programs, as well as differing purposes. Kali is for pentesting, CentOS is commonly for servers, etc. The two most widely known Linux-based distros are __Ubuntu__ and __Debian__. If you observe other less-popular distros, you would find that many of them look and have near-exact features as those two. In fact, Kali is __based__ off of Debian. The graphical user interface, without any themes or change, looks exactly like Debian. Some other operating systems, such as __elementary OS__, which I've reviewed, also has resemblance with Ubuntu.

__MYTH #2:__ "How much is Linux?"

Linux was started off as a pet project by Linus Torvalds. In fact, this OS was never meant to become as large as it is today, as it was just a community project. Linux is __completely__ free and open-source. There are books out there for Linux kernel development, since you can download the kernel right off the Internet.

Another thing, if you are an Android user, guess what, you're using Linux :)

__MYTH #3:__ Linux is for h4x0rs and programmers.

True to an extent. There are many distros out there that are designed to be friendly to an average Windows/OS X user wanting to make a switch. There are those out there that are not even meant to be a regular user OS, such as Kali (I got flamed several times on Reddit and Stackexchange).

However, I view the operating system in a much more philosophical manner. Throughout the years I've developed and wrote code on Linux, I've gotten a much deeper understanding of low-level programming, and how the kernel works in terms of run-time and compile-time code execution and debugging. Linux comes with many programming languages installed, and even if it doesn't have, `apt` and `yum` are great friends to make. With my introduction to Linux, I've been more accustomed to consistent errors, and I've developed a much more keen intuition and problem-solving ability in order to solve them. Also, my WPM score has skyrocketed :)

And if you __ARE__ a developer like me, you don't need no large commercial IDE. You can write code within your distro's notepad applications. Yes, syntax highlighting, whitespace, etc is ALL supported. Maybe you're a little more serious. Atom (which I'm using right now), Brackets, Sublime Text, etc can be installed in a snap. Git is there for you, and if you like GUIs, [Gitkraken](https://www.gitkraken.com/) can comfort you. Linux is a great for server work, especially with CentOS, Ubuntu Server, or FreeBSD. The command line is your friend and always there for you.

__MYTH #4:__ Linux is too hard to install

Yes, it looks very intimidating. Partitioning, stupid UEFI, etc. With the abundant amount of YouTube videos, guides, tutorials, I'm sure its not gonna be very hard.

And jokes aside, installing or even just putting Linux on a USB or a virtualization application can attribute a lot to your knowledge in tech. I've learned quite a lot through research.

![](http://imgur.com/hbmvZRb.png)

# The Vices of Linux
Well, it is important to look at some of Linux's bads. There are a few that I would like to highlight.

* Some of your favorite applications have no Linux ports
* Even if you use Wine virtualization, some Windows applications are unstable as hell.
* Your favorite games may not all work on Linux.
* Your hardware may choke.
* Consistent updates!!
* It's easy to kill yourself. Let me show you. Type: `rm -rf /` in a Terminal.
* Not a default OS choice for popular computer brands. __[(However, System76 has created some neat Ubuntu machines)](https://system76.com/https://system76.com/)__
* If you downloaded Flash, you're a dumbass.

But hey, here's an even longer list of virtues:

* Secure. Show me the PoC of a past exploit. (let's forget Dirty Cow). I bet there's a lot. But with system updates and just regular standard user precautions, you shouldn't even have to download an AV.
* Deployment to a web server? Application? A simple hello world python script? EZ.
* Soooo many themes and desktop environments to choose from!!! __[/r/unixporn](reddit.com/r/unixporn)__
* Need to rescue your OS (e.g forgot yo password)? There are Linux CDs for that!
* Be a pro h4x0r
* Be a pro codar or programmar
* IoT and embedded devices w/ Linux (e.g Rasp Pi) = home automation, robots, media centers, retro gaming machines, etc!
* Wanna make your own distro? Well the kernel's there, so... no stoppin you.
* Firefox or Iceweasel as default browser > Internet Explorer :)
* Hey, no PRISM, Fourteen Eyes, Big Brother here to government-D0x you.

Thanks for reading! Hopefully, this provided some inspiration to learn or make the switch to a Linux-based distro, or even consider the hazards of utilizing Windows as an operating system.

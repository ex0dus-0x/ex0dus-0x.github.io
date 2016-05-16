---
layout:     post
comments:   true
title:      "Elementary OS: Replacement for Windows and OS X"
subtitle:   "...or nah????"
date:       2016-04-30 12:00:00
author:     "ex0dus"
header-img: "img/PostBG/post-bg-09.jpg"
---

I'm always interested in looking at creative and primitive Linux distros, such as the simplistic <b>Elementary OS</b>. Looking at the picture of the website:

<img src="/img/Elementary/elementaryos.png">

it seems to show off a GNOME environment. That is where you are wrong. Instead of using <b>GNOME</b>, the new OS introduces the <b>Pantheon</b> desktop environment. The latest release is currently "Freya". A lot of mythical references.

Let's take a look at this interested distro. Although quite primitive, it is starting to quite shape up, and is starting to become quite popular among Linux enthusiasts. It is being praised for its simplicity, and its user-friendliness. With Elementary OS comes the arrival of a built-in photo library application, and iTunes-like music player, video player, and <b>Midori</b>, which is the fast & lightweight web browser. <

<h2>Let's get into action!</h2>

First, download Elementary OS from the website, <a href="https://elementary.io"><b>here</b></a>. It is a 1.15 GB download for the latest version, <b>Freya</b>. It is free, but you can still donate to help keep the project going. It comes as an ISO.

Next after you download it, lets get working. We have two options. One you can physically boot it off a USB. That's not very hard, so let's get to the part if you are just experimenting with it. I'll talk about QEMU and KVM.

<b>QEMU</b> and <b>KVM</b> (Kernel Virtual Machine) are software that both are involved in virtualization. In short, they are emulators, just like VMware and Virtualbox <a href="http://serverfault.com/questions/208693/difference-between-kvm-and-qemu"><b>(Read more here</b></a>). In the past, we have looked at them, with the <b>Redox</b> OS, written in Rust. Let's get into a little more detail now.

For me, using standalone QEMU to emulate the ISO, using this command:
<pre>$ qemu-system-x86_64 -boot d -cdrom elementaryos-0.3.2-stable-amd64.20151209.iso -m 512</pre>
yields this:
<img src = "/img/Elementary/acpifailed.png">

I have went online and attempted to fix this problem, which apparently has something to do with a driver. However, the solutions I came across only apply to the GRUB bootloader, which is not present in QEMU.

So let's actually install a working GUI known as <b>Virtual Machine Manager </b>that allows us to actually create a virtual machine. We can do so by executing:

<pre>sudo apt-get install qemu-kvm libvirt-bin bridge-utils virt-manager</pre>

We will get <b>QEMU-KVM</b>, which is the package that comes with KVM for the virtualization of different processors. Also comes with <b>Virtual Machine Manager</b> and its many libraries.

After installation, let us start the service for the Virtual Machine Manager:
<pre>$ /etc/init.d/libvirtd start </pre>

After starting the service, we are presented with this:
<img src="/img/Elementary/vmmanager.png">
I have already created my VM, but the process is like so:

Click the <b>"Create a new Virtual Machine"</b> icon
<img src="/img/Elementary/start.png">

Select <b>"Local install media (ISO image or CDROM"</b>.
<img src="/img/Elementary/1of5.png">

Select the ISO image, which is usually in <b>~/Downloads</b>.
<img src="/img/Elementary/2of5.png">

Click <b>Browse</b>, and <b>Browse Local</b>. Go to the ~/Downloads directory and select the ISO image.

Step 3 of 5 asks for the allocation of RAM and number of CPUs to use. I left it as it was.
Step 4 of 5 asks for the creation of a disk image. Leave it as it is, unless you want to allocate a different number for space for the disk image. The default is 20GB, but I allocated only 10GB, since I was just experimenting.
Step 5 asks you to name it. I named it "Elementary OS".

Click <b>"Finish"</b> and you got your OS. Start it up.

<img src="/img/Elementary/elementarykvm.png">

<h2> The Verdict </h2>

Very nice. Again, not only does the OS run smoothly, it is as it has advertised: <i>simple</i>.

Of course, Elementary is currently running on a VM. Therefore, I am unable to actually monitor the system processes, to truly tell if it is lightweight or not. However, let us look at the aesthetics of the OS.

We have a standard Terminal, with bash and aptitude. What else is interesting is the fact that Elementary comes with the Software Center, just like Ubuntu. This is great, especially for the average computer user looking to make that switch from Windows or OS X to a Linux distro. Many compilers and interpreters for programming are also included, which is pretty awrsome for the avid developer. Even if something you want isn't here, Elementary includes Ubuntu repositories, so the packages you need are not impossible to get.

<img src="/img/Elementary/softcent.png">

Midori, the web browser, works very well. It is very Safari-like, but is much faster in performance and again, <i>simple</i>. However, the only setback I found was the fact that Midori did not come with the encoder that allowed YouTube videos to run. Many modern web browsers come with this, especially since YouTube does not require Flash.

Overall, I really like Elementary OS. A lot of people are starting to recognize it, and it is starting to become quite popular, and people are making the switch. The Pantheon desktop environment, despite primitive, is starting to make its mark. The multitasking view, the application menu, all have a GNOME-like feel, but in the end, Pantheon still diverts from the large conglomerate environment known as GNOME.

Elementary OS, at this time, has not yet reached their first version. Although it is starting off as a pioneer and an "alternative" to your modern day Windows and OS X, it still has quite a way to go. I would recommend adding some things, such as an Office-like suite, such as LibreOffice. Actually scratch that, I know the developers can come up with their own office suite! Maybe call the suite "Olympus" and the word processor "Zeus" and the presentation creator "Hera" or something...just throwing out ideas.

Second, I think that Elementary should start to divert away from Ubuntu. The Software Center and the fact that Elementary is dependent upon Ubuntu repositories is great, since Ubuntu comes with a multitude of cool shit. Of course, you shouldn't be surprised: Elementary is based off of Ubuntu. Still, if Elementary hopes to become truly an independent OS, it shouldn't keep ties to its derivative. I would recommend creating repositories only specific to Elementary. And to add to that, why not get rid of apt-get, and create a unique package management utility?

I would <b>not</b> recommend however, adding <i>too</i> much software and packages to the distro. After all, Elementary is <i>lightweight</i>.

In conclusion, I think the future of Elementary OS yields greatness. I know the next version coming out is Loki (gotta keep up with that tradition), and I can't wait to see it. In the past, I have reviewed the distro Redox. Of course, we can all agree that it is experimental, but when we look at Elementary, we can all agree that it is going to be a full-fledged Linux distro with support that will live up to Ubuntu. I mean, doesn't it already?

Read more about the updates of this cool-ass project <a href="https://blog.elementary.io"><b>HERE</b></a>. Remember to always stay tuned for future updates!
<hr>
References:
<br>
https://en.wikipedia.org/wiki/Elementary_OS
<br>
https://blog.elementary.io

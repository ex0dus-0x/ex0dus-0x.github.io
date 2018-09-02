---
title: Build Your Own Linux Distro
date: 2017-11-03 00:00:00 Z
layout: post
---

I'll be talking about my experience in building my own Linux-based distribution, imperium. __imperium__ is based on the 64-bit Debian 9.x (stretch) distribution, as it still relies on its repositories for package management.

<!--more-->

## Why another one?

Some wonder, "Why build ANOTHER Linux distro? Don't we already have enough?" The question really should be, "what can we LEARN about Linux by BUILDING a Linux?" I pursued the imperium project not just to provide my interested friends and I a more personalized distro with some alternative open-sourced software, but it also gave me an opportunity to look at Linux internally through its config.

## Let's get started.

As for distribution, I relied on a [fork](https://github.com/chamuco/respin) of Linux Respin, which is a revamped version of the remastersys tool. Respin is incredibly reliable, as it enables a user to spend time on actual distro configuration then redistribution.

For the actual configuration process, I will be listing the steps that I took to create the image that I currently have released to the public. Keep in mind that I have placed __imperium__ at an alpha build, so there are some issues that I am currently dealing with.

I start off with a regular `debian-9.2.1-amd64-netinst.iso` image, available [here](https://www.debian.org/CD/netinst/). It's light, and installs pretty quickly on a virtual machine.

Make sure to create a nonroot user. Once you are actually finished with installation, add that user to your `/etc/sudoers` config.

    # User privilege specification
    user  ALL=(ALL:ALL) ALL

I first start by reinstalling the desktop environment to [Budgie](https://budgie-desktop.org/home/), because I didn't like the default GNOME look. I followed instructions from [this guide](https://mike632t.wordpress.com/2016/11/29/installing-budgie-desktop-on-debian-9-x-stretch/).

It's important that you want to install your desktop environment first. Debian comes with a lot of crappy software, and you are definitely moved to remove them first. However, desktop environments like Budgie actually rely on some of the core GNOME packages that come, (i.e `network-manager`), so removing and purging at once is not the safest.

I also installed the [Adapta](https://github.com/adapta-project/adapta-gtk-theme) GTK theme and [Paper Icons](https://github.com/snwh/paper-icon-theme), as it works really nicely with an Adapta look.

When building Adapta, it's a good idea to use `parallel` to add concurrency to your build.

    sudo apt install parallel
    ./autogen.sh --enable-parallel=true
    make && sudo make install

In accordance with the previously mentioned guide, I installed `lightdm` as the desktop manager, and set it as the default instead of `gdm3`. This involves a little bit of configuration, specifically in `/etc/lightdm/lightdm.conf`:

```
[Seat:*]
# ...
user-session=budgie-desktop

... and `/etc/lightdm/lightdm-gtk-greeter.conf`:

[greeter]
# ...
background=/path/to/background/wallpaper.jpg
theme-name=Adapta
icon-theme-name=Paper
indicators=~power
```

Restart to check if the desktop environment renders. In the case that it doesn't, it's always helpful to check `/var/log/lightdm` for any errors.

At this point, you are pretty free to continue on with building, installing and configuring whatever software and packages you need for your distro. I did want to include a few extra steps and tips, especially for those who want to publicly redistribute.

We can change the name the Debian build to our custom OS through a few files: `/etc/os-release`, `/etc/issue`, `etc/issue.net`, and `/etc/lsb-release`.
Here's an example of imperium's `/etc/os-release` config:

    NAME=imperium
    VERSION="1.1.0 (alpha)"
    ID=imperium
    VERSION_ID=1.1.0
    PRETTY_NAME="imperium 1.1.0 (alpha)"
    HOME_URL="https://example.org/"
    BUG_REPORT_URL="https://bugs.example.org/"

Let's say that you are finished installing/removing packages and software according to your tastes. Let's actually go ahead with the redistribution process with Respin.

    sudo apt install git
    git clone https://github.com/chamuco/respin
    cd respin/Debian
    sudo dpkg -i respin-*.deb

Once complete, we can make our image:

    # ... make a liveCD filesystem
    sudo respin dist cdfs
    # ... make an ISO and MD5 pair
    sudo respin dist iso

Your result will be stored in `/home/respin/respin`. I recommend using [Sourceforge](https://sourceforge.net) to distibute your software, especially since your ISO will be a GB or two.

So there you go! Process complete! If you actually boot your image through the VM or on an actual USB/CD to make an install, keep in mind that you first have to boot into the LiveCD system, open a terminal, and run

    sudo respin-installer

This will put up an `ncurses`-style menu that enables you to actually install the OS onto your disk. Keep in mind that you will need an `ext4` partition and a `linux-swap` partition as well.

---

That was a pretty big task! Redistributing Linux is not that difficult of a process, but can be incredibly bothersome and annoying. Respin, although it doesn't require building LFS or doing any manual hard labor, is the best way if you want to focus on the quality of your OS. Here are definitely some tips to note when creating and distributing a distro:

* Try not to install from source. Users should be able to get the latest updates to their packages, so install from the Debian repo (or it's own).
* Try not to install too much. People prefer lightweight distros compare to heavy ones with too much software they might uninstall anyway
* Be creative and unique! Try to fulfill some sort of need in the community that users may have.
* Keep track of your versioning. Most popular distros have funky names like Ubuntu's current __Artful Aardvark__ release.

## Issues:

Issues do arise. In fact, here are actually a few of mine that you should be aware of:

* `respin` takes up a lot of space. Make sure that once you have your `.iso`, run `sudo respin clean`.
* `Adwaita` shows up as the default after booting off live. Issue [here](https://unix.stackexchange.com/questions/401959/how-do-i-change-the-default-gtk-and-icon-theme-on-gnome).

---

Thanks for reading!

---
layout:     post
comments:   true
title:      "Redox: a Linux-Like Operating System made with Rust"
subtitle:   "How a programming language lived up to it's dreams"
date:       2016-03-19 12:00:00
author:     "ex0dus"
header-img: "img/PostBG/post-bg-04.jpg"
---
Recently, I was doing my routinely performing my daily rituals on Reddit when I came across this:

![](/img/Redox/redox.png)

It looked interesting, especially since it was written in the Rust programming language, a programming language I played around with during the summer before my freshman year of high school. It was an interesting language, and it had many similarities with C/C++. After all, it was a language that tried to replace it. And now after going back to the [**Rust website**](https://doc.rust-lang.org/book/), I can see that Rust has been receiving A LOT more functionality than it did when I tinkered with it. Windows support, especially. One thing that I really like about Rust's programming language is Cargo, which is it's minature package manager and build system. It's the GCC for Rust.

So here I was, on the Redox website:

![](/img/Redox/redox-site.png)

It looked pretty interesting, so I decided to download the ISO, which was actually only a nice 26MB, compared to a usual 1-2GB download for any other Linux distro.

First, I cloned it from the GitHub repository:

<pre> $ git clone https://github.com/redox-os/redox </pre>

Set it up with Curl. This installs Rust, as well as other dependenices

<pre> $ curl -sf https://raw.githubusercontent.com/redox-os/redox/master/bootstrap.sh -o bootstrap.sh && bash -e bootstrap.sh </pre>

Build it and then use QEMU to launch it:

    $ cd redox
    $ make all
    $ make qemu

The instructions are all available here on the [**GitHub page**](https://github.com/redox-os/redox) for Redox

Afterwards, here's what you will get:

![](/img/Redox/redox-qemu.png)

Login with "root" and run the command "orbital" to get the GUI, which looks like this:

![](/img/Redox/redox-gui.png)

Overall, I think the OS is quite basic, but a pretty impressive build. It has several things different when compared to your average Linux operating system. It has its very own shell, Ion. A text editor is also included, called Sodium, and several other lil' side projects, which you can find on [**here**](http://www.redox-os.org/book/book/overview/welcome.html), on the Redox website.

Obviously, I have little knowledge of writing operating systems, and kernel-level programming, but I still really like Redox. It is obviously going to improve over time, but I still recommend that you should check it out, play around with it to get a better understanding of Operating Systems.

And yes, Rust is installed along with it.

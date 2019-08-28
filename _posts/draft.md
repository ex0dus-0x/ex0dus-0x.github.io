---
title: Building a syscall process tracer in Rust
date:
layout: post
---

To keep up with my [previous work](https://codemuch.tech/elf-security-rust)  in building a static ELF binary security checker tool in Rust, I decided to continue and build more clones of useful security / debugging / devops tools in Rust.

Since I've worked quite a bit with system call tracing the past, one of my side projects ended up being a `strace` clone in Rust, implemented with native `ptrace` support. Our implementation, `jtrace` is more pedgogical, rather than an actual drop-in replacement for process tracers. However, it does contain a rather neat feature that allows us to deserialize system call traces in JSON, something I have [blogged about in the past](https://codemuch.tech/system-call-sequencing-ids). Hopefully, more features can come out of this implementation, and you [can help!](https://github.com/ex0dus-0x/jtrace/issues).

## Implementing `ptrace`

To implement `ptrace`, I looked into the work done previously by [Joseph Kain](http://system.joekain.com/2015/07/15/rust-load-and-ptrace.html) and the Rust `nix` crate, and re-implemented what I needed to make a syscall tracer.

One thing a lot of developers might note is that nowadays, using `ptrace` in order to do any type of process tracing may not be [especially safe](https://www.nsa.gov/Portals/70/documents/what-we-do/cybersecurity/professional-resources/csi-limiting-ptrace-on-production-linux-systems.pdf?ver=2019-05-16-151825-133), as it potentially allows for someone with malicious intent to modify system call arguments in a running process. When used in the context of tracing, it may also not be performant, as we are continuously interjecting into a forked child process, increasing program overhead.

Now with that said, an ideal alternative to this (which has also been implemented in `strace`) is using eBPF machine code to implement tracing functionality at the userspace. Julia Evans does a really neat [blog post](https://jvns.ca/blog/2018/02/24/an-ltrace-clone-using-ebpf/) about using eBPF but instead for library tracing, which is definitely a must-read.

eBPF support is coming soon to `jtrace`, and will be the _modus operandi_ for the tool, while still supporting a fallback `ptrace` mode, which we will focus on building for pedagogical purposes.


```rust
// ptrace code here
```

## Command Line

Let's implement our actual CLI tool. Let's parse user input for a target tracee process, and the arguments passed to it:

```rust
fn main() {

}
```

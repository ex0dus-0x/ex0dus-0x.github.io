---
title: Evading Code Injection Attacks on Linux Applications
date: 2020-08-20
layout: post
tags:
- technical
- linux
- security

---
Often times when an attacker or piece of malware wants to execute some payload, they can perform some type of a **code injection** attack on a pre-existing innocent running application, where they try to inject crafted code in-memory, and mutate its execution runtime to run it. This is done to escalate privileges, or to patch up that application to do something completely different. These types of attacks come in different variants, such as DLL hijacking, hotpatching, and IAT/GOT hooking.

Since this has become a known attack vector, OS vendors have already jumped ahead and implemented many facilities to help mitigate against such attacks. Windows' [sophisticated Advanced Threat Protection software](https://www.microsoft.com/security/blog/2017/03/08/uncovering-cross-process-injection-with-windows-defender-atp/) dynamically analyzes processes for any intrusive system calls, such as `CreateRemoteThread` and `SetWindowsHookEx` that signify some type of runtime hijacking, plus a multitude of other techniques to detect misuse statically. macOS introduced both the `__RESTRICT` program header and [Hardened Runtime Entitlements](https://developer.apple.com/documentation/security/hardened_runtime), which all work with the dynamic linkage process to stop code injection attempts with `DYLD_INSERT_LIBRARIES`.

## The Linux Wild West

However, with Linux, the protections against code injection is somewhat lackluster. While it is true that the use of `ptrace` can be restricted to mitigate code injection (through `kernel.yama.ptrace_scope`), `LD_PRELOAD` itself is already an easy way to change execution behavior, let alone the multiple other ways we can statically and dynamically alter it without strict preventions. Even worse, many consumer-grade Linux distributions do not support hardened protection layers (ie grsecurity) out-of-the box, compared to the actively developed security mechanisms Apple and Microsoft incorporate. This means that once attackers pop a shell, gaining privileges or doing RCE becomes much more trivial in comparison to other OSes.

Take for example a simple application that implements some type of license checking functionality. Often times vendors will make this either call back home to some secure datastore to validate, or use some pesky obfuscation to hide it away. In either cases, we can use `LD_PRELOAD` to get rid of it with our own patch.

Here's what our example app looks like:

```c
/* app.c */
#include <stdio.h>
#include <string.h>

/* defines `licenseCheck`, but we don't really need to care
#include "license.h"

#define MAX_LEN 10


int main(int argc, char *argv[]) {
	if (argc < 2)
		return 1;

	/* write license key to buffer */
	char license[MAX_LEN];
	strncpy(license, argv[1], MAX_LEN);
	size_t len = strlen(license);

	/* check to see if valid */
	if (!licenseCheck(license, len))
		return 1;

	/* we're good! start the app */
	printf("Starting the app!\n");

	/* something that starts the main functionality */
	startApp();
    return 0;
}
```

Given a patch that we then compile to a shared object library, we can use `LD_PRELOAD` to mutate the functionality of `licenseCheck()` to simply return 1, as so:

```c
/* patch.c */
int licenseCheck(char *license, size_t len) {
	return 1;
}
```

    $ gcc -shared -fPIC patch.c -o patch.so
    $ LD_PRELOAD=$PWD/patch.so ./app SOMELICENS
    Starting the app!
    ...

As application developers, we can beat this in two primary different ways: by checking if environment variables are set for `LD_PRELOAD` (either through `getenv()`, or the smarter but lesser known `char **environ` parameter), or checking the memory maps for the process to see if a suspicious shared object library has been preloaded in. @haxelion has a great [post](https://haxelion.eu/article/LD_NOT_PRELOADED_FOR_REAL/) going into this in-depth, and some of the detection mechanisms he outlines will be what we incorporate into the semantics of our implementation. In fact, here's a portable version of the `environ` check mentioned, with no stdlib needed at all:

```c
int main(int argc, char *argv[], char **environ)
{
    int i, j;
    char env[] = "LD_PRELOAD";
    for(i = 0; environ[i]; i++)
    {
        for(j = 0; env[j] != '\0' && environ[i][j] != '\0'; j++)
            if(env[j] != environ[i][j])
                break;

        if(env[j] == '\0')
        {
            return 1;
        }
    }
    return 0;
}
```

By simply incorporating the `char **environ` parameter, we can iterate over each envvar check and see if `LD_PRELOAD` is present. No need for external deps that can patched beforehand!

So given what we know about detecting against code injection, let's try to take this and consider an approach that takes something like that neat detection snippet (as we'll see in the next post) and helps harden Linux binaries. We want something similar to what Microsoft/Apple does, which doesn't require the developer to be encumbered in having to add more code or functionality.

## Warding off Injections

This is where **ward** comes in. **ward** implements what is formally known as _runtime application self-protection_, where a compiled executable is able to _protect itself_ during runtime, without the need for operating system facilities to fight away the bad guys. We'll discuss how this more in detail in the next section, but we'll be taking advantage of an interesting _code cave_ in ELF binaries and a syscall called `memfd_create` in order to generate a unique "protector executable" that wraps over the original vulnerable app.

Now at this point, a skilled reader may ask, if **ward** is executing code to protect itself, can't an attacker simply just patch _that_ out and mutate the binary in whatever malicious way they want to? This is true for any attacker that has some level of read-write privilege, and wants to start hijacking applications.

As a result, **ward** will implement another layer of protection through **binary signing**. By incorporating binary signing, we ensure that the executable is _tamper-proof_, since we are checking to see if a reconstructed signature of the executable matches what we have in store of its original safe and signed state.

So to sum it up, **ward** does two things:

* **Binary signing** to ensure the protected binary remains tamper-proof
* **Runtime Protection** to help protect against attempts to inject code dynamically into the binary in execution.

## Design

Let's talk about how we'll be implementing **ward** through the two aforementioned techniques:

### Binary Signing

This will be simple: we'll utilize Ed25519 through `minisign` to digitally sign and validate files using a generated key-pair, which is then securely stored in my [microkv](https://github.com/ex0dus-0x/microkv) implementation.

### Runtime Protection

Let's talk about the exciting stuff: how we'll implement _runtime protection_. We'll take advantage of two interesting features in Linux, with the first being a code cave in ELF binaries, the `PT_NOTE` segment. This is a segment that can be converted into a loadable (`PT_LOAD`) one, where we can point to instructions that we can execute.

In traditional static `PT_NOTE` patching, we are much more interested about loading our own Assembly-based payload, redirect the entry point, and essentially "infect" the binary, but for us, that will not be the case as much. We'll be first creating a "protector" binary, which utilizes our _second_ feature, `memfd_create`, which a more recent Linux syscall that enables us to map and execute anonymous files into memory. Our goal is to inject target binary into the protector one through `PT_NOTE` injection, and have the protector app during execution, _parse itself_ and recover the binary, which it will then execute through `memfd_create` after executing our own checks for code injection attempts.

That seems like a lot and quite complex! This is why I decided to split this into two parts, with the first going into the problem and the solution we want to outline. Check back next time for Part 2, where we will actually implement the functionality of our application, and demonstrate its effectiveness against actual attacks. Hopefully everything will make much more sense by then!

Thanks for reading!
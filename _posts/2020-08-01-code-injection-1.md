---
title: Evading Code Injection Attacks on Linux Applications
date: 2020-08-01
layout: post
tags: [technical, linux, security]
---

Often times when an attacker or piece of malware wants to execute some payload, they can perform some type of a __code injection__ attack on a pre-existing innocent running application, where they try to inject crafted code in-memory, and mutate its execution runtime to run it. This is done to escalate priviledges, or to patch up that application to do something completely different. These types of attacks come in different variants, such as DLL hijacking, hotpatching, and IAT/GOT hooking.

Since this has become a known attack vector, OS vendors have already jumped ahead and implemented many facilities to help mitigate against such attacks. Windows' [sophisticated Advanced Threat Protection software](https://www.microsoft.com/security/blog/2017/03/08/uncovering-cross-process-injection-with-windows-defender-atp/) dynamically analyzes processes for any intrusive system calls, such as `CreateRemoteThread` and `SetWindowsHookEx` that signify some type of runtime hijacking, plus a multitude of other techniques to detect misuse statically. macOS introduced both the `__RESTRICT` program header and [Hardened Runtime Entitlements](https://developer.apple.com/documentation/security/hardened_runtime), which all work with the dynamic linkage process to stop code injection attempts with `DYLD_INSERT_LIBRARIES`.

## The Linux Wild West

However, with Linux, the protections against code injection is somewhat lackluster. While it is true that the use of `ptrace` can be restricted to mitigate code injection (through `kernel.yama.ptrace_scope`), `LD_PRELOAD` itself is already an easy way to change execution behavior, let alone the multiple other ways we can statically and dynamically alter it without strict preventions. Even worse, many consumer-grade Linux distributions do not support hardened protection layers (ie grsecurity) out-of-the box, compared to the actively developed security mechanisms Apple and Microsoft incorporate. This means that once attackers pop a shell, gaining priviledges or doing RCE becomes much more trivial in comparison to other OSes.

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

```
$ gcc -shared -fPIC patch.c -o patch.so
$ LD_PRELOAD=$PWD/patch.so ./app SOMELICENS
Starting the app!
...
```

As application developers, we can beat this in two primary different ways: by checking if environment variables are set for `LD_PRELOAD` (either through `getenv()`, or the smarter but lesser known `char **environ` parameter), or checking the memory maps for the process to see if a suspicious shared object library has been preloaded in. @ has a great [post]() going into this in-depth, and some of the detection mechanisms he outlines will be what we incorporate into the semantics of our implementation. In fact, here's a portable version of the `environ` check mentioned, with no stdlib needed at all:

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

So given what we know about detecting against code injection, let's try to take this and consider an approach that takes something like that neat detection snippet (as we'll see in the next post) and helps harden Linux binaries. We want something similar to what Microsoft/Apple does, which doesn't require the developer to be encumbered in having to add more code or functionality. This is what led to __ward__, a hardening tools that implements _self-protection_.

## Warding off Injections

When deciding about __ward's__ intrinsic functionality, I decided to explore some of the more obscure work in static binary patching, working off this idea that we could fight fire with fire - injecting statically code in order to beat code injection dynamically. So instead of hacking on pre-existing linkers or system-level protections, we introduce a portable technique through __ward__ that allows apps to _protect themselves_, by statically patching apps to run our lighweight protection runtime _before_ executing actual code. This is a technique formally known as _runtime application self-protection_.

A sophisticated reader may ask, if __ward__ is injecting code to protect itself, can't an attacker simply just patch _that_ out and mutate the binary in whatever malicious way they want to? This is true for any type of static patching against executables, so __ward__ implements a second layer of protection through __binary signing__. By incorporating binary signing, we ensure that the executable is _tamper-proof_, since we are checking to see if a reconstructed signature of the executable matches what we have in store of its original safe and signed state.

So to sum it up, __ward__ does two things:

* __Binary signing__ - `ward` securely stores (with `microkv`) a registry of signatures for files signed by the service. This is to prevent any attempts to _statically patch_ code into the binary, as validation efforts will see that the executable file itself has changed in the regenerated signature.

* __Runtime Protection__ - `ward` implements a runtime protection layer through static binary injection, which executes before the actual functionality of the program. This is to prevent _runtime code injection_ attempts, specifically with `LD_PRELOAD`.

## Design

Let's talk about how we'll be implementing __ward__!

### Binary Signing

### Runtime Protection

Let's get into the fun stuff: runtime protection. As mentioned, we want to incorporate static binary patching in order to redirect control flow to our protection code before the actual execution. We can do this by finding several sources of _code caves_ within the compiled ELF executable. These are locations in the binary where code can be placed into and modified to run without interfering with anything else. A common location is the `PT_NOTE` segment, which is often not used in ELFs. By injecting our payload and changing it into a `PT_LOAD` segment, it can now be a part of the executable runtime.

Thanks for reading! Check back next time for Part 2, where we will actually implement the functionality of our application, and demonstrate its effectiveness against actual attacks.

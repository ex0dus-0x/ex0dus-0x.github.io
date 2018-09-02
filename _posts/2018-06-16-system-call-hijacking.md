---
title: System Call Hijacking Using LKMs
date: 2018-06-16 00:00:00 Z
layout: post
---

System call hijacking is an interesting low-level way for the hacker / penetration tester
to gain system privileges of a system, and deploying rootkits for faster and intrusive-less
privilege mitigation. Today, let's take a look at how exactly this works by breaking down the anatomy
of a system call, and performing an actual hijacking.
<!--more-->
## The Anatomy of a System Call

<br>
<img src="https://i.imgur.com/Sk5p2vJ.png" width="500px">

This image is from the [Linux Programming Interface](https://www.amazon.com/Linux-Programming-Interface-System-Handbook/dp/1593272200), and it provides an incredibly detailed look at exactly what occurs when a user calls a wrapper function at the user-mode, and how the service routine is handled at the kernel-mode.

That's right, _wrapper function_. The traditional functions that you utilize within the `glibc` interface are not system calls. In fact, by doing a trace of a the wrapper `printf`, throws at us a ton of different system calls that occur:

```bash
$ strace printf

execve("/usr/bin/printf", ["printf"], 0x7fff64a7c0a0 /* 45 vars */) = 0
brk(NULL)                               = 0x560bb5adb000
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=187110, ...}) = 0
mmap(NULL, 187110, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f4989137000
close(3)                                = 0
openat(AT_FDCWD, "/usr/lib/libc.so.6", O_RDONLY|O_CLOEXEC) = 3
read(3, "\177ELF\2\1\1\3\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0\2001\2\0\0\0\0\0"..., 832) = 832
fstat(3, {st_mode=S_IFREG|0755, st_size=2105608, ...}) = 0
mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f4989135000
mmap(NULL, 3914128, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f4988b85000
mprotect(0x7f4988d38000, 2093056, PROT_NONE) = 0
mmap(0x7f4988f37000, 24576, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x1b2000) = 0x7f4988f37000
mmap(0x7f4988f3d000, 14736, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7f4988f3d000
close(3)                                = 0
arch_prctl(ARCH_SET_FS, 0x7f4989136540) = 0
mprotect(0x7f4988f37000, 16384, PROT_READ) = 0
mprotect(0x560bb525c000, 4096, PROT_READ) = 0
mprotect(0x7f4989165000, 4096, PROT_READ) = 0
munmap(0x7f4989137000, 187110)          = 0
brk(NULL)                               = 0x560bb5adb000
brk(0x560bb5afc000)                     = 0x560bb5afc000
openat(AT_FDCWD, "/usr/lib/locale/locale-archive", O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=1683056, ...}) = 0
mmap(NULL, 1683056, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f4988f9a000
close(3)                                = 0
openat(AT_FDCWD, "/usr/share/locale/locale.alias", O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=2997, ...}) = 0
read(3, "# Locale name alias data base.\n#"..., 4096) = 2997
read(3, "", 4096)                       = 0
close(3)                                = 0
openat(AT_FDCWD, "/usr/share/locale/en_US.UTF-8/LC_MESSAGES/coreutils.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/share/locale/en_US.utf8/LC_MESSAGES/coreutils.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/share/locale/en_US/LC_MESSAGES/coreutils.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/share/locale/en.UTF-8/LC_MESSAGES/coreutils.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/share/locale/en.utf8/LC_MESSAGES/coreutils.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/share/locale/en/LC_MESSAGES/coreutils.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
write(2, "printf: ", 8printf: )                 = 8
write(2, "missing operand", 15missing operand)         = 15
write(2, "\n", 1
)                       = 1
write(2, "Try 'printf --help' for more inf"..., 42Try 'printf --help' for more information.
) = 42
close(1)                                = 0
close(2)                                = 0
exit_group(1)                           = ?
+++ exited with 1 +++
```

That's quite a bit of work for such a simple operation. Let's break it down based on what we know.

1. The first call made is a `execve(2)`, which signals the creation of a replacement process to the current one. Notice how in the `strace` call above, the program name, parameters and an environment string.
2. `int 0x80` is made within `execve`, which is a kernel interrupt that actually switches the context to kernel mode and ensures that the proper arguments specified are passed. `int 0x80` is actually utilized within x86 Assembly in order to make a system call at the kernel-space once required parameters values are all placed in the respective 32-bit registers.
3. A lot of the stuff within our `strace` traceback isn't the most relevant to what we want to know, as they are doing work in memory allocaion and setting the proper locale for display purposes, so let's keep diving into the kernel-mode. Once `int 0x80` is invoked and we are in kernel-mode, we are now within a trap-handling routine that has captured our kernel interrupt signal, causing it to work is magic. The kernel invokes the `system_call()` routine, and ensures that the values passed in registers are saved upon the kernel stack
4. The trap handler utilizes the `sys_call_table` to call the correct command based on the requested system call number and arguments passed
5. The service routine that is executed and performs what it is tasked to done. However, in the very end, a return value is passed back to signify status such as success / failure (0 / 1). Register values are restored for later use, and the return value is passed back to user-mode.

Wow, that's quite a deep trip down the rabbit hole. Knowing this knowledge, we can now actually try to write our own __loadable kernel module__, or LKM in order to modify the execution of a system call. LKMs are low-level code that is implemented at a kernel-level in order to provide support for new hardware or extend the release of a the kernel, but we will be doing this to do some more...malicious stuff.

## Hijacking System Calls

Let's write a LKM that modifies and hijacks the `open()` call. Note that at the time of writing, I'm am currently using a `4.16.13-2` Linux kernel version, and that standards for writing kernel modules may change in future updates.

When writing our code, we must declare some important things within our code. This includes the necessary header files, and some module identifiers:

```c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/unistd.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Alan <ex0dus@codemuch.tech>");
MODULE_VERSION("0.0.1");
MODULE_DESCRIPTION("We hack the kernel");
```

When declaring a kernel module, there are two very important functions that sort-of act as constructor / destructor routines:

```c
static int __init
init_module(void)
{
    printk(KERN_INFO "Welcome to Kernel Town!\n");
    return 0;
}

static void __exit
cleanup_module(void)
{
    printk(KERN_INFO "We are now leaving Kernel Town! Thanks for the stay!\n");
    return;
}

/* pass functions as initialization and cleanup routines */
module_init(init_module);
module_exit(cleanup_module);
```

Let's get into the meat and potatoes. We want to first obtain the actual address of our system call table. This can be done in the command line as so:

```bash
# I needed to do do this, so this is NOT necessary on different architectures, as System.map is probably already
# present
$ sudo cp /proc/kallsyms /boot/System.map-`uname -r`
$ sudo cat /boot/System.map-`uname -r` | grep sys_call_table
[whatever address you get] R sys_call_table
```

Once done, you can create a global `unsigned long *` to your system call table in the kernel module as so:

```
unsigned long *sys_call_table = (unsigned long) 0x[whatever address you get];
```

Another variable we need to make global is the pointer to the actual `open()` system call. This can be done by actually accessing the `sys_call_table` with the `__NR_open` constant, which defines the system call number.

```
/* This defines a pointer to the real open() syscall */
asmlinkage int (*old_open)(const char *filename, int flags, int mode);
```

We are going to be using the `asmlinkage` tag, as we are at a kernel-level, and all of our arguments are not placed into registers like `ebx` or `ecx`, but rather the CPU's stack.

As referenced in several posts about hijacking system calls, we need to make changes to whats actually going on in the system call table. This can be done by flipping some bytes so that we are able to write to this memory page, as it is normally write-protected. We also make a function that sets it BACK to read-only mode, such that it will appear nothing has been changed.

```c
/* enable use to memory page and write to it */
int
set_addr_rw(long unsigned int _addr)
{
    unsigned int level;
    pte_t *pte = lookup_address(_addr, &level);

    if (pte->pte &~ _PAGE_RW) pte->pte |= _PAGE_RW;
}

/* ensure that when cleanup occurs, make page write-protected */
int
set_addr_ro(long unsigned int _addr)
{
    unsigned int level;
    pte_t *pte = lookup_address(_addr, &level);

    pte->pte = pte->pte &~_PAGE_RW;
}
```

Alright, with that done, let's actually hack `open()`!

```c
asmlinkage int
new_open(const char *filename, int flags, int mode)
{

    /* perform our malicious code here */
    printk(KERN_INFO "Intercepting open(%s, %X, %X)\n", filename, flags, mode);

    /* give execution BACK to the original syscall */
    return (*old_open)(filename, flags, mode);
}
```

As per the comments, the body of the function is where we can define whatever we want to do. However, at the end of that, we call return BACK to the old `open`, passing the arguments with it to complete its execution. This is where the actual hijacking takes place, and it is really up to the dev / pentester to determine what to actually write when manipulating the passed arguments. The function above simply prints out the arguments passed, but there can be so much more that can be done.

We have our function ready, let's hook it back up to our initialization and cleanup routines:

```c
static int __init
init_module(void)
{
    printk(KERN_INFO "Welcome to Kernel Town!\n");

    /* allow us to write to memory page, so that we can hijack the system call */
    set_addr_rw((unsigned long) sys_call_table);

    /* grab system call number definition from sys_call_table */
    old_open = (void *) sys_call_table[__NR_open];

    /* set the open symbol to our new_open system call definition */
    sys_call_table[__NR_open] = new_open;

    return 0;
}

static void __exit
cleanup_module(void)
{
    /* set the open symbol BACK to the old open system call definition */
    sys_call_table[__NR_open] = old_open;

    /* set memory page back to read-only */
    set_addr_ro((unsigned long) sys_call_table);

    printk(KERN_INFO "We are now leaving Kernel Town! Thanks for the stay!\n");
    return;
}
```

The comments explain everything, but what essentially occurs with `init_module` is that we set the memory page to write, grab the syscall number of `open` and store it within `old_open` for future use, and set the syscall number to point to our new `open` routine. When `cleanup_module` is executed, it reverts what was done, and sets the system call table back to read-only.

Once done, we can now install it, and test it out. Here's a `Makefile` you can use

```
obj-m = hack_open.o
KERNEL = $(shell uname -r)
PWD = $(shell pwd)

all:
	make -C /lib/modules/$(KERNEL)/build M=$(PWD) modules

example:
	gcc -Wall -g example.c -o example

clean:
	make -C /lib/modules/$(KERNEL)/build M=$(PWD) clean
```

`example.c` is just a test file that utilizes `open` to see if the kernel module works. The source is within the [repo](https://github.com/ex0dus-0x/hijack), so feel free to look at the example.

```bash
$ make
$ sudo insmod hack_open.ko # assuming no errors were found

# to remove the module
$ rmmod hack_open
```

We are done! If you do write an example, you can check to see the output of the kernel module with `dmesg`.

System call hijacking is a quite interesting approach, and really provides the foundation for leading into stuff like developing rootkits. These are especially interesting exploitation techniques to learn, but also general stuff about the Linux system and kernel itself.

Thanks for the read!

### Read more:

* https://www-s.acm.illinois.edu/sigpony/old/talks/syscall_talk/syscall_talk.html
* https://legacy.gitbook.com/book/0xax/linux-insides/details

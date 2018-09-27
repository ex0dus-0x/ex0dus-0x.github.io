---
title: System Call Representation for Intrusion Detection Systems
date: 2018-09-26
layout: post
---

I'm really interested in __intrusion detection systems__. I've done quite a bit of research in how they are implemented, because there are a lot fascinating approaches on how we can build up this kind of software. I would like to present to you the work that I have done, and also a problem that I have seen when encountering current research in intrusion detection, which seems to approach the topic from a more theoretical stance rather than one of pragmatism.

## A little background

Intrusion detection systems are classifed as either _misuse_ or  _anomaly_-based. Misuse systems are based off of pre-existing signatures of intrusions, making it efficient to detect anomalous behavior quickly, _but only if they are known and pre-existent_. This sort of technique definitely does not hold up for new intrusions, or for intrusions that are continouosly adapting and changing it's behavior before and during detection. Anomaly-based detection systems are different, as rather than using definitive signatures, we can now instead rely on building up models for intrusion, using state machines or even classification and machine learning. This is now much more advanced, as variations of attacks can instead be classified by a model rather than a ton of different signatures. These models are referred as _system call sequence sets_.

Several pieces of research that I have utilized when looking at anomaly-based intrusion detection:

* Hofmeyr, S. A., Forrest, S., & Somayaji, A. (1998). Intrusion detection using sequences of system calls. Journal of computer security, 6(3), 151-180.
* Sekar, R., Bendre, M., Dhurjati, D., & Bollineni, P. (2001, May). A fast automaton-based method for detecting anomalous program behaviors. In sp (p. 0144). IEEE.
* Poulose Jacob, K., & Surekha, M. V. (2007). Anomaly Detection Using System Call Sequence Sets.

## How do we sequence? (feat. our representation problem)

Our focus today is on system call sequencing, because that seems to be something that a lot of researchers glance over more as an implementation detail. With that said, this post isn't about building a whole detection system, but rather how we can seamlessly create sequence sets.

What do I mean? Let's turn towards one of our favorite tools: `strace`. This example below shows a simple buffer overflow exploit, where input from `stdin` broke through stack bounds and corrupted memory, resulting in a `SIGABRT`.

```bash
$ strace ./overflow1
execve("./overflow1", ["./overflow1"], 0x7fff8a723560 /* 63 vars */) = 0
brk(NULL)                               = 0x55f2db384000
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=251963, ...}) = 0
mmap(NULL, 251963, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f1ed676a000
close(3)                                = 0
openat(AT_FDCWD, "/usr/lib/libc.so.6", O_RDONLY|O_CLOEXEC) = 3
read(3, "\177ELF\2\1\1\3\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0\2001\2\0\0\0\0\0"..., 832) = 832
fstat(3, {st_mode=S_IFREG|0755, st_size=2105608, ...}) = 0
mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f1ed6768000
mmap(NULL, 3914128, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f1ed61c8000
mprotect(0x7f1ed637b000, 2093056, PROT_NONE) = 0
mmap(0x7f1ed657a000, 24576, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x1b2000) = 0x7f1ed657a000
mmap(0x7f1ed6580000, 14736, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7f1ed6580000
close(3)                                = 0
arch_prctl(ARCH_SET_FS, 0x7f1ed67694c0) = 0
mprotect(0x7f1ed657a000, 16384, PROT_READ) = 0
mprotect(0x55f2d9700000, 4096, PROT_READ) = 0
mprotect(0x7f1ed67a8000, 4096, PROT_READ) = 0
munmap(0x7f1ed676a000, 251963)          = 0
fstat(0, {st_mode=S_IFCHR|0620, st_rdev=makedev(136, 4), ...}) = 0
brk(NULL)                               = 0x55f2db384000
brk(0x55f2db3a5000)                     = 0x55f2db3a5000
read(0, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"..., 1024) = 85
fstat(1, {st_mode=S_IFCHR|0620, st_rdev=makedev(136, 4), ...}) = 0
write(1, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"..., 85) = 85
writev(2, [{iov_base="*** ", iov_len=4}, {iov_base="stack smashing detected", iov_len=23}, {iov_base=" ***: ", iov_len=6}, {iov_base="<unknown>", iov_len=9}, {iov_base=" terminated\n", iov_len=12}], 5*** stack smashing detected ***: <unknown> terminated
) = 54
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f1ed67a7000
rt_sigprocmask(SIG_UNBLOCK, [ABRT], NULL, 8) = 0
rt_sigprocmask(SIG_BLOCK, ~[RTMIN RT_1], [], 8) = 0
getpid()                                = 7172
gettid()                                = 7172
tgkill(7172, 7172, SIGABRT)             = 0
rt_sigprocmask(SIG_SETMASK, [], NULL, 8) = 0
--- SIGABRT {si_signo=SIGABRT, si_code=SI_TKILL, si_pid=7172, si_uid=1000} ---
+++ killed by SIGABRT (core dumped) +++
```

Every security researcher / pentester is familiar with `strace`. It creates a tracer and tracee process, and utilizes `ptrace` in order to halt the tracee process in kernelspace when entering/exiting a system call, enabling the tracer to examine the contents of the syscall. This is a beautiful tool for IDSes, because we are able to actually grab a sequence of system calls of a process in order to determine if anomalous behavior is present.

But now, this is where we come across a problem. `strace` output is just a bunch of random jargon! In fact, a great deal of the actual `strace` source code is just logic on how to print system call information to `stderr` (IDK why it's not `stdout`). This now presents a problem with sequencing. How can we create reliable representations of `strace` that can be plugged into an intrusion detection system to create reliable anomaly models?

## The Approach

An obvious solution to this problem would be to create a fun regex engine that painfully parses `strace` output, and hope that these hardcoded regex rules don't break on us. As terrible as they may sound, we will actually be following through with this. But before you close the browser window, I'm just going to mention one thing: a lot of the heavy lifting has been done for us.

Introducing [`posix-omni-parser`](https://github.com/ssavvides/posix-omni-parser). This is a Python library that I have been working with during my time at NYU, and definitely shows great value in any sort of research involving system call tracing. It already does a lot of annoying regex stuff when parsing `strace` and builds up an object model of the trace for further use in Python.

Let's extend this library for printing out our `strace` as JSON.

We will be modifying the `Trace` object in the library. This class provides the main interface for capturing and extracting information from a trace file, and should be the main interface that developers use when generating system call representation. Our ideal script would appear as so:

```python
from posix_omni_parser import Trace

# argument 1 is your strace file, generated as so:
#   `strace my-program 2> my_strace.strace`
trace = Trace.Trace("my_strace.strace")
trace.generate_json()
```

That simple. Let's dive into how we will do that in the `Trace` object source code. Here is a trimmed down version of
what is going on exactly in the object.

```python
from parsers.StraceParser import StraceParser

class Trace:
    def __init__(self, trace_path=None):
        # set trace path
        self.trace_path = trace_path
        # set parser as the StraceParser
        self.parser = StraceParser(self.trace_path)
        # parse trace and return syscalls
        self.syscalls = self.parser.parse_trace()
        ...
```

Along with some other helper methods that I have not thrown in there, that's pretty much it! The `StraceParser` and `Syscall` objects do a lot of the
fun regex work that we don't want to bother with.

Let's plug in our `generate_json()` implementation:

```python
import json

class Trace:
    ...
    def generate_json(self):
      tree = []
      for syscall in self.syscalls:
          syscall_obj = {
            'pid': syscall.pid,
            'syscall': syscall.name,
            'args': str(syscall.args),
            'return': syscall.ret[0],
          }
          tree.append(syscall_obj)

      # write to file
      with open(self.trace_path + ".json", 'wb') as outfile:
          outfile.write(json.dumps(tree, ensure_ascii=False,
                                         sort_keys=False,
                                         indent=4))
```

Alright, looks good! What does the JSON snippet of a `ls` trace look like?

```
[
    ...
    {
        "syscall": "getdents64",
        "return": 0,
        "args": "(<FileDescriptor 3>, <UnimplementedType []>, <Int 32768>)",
        "pid": "2704"
    },
    {
        "syscall": "close",
        "return": 0,
        "args": "(<FileDescriptor 3>,)",
        "pid": "2704"
    },
    {
        "syscall": "fstat64",
        "return": 0,
        "args": "(<FileDescriptor 1>, <UnimplementedType {st_dev=makedev(0>, <UnimplementedType 21)>, <UnimplementedType st_ino=4>, <UnimplementedType st_mode=S_IFCHR|0620>, <UnimplementedType st_nlink=1>, <UnimplementedType st_uid=1000>, <UnimplementedType st_gid=5>, <UnimplementedType st_blksize=1024>, <UnimplementedType st_blocks=0>, <UnimplementedType st_rdev=makedev(136>, <UnimplementedType 1)>, <UnimplementedType st_atime=1537917944 /* 2018-09-25T19:25:44.483779582-0400 */>, <UnimplementedType st_atime_nsec=483779582>, <UnimplementedType st_mtime=1537917952 /* 2018-09-25T19:25:52.483779582-0400 */>, <UnimplementedType st_mtime_nsec=483779582>, <UnimplementedType st_ctime=1537905330 /* 2018-09-25T15:55:30.487778183-0400 */>, <UnimplementedType st_ctime_nsec=487778183}>)",
        "pid": "2704"
    },
    {
        "syscall": "write",
        "return": 54,
        "args": "(<FileDescriptor 1>, <UnimplementedType \"crashlang  posix-omni-parser  rrapper\\t\\t syscallreplay\\n\">, <Hex 54>)",
        "pid": "2704"
    },
    {
        "syscall": "write",
        "return": 53,
        "args": "(<FileDescriptor 1>, <UnimplementedType \"jstrace    rr\\t\\t      strace_out.strace  template.txt\\n\">, <Hex 53>)",
        "pid": "2704"
    },
    {
        "syscall": "close",
        "return": 0,
        "args": "(<FileDescriptor 1>,)",
        "pid": "2704"
    },
    {
        "syscall": "close",
        "return": 0,
        "args": "(<FileDescriptor 2>,)",
        "pid": "2704"
    }
```

That's great! We are now able to create a system call representation for use in detection systems. We can use this in order to generate anomaly-models of common intrusion patterns for use in IDSes.

Of course, the better approach to this would be to modify `strace` or create a smaller tracer that can print out representation rather than poopy raw output. Another project for another time!

---

__NOTE__: the forked repository with a lot of my work in system call representation is [here](https://github.com/ex0dus-0x/posix-omni-parser). However, this library has been _greatly_ modified for use for other projects. However, I will attempt to get a stable branch of the original `posix-omni-parser` going with JSON representation support.

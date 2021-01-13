---
title: Automated Python Black-Box Reverse Engineering with Boa
date: 2020-09-13
layout: post
tags:
- technical
- security
- reversing
- python

---
During the quarantine, I became pretty interested in how we can automate reverse engineering, and decided to commit some time to implement a platform that can help automatically reverse and assess Python-compile executables, called [boa](http://boa.codemuch.tech).  **boa** helps security researchers extrapolate original and readable Python source from compiled and packed executables, and runs automated security checks to detect for low-hanging bugs, leaked secrets, etc.

While there is quite a number of things that I have backlogged in regards to its development, I'm really happy to see the progress made on it so far in the initial revision, and would love to talk about how it would be used!

For hackers and reverse engineers, the routinization of processes and workflows that is often undertaken when manually disassembling applications may be strenuous, and given our experience and ability to persist, our results may not often be _precise_. This, as a result, often encumbers the work done needed to gain visibility into a program or process, needing more time to inquire and quantify about the target.

Tooling like FireEye's [FLARE](https://github.com/FireEye/FLARE) VM for Windows-based reversing and security research, and the well-known [pwntools](https://github.com/Gallopsled/pwntools) framework  was a big inspiration for **boa**'s design, as they enabled hackers to reverse and find bugs quickly, not spend time excavating the Internet for tooling. So as a result, I decided to build **boa** to strip away the levels of abstractions that often encapsulate the functionality of programs we want to analyze.

## Python Intrinsics

Python is a language that we all know and love, with one big reason being it's ability to be executed generally agnostically, as long as an interpreter exists on the host platform. Therefore, applications and even malwares (check out \[SeaDuke\]([https://unit42.paloaltonetworks.com/unit-42-technical-analysis-seaduke/](https://unit42.paloaltonetworks.com/unit-42-technical-analysis-seaduke/ "https://unit42.paloaltonetworks.com/unit-42-technical-analysis-seaduke/")), a sample found in the DNC hack) have been adopting capabilities to pack their code and resources with an interpreter into a final executable for a given platform.

### Compiling Python

The CPython runtime interprets original source code, but rather than spitting out optimized native machine code, it generates its own intermediate bytecode format, which is easier to concisely recover a source code. Notice the disassembled bytecode of a lambda function in the following snippet, and its stack-based and reduced instruction set:

```python
>>> import dis
>>> expand = lambda lst: [item for slst in lst for item in lst]
>>> dis.dis(expand)
  1           0 LOAD_CLOSURE             0 (l)
              2 BUILD_TUPLE              1
              4 LOAD_CONST               1 (<code object <listcomp> at 0x7f8dd50857c0, file "<stdin>", line 1>)
              6 LOAD_CONST               2 ('<lambda>.<locals>.<listcomp>')
              8 MAKE_FUNCTION            8 (closure)
             10 LOAD_DEREF               0 (l)
             12 GET_ITER
             14 CALL_FUNCTION            1
             16 RETURN_VALUE

Disassembly of <code object <listcomp> at 0x7f8dd50857c0, file "<stdin>", line 1>:
  1           0 BUILD_LIST               0
              2 LOAD_FAST                0 (.0)
        >>    4 FOR_ITER                18 (to 24)
              6 STORE_FAST               1 (fl)
              8 LOAD_DEREF               0 (l)
             10 GET_ITER
        >>   12 FOR_ITER                 8 (to 22)
             14 STORE_FAST               2 (item)
             16 LOAD_FAST                2 (item)
             18 LIST_APPEND              3
             20 JUMP_ABSOLUTE           12
        >>   22 JUMP_ABSOLUTE            4
        >>   24 RETURN_VALUE
```

Given such a simple instruction set and a constrained runtime, it is no surprise that the tooling for decompiling bytecode files is very precise. The most commonly used decompiler for bytecode today is `uncompyle6`, which has been well-maintained for most Python versions. Here it is in action decompiling sample source code. Notice that unlike most of the decompilers we work with that only approximate behavior, `uncomplye6` is able to fully recover all syntax, even the comment annotations themselves:

```python
$ pip install uncomyple6
$ uncompyle6 __pycache__/sast.cpython-38.pyc

# uncompyle6 version 3.7.3
# Python bytecode 3.8 (3413)
# Decompiled from: Python 3.7.8 (default, Aug 16 2020, 00:04:41)
# [GCC 10.1.0]
# Embedded file name: /home/nemesis/Code/boa/boa/sast.py
# Compiled at: 2020-09-08 21:49:34
# Size of source mod 2**32: 1692 bytes
"""
sast.py

    Given properly decompiled files from bytecode, apply 
    static analysis to the source using the Bandit security QA checker.
"""
import os, json, tempfile
from bandit.core import manager, config

class SASTEngine(object):
    __doc__ = '\nA SASTEngine defines the necessary functionality needed in order to\n    
    run static analysis checks upon parsed out Python code in order to identify bugs\n    
    and potential vulnerabilities for exploitation.\n'

    def __init__(self, ignore_nosec=False):
        conf = config.BanditConfig()
        self.manager = manager.BanditManager(conf, None, ignore_nosec=ignore_nosec)

...
```

### Executable Packing

Bytecode files (which end in `.pyc`) are often the by-products you see and `.gitignore` in Python projects with custom modules, but when compiling into a packaged executable, they are crucially important. As mentioned, the Python ecosystem supports packaging executables using several variants of "packers", which help turn a project into an executable that can be run on a target operating system. **boa** provides unpacking support to multiple packers, with the most effort dedicated to **PyInstaller**, probably the most commonly used packer for cross-platform applications, which we'll take a look at. Other support has been added slowly for other packers such as **py2exe**, and **cx_Freeze**.

Like many other known packers, PyInstaller "freezes" the compiled bytecode files (or bundled `.egg`s)  generated from source, including both external and standard library dependencies, converting them into Python archives (`.pyz` files) and injects them together into a final executable, with `TOC` (table of contents) objects acting as a headers to those locations. Once the executable is run, the environment is setup such that the external dependencies are recovered and loaded into `sys.path` using import hooks, and the functionality implemented at the entry point is run.

To support unpacking for PyInstaller-based executables, **boa** interfaces and re-implements the functionality from the well-known [**pyinstxtractor**](https://github.com/extremecoders-re/pyinstxtractor) by the popular @extremecoders-re, which implements the unpacking process of Python archives, and recovering any bytecode paths and other important resources.

> Read more about PyInstaller internals here: \[https://pyinstaller.readthedocs.io/en/stable/advanced-topics.html\]([https://pyinstaller.readthedocs.io/en/stable/advanced-topics.html](https://pyinstaller.readthedocs.io/en/stable/advanced-topics.html) "https://pyinstaller.readthedocs.io/en/stable/advanced-topics.html"))

## Boa Intrinisics

With a quick look into how Python itself operates at a lower-level, we can now discuss how **boa** incorporates this together in order to automate reverse engineering.  I decided on the following workflow the platform was going to implement:

* **Executable Unpacking** - parse out resources and code from binaries created with various packers.
* **Bytecode Decompilation/Patching** - decompile and patch (if necessary) Python source from unpacked bytecode.
* **Deobfuscation** - attempt to recover readable source from bytecode and source-level obfuscation methods (_this is a WIP_).
* **Static Analysis** - scan relevant source files for detrimental security issues.
* **Report Generation** - generate a user-friendly report on executable.

At its core, **boa** is built up with the [Flask](https://flask.palletsprojects.com/en/1.1.x/) web framework, with [Socket.io](https://socket.io/) integration, which allows us to reliably perform bidirectional communication between a client and a server worker. With the [Flask-Socketio](https://flask-socketio.readthedocs.io/en/latest/) library, a bulk of the analysis workflow was built into our core `BoaWorker` object, which encapsulated each step of the process through a specific channel callback, as seen below:

```python
import flask_socketio as sio

class BoaWorker(sio.Namespace):
	...

    def on_identify(self):
	    pass

    def on_unpack(self):
	    pass

    def on_decompile(self):
	    pass
```

The design for the current architecture for **boa** can be seen here:

![](https://i.imgur.com/UKM2Fcd.png)

When a file is first passed to the web application for scanning, a socket connection is instantiated with a web-based worker running aside the app, communicating with it to perform the necessary analysis. When first identifying the file, rudimentary signature-based detection with YARA is used, checking to see if the executable present is compiled with a known Python-based packer.

Then, if it is detected that the target is both Python-compiled and a valid executable (PE/.exes are currently only supported), the corresponding unpacker implementation (which all inherit the base `BoaUnpacker` object) rips the format apart, and recovers any bytecode files throughout the executable (see snippet below) based on any TOC metadata. Remember that during each step, real-time information is communicated back to the webapp, which allows it to dynamically update the front manner for the user to see the ongoing process.

```python
    def on_unpack(self):
        """
        Server-side message handler to call unpacker routine against the executable stored
        in the workspace.
        """

        # stores bytecode paths parsed out
        self.bytecode_paths = []

        # start unpacking into the workspace directory
        unpacked_dir = os.path.join(self.workspace, "unpacked")
        try:
            self.bytecode_paths = self.packer.unpack(unpacked_dir)
        except Exception as e:
            self.error = str(e)

        # delete workspace if unpacking failed at some point
        cont = False if self.error else True
        if not cont:
            shutil.rmtree(self.workspace)

        # get rid of binary on server at this point, we don't want live malware or big files.
        os.remove(self.path)

        # add a bit of latency since this is pretty quick
        time.sleep(1)
        self.emit(
            "unpack_reply",
            {
                "extracted": len(self.bytecode_paths),
                "continue": cont,
                "error": self.error,
            },
        )
```

Once we filter out relevant source files by checking against a dataset of known Python dependencies, a `BoaDecompiler`, which is simply an abstraction over the `uncompyle6` tool's API, helps recover the source code, stores them on disk serverside, and uses the [Bandit](https://bandit.readthedocs.io/en/latest/) static analysis engine to find security issues. by leveraging Bandit, we can automatically discover any pressing security issues early on, which may provide primitives for further exploitation.

At this stage, the analysis is complete, and we want to store the information recovered from this process. **boa** zips the workspace directory that it has been working with serverside, and uploads it to an AWS S3 bucket. The URL to the object, and any global metadata (i.e updated total number of sources files recovered, issues found, etc.) will be updated to a SQLite database, which is used to retrieve the entry per analysis result in order to generate a report for the user when requested.

### Demo

> **PLEASE NOTE** that the instance being served on my domain is static, since the web worker communicating with the application to undergo any reversing tasks is kicked. You may want to self-host a version of Boa yourself at the current moment.

This all sounds interesting yet complicated, so let's take a look at a demo video to see **boa** in action! Here, it is scanning and analyzing a sample PyInstaller-compiled executable, which it then seamlessly unpacks, decompiles and recovers source code. Notice how it has also detected a single high-severity issue in one of the known dependencies, which involves the misuse of `shell=True` when invoking a subprocess.

<div style="padding:48.93% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/458176992?title=0&byline=0&portrait=0" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>

## Future Work

**boa** is by no means a finished project, and may be something that will never stop being iterated. In the future, I'm hoping to support more packers, have detection and tooling to break deobfuscated sources, support allowing multiple analysis workers with a Redis task queue, and so on! I believe that this platform is quite valuable for the work that I do, and I hope it does for other people. If you are interested in helping contribute to this early-stage platform for the security community, feel-free to check out the open-sourced version of **boa**, available on [Github](https://github.com/ex0dus-0x/boa).
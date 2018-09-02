---
title: Using the Python C API to Interface CPUID Interactions
date: 2018-07-20 00:00:00 Z
layout: post
---

I recently had to implement an application that completes preemptive low-level system checks, such as ensuring that the CPU microarchitecture is correct before execution. This is done through the CPUID opcode instruction (not the software for benchmarking, but does some similar aspects), which provides processor details and features. However, the application was written in Python, and when I talk about _low-level_ stuff, its obviously going to be with C and Assembly. So today, let's take a look at how we can interface `CPUID` through C inline assembly, such that we are able to information back to our high-level Python application.
<!--more-->
## How CPUID works

`CPUID` is an x86 assembly instruction that takes no parameters. This means that before making a `cpuid` call, we must ensure that the `eax` variable is set with the proper flag. The result will be then stored within the `ebx`, `ecx`, and `edx` variable.

We will be implementing a wrapper library for Python written in C called `libcpuid`, which provides an interface method that does two very simple oepration: check to see if the CPU vendor is valid, and check to see if our CPU microarchitecture is supported.

## Implementation

Let's start in `cpuid.c` by defining the necessary headers.

```c
#include <string.h>
#include <stdint.h>               /* since our registers are all 32-bit sized. we can rely on uint32_t */
#include <python2.7/Python.h>     /* important for interfacing our final method */
```

Our first operation is to actual create a static function that calls upon inline assembly. This would make things a lot more easier for all of our other operations, as we can simply provide the necessary registers as parameters, and get results back.

```c
static inline void cpuid(uint32_t *eax, uint32_t *ebx, uint32_t *ecx, uint32_t *edx)
{
        asm volatile("cpuid"
            : "=a" (*eax),
              "=b" (*ebx),
              "=c" (*ecx),
              "=d" (*edx)
            : "0" (*eax), "2" (*ecx));
}
```

Both `eax` and `ecx` registers act as input and outputs (although we will be interfacing with `eax` a lot more), and can be represented by the `0`th and `2`nd output arguments, respectively.

We now have a useful representation of an Assembly instruction as a C function. Let's put it to work for our first operation

### Get CPUID vendor string (eax = 0)

We want to retrieve a valid supported vendor string (either `GenuineIntel`, or `AuthenticAMD`).

This operation returns a ASCII string stored in the `ebx`, `edx` and `ecx` registers (in that order) that represents the vendor string. If were to do this in traditional Intel x86, it would look as so:

```
_main:
    mov eax, 0                    ; set eax = 0 for vendor string operation
    cpuid                         ; call CPUID
    call preg                     ; print registers

    mov DWORD ptr [msg], ebx      ; our result is now stored in a 12 byte string
    mov DWORD ptr [msg+4], edx    ; within the ebx, edx and ecs registers
    mov DWORD ptr [msg+8], ecx    ; i.e "AuthenticAMD"
```

Let's define this as a C function:

```c
static void cpuid_vendor(char * name)
{
        /* set 12th char to 0 */
        name[12] = 0;

        /* eax = 0 for vendor */
        uint32_t eax;
        eax = 0;

        /* call cpuid, storing output in ebx, edx, and ecx */
        cpuid(&eax, (uint32_t *) &name[0], (uint32_t *) &name[8], (uint32_t *) &name[4]);
}
```

The code is incredibly straightforward. We pass a C string (as denoted by the pointer) with a size of 13-bytes, and set the 12th byte to 0.
The `eax` register is set, and the `cpuid` C function is called, with arguments type-casted accordingly. The result would be stored back into the char array, in the (weird) register order. Since the function parameter is a pointer, we would not need to return anything.

### Get processor microarchitecture (eax = 1)

Let's say we want to support only a few microarchitectures for our application. For CPUID, we can represent processors as hex-encoded strings, stored in an array:

```c
static const uint32_t valid_pmu_cpu_type[25] = {
        0x106A0, 0x106E0, 0x206E0,          // IntelNehalem
        0x20650, 0x206C0, 0x206F0,          // IntelWestmere
        0x206A0, 0x206D0, 0x306e0,          // IntelSandyBridge
        0x306A0,                            // IntelIvyBridge
        0x306C0, 0x306F0, 0x40650, 0x40660, // IntelHaswell
        0x306D0, 0x40670, 0x406F0, 0x50660, // IntelBroadwell
        0x406e0, 0x50650, 0x506e0,          // IntelSkylake
        0x30670, 0x50670,                   // IntelSilvermont
        0x806e0, 0x906e0                    // IntelKabylake
};
```

There is a general operation that returns a whole bunch of CPU processor information, but it also requires a little bit of bitwise unmasking on our behalf. Let's take a look at the Intel x86 again:

```
_main:
    mov eax, 1                    ; set eax = 1 for processor information
    cpuid                         ; call CPUID
    call preg                     ; print registers, but we are only interested in what's in eax
```

Simple, right? And the C code is understandable as well:

```c
static uint32_t cpuid_processor_info()
{
        /* temporary registers to hold results */
        uint32_t eax, ebx, ecx, edx;

        /* eax = 1 for processor information */
        eax = 1;

        /* use all registers for output consuming purposes. */
        cpuid(&eax, &ebx, &ecx, &edx);

        /* return signature, must be unmasked */
        return eax;
}
```

As mentioned earlier, it turns out in order for whatever is returned in `eax` to match what is in `valid_pmu_cpu_type[]`, we must first perform this unmasking operation:

```c
/* check CPU microarchitecture through unmask */
uint32_t cpuid_data = cpuid_processor_info();
uint32_t cpu_type = cpuid_data & 0xF0FF0;
```

And from there we can check against our array:

```c
/* check if microarchitecture is appropriate for use */
for (i=0; i <= sizeof(valid_pmu_cpu_type); i++){
        if (valid_pmu_cpu_type[i] == cpu_type) {
                /* return a exit code 0 */
        }
}
```

### The Python Stuff

Alright! Let's take our low-level stuff and make it deployable to an actual Python module. Our final interface looks like so:

```c
/* main Python interface */
static PyObject* cpuid_check(PyObject *self, PyObject *noargs)
{
        int i;

        /* check vendor: only Intel and AMD processors supported */
        char vendor[13];
        cpuid_vendor(vendor);

        if (strcmp(vendor, "GenuineIntel") && strcmp(vendor, "AuthenticAMD")) {
                PyErr_SetString(PyExc_RuntimeError, "invalid vendor string");
                return NULL;
        }

        /* check CPU microarchitecture through unmask */
        uint32_t cpuid_data = cpuid_processor_info();
        uint32_t cpu_type = cpuid_data & 0xF0FF0;

        /* check if microarchitecture is appropriate for use */
        for (i=0; i <= sizeof(valid_pmu_cpu_type); i++){
                if (valid_pmu_cpu_type[i] == cpu_type) {
                        /* return a exit code 0 */
                        return Py_BuildValue("i", 0);
                }
        }

        /* returned if microarchitecture is not found */
        PyErr_SetString(PyExc_RuntimeError, "unsupported CPU microarchitecture");
        return NULL;
}
```

Simple, right? `cpuid_check()` requires no arguments, performs our two specified operations, and will return either a `0` when successful or a `RuntimeError` exception.

But we aren't done, as we still need to do the initialization housekeeping that can allow it to be compiled correctly as a `.so`:

```c
/* docstrings for method */
static char cpuid_docstring[] =
        "Checks for appropriate vendor string and processor microarchitecture.";

/* module specification */
static PyMethodDef module_methods[] = {
        {"cpuid_check", cpuid_check, METH_VARARGS, cpuid_docstring},
        {NULL, NULL, 0, NULL}
};

/* initialize the module */
PyMODINIT_FUNC initcpuid(void)
{
        (void) Py_InitModule("cpuid", module_methods);
}
```

This creates our (optional) docstring that we can plug into an array that defines all of the methods we are exporting. We finally call `initcpuid` for module initialization.

(I would get into more detail about how Python and C work together through the API, such as the awesome reference-counting, but that's another story for another time).

## Execution

Alright! Let's get this setup and ready to use in Python.

We have the option of compiling this just through `gcc` if we aren't doing incredibly fancy stuff:

```bash
$ gcc -fpic --shared $(python-config --includes) cpuid.c -o cpuid.so
```

But for using in a large-scale application or library, we can integrate this within `setup.py`:

```python
from setuptools import setup, find_packages
from setuptools.extension import Extension

CPUID_EXTENSION = Extension('cpuid', ['src/cpuid.c'],
                             extra_compile_args=["-Wall"])

# Main setup method
setup(
   # ... the usual stuff
   ext_modules=[
       CPUID_EXTENSION
   ]
)
```

We can now use this in Python!

```python
import cpuid

assert cpuid.cpuid_check(), 0
```

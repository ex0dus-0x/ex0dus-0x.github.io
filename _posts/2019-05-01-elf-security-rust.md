---
title: Binary Security Detection with Rust
date: 2019-05-01
layout: post
---

I released [binsec](https://github.com/ex0dus-0x/binsec), a simple utility that checks for security features in Linux ELF binaries. It works similarly to `checksec.sh`, but is instead built in Rust and with the [libgoblin](https://github.com/m4b/goblin) library. By utilizing a systems language and a lower-level binary parser, we can learn quite a bit about the intricacies of ELF binaries and how they work, and construct static analysis tools to better test for security.

## Quick Primer into ELF

> NOTE: I won't be providing a detailed look into the nature of ELF and its role in during compilation and program execution (ie with dynamic linking), but rather a larger abstract idea that it fulfills.

At the end of the day, binaries are just files written in a special format. This format, ELF, is interpreted by the kernel, which employs a set of handlers that determines what to do. The ELF format includes various information about where the stack resides, memory mappings, relocations to symbols in dynamically loaded libraries, etc.

ELF binaries can utilize a variety of a security mechanisms that prevent various attacks (i.e memory corruption, ret2libc). These are often configurable by the compiler, which ensures these mechanisms are place during linking. Today, we want to better understand what some of these features are, how they are used in defense to modern textbook binary exploitation techniques, all while building a working implementation.

Let's introduce these mechanisms as we break down `binsec`'s code. First, we need to initialize our Rust CLI tool as so:

```rust
extern crate goblin;

#[cfg(target_pointer_width = "64")]
use goblin::elf64 as elf;

#[cfg(target_pointer_width = "32")]
use goblin::elf32 as elf;

use goblin::elf::{header, program_header, ProgramHeader};
use goblin::elf::dynamic::{tag_to_str, Dyn};
use goblin::Object;

fn main() {

    // in an ideal release version, there would be more robust cli argparsing
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 2 {
        panic!("please supply a binary name");
    }

    // retrieve bin arg and initialize path and file
    let binary = args[1];
    let path = Path::new(binary);
    let mut fd = File::open(path).unwrap();

    // read file to buffer and parse (continue only if ELF32/64
    let mut buffer = Vec::new();
    fd.read_to_end(&mut buffer).unwrap();
    let elf = match Object::parse(&buffer).unwrap() {
        Object::Elf(elf)    => elf,
        _                   => { panic!("unsupported binary format"); }
    };

    // output ELF object
    println!("{:#?}", elf);
}
```

> To read more about ELF: https://linux-audit.com/elf-binaries-on-linux-understanding-and-analysis/

Before we dive right into detecting for security features, we can get our feet wet first with the ELF _executable header_, which provides basic information about about the binary filetype, architecture, etc. The (shortened) type definition as a C `struct` for `Elf64_Ehdr` appears as so:

```c
typedef struct {
    unsigned char   e_ident[16];
    uint16_t        e_type;
    uint16_t        e_machine;
    uint16_t        e_version;
    uint16_t        e_entry;
    ...

} Elf64_Ehdr;
```

When parsed and outputted in `Debug` format, the executable header can be seen as so:

```
Elf {
    header: Header {
        e_ident: [127, 69, 76, 70, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        e_type: "DYN",
        e_machine: 0x3e,
        e_version: 0x1,
        e_entry: 0x1070,
        e_phoff: 0x40,
        e_shoff: 0x3810,
        e_flags: 0,
        e_ehsize: 64,
        e_phentsize: 56,
        e_phnum: 10,
        e_shentsize: 64,
        e_shnum: 34,
        e_shstrndx: 33
    },
	...
```

While each `struct` field represents a numerical data type, libgoblin provides a set of helpers that ensures that we can properly convert constant values into string representations. So let's put that to work as we actually parse out some basic binary information:

```rust
// binary name
println!("Binary name: {}", binary);

// machine type - specifies the ISA
println!("Machine: {]", header::machine_to_str(elf.header.e_machine));

// file class - 32 or 64 bit binary?
let file_class: &str = match elf.header.e_ident[4] {
    1 => "ELF32",
    2 => "ELF64",
    _ => "unknown"
};
println!("File Class: {}", file_class);

// entry point - virtual address where the program should begin execution
// this uses the format_args! macro helper for proper string formatting
println!("Entry Point: {}", &format_args!("0x{:x}", elf.header.e_entry));
```

One important piece of information is actually the `header.e_type` attribute, which specifies what _type_ of binary the file is. A [public helper](https://docs.rs/goblin/0.0.22/src/goblin/elf/header.rs.html#128) in libgoblin parses a `u16` to an appropriate string constant:

```rust
/// Convert an ET value to their associated string.
#[inline]
pub fn et_to_str(et: u16) -> &'static str {
    match et {
        ET_NONE => "NONE",
        ET_REL => "REL",
        ET_EXEC => "EXEC",
        ET_DYN => "DYN",
        ET_CORE => "CORE",
        ET_NUM => "NUM",
        _ => "UNKNOWN_ET",
    }
}
```

Thus, we can use this in order to provide some information back to the user:

```rust
// binary type
println!("Binary type: {}", &header::et_to_str(elf.header.e_type));
```

## Checking For Security Features

Now that we are familiar with libgoblin, we can harness the library to actually check for various binary security features. But before we continue, it is important to note that besides the executable header, the ELF format also comprised of __section headers__ and __program headers__.

__Section headers__, otherwise known as just sections, are contiguous chunks that store code and data used during execution, and is especially useful during linking and relocation. If you have programmed in x86/x86-64, you may be already familiar with some of these sections, such as `.text`, `.bss`, and `.data`.

More importantly are __program headers__, as these are what defines the memory offsets used during process execution. The kernel first reads these offsets, and utilizes `mmap` in order to appropriate map to a virtual address space for execution. We can use some of the program headers present in binaries and interpret their flags in order to determine if a feature is enforced within the binary.

### Non-executable Stack

One of the simplest security features we can check first is for an __executable stack__. When improper bounds checking is put in place, an attacker can redirect execution _back_ to any inputted shellcode. However, this problem is mitigated when we ensure that writable addresses are not executable.

To check for this, we can refer to the `PT_GNU_STACK` program header and ensure that the flag set for that segment is read-write only.

```rust
// NX bit is set when GNU_STACK is read/write only (RW)
let stack_header: Option<ProgramHeader> = elf.program_headers
    .iter()
    .find(|ph| program_header::pt_to_str(ph.p_type) == "PT_GNU_STACK")
    .cloned();

if let Some(sh) = stack_header {
    if sh.p_flags == 6 {
        println!("NX bit Enabled");
	} else {
		println!("NX bit Disabled");
	}
}
```

Notice in this case how we utilize Rust's _iterators_, utilizing `std::iter::Iterator::find` to initialize closure that tests a predicate. Iterators are incredibly advantageous for processing items, especially those that are structured, like program headers in ELF binaries!

> Read more: https://www.usenix.org/legacy/publications/library/proceedings/sec98/full_papers/cowan/cowan_html/node21.html

### RELRO - RELocation Read-Only

ELF binaries that need to dynamically resolve functions from shared libraries utilize the GOT (Global Offset Table) and PLT (Program Linkage Table) to perform relocations. However, these relocations are not performed until runttime due to "lazy binding". Therefore, if an attacker knows the memory offsets of the GOT/PLT, they can essentially perform an overwrite to change control flow to a malicious routine.

RELRO, or RELocation Read-Only, ensures that during compilation, the linker should resolve dynamically linked functions during the beginning of execution, (also known as __lazy binding__) and that the GOT should be made read-only after. This is supported by default with most compilers/linkers, and is also known as _partial RELRO_.

We can check for this through the `PT_GNU_RELRO` program header, checking to see if it was made to be read-only.

We can also check to the see if the ELF binary supports _full_ RELRO. With _full_ RELRO, lazy binding is now thrown out of the window, as we make the entirety of the GOT read-only, and that all symbols and addresses are resolved _before_ execution. We can check for this using the `DT_BIND_NOW` dynamic linker symbol, which tells our linker to ensure we have _full RELRO_ and that we should resolve our symbols before actual execution.


```rust
let relro_header: Option<ProgramHeader> = elf.program_headers
    .iter()
    .find(|ph| program_header::pt_to_str(ph.p_type) == "PT_GNU_RELRO")
    .cloned();

if let Some(rh) = relro_header {

	// 4 => read-only
    if rh.p_flags == 4 {

		// check for full/partial RELRO support
		if let Some(segs) = elf.dynamic {
			let dyn_seg: Option<Dyn> = segs.dyns
				.iter()
				.find(|tag| tag_to_str(tag.d_tag) == "DT_BIND_NOW")
				.cloned();

			if let None = dyn_seg {
				println!("Partial RELRO enabled");
			} else {
				println!("Full RELRO enabled");
			}
		}
	}
} else {
    println!("No RELRO enabled");
}
```

> Read more: https://blog.osiris.cyber.nyu.edu/exploitation%20mitigation%20techniques/exploitation%20techniques/2011/06/02/relro-relocation-read-only/

### Stack Canary

A stack canary is another type of stack smashing prevention mechanism by appending an extra bit to a function return address. This way, if an attacker attempts to perform an attack like ret2lib that overwrites the function return address, the stack canary bit is also overwritten. Checks are performed to see if this bit has been altered, and if so, the program abruptly segfaults/crashes rather than continue with execution.

![binninja](/assets/sec-1.png)

This program was compiled with `-fstack-protector-all`. Notice the existence of the `__stack_chk_fail` routine and the check performed at the end of the function with the `je` instruction.

Instead of parsing segments to determine if this check is performed, we can instead parse a section, specifically `.strtab` for the `__stack_chk_fail` symbol. `.strtab` is the string table section, which stores null-terminated strings referenced to by the `.symtab` (symbol table) section. These symbols can be resolved statically, rather than relying on lazy binding with dynamic loading.

```rust
let strtab = elf.strtab.to_vec().unwrap();
let str_sym: Option<_> = strtab
    .iter()
    .find(|sym| sym.contains("__stack_chk_fail"))
    .cloned();

if let None = str_sym {
    println!("Stack canary not enabled");
} else {
    println!("Stack canary enabled");
}
```

> Read more: https://savita92.wordpress.com/2012/11/03/stack-canary/

## Conclusion

Rust is a language that supports programming under a functional paradigm while still being able to interact with low-level abstractions like binary files. This makes it an especially powerful and performant language, and I am excited to do more with it in regards to security and infrastructure.

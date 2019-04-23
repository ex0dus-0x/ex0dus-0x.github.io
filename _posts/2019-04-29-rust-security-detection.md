---
title: Binary Security Detection with Rust
date: 2019-04-29
layout: post
---

I released [binsec](https://github.com/ex0dus-0x/binsec), a simple utility that checks for security features in Linux ELF binaries. 
It works similarly to `checksec.sh`, but is instead built in Rust and with the [libgoblin](https://github.com/m4b/goblin) library. By utilizing a systems language and a lower-level binary parser, we can learn quite a bit about the intricacies of ELF binaries and how they work.

## Quick Primer into ELF

At the end of the day, binaries are just files written in a special format. This format, ELF, is interpreted by the kernel, which employs a set of handlers that determines what to do. The ELF format includes a ton of various information about where the stack resides, memory mappings, relocations to symbols in dynamically loaded libraries, etc.

ELF binaries employ a variety of a security mechanisms that prevent various attacks (i.e memory corruption, ret2libc). These are often configurable by the compiler, which ensures these mechanisms are place during linking.

Let's introduce these mechanisms as we break down `binsec`'s code. First, we need to initialize our Rust CLI tool as so:

```
// main.rs
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

Before we dive right into detecting for security features, we can get our feet wet first with the ELF _executable header_, which provides basic information about about the binary filetype, architecture, etc. The (shortened) type definition as a C `struct` for `Elf64_Ehdr` appears as so:

```
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
```

While each `struct` field represents a numerical data type, libgoblin provides a set of helpers that ensures that we can properly convert constant values into string representations. So let's put that to work as we actually parse out some basic binary information:

```rust

// binary name
println!("Binary name: {}", binary);

// machine type (with helper)
println!("Machine: {]", header::machine_to_str(elf.header.e_machine));

// file class
let file_class: &str = match elf.header.e_ident[4] {
    1 => "ELF32",
    2 => "ELF64",
    _ => "unknown"
};
println!("File Class: {}", file_class);

// binary type

```

One important piece of information is actually the `header.e_type`...

## Checking For Security Features

Now let's get into the good stuff: detecting security features. 






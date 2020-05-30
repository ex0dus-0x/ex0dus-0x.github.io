---
title: Design and Implementation of a Turing Machine
date: 2018-12-30
layout: post
image: https://pbs.twimg.com/media/DjBH2txXgAALVs3.jpg
tags: [technical, rust, theory]
---

## Theory

The concept of modern computing can be formally defined by Alan Turing's famous publication, _On Computable Numbers_, mentioning the use of abstract computing machines that can execute any set of rules/instructions, which we call _algorithms_ these days.

In computational theory, these machines are known are _Turing machines_.
We can represent them using an infinitely long tape, with cells on these tapes. We can also think of an _instruction pointer_ pointing to a cell, which can move to other cells and change their state.

```
[ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ]
                ^
```

Instructions fed as input to the machine are parsed and executed accordingly, and is what moves the IP and change the state. Knowing this, we can list properties that define all Turing machines:

1. Finite internal state - _i.e hardrives, registers_
2. Loops and iteration - _i.e CPU cycle, for/while_
3. Conditionals - _i.e branching, if/else_
4. Replicable - _i.e emulation, compiler bootstrapping_

The fourth property is what leads to the idea of the _universal Turing machine_, where a Turing machine can replicate capabilities of another Turing machine. Of course, in modern times, this is apparent in our technology: hypervisor emulating other ISAs, virtual machines that emulate bytecode (i.e JVM with Java).

As trivial as it already sounds, it becomes much weirder realizing that these machines are able to run any program imagined. On practical example is the esoteric yet Turing-complete language [Brainfuck](https://esolangs.org/wiki/brainfuck), which utilizes a tape and instruction set very similar to a Turing machine, and it has been able to do complex stuff like  [generate Mandelbrot images](https://www.youtube.com/watch?v=ABnBd0VZmPI). Furthermore, Brainfuck can also represent a _universal Turing machine_, as it demonstrates the ability to [self-compile](https://github.com/matslina/awib).

Now with this theory behind us, let's actually construct a Universal Turing machine in the Rust programming language!

## Design

Our universal machine, `xb` can be represent by two cells, which can represent our finite tape:

```
    | B | B |
```

whose initial contents are `B`.

In actuality, we are more going to represent the design of `xb` as a finite state machine, where we have two states that can transition to one another based on instructions.

```
+---+ ------> +---+
| x |         | b |
+---+ <------ +---+
```

In order to alter the contents of each cell from `B` to `X` or `X` to `B`, we will need to define instructions. We also need instructions to move our IP.

Here's our instruction set:

```
R       = move cell to the right
L       = move cell to the left
->      = alter content of cell
s1..s4  = state symbols
```

A sample program defined by our syntax would look as so:

```
<Current Char> <State> -> <New Char> <Instruction> <Next State>

    B, s1 -> X, R, s2
    B, s2 -> B, L, s3
    X, s3 -> B, R, s4
    B, s4 -> B, L, s1
```

Looking at the first line of the program, we can see that we define our first state, which starts in the first cell with `B`. The specification then mentions to alter the state to `X`, move to the right, moving on to the second state.

## Implementation

Let's implement `xb` in Rust! We first define a `struct` that represents a state:

```rust
struct State<'a> {
    current_char: char,     // defines char stored in state, either `X` or `B`.
    current_state: &'a str  // name of current state
}
```

We can also define an `Instruction` struct:

```rust
struct Instruction<'a> {
    symbol: char,           // char to alter to
    direction: char,        // defines where to move IP
    next_state: &'a str     // defines the next state to transition to
}
```

What we can now do is emulate this kind of Turing machine through the use of Rust's `HashMap<K, V>` type from its standard library.

```rust
use std::collections::HashMap

type XbMachine<'a> = HashMap<State<'a>, Instruction<'a>>;
```

Let's now also define a `trait` for the `XbMachine` type, as it is just a specific type alias for a `HashMap`.
This way we can now specify methods for implementation only for `XbMachine`:


```rust
trait XbExt {
    fn xb_new(vec_state: Vec<(char, &'static str)>, vec_instruction: Vec<(char, char, &'static str)>) -> Self;
    fn xb_simulate(&mut self) -> ();
}
```

Here we will now actually implement these methods, starting with `xb_new()`:

```rust
impl<'a> XbExt for XbMachine<'a> {
    pub fn xb_new(vec_state: Vec<(char, &'a str)>, vec_instruction: Vec<(char, char, &'a str)> ) -> XbMachine<'a> {

        // create a new machine
        let mut isa = HashMap::new();

        // create states based on those passed in `Vec` argument
        for i in 0..vec_state.len() {

            // Create the new State from the first tuple provided
            let state = State {
                current_char: vec_state[i].0,
                current_state: vec_state[i].1
            };

            // Create the new Instruction from the second tuple provided
            let instruction = Instruction {
                symbol: vec_instruction[i].0,
                direction: vec_instruction[i].1,
                next_state: vec_instruction[i].2
            };

            // Insert both into the HashMap
            isa.insert(state, instruction);
        }
        isa
    }
...
```

Here, we are simply initializing a new `HashMap`, and adding `State`s with their corresponding `Instruction`s.

Once the `HashMap` is initialized with the states and instructions, we can now simulate execution. Following along with the comments,
we can see how the execution loop plays out, pattern matching the instructions and altering the tape cells as necessary:

```
    pub fn xb_simulate(&mut self){
        // First, let's declare our tape as a vector
        let mut tape: Vec<char> = vec!['B', 'B'];

        // Let's also declare an index, or head, for our tape.
        let mut head: isize = 0;

        // Set the default state to start in.
        let mut index_state: &str = "s1";

        // Simulate in an infinite loop, until killed
        loop {

            // Iterate over the HashMap by unpacking the key (State) and value (Instruction)
            for (state, instruction) in self.iter() {

                // Set the default state as the initial symbol and the state
                let index_key = (tape[head as usize], index_state);

                // Check if a tuple comprising of the elements of a key is equal to index_key.
                if (state.current_char, state.current_state) == index_key {

                    // Print the current state of the tape.
                    println!("{:?}", tape);

                    // Output the current instruction being executed.
                    println!("{:?}, {:?} -> {:?}, {:?}, {:?}", state.current_char,
                        state.current_state, instruction.symbol, instruction.direction,
                        instruction.next_state);

                    // Now, set the cell in the tape to the specified symbol
                    tape[head as usize] = instruction.symbol;

                    // Move to the cell as specified by the direction
                    match instruction.direction {
                        'R' => head += 1,
                         _  => head += -1,
                    }

                    // This means that the head has fallen through the cracks of
                    // unsigned-signed space and time.
                    if head < 0 {
                        head = 1;
                    } else if head > 2 {
                        head = 0;
                    }

                    // Assign state to the new state as specified by instruction
                    index_state = instruction.next_state;
                }
            }
        }
    }
}
```

Nice! Since I wrote this as a library crate, I decided to test this by writing a test case:

```rust

mod tests {
    #[test]
    fn it_works(){

        // initialize our states
        let xb_states = vec![
            ('B', "s1"),
            ('B', "s2"),
            ('X', "s3"),
            ('B', "s4")
        ];

        // create our instructions
        let xb_instructions = vec![
            ('X', 'R', "s2"),
            ('B', 'L', "s3"),
            ('B', 'R', "s4"),
            ('B', 'L', "s1")
        ];

        // create a new machine, and simulate
        let mut xb_isa = XbMachine::xb_new(xb_states, xb_instructions);
        xb_isa.xb_simulate();
    }
}
```

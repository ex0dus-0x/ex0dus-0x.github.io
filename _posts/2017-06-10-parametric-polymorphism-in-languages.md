---
title: Parametric Polymorphism in Programming
date: 2017-06-10 00:00:00 Z
layout: post
---

__Parametric polymorphism__ is one of the key programming paradigms that I've realized is in every expressive and powerful programming language. It is the ability for a language to be able to create data types and structures such that they are able to handle data generically. <!--more-->This enables type safety, as well as programmers not needing to worry about type coercion.

As a beginner to type systems and generic programming, I've come to realize the importance of polymorphism, especially in object-oriented programming. Not only does it enable you to write flexible code and save time doing so, but also to compile and debug more efficiently as well. What is also great about parametric polymorphism is the ability to reproduce type-safe code, while also maintaining portability and not having to duplicate code.

Parametric polymorphism are often expressed through __generics__ and __templates__. Keep in mind that we are referring to __parametric__ polymorphism, whereas polymorphism alone deals with the property of classes in object-oriented languages.

We will be examining such features discussed within two languages: Rust and C++.

But why?

* Understand how programming language design operates and understand their style and the purposes behind such design, and how it implements in large-scale services, especially web and application design.

---

## C++

In C++, __templates__ are considered the foundation for generic programming. Templates are extensible to functions and classes.

```c++
// Simple function template
 template<typename T>
 T multiply(T a, T b) {
   return a * b;
 }
```

One of the only problems that concern C++ is the fact that type inference is not implemented. Therefore, utilizing the above template wouldn't deem functional if do not explicitly provide a cast when passing arguments of different types. Do be warned that types are checked at compile-time, and that the process of operating and type-checking can be incredibly excruciating. Therefore, implementing C++ templates require a level of delicacy and understanding.

```c++
#include <iostream>
#include <string>

int main()
{
  std::cout << multiply(4, 5) << std::endl; // implicit cast to int, returns 20
  std::cout << multiple<double>(3.0, 4.0) << std::endl; // explicit cast to double, returns 12.0
  std::cout << multiple(2.0, 1) << std::endl; // no explicit cast, different types implemented
}
```

However, C++ still implements templates powerfully within both the Standard Template Library and the Boost Libraries. One great example is utilizing `std::vector` over a standard array.

```c++
#include <vector>

size_t size = 10;
std::vector<int> array(size);
```

## Rust

Rust utilizes `<` and `>` for generic syntax. Through Rust's type-safety system, type specification is immediately checked, when called, unlike C++, which does it at compile-time.

Generics can be implemented for functions, structs, enums and `impl` blocks that are associated to its struct or enum. Here is an example of how generics can be implemented.

```rust
struct Player<T> {
  health: T,
  coins: T,
  stamina: T,
}

impl<T> Player<T> {
  fn output(&mut self) {
      println!("Stats: \n Health: {:?}, Coins: {:?}, Stamina: {:?}", health, coins, stamina);
  }
}


fn main() {
  let Player1 = Point { health: 32, coins: 10, stamina: 5};
}
```

---

## Rust versus C++ and in Discussion of Traits

Let's compare Rust and C++ in terms of their implementation of parameteric polymorphism, and understand how why a language
like Rust can be much more powerful.

One great Gist that I found explained this concept quite well with simple to understand code.
[Here is the link](https://gist.github.com/brendanzab/9220415). I will be using the code from the Gist and annotating it.

```c++
template <typename T>
T fact(T n) {
  return n == T(0) ? T(1) : fact(n - T(1)) * n;
}

int main()
{
  auto x = fact("hi");
}
```

This will obviously return an error. Working with calculations on a `string` type is a no-no.
What is intriguing is the stack trace that is returned:

```
Untitled 3.cpp:3:46: error: invalid operands to binary expression ('long' and 'const char *')
return n == T(0) ? T(1) : fact(n - T(1)) * n;
                          ~~~~~~~~~~~~~~ ^ ~
Untitled 3.cpp:7:14: note: in instantiation of function template specialization 'fact<const char *>' requested here
auto x = fact("hi");
         ^
1 error generated.
```

Looking at the output, it seems that the error is taking place within the `fact()` template function. This goes back to my previous convictions surrounding parametric polymorphism in C++: __type-safety and implementation is checked during compile-time__.

This of course is also erroneous on Rust.

```rust
use std::num::{One, one, Zero, zero};

fn fact<T: Eq + Zero + One + Mul<T, T> + Sub<T, T>>(n: T) -> T {
  if n == zero() { one() } else { fact(n - one()) * n }
}

fn main() {
  println!("{}", fact("hi"));
}
```

However, where does the error occur?

```
Untitled 6.rs:8:20: 8:24 error: failed to find an implementation of trait std::num::Zero for &'static str
Untitled 6.rs:8     println!("{}", fact("hi"));
                                   ^~~~
note: in expansion of format_args!
<std macros>:2:23: 2:77 note: expansion site
<std macros>:1:1: 1:1 note: in expansion of println!
Untitled 6.rs:8:5: 8:32 note: expansion site
```

Once again, we see the strictness of Rust's type system. On call, once we attempt to pass a type that cannot implement the required interface, then we simply cannot work with the associated function.

Of course, if you have been using Rust for a while, it's always essential to look at __traits__. __Traits__ are features in Rust's that enable the programmer to specify the how types should work and how they should be implemented with code. Looking back at our earlier code, we have seen how useful `impl` blocks have been for extending structures such as `structs`. In fact, you have already seen trait bounds be implemented on such structures, in the form the syntax `<T>`. But let's explicitly look at `trait` type declarations.

```rust
trait Mathematical {
  fn multiply(&self) -> f64;
}

struct Expression {
  a: f64,
  b: f64,
}

impl Mathematical for Expression {
  fn multiply(&self) -> f64 {
    self.a * self.b
  }

}

fn check_my_math<T: Mathematical>(expression: T) {
    println!("This expression has a product of {}", expression.multiply());
}  

fn main() {
  let a = Expression {
      a: 1f64,
      b: 2f64,
  };

  check_my_math(a);

}
```

Hmmm... Interesting, correct? Definitely not something you see in C/C++. Actually you do. In this example, we see this syntax `impl Mathematical for Expression`. We are
actually extending the usage of the trait through inheritance. Of course, the rest of
the code seems familiar, if not guessable. Notice the function with generic bounds passed: `check_my_math<T: Mathematical>(expression: T)`.


---

I guess that is it for this post. I've been working quite a bit with type theory for a while now, as I am pretty interested in learning more about languages. I tend to blog about subject matters I'm not really familiar with, as it motivates me to pursue more research, compile more code, and really get to understand software.

---
title: First Class Functions in C
date: 2018-02-17 00:00:00 Z
layout: post
---

Working with `pthreads`, I started to ponder whether or not the C Programming
Language actually implements first-class functions to some extent. Well the answer?
_Not really. But sort of._ How? Pointers, of course!
<!--more-->

## First-Class / Higher-Order Functions. Same thing!

_(not necessarily the same thing, it turns out. Higher-order is more applicable for theoreotical and mathematical realms.)_

This is a property that is often displayed in higher-level programming languages, especially those that have an emphasis on functional programming. Implementing first-class functions does not only mean that you can pass functions into functions, but it means that you have the ability to manipulate a function just as you were to a mutable data type. Let's take the `lambda` for example:

```c
def print_me():
  print("Hello world!")

func = lambda x: x()
func(print_me)
```

In this code snippet, several things are occuring. After creating a regular function (assume in a strongly-typed sense, it returns `void`), we create an anonymous function that takes a function as a parameter, calling it. By setting it as if it were a data type, we are able to encapsulate a function within another function!

This adds a level of abstraction to our code, and with this, we are able to write flexible programs, and implement efficient features, such as iterators (functions such as `map()` and `filter()`), enabling the traversal of complex containers and data structures.

## How about C?

Let's first take a look at how `pthread_create` is implemented through manpages.

```
$ man pthread_create
...
int pthread_create(pthread_t *thread, const pthread_attr_t *attr, void *(*start_routine) (void *), void *arg);
```

Notice that third field, `void * (*start_routine)`. This is a pointer to the routine function that is to be executed once the thread is created. The catch is, the type of the function __MUST__ be a `void *`, as a return value can lead to unexpected results.

An example:

```c
#include <pthread.h>
#include <stdio.h>

void *thread_value(void *ptr){
  int value = (int) ptr;
  printf("Thread value passed: %s\n", value);
  return NULL;
}

int main(){

  pid_t tid;
  int arg = 1;

  pthread_create(&tid, NULL, *thread_value, (void *) arg);
  pthread_join(tid , NULL);

  return 0;
}
```

In our implementation, we pass a pointer to a void pointer of a function. I know, sounds weird! But the great thing about this function is that it also takes a typecasted `(void *)` argument, which means that the argument passed is not that of a specific type. The best way definition that I have seen is in this [Stackoverflow post](https://stackoverflow.com/a/11626816), where the user specified that a void pointer is _"pointer to memory with no assumptions what type is there stored"_.

Let's look a similar example, but this time, without any of the `pthread` nonsense.

```
#include <stdio.h>

/* Notice how this time, we do a typedef for our void * type so that we don't have
 * deal with the void * (void *) nonsense */

typedef void (*func)(void);

void our_function(){
  printf("Yayyy!\n");
  return NULL;
}

int main(){

  func ptr_func = &our_function;

  (*ptr_func)();

  return 0;
}

```

Overall, this is pretty hacky code. But what does this demonstrate? C does not yield __truly__ first-class functions. It requires a little hacking on how C manages memory, casting functions to an arbitrary pointer type, such that the compiler pretends not to care that a value being passed as an argument is in fact a pointer to a function. And since we are implementing pointers, we aren't really pushing and popping elements onto the program stack as we would normally do with regular data types. Plus, without the proper error handling, unexpected behavior is imminent.

Wow, C _is_ hard.

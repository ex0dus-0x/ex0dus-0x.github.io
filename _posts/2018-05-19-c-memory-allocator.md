---
title: Implementing a First-Fit Memory Allocator in C
date: 2018-05-19 00:00:00 Z
layout: post
---

A __memory allocator__ is implemented by a programming language at a system-level in order to track the allocation of blocks of data, and to see whether or not they are available for use and should / should not be destroyed. In C, this is the through the functionality of `malloc` and `free`.

Let's actually implement a memory allocator for C based on the popular first-fit linked-list-based model.
<!--more-->
## Prerequisites

I assume you understand how memory allocation works at the level of the stack. Therefore, let's look at how it instead occurs on the __heap__. The heap is a contiguous space of memory, and not very accessible for the user to interact with, as many of the operations done are strictly CPU-bound. With that said, this provides the flexibility of providing varying-sized allocations when calling `malloc`, which remains global throughout the run-time of the program in context. Of course, with our example in C, manual memory deallocation must occur, as no garbage collector is there to perform a mark-sweep deallocation.

`malloc` and `free` can be defined by these function prototypes:

```c
void * malloc(size_t size); // where we would implement sizeof() to determine size of allocation
void free(void *ptr);
```

The implementation of `malloc` relies on two system calls: `brk` and `sbrk`. Let's look at the manpages for these two functions:

```
man brk
...

int brk ( const void *addr );
void *sbrk ( intptr_t incr );

brk()  and sbrk() change the location of the program break, which defines the end of the process's data segment (i.e., the
       program break is the first location after the end of the uninitialized data segment).  Increasing the  program  break  has
       the effect of allocating memory to the process; decreasing the break deallocates memory.
```

As we can observe, this gives us a bit of a clue on how our heap is actually organized. The program break is the area that _bounds_ the heap until set by `malloc` or any other memory allocating function. This is also introduces us to THE heap having _initialized_ and _unintialized_ regions, where the _initialized_ space is occupied by virtual memory that has been mapped to real memory. When memory wants to be allocated, `sbrk` is called, which moves the break according to the given increment in bytes (whereas `brk` moves the break to a specified address). Once successful, `sbrk` will return a pointer to us with the address of the break point.

Keep in mind that for some experienced C/C++ developers, `mmap` and `munmap` are also feasible options for memory allocation. However, in alignment with many already existing examples, `sbrk` is good for learning.

## Implementation

Our implementation of a memory allocator, called __janitor__, available [here](https://github.com/ex0dus-0x/janitor), will implement a singly linked-list.

```c
struct janitor_block {
    size_t size; // represents the size of current block
    struct janitor_block *next; // represents next block
    int flag; // represents used or unused state
};

// typedef struct to janitor_t
typedef struct janitor_block janitor_t;

// implement a macro that defines the size of the entire linked list
#define BLOCK_SIZE sizeof(janitor_t)
```

We also want to define some global variables. This includes the linked-list's head and tail, which we can keep track of when doing reallocation or deallocation. We can also implement a mutex lock, as linked-list traversal can be considered a critical section when working with multi-threaded applications.

```c
// in order to keep track of our head and tail
janitor_t *head, *tail;

// implement a mutex such that threads do not interfere with memory allocation
pthread_mutex_t global_malloc_lock;
```

Let's first implement our helper function that traverses the tree and retrieves the next free block.

```c
static janitor_t *
get_free_block(size_t size)
{
    /* set head block as current block */
    janitor_t *current = head;
    while (current) {
        /* check if block is marked free and if ample space is provided for allocation */
        if (current->flag && current->size >= size)
            return current;
        /* check next block */
        current = current->next;
    }
    return NULL; // if not found
}
```

This is implemented such that starting at the head of the tree as the current block, it goes to each block and checks to see if the flag is set and the block allocation size is not greater than the head. If met, it then returns that block for use when performing allocation. Otherwise, it moves on to the next block

### malloc

Now let's take a look at how our `malloc`, aka `jmalloc`, is implemented. Take note that many of the implementation explanations are annotated as comments.

```c
void *
jmalloc(size_t size)
{
    /* define our static variables */
    size_t total_size;  // represents total size of linked list
    void *block;        // current block in context
    janitor_t *header;  // current context block

    /* error-check size */
    if (!size)
        return NULL;

    /* critical section start */
    pthread_mutex_lock(&global_malloc_lock);

    /* first-fit: check if there already is a block size that meets our allocation size and immediately fill it and return */
    header = get_free_block(size);
    if (header){
        header->flag = 0;
        pthread_mutex_unlock(&global_malloc_lock);
        return (void *) (header + 1);
    }

    /* if not found, continue by extending the size of the heap with sbrk, extending the break to meet our allocation */
    total_size = BLOCK_SIZE + size;
    block = sbrk(total_size);
    if (block == (void *) -1 ) {
        pthread_mutex_unlock(&global_malloc_lock);
        return NULL;
    }

    /* set struct entries with allocation specification and mark as not free */
    header = block;
    header->size = size;
    header->flag = 0;
    header->next = NULL;

    /* switch context to next free block
        - if there is no head block for the list, set header as head
        - if a tail block is present, set the next element to point to header, now the new tail
    */
    if (!head)
        head = header;
    if (tail)
        tail->next = header;

    tail = header;

    /* unlock critical section */
    pthread_mutex_unlock(&global_malloc_lock);

    /* returned memory after break */
    return (void *)(header + 1);
}
```

Following the same prototype signature as `malloc`, we now take a look at what it means to implement a _first-fit_ model. Before actually calling `sbrk` and moving the program break into umapped territory, the memory allocator should first call upon `get_free_block` to determine if there has already been an unmarked (non-allocated), returning it (where `header + 1` means a pointer to the region after `janitor_t`).

### free

With all these allocations on our tree, we also want to be able to free them at the end of execution. Here is our implementation of free, `jfree`:

```c
void
jfree(void *block)
{
    janitor_t *header, *tmp;
    void * programbreak;

    /* if the block is provided */
    if (!block)
        return (void) NULL;

    /* start critical section */
    pthread_mutex_lock(&global_malloc_lock);

    /* set header as previous bloc
    header = (janitor_t *) block - 1;

    /* start programbreak at byte 0 */
    programbreak = sbrk(0);

    /* start to NULL out block until break point of heap
        - header (previous block) size + target block should meet
    */
    if (( char *) block + header->size == programbreak){

        /* check if block is only allocated block (since it is both head and tail), and NULL */
        if (head == tail){
            head = tail = NULL;
        } else {

            /* copy head into tmp block, NULL each block from tail back to head */
            tmp = head;
            while (tmp) {
                if (tmp->next == tail){
                    tmp->next = NULL;
                    tail = tmp;
                }
                tmp = tmp->next;
            }
        }

        /* move break back to memory address after deallocation */
        sbrk(0 - BLOCK_SIZE - header->size);

        /* unlock critical section*/
        pthread_mutex_unlock(&global_malloc_lock);

        /* returns nothing */
        return (void) NULL;
    }

    /* set flag to unmarked */
    header->flag = 1;

    /* unlock critical section */
    pthread_mutex_unlock(&global_malloc_lock);
}
```

As per the comments within `jfree`, the function exists to simply NULL out each element until the point of the previous block of the target block.

### Other implementations: `calloc` and `realloc`

Other memory allocation functions exist alongside `malloc` that provide similar functions: `calloc` and `realloc`:

```
void *calloc(size_t nmemb, size_t size);
void *realloc(void *ptr, size_t size);
```

`calloc` is a function that allocates memory for an array of `nmemb` elements with `size` bytes each. `realloc` changes the size of a block `*ptr` to a specified `size`. `realloc` in a way acts as an abstraction for `malloc`, and in our implementation, will see how it reuses it for its functionality.

```c
void *
jcalloc(size_t num, size_t size)
{
    size_t total_size;
    void *block;

    /* check if parameters were provided */
    if (!num || !size)
        return (void *) NULL;

    /* check if size_t bounds adhere to multiplicative inverse properties
        - total_size is the number of elements * size of each element
    */
    total_size = num * size;
    if ( size != total_size / num)
        return (void *) NULL;

    /* perform conventional malloc with total_size */
    block = jmalloc(total_size);
    if (!block)
        return (void *) NULL;

    /* zero out our newly heap allocated block */
    memset(block, 0, size);
    return block;
}

void *
jrealloc(void *block, size_t size)
{
    janitor_t *header;
    void *ret;

    /* create a new block if parameters not set */
    if (!block)
        return jmalloc(size);

    /* set header to be block's previous bit */
    header = (janitor_t *) block - 1;

    /* check if headers size is greater than specified paramater */
    if (header->size >= size)
        return block;

    /* create a new block allocation */
    ret = jmalloc(size);

    /* add content from previous block to newly allocated block */
    if (ret){
        memcpy(ret, block, header->size);
        jfree(block);
    }

    return ret;
}
```

## Conclusions

Our memory allocation implementations simply provide a level of abstraction with a singly linked-list. Surprisngly, the __glibc__ `malloc` implementation isn't actually far off.

Understanding heap allocations and how a language like C implements it is quite valuable when doing binary exploitation, kernel hacking and all types of fun low-level stuff. The source code for janitor is once again available on [Github](https://github.com/ex0dus-0x/janitor).

Cheers!

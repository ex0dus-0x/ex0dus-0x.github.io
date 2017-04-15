---
title: A Programmatic Introduction to Sorting Algorithms with Rust
date: 2017-05-12 00:00:00 Z
layout: post
author: ex0dus
---

In my endeavors in systems programming, I have become familiar with the primer of 
algorithms and data structures. Of course, this is something any greenhorn 
programmer should understand, but I wanted to understand the nature of these programming
paradigms and implement them within a systems language such as Rust. Rust, a language 
still quite young, handles memory and data efficiently through concepts such
as ownership and borrowing. This removes constraints found in a language like C such as memory leaks and garbage collection through notorious offenders, including dynamic memory allocation functions like `malloc()`. Not to get off-topic, but I will be doing a future post on dynamic memory allocation in C.

Through my primer in algorithms, the idea of sorting has become a part of my studies. Before, we start, let's introduce a familiar aggregate known as a the array. Not to be confused, Rust does implement built-in vector syntax, but we aren't working with "_growable_" data. We will be using this to hold data to be sorted, and we will assume several standards. 

    let mut array[i32; 10] = [47, 31, 14, 76, 4, 10, 8, 90, 83, 41];

* The array is of randomized `i32` values, without any typecasting or coercion. Therefore, we maintain a level of __honogenuity__. 
* Due to randomization, values may repeat. This will not affect the sorting algorithm.
* Since Rust is a type-safe, we will make the array mutable.

## Insertion Sort

Insertion sort is a simple sorting algorithm that builds upon a sorted array by comparing one item at a time in an array from the first index to the last. In comparison to other sorting algorithms, insertion sort is inefficient when confronted with large sets of data, but demonstrates a great deal of stability. 



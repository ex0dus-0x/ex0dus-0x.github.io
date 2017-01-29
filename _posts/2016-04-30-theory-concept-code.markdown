---
title: Theory and Concept of Code
date: 2016-04-30 12:00:00 Z
layout: post
comments: true
subtitle: Computer Theory 101
author: ex0dus
header-img: img/PostBG/post-bg-08.jpg
---

Many beginning programmers often miss out the several key concepts and theory that involve programming. Many people have always asked me, "coding is difficult. I've tried reading. I've tried videos. I've tried this $2,000,000 course that says that it guarentees that I will master _x_ language in _y_ hours. What should I do? What needs to be done? Should I learn really advanced math?" In my experience, programming doesn't require such brevity and understanding in math. Obviously, as you dive into computer science more and more, you will learn it. All you need is an **ability** to understand mathematics. For example, there is a very simple method of converting a number from base 10 to base 2 (aka binary). The equation is: ![equation](http://www.sciweavers.org/tex2img.php?eq=V%28b%29%20%3D%20b_%7Bn-1%7D%20%2A%20%7B2%7D%5E%7Bn-1%7D%20%2B%20b_%7Bn-1%7D%20%2A%20%7B2%7D%5E%7Bn-2%7D%20%2B%20...%20b_%7B1%7D%2A2%5E%7B1%7D%2A%7Bb%7D_%7B0%7D%2B2%5E%7B0%7D%20%3D%20%0A%0A%5Csum_%7Bi%3D1%7D%5E%7Bn%7D%20x_%7Bi%7D%2A%7B2%7D%5E%7Bi%7D&bc=White&fc=Black&im=jpg&fs=12&ff=arev&edit=0) e.g We have a binary number, 1101\. In order to convert it to base 10: ![equation](http://bit.ly/1pSStnd) If you were able to grasp that, then you are well on your way to becoming a proficient programmer.

## The language

Let's talk about programming itself. Specifically, **languages**. When we talk about programming languages, it's like talking about different kinds of ice cream. All of them are different in terms of taste, color, and composition, but in theory, they are all the same. Ice cream is made of sugar, cream, milk. Essentially, all ice cream share the same material, but they may have different tastes and colors. That is the essential concept of programming. Each programming language is different - the syntax, semantics, whether it is interpreter or compiler-based, etc. However, if you think about it, all languages are the same despite their differences. I can write a program that asks for user input and print that input out back to the user in Python. I can do it in C. I can do it in BASIC. So in the end, all programming languages have the same **functionality**. Of course, we have languages that sort of differ. For example, HTML, which is web-specific. However, in this case, we are talking about programming on a **general-level**. When we also examine programming languages, we see that most of them, if not, all of them share a common model. What do I mean by that? When we learn code, what do we learn. Most of the time, we first start off with the simplest function: input and output. Often, we learn how to write the canonical `"Hello world!"` program. Then we learn about operators, and then flow control (if/else), loops, functions, lists/dictionaries (whatever language your doing) and then maybe some advances concepts, maybe implementation of external libraries and modules. These concepts are essential to all programming languages. Of course, I am 14, and I have never ever taken a formal computer theory class, so I do not know the proper name or this "model". The point is, programming languages are **high-level**. You may hear this term a lot. What this mean is that when this code runs, it gets translated into **machine code**, which is assembly language. Assembly will then take the code and make instructions for the **CPU** or, _Central Processing Unit_ to run, executing the code.

## What should I learn?

Some programming languages are much better than others. Many modern 21st-century languages are actually really nice. For example, Apple's Swift. The first general programming language I have ever learned was Bjarne Stroustrup's C++, specifically C++11 (C++0x at the time). It is **object-oriented**, meaning that in order for code to run, the code will be compiled by a compiler into object files so that it can be read. Here is a same C++ program:

    #include <iostream>
    using namespace std;

    int main(){
    	cout << "Hello world!" << endl;
    }

C++ is quite a complicated language, especially for a beginner. Let's get back to that and look at a program written in Python (v.2.7.11)

    print "Hello world!"

Wow, wasn't that simple! Well, as you can tell, both programs are the same. It's what is introduced in these languages that seperates them. In the Python program, the “print” function is utilized, which simply outputs a string or defined variable. However, as seen as code written in C++, many other lines of code are introduced. For example, the “#include <iostream>” line is the preprocessor directive, which means that the program requires the “iostream” library, which allows the user to use the standard output stream, otherwise known as “cout”. To a beginner, C++ is quite confusing and may result in the loss of interest very quickly. It is quite a hard language to learn, when compared to Python. To a user without any programming experience, a program in Python is probably not very hard to decipher.

## The Bottom Line

The bottom line is, learning code should not be based on the language you choose to pursue. All programming languages are different in some way, but in the end, all programming languages are essentially the same. As a decently-experienced programmer, I believe that it is important to choose the right path in programming. Although computer science is something everyone deserves, it is important for those who want to pursue it seriously to have a strong foundation. Understanding programming theory, and basic computer science theory won't hurt, and will give a nice boost to learning code. Math is also acceptable, and being able to grasp it is a plus. Being knowledgeable in your field of study, even if it means going beyond the scope of your education, shows initiative, eagerness, and allows you to get ahead. GitHub has a repository that is filled with courses that mainly explore computer science and theory. I have utilized a few of these courses, and have really enjoyed the experience. I recommend those aspiring to have a career in computers that want to get a head start utilize it. Find the course you like. Some are hard, some are boring, and some aren't available anymore. Take some time, and pique your interests.

<a href="https://github.com/prakhar1989/awesome-courses">Click here</a>

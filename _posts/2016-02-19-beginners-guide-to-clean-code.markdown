---
layout:     post
comments:	true
title:      "Beginner's Guide to Clean Code"
subtitle:   "How to NOT Look Like a Beginner (Even though you are)"
date:       2016-02-19 12:00:00
author:     "ex0dus"
header-img: "img/home-bg.jpg"
---
What is the difference between **effective** code and **clean** code?

## Let's look at an example:

For some really weird reason, you want to print out "Hello World" five times in C++. This is what you write:

<pre>int main(){
	std::cout >> "Hello World!" >> std::endl;
	std::cout >> "Hello World!" >> std::endl;
	std::cout >> "Hello World!" >> std::endl;
	std::cout >> "Hello World!" >> std::endl;
	std::cout >> "Hello World!" >> std::endl;
} </pre>

Of course, you wouldn't do that. You would instead use:

<pre>int main(){
	for( i = 5; i >= 0; i-- ){
		std::cout >> "Hello World!" >> std::endl;
	}
} </pre>

This is **effective** code. Even though this is a really basic example, it still demonstrates how we can write code, but shorter, easier, and doesn't require me to press `Ctrl+V` 5 times. But what is the idea of **clean** code? **Clean** code looks _professional._**Clean** code is _formal_. **Clean** code, when examined by other programmers, is _undestandable_ and _replicable_ and has a _steady flow_ where the programmer is easily to able to read through it without scratching his or her head and saying, _"Huh?"_.

#### Let us look at my criteria for clean code.

## 1\. _//Comment_ everything!

Code are like directions, that are pretty indecipherable, especially if you have written _alot_ of it. Shouldn't it be pretty logical to have comments, and give a human interpretation of what is happening? Not only should you write comments, but you should also make your comments, short, decipherable and does not overly explain what you are doing. Let's look at S. Kiddy's code:

<pre>#So here is my code. I am going to first declare the variable x, and then give it the value of 5\.
#After that, I will add 7 to x, and then call x again, and I will get 12\.
>>> x = 5
>>> x + 7
>>> x
> 12
</pre>

It's good that at least he is commenting what he is doing, but it does not mean that it is **clean**. The comments are overly explaining what is happening. Let's look at Masta Haxa's code:

<pre>#Declare variable x with value of 5\. Add 7 to it, and call x to have value of 12.
>>> x = 5
>>> x + 7
>>> x
> 12
</pre>

The program is the same, but the commenting is **simple** and still explains the concept of the code in a whole.

## 2\. Whitespace

The concept of **whitespace** is pretty big in programming, especially object-oriented. Although it is NOT a requirement, people tend to enjoy looking at code that is not tightly packed.

<pre>for( x = 3; x < 4; x++){
	cout << "Wow! This is pretty spaced out" << endl;
}</pre>

Compared to something like:

<pre>for(x=3;x<4;x++){
	cout<<"helpmeimtrapped"<< endl;
	}
</pre>

## 3.Indentation

Indentation, like whitespace is another form of organization. Also known as **indent style** it will easily help one recognize your code due to positioning, as well as for you, when you come back to edit your code. This is especially important for writing code in HTML. Let me demonstrate: ![](/img/BeginnersGuideToCleanCode/indentation.png)

_Updated because older picture was crap_

In this situation, my code is neatly indented. I am able to navigate, and I include (a bit) of comments.

This is an example of code that has **NO** indentation ![](/img/BeginnersGuideToCleanCode/notindentation.png)

_Updated because older picture was crap_

## 4.Variable Name Declaration

When you have a variable, class, structure, or any of that sort, is it not logical to name it something relevant. Give your variables ,classes, objects, etc. concise names. This shows organization and unity in your code. If you are writing code in an object-oriented programming language, such as C++, this is very important especially working with inheritance and stuff like that.

<pre> //Good example
struct PERSON{ //PERSON struct type
	int age;
	string name;
	float weight
}familymember; //Define object for PERSON type
</pre>

and here's a **BAD** example

<pre>//I will make a program where the user will input a number, and the computer returns that number + 2\.
//Here are my variables:
int noodles;
cin >> noodles;
noodles + 2;
cout << noodles << endl;
</pre>

Shouldn't it be a little more logical to call the variable "input" instead?

* * *

Thank you for reading my first article! I will be coming up with more in the future, but this one was definitely O.K. There are, of course **ALOT** of things you can do to improve your code and make it **clean** and **effective** . Code review, although I did not include it in here, is obviously a must, and an amateur programmer like you and me, **WILL** always have questions. One of the best places is StackExchange, a prominent Q&A forum community. Visit at: http://stackexchange.com/

---
layout:     post
comments:		true
title:      "Overview of brut3k1t: Server-side bruteforcing"
subtitle:   "How to 'Hack' Facebook"
date:       2016-12-27 12:00:00
author:     "ex0dus"
header-img: "img/brutekit.png"
---

Happy Holidays!

This year, I've written __brut3k1t__, which is a Python-based project that involves bruteforcing a multitude of protocols and services.
These included: `ssh, ftp, smtp, xmpp, facebook, instagram, twitter`.

![](/img/FacebookBrutekit/brutekit.png)

_brut3k1t's Facebook module_

Through the development of this project, I've come across many errors and problems, and I've learned a lot about my selfishness as a developer. In the end, __brut3k1t__ has become quite prominent and I want to continue active development on it.

So what do I mean by "selfishness"? When I'm talking about this, I'm talking my close-mindness when writing code, and how I did not think objectively on how my code will execute on other people's operating systems. Of course, I believed that I possessed the _perfect Linux build_, as everything was able to build, and that everything is optimal, and that once anybody `git clone`d the repository, it will run like it does on my OS. I was so selfish that I neglected to even include a `requirements.txt` file.  Turns out my neglience would lead to a lot of problems. Not only __compile-time__ or __build-time__ errors, but also lack of dependencies.

    ImportError: No module named cryptography

"Now what even __IS__ cryptography?" I would ask. Well, of course I didn't know, since I barely kept in touch with my libraries and understood their usage extensively. So naturally, people would definitely get errors, even __BEFORE__ running the code.

After extensive work, I've finally finished major development for this project. Today, I'm going to highlight the Facebook bruteforce module, something highly sought after by security enthusiasts and script kiddies alike.

One of the major problems that I ran into was the code itself. Initially, I utilized `fbchat`, which was a module that enabled Facebook integration with the Python IDE. However, in order to authenticate, the module required one's Facebook ID, __NOT__ their actual username. This was __VERY__ inefficient. No way will anyone actually utilize this! However, the solution was right in front of my eyes. My Instagram bruteforce module was based off of __Selenium__, a web browser interaction library for both Python and Java. It involves methods that attempts to find certain elements in a specified website's HTML and CSS source code.

    elem = driver.find_element_by_name("email")

would attempt to find an element with the name "email", for example:

    <input name="email"></input>


## How it Works

Let's examine how Facebook's bruteforce module works.

When we look at Facebook's main login page, we are presented with this:

![](/img/FacebookBrutekit/facebook1.png )

Not a pretty site. Too many web elements. I mean, what if selenium utilizes the Email field for the Sign Up area rather than login? Another thing that Facebook does is redirection. Once you enter a username and password combination that is incorrect, Facebook redirects you to a seperate page.

![](/img/FacebookBrutekit/facebook2.png)

__brut3k1t__ utilizes an `assert` method to see if there has been any changes to the webpage title

    try:
      # bruteforcing n stuff
      assert (("Welcome to Facebook") in driver.title)
    except AssertionError:
      print " If 'Welcome to Facebook' is not in the title anymore, that means the page has changed'"

This means that there has been success in bruteforcing Facebook, and it is continuing on to the Facebook page when the user is logged on. However, if we are using the Facebook Login page as presented in the first image, a false positive will return, due to the redirection.

    [*] Username: test | [*] Password: test | Incorrect!
    [*] Username: TEST | [*] Password found: test

We therefore rely on Facebook's mobile login page. This login page is self-explanatory: login to Facebook if the user doesn't have the application installed on his/her mobile device. The site appears very primitive, and it as so:

![](/img/FacebookBrutekit/facebook3.png)

But the good thing is, there is no redirection!

![](/img/FacebookBrutekit/facebook4.png)

The `driver.title`, or webpage title, stays the same, and therefore the `assert` method will continue the `try` block until the password is found, or when the wordlist is out of words.

What happens if you get blocked, or Facebook prevents you from doing any more logging in? One feature I wish to add is the ability for the code to detect this, and in return, open up a new `firefox` instance and continue. Furthermore, threading can be introduced, where multiple threads of bruteforcing can be implemented for efficiency (for e.g, multiple wordlists for multiple sessions)

This exact same "vulnerability" was also utilized in both Twitter and Instagram bruteforcing. However, the Instagram bruteforce module was already written by Github user __chinoogawa__, called [__instaBrute__](https://github.com/chinoogawa/instaBrute).

Future improvements? Definitely. Proxy support is already coming, and even a GUI or web-based GUI sounds like a plan. So much active development has been going on with brut3k1t, and I would really love to thank all the users who tested the code out, and gave feedback.

Check out the repository here and see for yourself: https://github.com/ex0dus-0x/brut3k1t

Until next time!

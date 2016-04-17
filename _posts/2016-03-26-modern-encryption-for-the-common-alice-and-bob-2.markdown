---
layout:     post
comments:   true
title:      "Modern Encryption for the Common Alice and Bob "
subtitle:   "Part 2: Diffie-Hellman and PGP"
date:       2016-03-26 12:00:00
author:     "ex0dus"
header-img: "img/PostBG/post-bg-05.jpg"
---

<p> In this part of the series, we will examine the past and the present. Today we will have a little talk about Diffie-Hellman and public key exchange. No it will not be boring. Maybe a little in the beginning, but I assure you,
it is worth it. I will also be talking about PGP, which closely relates to the Diffie-Hellman key exchange, but in modern society. Don't worry, I won't confuse you. Please read on. </p>
<h2> First off... </h2>
<p> Let's talk encryption. We have <b>ciphertext</b>, <b>cleartext</b> and <b>the cipher </b>. When we want to send someone a message but securely, we <b> encrypt </b> it so that it appears as some sort of gibberish. <b> Cleartext </b> is the starting point. It is the message you <b>WANT</b> the person to send. In encryption, two people, Alice and Bob, are always used as an example (hence the series name). I guess you can call them placeholders. I'm Alice. I want to send Bob a message: "I'm have a ton of dank weed." The message is <b>cleartext</b>. It is in plain English. Alice uses a <b>cipher</b>, which is a method to encrypt the cleartext, and generates <b>ciphertext</b>. A cipher can be anything. It can be a program. It can be where I take each letter in cleartext and change it to their respective number (A = 1, B = 2, C = 3). A cipher is ideally anything is that crypts and decrypts a message. This is the basis of security and computer technology. </p>
<p> Well it might seem pretty simple. I can create a really complex cipher. No one will ever crack my code! But the problem is, how are you to send the cipher? In order to encode and decode, BOTH Alice and Bob has to have the cipher. That is where the problem of encrpytion comes in, and is what makes public key encryption so important today. Let's look at a scenario: </p>
<pre><code class="language-bash"> Joy is stupid. She comes up with a cipher to send to her boyfriend Tyrone that is so complex no single computer in the world could ever crack it. She emails the message that is encrypted to her B.F. But he needs the cipher. He can't read it. So she sends it as well. </code></pre>
<p> That's where we introduce the eavesdropper, Eve. Eve is a placeholder for anyone: a spy, the government, your nosy-ass neighbor, who has the mission of getting the cipher. Who cares if she gets the ciphertext? She can't read it, so it's useless without the cipher. That's when I introduce the Diffie-Hellman key exchange </p>
<h2> La clase historia </h2>
<p> Robert Merkle devised the earliest known methods of public-key exchange. One of them was the Diffie-Hellman key exhange, named after Whitfield Diffie and Martin Hellman, two cryptographers. The idea behind it is that Alice and Bob are able to have a shared ciphertext whereas one party does not know the cipher, let alone the other person. The catch is that this cipher can be send over an insecure, or "public" channel, one that Eve may be monitoring. There is obviously mathematics involved in this, but I'm mostly focusing on computer technology, not math. Let us take a look. </p>
<ul>
	<li> Alice and Bob agree on a cipher, "WATER". This is known publicly, so Eve knows it as well. This is the <b>public key</b></li>
	<li> Alice and Bob each create their own <b>private keys</b>. They don't send it to each other. Alice uses "NOTEBOOK". Bob uses "GLASS"</li>
	<li>Alice uses "WATER" and "NOTEBOOK" and a message to create a ciphertext. </li>
	<li> She sends it through the public channel to Bob. Eve gets a copy as well. </li>
	<li> Bob uses his private key to decrypt the message. He responds by using "WATER" and "GLASS" to create another message and sends it to Alice. Eve also intercepts it </li>
	<li> Alice uses to his private key to decrypt the message. </li>
</ul>

<p> Notice the pattern? Eve is unable to decrypt the message. She only has the <b>public</b> key. She does not have a <b>private</b> key. Let's look at it in terms of math. Here's a formula a <a href="http://security.stackexchange.com/questions/45963/diffie-hellman-key-exchange-in-plain-english">
<b>Stackexchange</b></a> user devised using prime numbers.</p>
<pre> (g^a mod p)^b mod p = g^ab mod p
</pre>
<p> In this situation, two public keys are used. The case in parenthesis is the message that has been encrypted in cipher text with the public key g and p. Using <code> exponent b</code>, or the private key and <code>mod p</code>, the public key, what returns is the message, and the public key. It is a little complex, I know. </p>
<p> To further elaborate, I also have a YouTube video that is <b>VERY</b> helpful. It is by a known KhanAcademy affliate by the name of Brit Cruise, on his channel, the 
<a href="https://www.youtube.com/channel/UCotwjyJnb-4KW7bmsOoLfkg"><b>Art of the Problem.</b></a></p>

<iframe width="420" height="315"
src="https://www.youtube.com/watch?v=YEBfamv-_do">
</iframe>  

<h2>Today...</h2>
<p> Well the Diffie-Hellman key exchange works very well in the past, but in today's modern technology, encryption is a complex subject, especially passwords. The modern version of Diffie-Hellman exchange is known as <b>PGP</b>, or <i>Pretty Good Privacy</i>. It essentially is the same process as Diffie-Hellman, but the keys are very complex. <p>
<img src= "/img/pgp-key-example.png">
<p>Let's stop talking theory and now let's talk application. I will now show you how to make your own PGP key in a Linux distribution. You will generate a public key for yourself, and a private key.</p>
<h2>How to make a PGP Key</h2>
<p>Let's start by opening up our terminal. We first need to download GPA and GnuPG, which allows us to create and manage our PGP keys </p>
<pre><code class="language-bash">sudo apt-get install gpa gnupg2</code></pre>
<p>Next after entering your password and allowing it to install, we will generate a key</p>
<pre><code class="language-bash"> gpg --gen-key</code></pre>
<p> This will pop out</p>
<pre><code class="language-bash">gpg (GnuPG) 1.4.16; Copyright (C) 2013 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Please select what kind of key you want:
   (1) RSA and RSA (default)
   (2) DSA and Elgamal
   (3) DSA (sign only)
   (4) RSA (sign only)
Your selection? 
</code></pre>
<p> We will go with RSA and RSA, or option (1). RSA is another form of encryption that is also public-key based, and is similar to the concept of Diffie-Hellman's key exchange. </p>
<p> It will then ask you you how many bits you want the key. We want it to be 4096 bits, the more complex the better. Most people nowadays use 4096 bits as well. 
<pre><code class="language-bash">
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (2048) 4096
Requested keysize is 4096 bits
Please specify how long the key should be valid.
         0 = key does not expire
      (n)   = key expires in n days
      (n) w = key expires in n weeks
      (n) m = key expires in n months
      (n) y = key expires in n years
Key is valid for? (0) 
</code></pre>
<p> Next, it will ask when the key will expire. Type 0, and then "1" when it asks for confirmation. We don't want it to be temporary.</p>
<p>Personal information will be asked next. I will be making it up, so provide your information where it asks. </p>
<pre><code class="language-bash">
You need a user ID to identify your key; the software constructs the user ID
from the Real Name, Comment and Email Address in this form:
    "Heinrich Heine (Der Dichter) heinrichh@duesseldorf.de"

Real name: exodus 0x
Email Address: stack.over.heap@mgmail.com
Comment: Hello World!

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O
</code></pre>
<p>Next they will ask for a passphrase so that you can keep your key safe. </p>
<pre><code class="language-bash">
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.

Not enough random bytes available.  Please do some other work to give
the OS a chance to collect more entropy! (Need 186 more bytes)
</code></pre>
<p> Next, it will ask you to generate entrophy. What this means is that you will need to perform tasks that will allow your OS to collect random bits to create a usable key. So go on YouTube, play 50 videos, spam a friend, etc. etc. </p>
<pre><code class="language-bash">
gpg: key 211964F1 marked as ultimately trusted
public and secret key created and signed.

gpg: checking the trustdb
gpg: 3 marginal(s) needed, 1 complete(s) needed, PGP trust model
gpg: depth: 0  valid:   3  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 3u
pub   4096R/211964F1 2016-03-27
      Key fingerprint = 1086 A4E6 D6D8 2978 8CA5  644E 77BB C5C2 2119 64F1
uid                  exodus 0x (Hello World!) (stack.over.heap@gmail.com)
sub   4096R/41949535 2016-03-27
</code></pre>
<p>ANDDD its done!</p>
<p>Now we need to obtain this key. That is where we need GPA:</p>
<pre>sudo gpa</pre>
<p> And this will show up:</p>
<img src="/img/ModernEncryptionAliceBob2/gpa.png">
<p> I have 3 keys. One for my personal email, one for my Sigaint mail and the test one I just made. Press the one you have made, click <b>"Keys"</b> and then <b>"Export Keys"</b>
<img src="/img/ModernEncryptionAliceBob2/exportkeys.png">
<p>Choose a directory you want your keys to be exported to.</p>
<img src="/img/ModernEncryptionAliceBob2/exported.png">
<p> Done! Now navigate to that directory. Open the PUBLIC key, which you provided a name for, with a text editor like Gedit: </p>
<pre>
-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: GnuPG v2.0.22 (GNU/Linux)

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
wjVd78tcURXqB5fAZ/LsY26EZg==
=iS0y
-----END PGP PUBLIC KEY BLOCK-----
</pre>
<p> Now let's say we want to communicate with someone. First, agree on a shared key. It can be your public key, or THEIR public key. In this case let's pretend it is THEIR public key. First, obtain their PUBLIC key, save it as a text file, and then press <b>Keys</b> and then <b>Import Keys...</b></p>
<img src="/img/ModernEncryptionAliceBob2/importkeys.png">
<p> Select <b>"Windows"</b> and then <b>"Clipboard"</b>. This window will show up:</p>
<img src="/img/ModernEncryptionAliceBob2/clipboard.png">
<p> Write what you need to write. Preferably some illegal icky shit. Then press <b>"Encrypt the buffer test"</b>, which is the blue envelope. Encrypt it with their public key. Result:
(message was: "hi") </p>
<pre>
-----BEGIN PGP MESSAGE-----
Version: GnuPG v2.0.22 (GNU/Linux)

hQIMA+Fb1zKfnWs6AQ/+JcgAMVYisL8HfGoHKlFDA10UfegkCVD93Cw47HZzPele
qqia2fj5PbEtBrPNlsnQ/jxQ1niBhZFf67+45FuisLpfpFSrK1gkJ0EFOuwZ4ikh
4SJ8QVzOBcFFypWJxQfoISvJAGdO3llQFlYG+DojtzHxjy7AIxxkuRfs9ChWETU5
RTkFuobfyRx+wulx1ytnTDrQd6flP18r2Q4cqJarVt01MmRRZ3MuR28t8gR39rzg
WM7u3Ml3odFaPkMVjZUUY12QTc/7kneuWkag5gjmC/cT90naVLKTGVUAY1ed6BQY
215rVsOMBTz5bosDRgryAzBIB1r0vhhOGDQNGr19VLLMh6gCYd/3/bsRDcAaZnFc
2FZ/etaQzR523/B4Lkos0j6LxVR5qdUxwsWDQyyaN6Wa7PS2W30scdyDy3P+sfyZ
RSoysNc1Kdwm/SB/orfiLha7QxXxr4e73FAtbPApC4QTIsP7i2q1ZcPzSDR3a5Im
T1ZHpMIiOpdQqsqZUXNwJFhAyrjPrY2kT+M7mVhc6ewnPsv7SHh+1GdeN9WeRofO
L8ku+66jD7Hddam4/4oOi8OwA+3xd8pAn4YGN8PFx3FYtuK1Tm2UJZmpCtlxZ2yl
7VhriNDN8iv6zDcLDGPZtmLCA6zjqwZ0LX53f+6CkkC0fVC+xYZRsl0VlEy9ybTS
PgElo03YOQtNuijl5w2v1fSaWiZn0HVQX1uWM6+Y1M32a2wp+O/qbCbzg9x/0OHz
eCJvQqE5pm61hyAOW2p6
=/ZCb
-----END PGP MESSAGE-----
</pre>
<h2> To finish off...</h2>
<p> Damn, that was a long-ass article. I hope that you have learned quite a lot about basic encryption. Well, this series ain't never gonna finish, so stay tuned for <b>Part 3!</b>
</p>

---
layout:     post
title:      "Modern Encryption for the Common Alice and Bob"
subtitle:   "Hey, I'm the government. Gimme all your passwords."
date:       2016-02-27 12:00:00
author:     "ex0dus"
header-img: "img/post-bg-03.jpg"
---

<p> Hello, everyone, I'm back! </p>

<p> As you may have heard, the nasty government has been attempting to spy on us again. It has requested that Apple backdoor an iPhone belonging to the San Bernardino terrorist. You may say, "ex0dus (or Alan, if you know me in real life), I, like ever dedicated citizen of the United States, watched the Republican Debate last night, and it was said that the government only want access to the terrorist's phone by disabling the locking mechanism after a certain number of tries. You're a retard". You may be right, fellow reader, but think about it. How demanding is our government today? This has already happened several time, especially with Steve Jobs running Apple, and Tim Cooks, being the goody-good boy he is, is protecting his company's image by refusing. I would, and you should to, not be surprised if this doesn't happen again in the future again, especially in a world filled with terrorist, hate and political oppression.</p>

<p> This may seem like propaganda. Common-day conspiracy theory. Windows 10's spyware, the government spying on us. And so what if it is real? I have nothing to hide, I'm not a terrorist or a hacker like you. OK. Well let's put it this way. I am a NSA agent, employed by the NSA in order to detect whether there is any hostile threats in our nation. In order to do so, I read <b>ALL OF YOUR EMAILS, MESSAGES, FACEBOOK POSTS, ETC. </b> How do you feel? Maybe I won't do anything with it, but do you really want a stranger snooping through your life? </p>

<p> If you have taken any studies of law, US History, government, etc, you would know that no amendment individually states that a person's personal information and privacy cannot be voided. However several acts have been implemented that guarentees privacy. Read: <a href="http://www.livescience.com/37398-right-to-privacy.html"><b>THIS</b></a> by LiveScience. </p>

<p> Well, I'm not really going to get into the law stuff anymore, and I'm going to get into the technical stuff. Today, I will be teaching you, as well as providing several resources on how <b> YOU </b> as a citizen can protect yourself. This is not necessarily from the government, but also to anonymize yourself during any hacktivistic related activities and endeavors. </p> 

<h2 class="section-heading">What to do?</h2>
 
<p> I have collected a large amount of resources through research and scouring, and one of the best I have found was a site called <a href="privacy.tools.io"><b>PrivacyTools.io</b></a>. This site has given A LOT of resources on how to protect yourself. It is repository filled with the necessary tools, software and measures you should take in order to protect yourself. I will review a few of these as well. </p>

<h2 class="section-heading">The Operating System</h2>
<p> Well first of all, if you want to protect yourself, I would recommend switching your OS. As you may have heard, Windows is completely a nightmare right now. It has spawn off as a simple and lovable OS, and now is a global conglomerate mess that is siphoning everything you have. Maybe it's Cortana, asking you for your location, so that it "can find the nearest Italian restaurant", when it is really is sending data about your computer and your Geolocation to a nasty government agency that contracted Microsoft. Right now, you may wondering, "Well, if I wanted to use OS X, I have to buy a Mac. If I wanted to Linux, I have to be some tech nerd." You don't. I am running Ubuntu 14.04 on dual-boot right now, as I am writing this blog. This is the most user-friendly OS ever, and even if you have no knowledge of the Linux terminal, this doesn't mean that Ubuntu is unusable. If you are a hacker or pentester, you can still use Ubuntu, but requires extra configuration, such as when installing Metasploit (challenge level 5,000,000,000,000,000) and including other repositories to get your lil' toolkit o' tools. </p>

<p> If you are complete privacy freak, you may have heard about the Tails OS. Tails stands for <b>T</b>he <b>A</b>mnesic <b>I</b>ncognito <b>L</b>ive <b>S</b>ystem. It is for the paranoid of the paranoid. Everything is routed through Tor, and every application is secure and encrypted. However, it does not mean it is 100% secure. Tails should obviously be run on a USB, CD or SD card, hence "Live System" and should not be installed. Tails does not guarentee malware protection, remember, "anonymity", not "antivirus". Obviously, if you have heard, Tor is broken, due to data being able to be sniffed out in the exit nodes, so that is a caution to be aware of. You can get Tails 
<a href="https://tails.boum.org"><b>HERE</b></a>.</p>

<h2 class="section-heading">Secure Browsing and Anonymity</h2>
<p> Let's assume that you have Ubuntu or Debian or any Linux OS installed. Obviously, having a secure OS does not mean you are guranteed anonymity and protection of your privacy. The first thing I will be concerning is browsing the web. </p>
<p> On any OS, you would probably be acquainted to Chrome. It supports Javascript, your Gmail and everything concerning it will be synced and saved for your convenience, its definitely 500x better than Internet Explorer, and is the big daddy of browsers. However, I think that if you want to become more secure with your information, consider downloading two browsers. It doesn't matter that you are Windows, Linux, Mac OS X. These browsers support all platforms. </p>
<li>
	<ul><a href="https://www.mozilla.org/en-US/firefox/new/"><b>Firefox</b></a>- <i> Well, to be precise, FireFox with a few additional addons. Firefox is the browser that won't leak your information, and has a variety of addons that will help protect you even further. </i></ul>
		<ul><a href="https://addons.mozilla.org/en-US/firefox/addon/self-destructing-cookies/"><b> - Self-Destructing Cookies </b></a>- <i>This addon protects you from a website's trackers and cookies attempting to identify you by destroying them each time you close a browser. </i></ul>
		<ul><a href="https://noscript.net/"><b> - NoScript </b></a>- <i>Noscript disables any sort of script, whether it is an addon, plugin, Javascript, Flash on any site, except for the one's you configure as "trusted". It is considered a mandatory addon for Firefox and is definitely disables sites from tracking and identifying you through your external plugins and addons.</i></ul>
		<ul><a href="https://addons.mozilla.org/en-US/firefox/addon/random-agent-spoofer/"><b> - Random Agent Spoofer</b></a>- <i> When your information gets captured by a website or such, your User Agent is exposed. The User Agent identifies the browser you are using, as well as your OS. It looks like this:
		<pre>Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36</pre> This is the one for Chrome 41.0.2228.0. This is information that you do not want to leak. Random Agent Spoofer changes it everytime you open Firefox, with a completely Random Browser, and a Random OS. </i></ul>
		<ul><a href="https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/?src=search"><b> - uBlock Origin </b></a>- <i> This is the Adblocker you want for Firefox. It isn't very consuming on your memory and CPU, and runs very efficiently. You will barely realize that it is there, blocking annoying and possibly snooping advertisements attempting to fingerprint you. </i></ul>
		<ul><a href="https://www.youtube.com/watch?v=onmDmyypIMM"><b>HERE'S A GREAT VIDEO MADE BY N.0.D.E ADDRESSING ANONYMITY AND SECURITY ON FIREFOX.</b></a></ul>
		<br>
		<ul> One thing that I also do on Firefox is to configure it so that no history is remembered. You can do this by clicking the side menu, Preferences > Privacy, and setting History to <b>Never remember history </b></ul></li>
<li>		
	<ul><a href="https://www.torproject.org/"><b>Tor Browser</b></a>- <i> If you are reading this, you should obviously know what Tor is. If you don't search it up. Actually, I'll still tell you. Tor, also known as the The Onion Router, is software that ensures anonymity by encrypting your connection to the Internet by looping it through several nodes, like layers of an onion. After several layers of security, you will have a new IP address, and you are safe to browse safely. However, as I mentioned before, Tor has been broken by the NSA, but it does not mean it isn't practical and secure. Essentially, what you are using to surf the web is the Tor <b>BROWSER</b>. It is actually a version of Firefox (it includes Noscript as well, neat) that has been configured with Tor. Now a lot of people always thought Tor was the software you use to get into the Darknet and buy illegal drugs. Don't get me wrong, it is, but it does not mean that the creators are to be executed by guillotine. Tor was created to help <b>protect</b> a person, and it has obviously been misused by others to host websites that sell drugs, guns, weapons, hit services, illegal pornography, etc (using the .onion suffix). However, many journalists, activists, bloggers, etc still utilize the Tor Browser to communicate with dissidents of places such as Syria, Iraq, etc. and has helped tremendously in the hacktivism world. </i>
	<img src="/img/tor.png"></ul>
	</ul>
</li>


<h2 class = "section-heading"> OK, I have decided this to be a pretty long and continous series. I will be back with more on encryption. Tune in next time for topics on ... <b> Diffie-Hellman key-exchange! </b> and <b> PGP! </b>


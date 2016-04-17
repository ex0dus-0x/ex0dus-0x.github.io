---
layout:     post
title:      "Arduino - WTF is it?"
subtitle:   "Please excuse my rip-off 3rd party Arduino"
date:       2016-04-16 12:00:00
author:     "ex0dus"
header-img: "img/PostBG/post-bg-07.png"
---
<h2> What is it? </h2>
The Arduino is an open-sourced prototype board. You use it to make projects, and is great for electronics and learning electronics. Whether it is a small blinking LED controlled by a button, or even a home automation system, the Arduino is your imagination, all stuffed into a credit card-sized blue board.

The Arduino appears in many different models. However, the most basic and common one is the Arduino UNO. However, you have other versions, such as the very tiny Arduino NANO, which is bite-sized chipset-like board that acts like a miniature size Arduino. You have the Arduino MEGA, which has more I/O pins and is great for complex projects. There is much more (I remember there is actually even a Arduino Robot), but the ideal prototype board is the UNO, as shown below:

<img src="/img/ArduinoWTFisIt/arduino-pic.jpg">

<i>This is mine. It is from a 3rd-party retailer, hence the Sunfounder logo. Basically the same as an Arduino :P</i>

<h2> How to Get it? </h2>
You can obviously buy it from the Arduino website, <a href="http://www.arduino.org/">here</a>. However, it is wiser to buy a kit. Here are a few:
<ul>
	<li><a href="http://www.makershed.com/products/ultimate-arduino-microcontroller-pack">Make: Ultimate Arduino Microcontroller Kit</a></li>
	<li><a href="https://www.sparkfun.com/products/12060?gclid=CjwKEAiA-s6zBRDWudDL2Iic4QQSJAA4Od3Xv9dGOkvaiVOAmJ7S2rWWO9lrId_EG5lTEYWW1DwClRoCQ_Xw_wcB">Sparkfun's Inventor Kit:</a></li>
	<li><a href="https://www.adafruit.com/products/68?gclid=CjwKEAiA-s6zBRDWudDL2Iic4QQSJAA4Od3Xa0jNpHILmQFEqvXD2qshEWqEAxlnskf1J57GT53zdhoCrK_w_wcB">
	Adafruit's Starter Pack for Arduino</a></li>
</ul>

<img src="/img/ArduinoWTFisIt/personalkit.jpg">
<i> I have set up my own DIY kit. It includes a breadboard, jumper wires, many different types of resistors, colored LEDs, transistors, relay, buttons, etc. Ideal for learning Arduino </i>

In my opinion, you can get any kit you want. However, I recommend that it should have these:

<ul>    
    <li>Jumper Wires/Cables</li>
    <li>LEDs (Colored) </li>
    <li>Assorted resistors </li>
    <li>Push buttons </li>
    <li>LCD</li>
    <li>Relay</li>
    <li>Breadboard (Solderless)</li>
    <li>Transistors</li>
    <li>Arduino (duh)</li>
    <li>USB cable FOR the Arduino</li>
</ul>

<h2> Sofware: The Arduino IDE </h2>
The Arduino IDE <a href="https://www.arduino.cc/en/Main/Software">(Download Here)</a> is the batteries-included development environment where you write code in a C-like language. This code is later uploaded as a sketch to the Arduino board, when you connect it with a USB cable. The Arduino acts like a sort-of CPU, and executes the code. Each program is called a "sketch".For example if I write a sketch of a blinking LED on pin 13, and upload it to the Arduino, the LED I attached to pin 13 will start blinking. This is only the simple stuff. You can do much MUCH more with it (you can even integrate python, showing how flexible the language is). 

<img src="/img/ArduinoWTFisIt/arduinoide.png">

<h2> Sample Program: Blink </h2>
In programming, the canonical entry point for all beginners is the "Hello world!" program, where the compiler/interpreter outputs "Hello world!" In Arduino, it is the "Blink" sketch.
<p>1. Well first, we got to connect the Arduino to the computer. You know that it is working once the built-in LEDs start flashing.</p>
<img src="/img/ArduinoWTFisIt/connectedarduino.jpg">
<p>2. Next, we are going to attach an LED to the GND (ground) pin and pin 13. Make sure that the anode (long pin of the LED, represents positive terminal) is in GND and that the cathode (short pin, represents negative terminal) is in pin 13.</p>
<img src="/img/ArduinoWTFisIt/arduinopin.jpg">
<p>3. We will write the sketch in the Arduino IDE. </p>
<img src="/img/ArduinoWTFisIt/blinksketch.png">
The program is self-explanatory. Refer to the comments in the picture. Essentially, we declare the presence of an LED as an integer variable. We call it to turn ON and OFF after a one-second delay according to the <code>loop()</code> function.
<p>4. Click the UPLOAD button, represented by the arrow, and the program will run!</p>
<video width="320" height="240" controls>
  <source src="/img/ArduinoWTFisIt/blinkout.mov">
Your browser does not support the video tag.
</video> 

<h2> Thanks for reading! Of course, the Arduino is only a gateway into hardware and hardware hacking. Next time, I will be introducing logic gates in computer science theory USING the Arduino! Stay tuned in for it and more upcoming posts!</h2>
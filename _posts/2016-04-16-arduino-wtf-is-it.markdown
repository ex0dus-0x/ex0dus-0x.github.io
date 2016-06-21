---
layout:     post
comments:   true
title:      "What is an Arduino?"
subtitle:   "a.ka. Beginner's Guide to Hardware Hacking"
date:       2016-04-16 12:00:00
author:     "ex0dus"
header-img: "img/PostBG/post-bg-07.png"
---

## What is it?

The Arduino is an open-sourced prototype board. You use it to make projects, and is great for electronics and learning electronics. Whether it is a small blinking LED controlled by a button, or even a home automation system, the Arduino is your imagination, all stuffed into a credit card-sized blue board. The Arduino appears in many different models. However, the most basic and common one is the Arduino UNO. However, you have other versions, such as the very tiny Arduino NANO, which is bite-sized chipset-like board that acts like a miniature size Arduino. You have the Arduino MEGA, which has more I/O pins and is great for complex projects. There is much more (I remember there is actually even a Arduino Robot), but the ideal prototype board is the UNO, as shown below: ![](/img/ArduinoWTFisIt/arduino-pic.jpg) _This is mine. It is from a 3rd-party retailer, hence the Sunfounder logo. Basically the same as an Arduino :P_

## How to Get it?

You can obviously buy it from the Arduino website, [here](http://www.arduino.org/). However, it is wiser to buy a kit. Here are a few:

*   [Make: Ultimate Arduino Microcontroller Kit](http://www.makershed.com/products/ultimate-arduino-microcontroller-pack)
*   [Sparkfun's Inventor Kit:](https://www.sparkfun.com/products/12060?gclid=CjwKEAiA-s6zBRDWudDL2Iic4QQSJAA4Od3Xv9dGOkvaiVOAmJ7S2rWWO9lrId_EG5lTEYWW1DwClRoCQ_Xw_wcB)
*   [Adafruit's Starter Pack for Arduino](https://www.adafruit.com/products/68?gclid=CjwKEAiA-s6zBRDWudDL2Iic4QQSJAA4Od3Xa0jNpHILmQFEqvXD2qshEWqEAxlnskf1J57GT53zdhoCrK_w_wcB)

![](/img/ArduinoWTFisIt/personalkit.jpg) _ I have set up my own DIY kit. It includes a breadboard, jumper wires, many different types of resistors, colored LEDs, transistors, relay, buttons, etc. Ideal for learning Arduino _ In my opinion, you can get any kit you want. However, I recommend that it should have these:

*   Jumper Wires/Cables
*   LEDs (Colored)
*   Assorted resistors
*   Push buttons
*   LCD
*   Relay
*   Breadboard (Solderless)
*   Transistors
*   Arduino (duh)
*   USB cable FOR the Arduino

## Sofware: The Arduino IDE

The Arduino IDE [(Download Here)](https://www.arduino.cc/en/Main/Software) is the batteries-included development environment where you write code in a C-like language. This code is later uploaded as a sketch to the Arduino board, when you connect it with a USB cable. The Arduino acts like a sort-of CPU, and executes the code. Each program is called a "sketch".For example if I write a sketch of a blinking LED on pin 13, and upload it to the Arduino, the LED I attached to pin 13 will start blinking. This is only the simple stuff. You can do much MUCH more with it (you can even integrate python, showing how flexible the language is). ![](/img/ArduinoWTFisIt/arduinoide.png)

## Sample Program: Blink

In programming, the canonical entry point for all beginners is the "Hello world!" program, where the compiler/interpreter outputs "Hello world!" In Arduino, it is the "Blink" sketch.

1\. Well first, we got to connect the Arduino to the computer. You know that it is working once the built-in LEDs start flashing.

![](/img/ArduinoWTFisIt/connectedarduino.jpg)

2\. Next, we are going to attach an LED to the GND (ground) pin and pin 13\. Make sure that the anode (long pin of the LED, represents positive terminal) is in GND and that the cathode (short pin, represents negative terminal) is in pin 13.

![](/img/ArduinoWTFisIt/arduinopin.jpg)

3\. We will write the sketch in the Arduino IDE.

![](/img/ArduinoWTFisIt/blinksketch.png) The program is self-explanatory. Refer to the comments in the picture. Essentially, we declare the presence of an LED as an integer variable. We call it to turn ON and OFF after a one-second delay according to the `loop()` function.

4\. Click the UPLOAD button, represented by the arrow, and the program will run!

<video controls="" height="240" width="320"><source src="/img/ArduinoWTFisIt/blinkout.mov"> Your browser does not support the video tag.</video>

## Of course, the Arduino is only a gateway into hardware and hardware hacking. Next time, I will be introducing logic gates in computer science theory USING the Arduino!

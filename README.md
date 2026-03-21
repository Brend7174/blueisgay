# blue(isgay) converter
Converts Gameboy audio into MIDI files. Namesake is that rival boy from pokemon, vulgar innit
"I'M SORRY FOR NAMING IT THAT" - fallen

It's intended to be used with a synthesizer I'm still working on.

## usage
In your terminal, install node js (im sorry for using that bum ass programming language)

Now, you can use this command:
`node blueisgay.js (ROM FILE)`

Then my fork of SameBoy will open and the kind Blue will transcribe the midi for you.. This works with both gbs files and normal roms. For some reason the midis might come out broken and unusable in GarageBand or Logic Pro, despite working in other softwares. YES IT IS VERY BUGGY I WILL FIX IT

Please report all bugs because I want to fix them.
**NOTE: The path in the .js file MIGHT have to be edited if you are using a windows or linux build of sameboy!**

## to be done
So far I only have pitch detection and volume detection, and it's a bit janky. I will be adding things like pitch bend soon.
Also, sometimes the midi files do not work properly in Logic Pro, while loading on other DAWs, but I am not sure why.

## credits
This project uses SameBoy (MIT License) and this is the original: [SameBoy GitHub](https://github.com/LIJI32/SameBoy).  

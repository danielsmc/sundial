# Mobile Synthetic Sundial
This <a href="https://danielsmc.github.io/sundial">webapp</a> uses geolocation and device orientation to simulate a sundial.

It uses [SunCalc](https://github.com/mourner/suncalc) to find the sun's location, [Full Tilt](https://github.com/adtile/Full-Tilt) to smooth out the quirks in how various devices report their orientation, [geomagnetism](https://github.com/naturalatlas/geomagnetism) to calculate magnetic declination, and [freegeoip.net](http://freegeoip.net/) for IP address geolocation.
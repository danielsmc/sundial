import SunCalc from 'suncalc';
import FULLTILT from 'exports?window.FULLTILT!fulltilt/dist/fulltilt';
import geomagnetism from 'geomagnetism';
import * as matrix from './matrix';

function xhrPromise(url) {
  return new Promise((resolve,reject) => {
    var req = new XMLHttpRequest();
    req.responseType = 'json';
    req.open( "GET" , url, true);
    req.onload = (e) => resolve(req.response);
    req.onerror = reject;
    req.onabort = reject;
    req.send();
  });
}

function locationPromise(options) {
  return new Promise((resolve,reject) => navigator.geolocation.getCurrentPosition(resolve,reject,options));
}

function gyroPromise() {
  return FULLTILT.getDeviceOrientation({'type': 'world'})
          .then(devor => () => matrix.shape(devor.getScreenAdjustedMatrix().elements,3,3));
}

function rafLoop(func) {
  function recur() {
    window.requestAnimationFrame(recur);
    func();
  }
  recur();
}

function sunVector(lat,lon,when = new Date()) {
  // Returns a vector pointing away from the sun in local earth coordinates (magnetic north)
  // East - North - Up
  const altaz = SunCalc.getPosition(when,lat,lon);
  const decl = geomagnetism.model(when).point([lat,lon]).decl;
  const theta = altaz.azimuth - decl * Math.PI/180.0;
  const phi = -altaz.altitude;
  return [Math.sin(theta)*Math.cos(phi),Math.cos(theta)*Math.cos(phi),Math.sin(phi)];
}

function projectGnomon(rot,sun,gno) {
  rot = matrix.clone(rot);
  const rotated_gno = matrix.multiply(rot,gno);
  for (var i=0; i<3; i++) {
    rot[i][2]=sun[i];
  }
  const projection = matrix.inverse(rot);
  const projected = matrix.multiply(projection,rotated_gno);
  return projected.map(r=>r[0]);
}

function setAttributes(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}

function draw(lat,lon,rot) {
  const scale = 100;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const gno = matrix.colvec([0,0,1]);
  var time = new Date();

  // Resize svg
  setAttributes(
    document.getElementById("sundial"),
    {width: w+"px", height: h+"px",
     viewBox: "-"+w/2+" -"+h/2+" "+w+" "+h});

  // Draw gnomon
  var projected = projectGnomon(rot,sunVector(lat,lon,time),gno);
  setAttributes(
    document.getElementById("gnomon"),
    {x2: scale*projected[0],
     y2: -scale*projected[1]});
  document.getElementById("shadow").setAttribute("display",projected[2]>0?'inline':'none');

  // Draw Hours
  time.setMinutes(0);
  hours.forEach((el,i) => {
    time.setHours(i);
    projected = projectGnomon(rot,sunVector(lat,lon,time),gno);
    const myscale = Math.min(
      scale,
      Math.abs((w/2-20)/projected[0]),
      Math.abs((h/2-15)/projected[1]));
    setAttributes(el,{
      x: myscale*projected[0],
      y:-myscale*projected[1],
      display: projected[2]>0?'none':'inline'
    });
  });
}

// http://stackoverflow.com/a/37235274
function oneSuccess(promises){
  return Promise.all(promises.map(p => {
    // If a request fails, count that as a resolution so it will keep
    // waiting for other possible successes. If a request succeeds,
    // treat it as a rejection so Promise.all immediately bails out.
    return p.then(
      val => Promise.reject(val),
      err => Promise.resolve(err)
    );
  })).then(
    // If '.all' resolved, we've just got an array of errors.
    errors => Promise.reject(errors),
    // If '.all' rejected, we've got the result we wanted.
    val => Promise.resolve(val)
  );
}

function formatHour(h) {
  if (h==12) {
    return "noon";
  } else if (h==0) {
    return "midnight"
  } else {
    return (h%12) + (h>12?"pm":"am");
  }
}

var hours = [];

function fireWhenReady(func) {
  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded",func);
  } else {
    func();
  }
}

fireWhenReady(() => {
  var lat, lon;
  var backupLoc = xhrPromise("https://freegeoip.net/json/")
    .then(res => ({latitude:lat, longitude:lon} = res));
  var getMat = () => ([[1,0,0],[0,1,0],[0,0,1]]); // Stub if no device support
  gyroPromise()
    .then(gm => {
      getMat=gm;
    })
    .catch(e => {
      document.body.className += " nogyro"
      console.log("gyrofail",e);
    });

    document.getElementById("button-engage").addEventListener("click", () => {
      // We go through this whole song and dance so that the more accurate location
      // can supercede the IP-based guess, but doesn't block it
      oneSuccess([backupLoc,
                  locationPromise().then(e => ({latitude:lat, longitude:lon} = e.coords))])
      .then(() => {
        rafLoop(() => draw(lat,lon,getMat()));
        document.body.className += " running";
      }).catch(e => console.log("something went wrong", e));
    });

  for (var i=0;i<24;i++) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", "text");
    el.innerHTML = formatHour(i);
    el.setAttribute("text-anchor","middle")
    document.getElementById("face").appendChild(el);
    hours.push(el);
  }
});

    
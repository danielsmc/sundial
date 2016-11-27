export function multiply(a,b) {
  var h = a.length;
  var w = b[0].length;
  if (a[0].length != b.length) {
    console.log("dimension mismatch: can't multiply",a,b);
    return;
  }
  var l = b.length;
  var out = [];
  for (var i = 0; i<h; i++) {
    out.push([]);
    for (var j = 0; j<w; j++) {
      out[i].push(0);
      for (var k = 0; k<l; k++) {
        out[i][j] += a[i][k]*b[k][j];
      }
    }
  }
  return out;
}

export function shape(raw,r,c) {
  var out = [];
  for (var i=0;i<r;i++) {
    out.push(Array.prototype.slice.call(raw,i*c,(i+1)*c));
  }
  return out;
}

export function colvec(raw) {
  return raw.map(d => ([d]));
}

export function inverse(m) {
  const det = m[0][0]*m[1][1]*m[2][2]
             -m[0][0]*m[1][2]*m[2][1]
             -m[0][1]*m[1][0]*m[2][2]
             +m[0][1]*m[1][2]*m[2][0]
             +m[0][2]*m[1][0]*m[2][1]
             -m[0][2]*m[1][1]*m[2][0];

  // console.log("det",det)
  return [
    [(m[1][1]*m[2][2]-m[1][2]*m[2][1])/det, (m[0][2]*m[2][1]-m[0][1]*m[2][2])/det, (m[0][1]*m[1][2]-m[0][2]*m[1][1])/det],
    [(m[1][2]*m[2][0]-m[1][0]*m[2][2])/det, (m[0][0]*m[2][2]-m[0][2]*m[2][0])/det, (m[0][2]*m[1][0]-m[0][0]*m[1][2])/det],
    [(m[1][0]*m[2][1]-m[1][1]*m[2][0])/det, (m[0][1]*m[2][0]-m[0][0]*m[2][1])/det, (m[0][0]*m[1][1]-m[0][1]*m[1][0])/det]
  ];
}

export function clone(m) {
  return m.map(row => row.map((cell => cell)));
}

// export function prettyprint(m) {
//   return m.map(row => (
//     row.map(cell => cell.toFixed(2)).join(" ")
//     )).join("<br>");
// }
const findArgs = s => {
  const args = []
  while (s.length > 0) {
    s = s.trim()
    if (s[0] != '"') { // non-quote arg
      const a = s.split(/\s+/)[0]
      args.push( a )
      s = s.substring(a.length)
    } else { // it's a quote
      const a = s.split('"')[1]
      args.push( a )
      s = s.substring(a.length+2)
    }
  }
  return args
}

const strs = [
  { s: '', a: [] },
  { s: 'p1.jpg "Scene of action, Arrass" p2.jpg "Lt. Col. Lloyd Hamilton, RAF; 1918" p3.jpg  "some more text"',
    a: ['p1.jpg', 'Scene of action, Arrass', 'p2.jpg', 'Lt. Col. Lloyd Hamilton, RAF; 1918', 'p3.jpg', 'some more text'] },
  { s: 'first "second w/ quotes" "third w/ \"quoted\" inside"',
    a: ['first', 'second w/ qoutes', 'third w/ "quoted" inside' ] }
]

strs.forEach( t => {
  const ta = findArgs(t.s)
  if (JSON.stringify(ta) == JSON.stringify(t.a)) {
    console.log('ok')
  } else {
    console.log('error: ',ta)
  }
})

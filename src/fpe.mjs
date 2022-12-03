
import { peParse } from './pe.mjs'
import * as fs from 'fs'

const fname = process.argv[2]
let z = ''
try {
  z = fs.readFileSync(fname,'utf-8').split('\n').map( s => s.trim() )
} catch (e) {
  console.error(e.message)
  process.exit(1)
}
const s = peParse(z)
console.log(s.html)
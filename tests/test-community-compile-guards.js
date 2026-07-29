const fs = require('fs')
const path = require('path')

const read = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8')

const postDetail = read('pages/community/post-detail.uvue')
if (/^[ \t]*}\r?\n^[ \t]*}\r?\n^[ \t]*const onFollow/m.test(postDetail)) {
  throw new Error('post-detail.uvue has an extra closing brace before onFollow')
}

const paperPlane = read('pages/community/paper-plane.uvue')
const ifdefCount = (paperPlane.match(/^\s*\/\/\s*#ifdef\b/gm) || []).length
const endifCount = (paperPlane.match(/^\s*\/\/\s*#endif\b/gm) || []).length
if (ifdefCount !== endifCount) {
  throw new Error(`paper-plane.uvue conditional directives are unbalanced: #ifdef=${ifdefCount}, #endif=${endifCount}`)
}
if (!/const startRecording\s*=/.test(paperPlane) || !/const stopRecording\s*=/.test(paperPlane)) {
  throw new Error('paper-plane.uvue must define both startRecording and stopRecording')
}
if (!/recorderManager\.start\s*\(/.test(paperPlane)) {
  throw new Error('paper-plane.uvue startRecording must start the recorder manager')
}

console.log('PASS community compile guards')

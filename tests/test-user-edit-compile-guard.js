const fs = require('fs')
const path = require('path')

const pagePath = path.join(__dirname, '..', 'pages', 'user', 'edit.uvue')
const source = fs.readFileSync(pagePath, 'utf8')
const declarations = source.match(/\b(?:const|let|var)\s+formData\s*=/g) || []

if (declarations.length !== 1) {
  throw new Error(`pages/user/edit.uvue must declare formData exactly once; found ${declarations.length}`)
}

console.log('PASS pages/user/edit.uvue formData declaration guard')

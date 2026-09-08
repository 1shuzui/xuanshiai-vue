const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { baseParse } = require('@vue/compiler-dom')
const { listFiles } = require('../scripts/mp-build-state.cjs')

const root = path.resolve(__dirname, '..')
const icon = fs.readFileSync(path.join(root, 'components/XsaIcon.uvue'), 'utf8')
const baseline = require('./fixtures/icon-glyphs.json').glyphs
for (const font of require('./fixtures/icon-glyphs.json').fonts) {
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, font.path))).digest('hex'), font.sha256, `original font bytes must remain unchanged: ${font.path}`)
}
const glyphs = Object.fromEntries([...icon.matchAll(/\.xsa-icon-([\w-]+):before\s*\{\s*font-family:\s*"([^"]+)";\s*content:\s*"\\([0-9a-f]+)";/g)]
  .map(([, name, font, codepoint]) => [name, { font, codepoint }]))
assert.deepEqual(glyphs, baseline, 'original font families and codepoints must retain their glyphs')
assert.equal([...icon.matchAll(/@font-face/g)].length, 6, 'one definition for each existing font family')
let uses = 0
const sourceFiles = ['pages', 'pagesSub', 'components'].flatMap(folder => listFiles(path.join(root, folder))).filter(file => file.endsWith('.uvue'))
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8')
  if (file !== path.join(root, 'components/XsaIcon.uvue')) assert.doesNotMatch(source, /@font-face/, `${file}: font duplicated outside catalog`)
  const template = source.match(/<template>([\s\S]*?)<\/template>\s*<script/)
  if (!template) continue
  function visit(node, parentTag) {
    if (node.type === 1 && node.tag === 'XsaIcon') {
      uses++
      assert.notEqual(parentTag, 'text', `${file}: text cannot wrap a custom icon component`)
      const name = node.props.find(prop => prop.type === 6 && prop.name === 'name')?.value?.content
      if (name) assert.ok(glyphs[name], `${file}: missing icon ${name}`)
    }
    for (const child of node.children || []) visit(child, node.tag || parentTag)
  }
  visit(baseParse(template[1]))
  for (const [, name] of source.matchAll(/iconName:\s*'([^']+)'/g)) assert.ok(glyphs[name], `${file}: missing dynamic icon ${name}`)
}
assert.ok(uses >= 100, 'the migrated icon consumers must remain connected')
console.log(`PASS ${Object.keys(glyphs).length} preserved glyphs, ${uses} component uses, six shared font definitions`)

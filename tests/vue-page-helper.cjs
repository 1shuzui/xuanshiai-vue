const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const babel = require('@babel/core')
const { parse } = require('@vue/compiler-sfc')
const { baseParse } = require('@vue/compiler-dom')
const { ref, computed } = require('vue')

function readPage(relativePath) {
  const source = fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8')
  const { descriptor, errors } = parse(source)
  assert.equal(errors.length, 0, `${relativePath}: invalid Vue page`)
  return { source, script: descriptor.scriptSetup.content, template: descriptor.template.content }
}

// Execute the real page declarations; replace only platform/API inputs supplied by each scenario.
function evaluateBindings(page, names, inputs = {}, lifecycleNames = []) {
  const ast = babel.parseSync(page.script, { configFile: false, babelrc: false, parserOpts: { plugins: ['typescript'] } })
  ast.program.body = ast.program.body.filter(node =>
    (node.type === 'VariableDeclaration' && node.declarations.some(item => names.includes(item.id.name))) ||
    (node.type === 'ExpressionStatement' && node.expression.type === 'CallExpression' && lifecycleNames.includes(node.expression.callee.name)))
  const found = ast.program.body.filter(node => node.type === 'VariableDeclaration').flatMap(node => node.declarations.map(item => item.id.name))
  for (const name of names) assert.ok(found.includes(name), `Missing page declaration: ${name}`)
  const { code } = babel.transformFromAstSync(ast, page.script, { configFile: false, babelrc: false,
    plugins: [[require('@babel/plugin-transform-typescript'), { allExtensions: true }]] })
  return vm.runInNewContext(`${code}\n;({${names.join(',')}})`, { ref, computed, ...inputs })
}

function templateElements(page) {
  const elements = []
  function visit(node) {
    if (node.type === 1) elements.push(node)
    for (const child of node.children || []) visit(child)
  }
  visit(baseParse(page.template))
  return elements
}

module.exports = { readPage, evaluateBindings, templateElements }

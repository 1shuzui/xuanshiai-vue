const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const configPath = path.join(root, 'project.config.json')
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

assert.strictEqual(
  config.miniprogramRoot,
  'unpackage/dist/dev/mp-weixin/',
  'WeChat DevTools must load the compiled mini-program output'
)

console.log('微信开发者工具项目路径测试通过')

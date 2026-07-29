const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const configPath = path.join(root, 'project.config.json')
const launcherPath = path.join(root, 'open-wechat-devtools.bat')
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
const launcher = fs.readFileSync(launcherPath, 'utf8')

assert.strictEqual(
  config.miniprogramRoot,
  '',
  'HBuilderX copies this file to the compiled output, so the generated project must use itself as miniprogramRoot'
)
assert.match(
  launcher,
  /set "MINIPROGRAM_DIR=%~dp0unpackage\\dist\\dev\\mp-weixin"/,
  'WeChat DevTools launcher must open the compiled mini-program output'
)

console.log('微信开发者工具项目路径测试通过')

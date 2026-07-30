const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const configPath = path.join(root, 'project.config.json')
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
const artifactRoot = path.join(root, 'unpackage', 'dist', 'dev', 'mp-weixin')
const artifactConfigPath = path.join(artifactRoot, 'project.config.json')

assert.strictEqual(
  config.miniprogramRoot,
  './',
  'The source project config must keep the compiled output as its project root'
)

assert.ok(
  fs.existsSync(artifactConfigPath),
  'The compiled mini-program output must contain project.config.json'
)

const artifactConfig = JSON.parse(fs.readFileSync(artifactConfigPath, 'utf8'))
const artifactRootSetting = artifactConfig.miniprogramRoot || './'
const resolvedArtifactRoot = path.resolve(artifactRoot, artifactRootSetting)

assert.strictEqual(
  resolvedArtifactRoot,
  artifactRoot,
  'Opening the compiled output directly must resolve miniprogramRoot to that output directory'
)
assert.ok(
  fs.existsSync(path.join(resolvedArtifactRoot, 'app.json')),
  'The compiled project root must contain app.json'
)

console.log('微信开发者工具项目路径测试通过')

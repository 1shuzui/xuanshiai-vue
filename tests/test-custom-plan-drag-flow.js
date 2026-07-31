const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8')
}

function expect(content, fragment, label) {
  if (!content.includes(fragment)) {
    throw new Error(`${label}: missing ${fragment}`)
  }
  console.log(`PASS ${label}`)
}

console.log('Custom plan drag flow checks')

const source = read('pages/matchmaker/matchmaker.uvue')
expect(source, 'scroll-x', 'horizontal plan scroll enabled')
expect(source, 'customPlanListWidth', 'scroll content width calculation')
expect(source, "'width: ' + customPlanListWidth + 'rpx;'", 'scroll content width binding')
expect(source, 'count * 300 + (count - 1) * 14 + 32', 'scroll width includes every plan')
expect(source, 'width: 300rpx', 'two-and-a-half card viewport layout')

// 编译产物由不同工作区生成；此静态守卫只验证源码，不依赖可能被清理的本机 unpackage 目录。

console.log('Custom plan drag flow checks passed')

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

console.log('Matchmaker contact Mock flow checks')

const mock = read('mock/matchmaker.uts')
expect(mock, 'mockMatchmakerContact', 'contact Mock record')
expect(mock, "phone: '17000025001'", 'test phone number')
expect(mock, "wechat: 'xsa_matchmaker_linxia'", 'test WeChat ID')
expect(mock, '测试联系方式，请勿用于真实业务沟通', 'non-production contact note')

const api = read('api/matchmaker.uts')
expect(api, 'getMockMatchmakerContact', 'contact Mock API')
expect(api, 'Object.assign({}, mockMatchmakerContact)', 'contact copy isolation')

const apiIndex = read('api/index.uts')
expect(apiIndex, 'getMockMatchmakerContact', 'contact API export')

const matchmakerHome = read('pages/matchmaker/matchmaker.uvue')
expect(matchmakerHome, 'const handleMatchmakerContact', 'contact action handler')
expect(matchmakerHome, "url: '/pagesSub/matchmaker/detail?id=' + item.id", 'contact opens matchmaker profile')
if (matchmakerHome.includes("url: '/pagesSub/matchmaker/apply?matchmakerId='")) {
  throw new Error('contact action must not open the matchmaker recruitment form')
}
console.log('PASS contact action does not open recruitment form')

const page = read('pagesSub/matchmaker/custom.uvue')
expect(page, 'contactPanelVisible', 'contact panel state')
expect(page, 'getMockMatchmakerContact()', 'contact data loading')
expect(page, 'uni.makePhoneCall', 'phone action')
expect(page, 'uni.setClipboardData', 'WeChat copy action')

const detail = read('pagesSub/matchmaker/detail.uvue')
expect(detail, "import { mockMatchmakerContact } from '@/mock'", 'shared contact Mock import')
expect(detail, 'phone: mockMatchmakerContact.phone', 'shared detail phone')
expect(detail, 'wechat: mockMatchmakerContact.wechat', 'shared detail WeChat')

console.log('Matchmaker contact Mock flow checks passed')

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const messagesPage = fs.readFileSync(path.join(root, 'pagesSub/community/paper-plane-messages.uvue'), 'utf8')
const chatPage = fs.readFileSync(path.join(root, 'pagesSub/chat/detail.uvue'), 'utf8')
const communityApi = fs.readFileSync(path.join(root, 'api/community.uts'), 'utf8')

function includes(source, value, label) {
  assert.ok(source.includes(value), `${label} should include ${value}`)
}

includes(messagesPage, 'paperPlaneConversationId=', 'paper-plane conversation navigation')
includes(messagesPage, '@click.stop="openPeerProfile(item)"', 'paper-plane peer profile avatar action')
includes(messagesPage, 'const openPeerProfile = (item: any)', 'paper-plane peer profile handler')
includes(messagesPage, "url: '/pagesSub/userExtra/user/detail?userId=' + item.userId", 'paper-plane peer profile navigation')
assert.ok(
  !messagesPage.includes("url: '/pagesSub/chat/detail?userId=' + item.userId"),
  'paper-plane conversation should not navigate through ordinary chat userId'
)
includes(chatPage, 'paperPlaneConversationId', 'chat page paper-plane mode')
includes(chatPage, 'getPaperPlaneMessages', 'paper-plane message loader')
includes(chatPage, 'sendPaperPlaneMessage', 'paper-plane message sender')
includes(chatPage, 'readPaperPlaneConversation', 'paper-plane read marker')
includes(communityApi, 'row.mine', 'paper-plane mine flag mapping')

console.log('纸飞机会话链路测试通过')

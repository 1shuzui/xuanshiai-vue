const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath))

const paperPlane = read('pages/community/paper-plane.uvue')
const messages = read('pages/community/paper-plane-messages.uvue')
const sent = read('pages/community/paper-plane-sent.uvue')
const chat = read('pages/chat/detail.uvue')
const pagesJson = read('pages.json')
const api = read('api/community.uts')

for (const fragment of [
  '扔纸飞机次数：',
  '捡纸飞机次数：',
  'catchCount',
  'openCatchMenu',
  'openNormalCatch',
  'normalCatchVisible',
  'normalReplyDraft',
  'sendNormalReply',
  'openDatingPlaneComposer',
  'paperPlaneImages',
  'getRecorderManager',
  'toggleRecording',
  'sendPaperPlane',
  'replyPaperPlane',
  'guardRealName',
  'createCommunityCreateKey'
]) {
  assert.ok(paperPlane.includes(fragment), `paper-plane home must include ${fragment}`)
}

assert.ok((paperPlane.match(/flight-plane/g) || []).length >= 8, 'paper-plane home must render the flight scene')
assert.ok(!paperPlane.includes('<scroll-view'), 'paper-plane home must keep its fixed flight layout')

assert.ok(exists('pages/community/dating-plane.uvue'), 'dating-plane page must exist')
assert.ok(exists('pages/community/dating-plane-compose.uvue'), 'dating-plane composer must exist')
assert.ok(exists('pages/community/paper-plane-messages.uvue'), 'paper-plane messages page must exist')
assert.ok(exists('pages/community/paper-plane-sent.uvue'), 'sent paper-plane page must exist')

for (const fragment of [
  '我的纸飞机',
  '聊天列表',
  '我发出的',
  'getPaperPlaneConversations',
  'markPaperPlaneConversationRead',
  'paperPlaneConversationId='
]) {
  assert.ok(messages.includes(fragment), `paper-plane messages page must include ${fragment}`)
}
assert.ok(!messages.includes("url: '/pages/chat/detail?userId=' + item.userId"), 'paper-plane conversation must not use ordinary chat identity routing')

for (const fragment of [
  'getSentPaperPlanes',
  '还没有发出的纸飞机',
  '只保留最近五天扔出去的纸飞机'
]) {
  assert.ok(sent.includes(fragment), `sent paper-plane page must include ${fragment}`)
}

for (const fragment of [
  'paperPlaneConversationId',
  'getPaperPlaneMessages',
  'sendPaperPlaneMessage',
  'readPaperPlaneConversation'
]) {
  assert.ok(chat.includes(fragment), `chat must support paper-plane conversations via ${fragment}`)
}

for (const route of [
  'pages/community/dating-plane',
  'pages/community/dating-plane-compose',
  'pages/community/paper-plane-messages',
  'pages/community/paper-plane-sent'
]) {
  assert.ok(pagesJson.includes(route), `pages.json must register ${route}`)
}

for (const name of [
  'getPaperPlaneConversations',
  'getSentPaperPlanes',
  'getPaperPlaneMessages',
  'sendPaperPlaneMessage',
  'readPaperPlaneConversation'
]) {
  assert.ok(api.includes(`export async function ${name}`), `community API must export ${name}`)
}

console.log('PASS paper-plane UI and conversation contract')

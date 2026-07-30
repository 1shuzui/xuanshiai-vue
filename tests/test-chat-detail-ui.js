const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const chatPage = fs.readFileSync(path.join(root, 'pagesSub/chat/detail.uvue'), 'utf8')
const userApi = fs.readFileSync(path.join(root, 'api/user.uts'), 'utf8')
const apiIndex = fs.readFileSync(path.join(root, 'api/index.uts'), 'utf8')

function includes(source, value, label) {
  assert.ok(source.includes(value), `${label} should include ${value}`)
}

includes(chatPage, 'input-bar', 'chat input bar')
includes(chatPage, 'showMoreMenu', 'plus button opens the more menu')
includes(chatPage, 'showMoreMenu', 'plus button toggle action')
includes(chatPage, 'more-menu', 'expanded actions should render below input row')
includes(chatPage, 'unlockChatFeature', 'chat feature unlock API')
includes(chatPage, 'getChatFeatureUnlocks', 'chat feature unlock state API')
includes(chatPage, 'ensureChatFeatureUnlocked', 'chat unlock gate')
includes(chatPage, "ensureChatFeatureUnlocked('album'", 'album unlock gate')
includes(chatPage, "ensureChatFeatureUnlocked('camera'", 'camera unlock gate')
includes(chatPage, "ensureChatFeatureUnlocked('profile'", 'profile unlock gate')
includes(chatPage, 'openPeerProfile', 'peer avatar navigation action')
includes(chatPage, 'XsaReportSheet', 'detailed report sheet')
includes(chatPage, 'openChatReport', 'report menu action')
includes(chatPage, '举报', 'report menu label')
assert.ok(!chatPage.includes('>资料</text>'), 'profile menu item should be replaced by report')
assert.ok(
  /\.message-wrapper\.mine\s*\{[^}]*justify-content:\s*flex-end;/.test(chatPage),
  'own messages should align the bubble and avatar to the right'
)
assert.ok(
  /\.message-wrapper\.mine\s*\{[^}]*flex-direction:\s*row-reverse;/.test(chatPage) === false,
  'own messages should keep bubble before avatar in normal row order'
)

const voiceIndex = chatPage.indexOf('@click="sendVoice"')
const inputIndex = chatPage.indexOf('class="input"')
const toggleIndex = chatPage.indexOf('showMoreMenu')
assert.ok(voiceIndex >= 0 && inputIndex >= 0 && toggleIndex >= 0, 'chat controls should exist')
assert.ok(voiceIndex < inputIndex && inputIndex < toggleIndex, 'voice, input, and plus controls should be ordered left to right')

includes(userApi, 'getChatFeatureUnlocks', 'chat feature unlock read API')
includes(userApi, 'unlockChatFeature', 'chat feature unlock charge API')
includes(userApi, 'CHAT_FEATURE_UNLOCK_COST = 80', 'chat feature unlock cost')
includes(apiIndex, 'getChatFeatureUnlocks', 'chat feature unlock API export')
includes(apiIndex, 'unlockChatFeature', 'chat feature charge API export')

console.log('聊天详情页交互契约测试通过')

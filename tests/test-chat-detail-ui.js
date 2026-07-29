const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const chatPage = fs.readFileSync(path.join(root, 'pages/chat/detail.uvue'), 'utf8')
const apiIndex = fs.readFileSync(path.join(root, 'api/index.uts'), 'utf8')

function includes(source, value, label) {
  assert.ok(source.includes(value), `${label} should include ${value}`)
}

includes(chatPage, 'input-bar', 'chat input bar')
<<<<<<< HEAD
includes(chatPage, 'showMore ? \'×\' : \'+\'', 'plus button should toggle into close icon')
includes(chatPage, 'toggleMoreMenu', 'plus button toggle action')
includes(chatPage, 'more-actions', 'expanded actions should render below input row')
=======
includes(chatPage, 'showMoreMenu', 'plus button should open the action menu')
includes(chatPage, 'closeMoreMenu', 'action menu should have a close action')
includes(chatPage, 'more-menu', 'expanded actions should render in the action menu')
includes(chatPage, 'unlockChatFeature', 'chat feature unlock API')
includes(chatPage, 'getChatFeatureUnlocks', 'chat feature unlock state API')
includes(chatPage, 'ensureChatFeatureUnlocked', 'chat unlock gate')
includes(chatPage, "ensureChatFeatureUnlocked('album'", 'album unlock gate')
includes(chatPage, "ensureChatFeatureUnlocked('camera'", 'camera unlock gate')
includes(chatPage, "ensureChatFeatureUnlocked('profile'", 'profile unlock gate')
>>>>>>> sync/upstream-main-751a9f4
includes(chatPage, 'openPeerProfile', 'peer avatar navigation action')
includes(chatPage, 'XsaReportSheet', 'detailed report sheet')
includes(chatPage, ':large-text="isParentMode"', 'parent chat report sheet uses the large-text variant')
includes(chatPage, 'openChatReport', 'report menu action')
includes(chatPage, '举报', 'report menu label')
includes(chatPage, 'onShow(() =>', 'chat permission should be rechecked when returning to the page')
includes(chatPage, 'permissionRequestSequence', 'new permission rechecks should supersede older responses')
includes(chatPage, 'isPermissionRequestCurrent', 'permission responses should be subject and generation guarded')
assert.ok(!chatPage.includes('permissionRequestInFlight'), 'onShow permission checks should not be discarded')
includes(chatPage, 'unsentLocal', 'failed local messages should survive a permission refresh')
includes(chatPage, "res.code == 'CHAT_NOT_ALLOWED'", 'permission failures should close the chat gate')
includes(chatPage, 'result.success != true', 'send success should require the business success flag')
includes(chatPage, 'uploadChatMedia', 'media should be uploaded before sending a media message')
includes(chatPage, 'revokeMessage', 'sent messages should support a server-side revoke')
includes(chatPage, 'getContactExchanges', 'contact exchange state should be loaded from the API')
includes(chatPage, 'createContactExchange', 'contact exchange should be explicitly requested')
includes(chatPage, 'respondContactExchange', 'contact exchange should require a receiver response')
includes(chatPage, 'contactLoading', 'contact exchange should expose a loading state')
includes(chatPage, '请重新选择媒体', 'failed uploads should not expose an invalid retry action')
includes(chatPage, 'onUnmounted(() =>', 'recording should be cleaned up when the page unmounts')
includes(chatPage, 'discardVoiceRecording', 'unmounting should discard a partial voice recording')
includes(chatPage, "{ 'parent-mode': isParentMode }", 'parent chat accessibility root variant')
includes(chatPage, 'isProtectedMediaMessage', 'parent chat media defense in depth')
includes(chatPage, "content: protectedContent ? '' : message.content", 'parent chat does not retain protected media URLs')
includes(chatPage, "avatar: isParentMode.value ? ''", 'parent chat does not retain clear avatar URLs')
includes(chatPage, '内容已保护', 'parent chat protected media placeholder')
assert.ok(
  (chatPage.match(/:large-text="isParentMode"/g) || []).length >= 2,
  'parent permission and history retry controls should use the large-text button variant',
)
assert.ok(
  /\.chat-page\.parent-mode \.state-desc,[\s\S]{0,400}font-size:\s*14px;/.test(chatPage),
  'parent support text should be at least 14px',
)
assert.ok(
  /\.chat-page\.parent-mode \.chat-loading > text,[\s\S]{0,300}font-size:\s*16px;/.test(chatPage),
  'parent body text should be at least 16px',
)
assert.ok(
  /\.chat-page\.parent-mode \.avatar,[\s\S]{0,300}min-height:\s*48px;/.test(chatPage),
  'parent avatar and icon controls should expose 48px targets',
)
assert.ok(
  /\.chat-page\.parent-mode \.input,[\s\S]{0,300}min-height:\s*48px;/.test(chatPage),
  'parent input and command controls should expose 48px targets',
)
assert.ok(!chatPage.includes('const peerAvatar ='), 'chat detail should not cache a peer clear avatar outside message rendering')
assert.ok(!chatPage.includes('@click="chooseImage"'), 'album should not be offered without an upload-and-send flow')
assert.ok(!chatPage.includes('@click="takePhoto"'), 'camera should not be offered without an upload-and-send flow')
assert.ok(!chatPage.includes('@click="sendVoice"'), 'voice should not be offered without a send flow')
assert.ok(!chatPage.includes('@click="sendGift"'), 'gifts should not be offered without a send flow')
assert.ok(!chatPage.includes('发送服务暂未开放'), 'removed send actions should not lead to a dead-end toast')
assert.ok(!chatPage.includes('>资料</text>'), 'profile menu item should be replaced by report')
assert.ok(!chatPage.includes('ensureChatFeatureUnlocked'), 'chat should not include the removed points unlock gate')
assert.ok(
	/\.message-wrapper\.mine\s*\{[^}]*justify-content:\s*flex-end;/.test(chatPage),
  'own messages should align the bubble and avatar to the right'
)
assert.ok(
  /\.message-wrapper\.mine\s*\{[^}]*flex-direction:\s*row-reverse;/.test(chatPage) === false,
  'own messages should keep bubble before avatar in normal row order'
)

const inputIndex = chatPage.indexOf('class="input"')
<<<<<<< HEAD
const sendIndex = chatPage.indexOf('@click="sendMessage"')
const toggleIndex = chatPage.indexOf('toggleMoreMenu')
assert.ok(inputIndex >= 0 && sendIndex >= 0 && toggleIndex >= 0, 'chat controls should exist')
assert.ok(inputIndex < sendIndex && sendIndex < toggleIndex, 'input, send, and plus controls should be ordered left to right')
=======
const menuIndex = chatPage.indexOf('showMoreMenu')
assert.ok(voiceIndex >= 0 && inputIndex >= 0 && menuIndex >= 0, 'chat controls should exist')
assert.ok(voiceIndex < inputIndex && inputIndex < menuIndex, 'voice, input, and plus controls should be ordered left to right')
>>>>>>> sync/upstream-main-751a9f4

includes(apiIndex, 'uploadChatMedia', 'chat media upload API export')
includes(apiIndex, 'revokeMessage', 'chat revoke API export')
includes(apiIndex, 'getContactExchanges', 'contact exchange read API export')
includes(apiIndex, 'createContactExchange', 'contact exchange create API export')
includes(apiIndex, 'respondContactExchange', 'contact exchange response API export')

console.log('聊天详情页交互契约测试通过')

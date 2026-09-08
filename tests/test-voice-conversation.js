const fs = require('fs')
const path = require('path')
const assert = require('assert')

const root = path.join(__dirname, '..')
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

const config = read('api/config.uts')
const wsApi = read('api/voice-ws.uts')
const component = read('pagesSub/profileExtra/components/VoiceConversation.uvue')
const page = read('pagesSub/profileExtra/my-portrait.uvue')
const player = read('utils/tts-player.uts')

// ===== api/config.uts: WebSocket URL 构建 =====
assert.match(config, /buildWsUrl/, 'config must export buildWsUrl for WebSocket connections')
assert.match(config, /wss:\/\//, 'buildWsUrl must upgrade https to wss')
assert.match(config, /ws:\/\//, 'buildWsUrl must upgrade http to ws')
assert.match(config, /token=/, 'buildWsUrl must append token as query parameter')

// ===== api/voice-ws.uts: WebSocket 封装 =====
assert.match(wsApi, /class VoiceWS/, 'voice-ws must export VoiceWS class')
assert.match(wsApi, /uni\.connectSocket/, 'VoiceWS must use uni.connectSocket')
assert.match(wsApi, /session_start/, 'VoiceWS must send session_start on connect')
assert.match(wsApi, /audio_start/, 'VoiceWS must have sendAudioStart method')
assert.match(wsApi, /audio_chunk/, 'VoiceWS must have sendAudioChunk method')
assert.match(wsApi, /audio_end/, 'VoiceWS must have sendAudioEnd method')
assert.match(wsApi, /cancel/, 'VoiceWS must have sendCancel method')
assert.match(wsApi, /partial_transcript/, 'VoiceWS must handle partial_transcript messages')
assert.match(wsApi, /final_transcript/, 'VoiceWS must handle final_transcript messages')
assert.match(wsApi, /ai_thinking/, 'VoiceWS must handle ai_thinking messages')
assert.match(wsApi, /ai_reply/, 'VoiceWS must handle ai_reply messages')
assert.match(wsApi, /tts_audio/, 'VoiceWS must handle tts_audio messages')
assert.match(wsApi, /onError/, 'VoiceWS must have error callback')
assert.match(wsApi, /reconnect/, 'VoiceWS must implement reconnection logic')
assert.match(wsApi, /disconnect/, 'VoiceWS must have disconnect method')
assert.match(wsApi, /JSON\.parse/, 'VoiceWS must parse incoming JSON messages')
assert.match(wsApi, /JSON\.stringify/, 'VoiceWS must stringify outgoing messages')

// ===== 新增:ai_reasoning / ai_content / revise_text / listen =====
assert.match(wsApi, /ai_reasoning/, 'VoiceWS must handle ai_reasoning messages')
assert.match(wsApi, /ai_content/, 'VoiceWS must handle ai_content messages')
assert.match(wsApi, /revise_text/, 'VoiceWS must send revise_text')
assert.match(wsApi, /sendListen/, 'VoiceWS must have sendListen method')
assert.match(wsApi, /type: 'listen'/, 'sendListen must send listen')
assert.match(wsApi, /sendReviseText/, 'VoiceWS must have sendReviseText method')

// ===== pagesSub/profileExtra/components/VoiceConversation.uvue: 实时对话组件 =====
assert.match(component, /VoiceWaveform/, 'VoiceConversation must use VoiceWaveform component')
assert.match(component, /VoiceWS/, 'VoiceConversation must import VoiceWS')
assert.match(component, /convState/, 'VoiceConversation must have convState ref')
assert.match(component, /idle/, 'VoiceConversation must support idle state')
assert.match(component, /listening/, 'VoiceConversation must support listening state')
assert.match(component, /processing/, 'VoiceConversation must support processing state')
assert.match(component, /speaking/, 'VoiceConversation must support speaking state')
assert.match(component, /partialText/, 'VoiceConversation must display partial transcript text')
assert.match(component, /recorderManager/, 'VoiceConversation must use recorderManager for audio capture')
assert.match(component, /onFrameRecorded/, 'VoiceConversation must handle onFrameRecorded for streaming audio')
assert.match(component, /sendAudioChunk/, 'VoiceConversation must send audio chunks via WS')
assert.match(component, /arrayBufferToBase64/, 'VoiceConversation must encode audio to base64')
assert.match(component, /new TTSPlayer/, 'VoiceConversation must use the shared queued TTS player')
assert.match(component, /ttsPlayer\.enqueue\(audioUrl, durationMs\)/, 'TTS chunks must reach the shared player')
assert.match(player, /uni\.createInnerAudioContext/, 'TTS must play through the platform audio context')
assert.match(component, /ttsPlayer\.stop\(\)/, 'VoiceConversation must stop queued playback on cleanup')
assert.match(component, /defineExpose/, 'VoiceConversation must expose methods to parent')
assert.match(component, /emit\(/, 'VoiceConversation must emit events')
assert.match(component, /transcribed/, 'VoiceConversation must emit transcribed event')
assert.match(component, /aiReply/, 'VoiceConversation must emit aiReply event')
assert.match(component, /onUnmounted/, 'VoiceConversation must clean up on unmount')

// ===== 新增:听写纸与按需播报 =====
assert.match(component, /atelier-dark/, 'VoiceConversation waveform must use atelier-dark')
assert.match(component, /finalText/, 'VoiceConversation must keep final transcript on the paper')
assert.match(component, /听它读/, 'VoiceConversation must offer listen action')
assert.match(component, /sendListen/, 'listen action must call sendListen')
assert.match(component, /sendReviseText/, 'revise action must call sendReviseText')
assert.ok(
  !/partialText\.value = ''[\s\S]{0,80}emit\('transcribed'/.test(component),
  'final transcript must not clear the paper before emit transcribed'
)

// ===== pagesSub/profileExtra/my-portrait.uvue: 实时对话模式集成 =====
assert.match(page, /VoiceConversation/, 'my-portrait must import VoiceConversation component')
assert.match(page, /conversationMode/, 'my-portrait must have conversationMode state')
assert.match(page, /startConversationSession/, 'my-portrait must have startConversationSession handler')
assert.match(page, /实时对话/, 'my-portrait mode select must include conversation option')
assert.match(page, /像朋友一样聊天/, 'my-portrait conversation mode must have descriptive text')
assert.match(page, /onConversationTranscribed/, 'my-portrait must handle onConversationTranscribed event')
assert.match(page, /onConversationAIReply/, 'my-portrait must handle onConversationAIReply event')
assert.match(page, /conversationRef/, 'my-portrait must have conversationRef for component reference')

// ===== 新增:听它读与改字重跑 =====
assert.match(page, /听它读/, 'portrait overlay must offer listen')
assert.match(page, /listenConvReview/, 'portrait must wire listenConvReview handler')
assert.match(page, /revise\(/, 'editing transcript must revise the live reply')

console.log('✅ test-voice-conversation.js: all assertions passed')

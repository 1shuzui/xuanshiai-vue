const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const page = fs.readFileSync(path.join(__dirname, '..', 'pagesSub', 'profileExtra', 'my-portrait-master.uvue'), 'utf8')
const player = fs.readFileSync(path.join(__dirname, '..', 'utils', 'pcm-player.uts'), 'utf8')

assert.match(page, /realtimeV2Active = protocolVersion != null && protocolVersion == 2/, 'v2 must activate from server journey_ready protocol_version')
assert.match(page, /if \(MOXIANG_REALTIME_V2_DEV && ws != null\) \{[\s\S]*?ws\.enableRealtimeV2\(\)/, 'v2 negotiation must remain behind the PCM capability/dev gate')
assert.match(page, /onAudioOutputStart:[\s\S]*?pcmPlayer\.begin\(generationId\)[\s\S]*?masterState\.value = 'speaking'[\s\S]*?currentGenerationId = generationId/, 'audio output start must bind the PCM generation before speaking')
assert.match(player, /begin\(generationId: string\)[\s\S]*?this\.generation = generationId/, 'PCM player must expose a generation binding used by enqueue')
assert.match(page, /onResponseStatus:[\s\S]*?playbackStatus == 'playing'[\s\S]*?masterState\.value = 'speaking'/, 'playing status must drive speaking state')
assert.match(page, /playbackStatus == 'completed' \|\| playbackStatus == 'interrupted' \|\| playbackStatus == 'unknown'[\s\S]*?masterState\.value = 'idle'/, 'playback terminal status must drive idle state')
assert.match(page, /generationId != '' && currentGenerationId != '' && generationId != currentGenerationId/, 'late response status from an old generation must be ignored')

const doneStart = page.indexOf('\t\tonResponseDone:')
const statusStart = page.indexOf('\t\tonResponseStatus:')
assert.ok(doneStart >= 0 && statusStart > doneStart, 'response_done and response_status callbacks must both exist')
const doneBlock = page.slice(doneStart, statusStart)
assert.ok(!doneBlock.includes("masterState.value = 'idle'"), 'response_done must not claim playback is complete')
assert.match(doneBlock, /pcmPlayer\.finish\(generationId\)/, 'response_done may only close input to the PCM queue')
assert.match(page, /onFinished:[\s\S]*?status == 'completed' \|\| status == 'interrupted' \|\| status == 'failed'[\s\S]*?masterState\.value = 'idle'/, 'PCM playback completion must settle the UI')

console.log('moxiang voice state contract: PASS')

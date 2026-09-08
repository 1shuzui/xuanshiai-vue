const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const babel = require('@babel/core')
const { readPage, evaluateBindings } = require('./vue-page-helper.cjs')

const source = fs.readFileSync(path.resolve(__dirname, '../utils/poster-profile.uts'), 'utf8')
const { code } = babel.transformSync(source, {
  filename: 'poster-profile.uts', configFile: false, babelrc: false,
  plugins: [[require('@babel/plugin-transform-typescript'), { allExtensions: true }], require('@babel/plugin-transform-modules-commonjs')]
})
const context = { exports: {} }
vm.runInNewContext(code, context)
const { normalizePosterProfile } = context.exports
const actual = normalizePosterProfile({
  user_id: 202, nickname: '联调子女', avatar: 'https://media.example/avatar.jpg',
  photos: [
    { id: 2, media_type: 'photo', file_url: 'https://media.example/album-a.jpg', thumbnail_url: null, sort_order: 0 },
    { id: 3, media_type: 'photo', file_url: 'https://media.example/album-b.jpg', thumbnail_url: 'https://media.example/small-b.jpg', sort_order: 1 }
  ]
})
assert.deepEqual(Array.from(actual.photos), ['https://media.example/album-a.jpg', 'https://media.example/album-b.jpg'], 'real media descriptors must become full-size image URLs in server order')
const legacy = normalizePosterProfile({ name: '原有资料', photos: ['/static/portraits/profile-man-light.jpg', '/static/portraits/profile-man-alt.jpg'] })
assert.deepEqual(Array.from(legacy.photos), ['/static/portraits/profile-man-light.jpg', '/static/portraits/profile-man-alt.jpg'], 'existing string photo lists retain their paths and order')

async function run() {
  const page = readPage('pagesSub/profileExtra/my-poster-preview.uvue')
  let response
  const state = evaluateBindings(page, ['profile', 'loading', 'userId', 'loadProfile'], {
    getOwnProfile: async () => { if (response instanceof Error) throw response; return response },
    getUserDetail: async () => { throw Error('own poster must use own profile') },
    normalizePosterProfile, defaultPosterProfile: () => ({ name: 'invented profile' }), uni: { showToast: () => {} }
  })
  response = { success: true, data: { nickname: '本人资料', photos: [{ file_url: 'https://media.example/own.jpg' }] } }
  await state.loadProfile()
  assert.equal(state.profile.value.name, '本人资料')
  assert.equal(state.profile.value.photos[0], 'https://media.example/own.jpg')
  for (const failure of [{ success: false }, new Error('offline')]) {
    response = failure
    await state.loadProfile()
    assert.equal(state.profile.value, null, 'failed reload must expose retry, not stale or invented identity')
    assert.equal(state.loading.value, false)
  }
  response = { success: true, data: { nickname: '重试后的本人资料', photos: ['/static/portraits/profile-man-alt.jpg'] } }
  await state.loadProfile()
  assert.equal(state.profile.value.name, '重试后的本人资料')
  console.log('PASS poster media descriptors, existing photo paths, real profile loading and error/retry')
}
run().catch(error => { console.error(error); process.exitCode = 1 })

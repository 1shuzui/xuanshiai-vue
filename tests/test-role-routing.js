const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const pages = JSON.parse(read('pages.json'))
const paths = pages.pages.map((item) => item.path)
const expectedNewRoutes = [
  'pages/parent/parent',
  'pages/parent/user-detail',
  'pages/emotion-lab/emotion-lab',
]

for (const route of expectedNewRoutes) {
  assert.ok(paths.includes(route), `pages.json should register ${route}`)
}

const parentDetailRoute = pages.pages.find((item) => item.path === 'pages/parent/user-detail')
assert.strictEqual(
  parentDetailRoute.style.navigationStyle,
  'custom',
  'parent detail must not render a native navigation bar above its accessible custom header',
)

assert.deepStrictEqual(
  pages.tabBar.list.map((item) => `${item.pagePath}:${item.text}`),
  [
    'pages/index/index:首页',
    'pages/community/community:社区',
    'pages/matchmaker/matchmaker:牵线',
    'pages/message/message:消息',
    'pages/profile/profile:我的',
  ],
  'the existing native five-tab order must remain unchanged',
)

const onboarding = read('pagesSub/userExtra/onboarding/profile.uvue')
assert.ok(onboarding.includes("key === 'parent'"), 'onboarding should handle the parent role')
assert.ok(
  onboarding.includes("uni.setStorageSync('xsa_onboarding_mode', 'parent')"),
  'parent selection should persist parent mode immediately',
)
assert.ok(
  onboarding.includes("url: '/pages/parent/parent'"),
  'parent selection should enter the parent shell',
)
assert.ok(
  !onboarding.includes("key === 'parent' || key === 'matchmaker'"),
  'parent role must no longer be grouped with unavailable roles',
)

const indexPage = read('pages/index/index.uvue')
assert.ok(indexPage.includes('routeParentMode'), 'home should enforce stored parent-mode routing')

const appPage = read('App.uvue')
assert.ok(appPage.includes('enforceParentRoute'), 'app resume should enforce parent-mode routing')
assert.ok(
  appPage.includes("route == 'pages/parent/parent'") && appPage.includes("route == 'pages/parent/user-detail'"),
  'app route guard should allow the parent shell and parent detail page',
)
assert.ok(
  appPage.includes("url: '/pages/parent/parent'"),
  'app route guard should return parent mode to the parent shell',
)
assert.ok(
  appPage.includes('setTimeout(() => enforceParentRoute(), 0)'),
  'app route guard should re-check after the cold-start page stack mounts',
)

const loginPage = read('pages/auth/login.uvue')
assert.ok(loginPage.includes('routeAfterLogin'), 'login should use one role-aware destination helper')
assert.ok(loginPage.includes("xsa_onboarding_mode"), 'login should read the stored onboarding role')
assert.ok(
  /storedMode[\s\S]*?parent[\s\S]*?uni\.reLaunch\(\{ url: '\/pages\/parent\/parent' \}\)/.test(loginPage),
  'login should replace the auth stack when entering parent mode',
)
const debugLoginStart = loginPage.indexOf('const handleDebugLogin = async () =>')
const firstLoginStart = loginPage.indexOf('const handleFirstLogin =')
assert.ok(debugLoginStart >= 0 && firstLoginStart > debugLoginStart, 'debug login handler should be complete')
assert.ok(
  loginPage.slice(debugLoginStart, firstLoginStart).includes('routeAfterLogin(true)'),
  'authenticated debug login should send a new account through role selection',
)

const configApi = read('api/config.uts')
const clearAuthStart = configApi.indexOf('export function clearAuthTokens')
const clearAuthEnd = configApi.indexOf('/** 拼接完整 HTTP URL */', clearAuthStart)
assert.ok(clearAuthStart >= 0 && clearAuthEnd > clearAuthStart, 'auth cleanup should be a complete function')
const clearAuthBody = configApi.slice(clearAuthStart, clearAuthEnd)
for (const key of [
  'ACCESS_TOKEN_KEY',
  'REFRESH_TOKEN_KEY',
  'CURRENT_USER_ID_KEY',
  'ONBOARDING_MODE_KEY',
  'ONBOARDING_COMPLETED_KEY',
]) {
  assert.ok(
    clearAuthBody.includes(`uni.removeStorageSync(${key})`),
    `auth cleanup should remove ${key}`,
  )
}

const registerPage = read('pages/auth/register.uvue')
assert.ok(
  registerPage.includes("url: '/pagesSub/userExtra/onboarding/profile'"),
  'new registration should reach role selection before a role-specific profile',
)
assert.ok(
  !registerPage.includes("url: '/pages/user/edit?isNew=true'"),
  'new registration must not bypass parent role selection',
)

const profilePage = read('pages/profile/profile.uvue')
assert.ok(profilePage.includes('情感实验室'), 'normal profile should expose the emotion lab')
assert.ok(
  profilePage.includes("/pages/emotion-lab/emotion-lab"),
  'normal profile emotion-lab entry should use the registered route',
)

const parentPage = read('pages/parent/parent.uvue')
assert.ok(parentPage.includes('切换为普通身份'), 'parent profile should expose a clear standard-role switch')
assert.ok(
  parentPage.includes("uni.setStorageSync('xsa_onboarding_mode', 'self')"),
  'switching roles should persist standard mode',
)
assert.ok(
  parentPage.includes("uni.reLaunch({ url: '/pages/index/index' })"),
  'switching roles should replace the parent page stack',
)

for (const file of ['pages/parent/parent.uvue', 'pages/parent/user-detail.uvue']) {
  const source = read(file)
  assert.ok(source.includes('const ensureParentRole'), `${file} should guard direct parent-route entry`)
  assert.ok(source.includes('getParentAuthenticationGate'), `${file} should require an authenticated account`)
  assert.ok(source.includes("uni.getStorageSync('xsa_onboarding_mode')"), `${file} should re-read the stored role`)
  assert.ok(source.includes("String(storedMode) == 'parent'"), `${file} should require parent mode explicitly`)
  assert.ok(
    source.includes("uni.reLaunch({ url: '/pages/auth/login' })"),
    `${file} should fail closed to login when the account session is missing`,
  )
  assert.ok(
    source.includes("uni.reLaunch({ url: '/pages/index/index' })"),
    `${file} should fail closed to the standard home`,
  )
}

const apiIndex = read('api/index.uts')
for (const name of [
  'getParentContext',
  'getParentAuthenticationGate',
  'updateParentChildProfile',
  'getConversationPage',
  'getApplicationPage',
  'getChatPermission',
  'markAllMessagesRead',
  'getEmotionLabSummary',
  'startMbtiAssessment',
  'saveMbtiAnswer',
  'submitMbtiAssessment',
  'setMyMbtiType',
  'discardMbtiDraft',
]) {
  assert.ok(apiIndex.includes(name), `api/index.uts should export ${name}`)
}

for (const file of [
  'pages/parent/parent.uvue',
  'pages/parent/user-detail.uvue',
  'pages/emotion-lab/emotion-lab.uvue',
  'components/XsaMessageCenter.uvue',
  'pagesSub/chat/detail.uvue',
]) {
  const source = read(file)
  assert.ok(source.includes("from '@/api'"), `${file} should use the unified API entry`)
  assert.ok(!source.includes("from '@/api/"), `${file} should not bypass api/index.uts`)
  assert.ok(!source.includes("from '@/mock"), `${file} should never import mock data directly`)
}

console.log('角色路由与公共入口契约测试通过')

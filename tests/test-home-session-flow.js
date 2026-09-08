const assert = require('node:assert/strict')
const { readPage, evaluateBindings } = require('./vue-page-helper.cjs')

const page = readPage('pages/index/index.uvue')
const lifecycleNames = ['onLoad', 'onShow', 'onMounted']

function createHome({ token = '', skip = false, tab, parent = false, agreed = false } = {}) {
  const storage = new Map([
    ['xsa_new_app_launch', true], ['xsa_skip_welcome_once', skip],
    ['xsa_onboarding_mode', parent ? 'parent' : 'self'], ['xsa_welcome_agreed_v2', agreed]
  ])
  const hooks = Object.fromEntries(lifecycleNames.map(name => [name, []]))
  const routes = []
  const loads = []
  const options = tab === undefined ? {} : { tab }
  const session = { token }
  const state = evaluateBindings(page, [
    'welcomeVisible', 'welcomeAgreementVisible', 'WELCOME_AGREEMENT_KEY',
    'openWelcomeAgreement', 'closeWelcomeAgreement', 'acceptWelcomeAgreement',
    'routeParentMode', 'currentTab', 'navTabs'
  ], {
    ...Object.fromEntries(lifecycleNames.map(name => [name, callback => hooks[name].push(callback)])),
    getAccessToken: () => session.token,
    getCurrentPages: () => [{ options }],
    resetDailyIfNeeded: () => {},
    loadHomeDiscovery: () => loads.push('discovery'),
    loadMembershipPlans: () => loads.push('plans'),
    loadFeedDynamics: () => loads.push('feed'),
    uni: {
      getStorageSync: key => storage.get(key),
      setStorageSync: (key, value) => storage.set(key, value),
      removeStorageSync: key => storage.delete(key),
      navigateTo: value => routes.push(value.url), reLaunch: value => routes.push(value.url)
    }
  }, lifecycleNames)
  const run = name => hooks[name].forEach(callback => callback(options))
  const enter = () => { run('onLoad'); run('onShow'); run('onMounted') }
  return { ...state, enter, show: () => run('onShow'), storage, routes, loads, session }
}

// Run actual lifecycle callbacks in mini-program entry order; later hooks must not undo earlier decisions.
for (const skip of [false, true]) {
  const home = createHome({ token: 'fixture-session', skip })
  home.enter()
  assert.equal(home.welcomeVisible.value, false, 'an existing session must bypass welcome on cold entry')
  home.show()
  assert.equal(home.welcomeVisible.value, false, 'resuming home must retain the authenticated view')
  assert.equal(home.routes.length, 0, 'home must not restart login for an existing session')
}

const guest = createHome({ agreed: true })
guest.enter()
assert.equal(guest.welcomeVisible.value, true, 'past agreement is not an authenticated session')
guest.openWelcomeAgreement()
assert.equal(guest.welcomeAgreementVisible.value, true)
assert.equal(guest.routes.length, 0, 'opening the agreement must not silently consent or navigate')
guest.closeWelcomeAgreement()
assert.equal(guest.welcomeVisible.value, true, 'dismissing consent keeps the welcome screen')
guest.openWelcomeAgreement()
guest.acceptWelcomeAgreement()
assert.equal(guest.storage.get('xsa_login_agreed'), true)
assert.deepEqual(guest.routes, ['/pages/auth/login'])
assert.equal(guest.session.token, '', 'agreement consent must not grant authentication')

const bypass = createHome({ skip: true })
bypass.enter()
assert.equal(bypass.welcomeVisible.value, false, 'the one-time bypass must survive initial show and mount')
assert.equal(bypass.storage.has('xsa_skip_welcome_once'), false, 'consume a one-time bypass exactly once')
bypass.show()
assert.equal(bypass.welcomeVisible.value, false, 'a later show must not reopen a dismissed welcome')
const nextLaunch = createHome()
nextLaunch.enter()
assert.equal(nextLaunch.welcomeVisible.value, true, 'a one-time bypass must not become permanent guest authentication')

const loginReturn = createHome()
loginReturn.enter()
loginReturn.session.token = 'new-fixture-session'
loginReturn.show()
assert.equal(loginReturn.welcomeVisible.value, false, 'returning from login re-reads the current session')

for (const tab of ['0', '1', '2']) {
  const linked = createHome({ tab })
  linked.enter()
  assert.equal(linked.currentTab.value, Number(tab), 'retain explicit home-tab destinations')
  assert.equal(linked.welcomeVisible.value, false, 'initial show must not cover an explicit home-tab destination')
}

const parent = createHome({ token: 'parent-fixture-session', parent: true })
parent.enter()
assert.ok(parent.routes.includes('/pages/parent/parent'), 'stored parent mode must still enter the parent shell')
console.log('PASS home session entry, resume, consent, one-time bypass, explicit tabs and parent routing')

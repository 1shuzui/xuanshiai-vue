const assert = require('node:assert/strict')
const vm = require('node:vm')
const { ref } = require('vue')
const { readPage, evaluateBindings, templateElements } = require('./vue-page-helper.cjs')

const indexPage = readPage('pages/index/index.uvue')
const detailPage = readPage('pagesSub/userExtra/user/detail.uvue')
const vipPage = readPage('pagesSub/profileExtra/vip.uvue')

async function main() {
  const targets = [{ id: 701, isVip: true }, { id: 815, isVip: false }, { id: 932, is_vip: true }]
  const recommendUsers = ref(targets)
  const currentRecommendIndex = ref(0)
  const opened = []
  const discovery = evaluateBindings(indexPage,
    ['filteredRecommendUsers', 'currentRecommendUser', 'squareAt', 'vipSquareUsers', 'vipSquareAt', 'toVipCard', 'goUserDetail'],
    { recommendUsers, currentRecommendIndex, squareUsers: ref(targets), uni: { navigateTo: options => opened.push(options.url) } })
  assert.deepEqual(Array.from(discovery.filteredRecommendUsers.value, user => user.id), [701, 815, 932], 'server recommendations must retain both VIP and ordinary targets')
  for (let index = 0; index < targets.length; index++) {
    currentRecommendIndex.value = index
    assert.equal(discovery.currentRecommendUser.value.id, targets[index].id)
    discovery.goUserDetail(discovery.squareAt(index).id)
  }
  assert.deepEqual(opened, targets.map(target => '/pagesSub/userExtra/user/detail?userId=' + target.id))
  assert.deepEqual(Array.from(discovery.vipSquareUsers.value, user => user.id), [701, 932], 'both API VIP field spellings must render')
  assert.equal(discovery.toVipCard(discovery.vipSquareAt(1)).id, 932, 'VIP card conversion must retain the server ID')
  recommendUsers.value = []
  assert.equal(discovery.currentRecommendUser.value.id, 0, 'empty results must not reuse a previous target')

  const cards = templateElements(indexPage).filter(node => node.props.some(prop => prop.type === 6 && prop.name === 'class' &&
    ['square-user-card', 'sq-vip-mini', 'vip-card-content'].includes(prop.value?.content)))
  assert.ok(cards.length > 0, 'discovery card entry points must remain present')
  for (const card of cards) {
    const tap = card.props.find(prop => prop.type === 7 && prop.name === 'on' && prop.arg?.content === 'tap')
    assert.match(tap?.exp.content || '', /^goUserDetail\(.+\.id\)$/, 'every card must open its bound target, never a fixed demo ID')
    for (const prop of card.props.filter(prop => prop.type === 7 && ['if', 'show'].includes(prop.name))) {
      assert.doesNotMatch(prop.exp.content, /viewerIsVip/, 'external cards must not be hidden by viewer membership')
    }
  }
  for (const removed of ['sq-vip-blurred', 'sq-vip-lock-mask', 'vip-card-blurred', 'vip-card-lock-mask', 'isVipTargetLocked', 'isVipCardLocked', 'openVipUnlock']) {
    assert.ok(!indexPage.source.includes(removed), `external discovery cards must not restore ${removed}`)
  }
  assert.match(indexPage.template, /v-if="currentRecommendUser\.isVip === true" class="recommend-vip-badge"/)

  const user = ref({ id: 932, isVIP: true })
  const viewerIsVip = ref(false)
  const isPreview = ref(false)
  const isOwnProfile = ref(false)
  const isLockedView = ref(false)
  let membership = false
  let membershipReads = 0
  const detail = evaluateBindings(detailPage, ['refreshLockedView', 'loadViewerMembership', 'openVipUnlock'], {
    user, viewerIsVip, isPreview, isOwnProfile, isLockedView,
    getMembershipStatus: async () => { membershipReads++; return { success: true, data: { is_vip: membership } } },
    uni: { navigateTo: options => opened.push(options.url) }
  })
  for (const targetVip of [false, true]) for (const viewerVip of [false, true]) for (const preview of [false, true]) for (const own of [false, true]) {
    user.value.isVIP = targetVip; viewerIsVip.value = viewerVip; isPreview.value = preview; isOwnProfile.value = own
    detail.refreshLockedView()
    assert.equal(isLockedView.value, targetVip && !viewerVip && !preview && !own, 'detail membership, own-profile and preview rules must remain intact')
  }
  isOwnProfile.value = false; isPreview.value = false; viewerIsVip.value = false; user.value.isVIP = true
  membership = true
  await detail.loadViewerMembership()
  detail.refreshLockedView()
  assert.equal(isLockedView.value, false, 'returning after membership changes must use the API status')
  membership = false
  await detail.loadViewerMembership()
  detail.refreshLockedView()
  assert.equal(isLockedView.value, true, 'an expired membership must not retain an old local entitlement')
  assert.equal(membershipReads, 2)
  assert.match(detailPage.script, /onShow\(async \(\) => \{\s*await loadViewerMembership\(\)\s*refreshLockedView\(\)/)
  assert.doesNotMatch(detailPage.source, /options\.viewerVIP|filter:\s*blur/)
  detail.openVipUnlock()
  const route = new URL(opened.at(-1), 'https://fixture.invalid')
  assert.equal(route.pathname, '/pagesSub/profileExtra/vip')
  assert.equal(route.searchParams.get('redirect'), '/pagesSub/userExtra/user/detail?userId=932')
  for (const content of ['user.basicInfo', 'user.lifePhotos', 'user.expect', 'dynamics']) assert.ok(detailPage.template.includes(content), `profile still renders ${content}`)

  const actionBars = templateElements(detailPage).filter(node => node.props.some(prop => prop.type === 6 && prop.name === 'class' &&
    ['bottom-bar', 'bottom-bar bottom-bar-own'].includes(prop.value?.content)))
  assert.equal(actionBars.length, 2, 'retain own-profile editing and other-user action bars')
  for (const bar of actionBars) {
    const condition = bar.props.find(prop => prop.type === 7 && prop.name === 'if').exp.content
    for (const own of [false, true]) for (const locked of [false, true]) {
      const visible = vm.runInNewContext(condition, { isOwnProfile: own, isLockedView: locked, isPreview: true, detailLoading: false, detailError: '' })
      assert.equal(visible, false, 'preview must hide editing and interaction actions for both identities')
    }
  }

  // Test-mode payment responses exercise navigation and failure states without contacting a payment service.
  for (const outcome of ['order-failed', 'payment-failed', 'success']) {
    const actions = []
    let payCalls = 0
    const paymentLoading = ref(false)
    const isVip = ref(false)
    const payment = evaluateBindings(vipPage, ['confirmPayment', 'returnAfterPayment'], {
      paymentSelected: ref(true), selectedPlanData: ref({ code: 'monthly' }), paymentLoading,
      paymentVisible: ref(true), isVip, redirectUrl: ref('/pagesSub/userExtra/user/detail?userId=932'),
      createMembershipOrder: async () => outcome === 'order-failed' ? { success: false } : { success: true, data: { order_no: 'fixture-order' } },
      testPayOrder: async order => { payCalls++; assert.equal(order, 'fixture-order'); return { success: outcome === 'success' } },
      getCurrentPages: () => [{}, {}], setTimeout: fn => fn(),
      uni: { showToast: options => actions.push(options.title), navigateBack: () => actions.push('back') }
    })
    await payment.confirmPayment()
    assert.equal(payCalls, outcome === 'order-failed' ? 0 : 1)
    assert.equal(actions.includes('back'), outcome === 'success', 'only acknowledged test payment success may navigate back')
    assert.equal(actions.includes('开通成功'), outcome === 'success', 'failed payment must not claim success')
    assert.equal(isVip.value, outcome === 'success', 'a failed response must not grant a local entitlement')
    assert.equal(paymentLoading.value, false, 'every settled outcome must release the loading state')
  }
  let destination
  const direct = evaluateBindings(vipPage, ['returnAfterPayment'], {
    getCurrentPages: () => [{}], redirectUrl: ref('/pagesSub/userExtra/user/detail?userId=932'),
    uni: { reLaunch: options => { destination = options.url } }
  })
  direct.returnAfterPayment()
  assert.equal(destination, '/pagesSub/userExtra/user/detail?userId=932')
  const redirectUrl = ref('/pages/index/index')
  evaluateBindings(vipPage, [], {
    redirectUrl, loadMembership: () => {}, onMounted: callback => callback(),
    getCurrentPages: () => [{ options: { redirect: encodeURIComponent('/pagesSub/userExtra/user/detail?userId=932') } }]
  }, ['onMounted'])
  assert.equal(redirectUrl.value, '/pagesSub/userExtra/user/detail?userId=932', 'the actual entry hook must recover the encoded source route')
  assert.doesNotMatch(vipPage.script, /clearAuthTokens|removeStorageSync|\/pages\/auth\/login/, 'membership navigation must preserve the authenticated session')
  console.log('PASS VIP discovery IDs, membership states, route recovery and acknowledged test-payment outcomes')
}

main().catch(error => { console.error(error); process.exitCode = 1 })

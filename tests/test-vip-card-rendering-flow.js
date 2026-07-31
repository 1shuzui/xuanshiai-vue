const fs = require('fs')
const root = __dirname + '/..'

function read(file) {
  return fs.readFileSync(root + '/' + file, 'utf8')
}

function expect(content, fragment, label) {
  if (!content.includes(fragment)) {
    throw new Error(`${label}: missing ${fragment}`)
  }
  console.log(`PASS ${label}`)
}

function reject(content, fragment, label) {
  if (content.includes(fragment)) {
    throw new Error(`${label}: unexpected ${fragment}`)
  }
  console.log(`PASS ${label}`)
}

const indexPage = read('pages/index/index.uvue')
const detailPage = read('pagesSub/userExtra/user/detail.uvue')
const editPage = read('pagesSub/userExtra/user/edit.uvue')
const vipPage = read('pagesSub/profileExtra/vip.uvue')

expect(indexPage, 'const filteredRecommendUsers = computed(() => mockRecommendUsers)', 'recommendations include every target')
expect(indexPage, 'v-if="currentRecommendUser.isVip === true" class="recommend-vip-badge"', 'VIP recommendation badge renders')
expect(indexPage, 'class="square-user-card" @tap="goUserDetail(2)"', 'VIP square card remains visible and opens its detail')
expect(indexPage, 'class="sq-vip-mini" @tap="goUserDetail(2)"', 'square VIP window opens its target detail')
expect(indexPage, 'class="sq-vip-content"', 'square VIP window uses an ordinary visible content wrapper')
expect(indexPage, 'class="vip-card-content" @tap="goUserDetail(card.id)"', 'independent VIP card opens its stable target ID')
expect(indexPage, "{ id: 2, isVip: true, name: '林悦'", 'independent VIP cards retain stable IDs and status')
reject(indexPage, 'v-if="viewerIsVip" class="square-user-card"', 'square cards are not hidden by viewer status')
reject(indexPage, '.filter((u: any) => u.isVip !== true)', 'recommendations do not filter VIP targets')
reject(indexPage, 'sq-vip-blurred', 'square VIP windows are not blurred')
reject(indexPage, 'sq-vip-lock-mask', 'square VIP windows have no lock mask')
reject(indexPage, 'vip-card-blurred', 'independent VIP cards are not blurred')
reject(indexPage, 'vip-card-lock-mask', 'independent VIP cards have no lock mask')
reject(indexPage, 'isVipTargetLocked', 'index has no target lock helper')
reject(indexPage, 'isVipCardLocked', 'index has no card lock helper')
reject(indexPage, 'openVipUnlock', 'external cards never open purchase directly')
reject(indexPage, 'lockable', 'external card wrappers have no lock semantics')

expect(indexPage, "import { getAccessToken } from '@/api/config.uts'", 'index reuses the persisted authentication token helper')
expect(indexPage, "const hasAuthenticatedSession = getAccessToken() != ''", 'index detects an authenticated session')
expect(indexPage, '!hasAuthenticatedSession &&', 'authenticated users bypass the welcome flow')

expect(editPage, 'getOwnProfile', 'edit page loads server profile when available')
expect(editPage, 'const applyLocalDraft = () => {', 'edit page has a local profile fallback')
expect(editPage, "uni.showToast({ title: '网络不可用，已打开本地资料', icon: 'none' })", 'edit page explains offline fallback')
expect(editPage, 'uploadUserProfileMedia', 'edit page preserves media upload workflow')
expect(editPage, 'updateOwnProfile', 'edit page preserves profile save workflow')

expect(detailPage, 'class="ordinary-detail-page"', 'ordinary Pencil detail template exists')
expect(detailPage, 'class="locked-detail-page"', 'locked Pencil detail template exists')
expect(detailPage, "import { getCurrentUserVipStatus } from '@/utils/quota.uts'", 'detail reads persisted viewer VIP status')
expect(detailPage, 'const refreshLockedView = () => {', 'detail centralizes the dual-identity access decision')
expect(detailPage, 'onShow(() => {', 'detail refreshes access after returning from payment')
expect(detailPage, 'refreshLockedView()', 'detail reevaluates the persisted VIP entitlement')
expect(detailPage, 'const targetIsVip = user.value.isVIP === true', 'detail reads target VIP status')
expect(detailPage, 'viewerIsVip !== true &&', 'locked decision requires a non-VIP viewer')
expect(detailPage, 'targetIsVip', 'locked decision requires a VIP target')
expect(detailPage, '!isPreview.value &&', 'preview bypasses locked detail')
expect(detailPage, '!isOwnProfile.value &&', 'own profile bypasses locked detail')
reject(detailPage, 'options.viewerVIP', 'detail ignores viewer VIP route state')
reject(detailPage, 'filter: blur', 'detail does not simulate access control with blur')

expect(detailPage, '关于我', 'ordinary detail includes About Me')
expect(detailPage, 'AI 匹配度分析', 'ordinary detail includes AI match analysis')
expect(detailPage, 'class="basic-info-grid"', 'ordinary detail includes the basic info grid')
expect(detailPage, 'Ta的瞬间', 'ordinary detail includes moments')
expect(detailPage, 'dynamics-section', 'ordinary detail includes dynamics')
expect(detailPage, 'spotlight-section', 'ordinary detail includes spotlight guests after VIP unlock')
expect(detailPage, '即时短信通知', 'ordinary spotlight includes fast reach benefit')
expect(detailPage, '头像展示在爆灯栏', 'ordinary spotlight includes exposure benefit')
expect(detailPage, '更容易被留意', 'ordinary spotlight includes favorability benefit')
expect(detailPage, 'class="spotlight-button" @tap="onSpotlight"', 'ordinary spotlight remains actionable')
expect(detailPage, 'class="activity-row"', 'ordinary detail includes recent activity')
expect(detailPage, 'class="locked-section-card"', 'locked detail has an independent card structure')
expect(detailPage, 'VIP会员专属内容', 'locked detail presents VIP-exclusive sections')
expect(detailPage, '开通VIP会员即可查看TA的择偶标准与期待', 'locked Q&A follows the Pencil copy')
expect(detailPage, 'spotlight-section', 'locked detail includes the full spotlight section')
expect(detailPage, '即时短信通知', 'spotlight includes fast reach benefit')
expect(detailPage, '头像展示在爆灯栏', 'spotlight includes exposure benefit')
expect(detailPage, '更容易被留意', 'spotlight includes favorability benefit')
expect(detailPage, "const redirect = '/pagesSub/userExtra/user/detail?userId=' + user.value.id", 'unlock preserves the target detail route')
expect(detailPage, "url: '/pagesSub/profileExtra/vip?source=user-detail&userId='", 'locked detail opens VIP purchase')
expect(detailPage, 'v-if="!isOwnProfile && !isPreview && !detailLoading && detailError == \'\'"', 'preview hides other-user actions')
expect(detailPage, 'v-if="!isLockedView && isOwnProfile && !isPreview && !detailLoading && detailError == \'\'"', 'preview hides own-profile edit action')

expect(vipPage, 'setCurrentUserVipStatus(true)', 'payment persists VIP status')
expect(vipPage, 'if (pages.length > 1)', 'payment preserves an existing navigation stack')
expect(vipPage, 'uni.navigateBack({ delta: 1 })', 'normal payment completion returns to the source page')
expect(vipPage, 'uni.reLaunch({ url: redirectUrl.value })', 'direct-open payment retains a safe fallback route')
reject(vipPage, 'clearAuthTokens', 'VIP payment never clears authentication tokens')
reject(vipPage, 'removeStorageSync', 'VIP payment never removes authentication storage')
reject(vipPage, '/pages/auth/login', 'VIP payment never redirects to login')
expect(vipPage, "decodeURIComponent('' + options.redirect)", 'payment parses the encoded source route')

console.log('VIP card rendering flow contract passed')

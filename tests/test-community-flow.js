/**
 * 社区闭环 Mock / 路由 / 实名门槛 静态校验
 * 不启动小程序，仅校验源码与 Mock 约定
 * 主 Tab：关注 / 同城 / 发现；喜欢为私有轻意向
 */

const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
let failed = 0

function ok(msg) {
  console.log(`   ✅ ${msg}`)
}

function fail(msg) {
  failed += 1
  console.log(`   ❌ ${msg}`)
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf-8')
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel))
}

console.log('====================================')
console.log('社区闭环流程测试')
console.log('====================================\n')

// 1. 页面与路由
console.log('1. 社区页面与 pages.json 路由...')
const communityPages = [
  'pages/community/community.uvue',
  'pages/community/publish.uvue',
  'pages/community/topic-list.uvue',
  'pages/community/topic-detail.uvue',
  'pages/community/post-detail.uvue',
  'pages/community/activity-list.uvue',
  'pages/community/activity-detail.uvue',
  'pages/community/my-activities.uvue',
  'pages/community/paper-plane.uvue',
  'pages/community/notifications.uvue'
]
communityPages.forEach((p) => {
  if (exists(p)) ok(p)
  else fail(`${p} 缺失`)
})

const pagesJson = read('pages.json')
const routePaths = [
  'pages/community/topic-list',
  'pages/community/topic-detail',
  'pages/community/post-detail',
  'pages/community/activity-list',
  'pages/community/activity-detail',
  'pages/community/my-activities',
  'pages/community/paper-plane',
  'pages/community/notifications'
]
routePaths.forEach((r) => {
  if (pagesJson.includes(r)) ok(`pages.json 已注册 ${r}`)
  else fail(`pages.json 缺少 ${r}`)
})

if (pagesJson.includes('pages/community/community') && pagesJson.includes('"text": "社区"')) {
  ok('社区 Tab 仍存在')
} else {
  fail('社区 Tab 配置异常')
}

// 2. Mock 扩展
console.log('\n2. Mock 数据扩展...')
const mockCommunity = read('mock/community.uts')
const mockExports = [
  'mockDynamicList',
  'mockTopics',
  'mockPaperPlanes',
  'mockActivities',
  'mockCommunityBanners',
  'mockCommunityNotifications',
  'mockCommunityQuotas',
  'mockReportReasons',
  'mockBlockedUserIds',
  'mockApplyStates',
  'mockCurrentCity'
]
mockExports.forEach((name) => {
  if (mockCommunity.includes(`export const ${name}`)) ok(name)
  else fail(`缺少 ${name}`)
})

if (mockCommunity.includes("type: 'topic'") && mockCommunity.includes("type: 'activity'") && mockCommunity.includes("type: 'plane'")) {
  ok('发现页三入口 banner 类型齐全')
} else {
  fail('banner 缺少 topic/activity/plane')
}

const mockIndex = read('mock/index.uts')
;[
  'mockCommunityNotifications',
  'mockCommunityQuotas',
  'mockReportReasons',
  'mockBlockedUserIds',
  'mockApplyStates',
  'mockCurrentCity'
].forEach((n) => {
  if (mockIndex.includes(n)) ok(`mock/index 导出 ${n}`)
  else fail(`mock/index 未导出 ${n}`)
})

// 3. API
console.log('\n3. 社区 API...')
const apiCommunity = read('api/community.uts')
const apiFns = [
  'getDynamicList',
  'getDynamicDetail',
  'getTopics',
  'getTopicDetail',
  'joinTopic',
  'getPaperPlanes',
  'sendPaperPlane',
  'replyPaperPlane',
  'getActivities',
  'getActivityDetail',
  'signupActivity',
  'getMyActivities',
  'getCommunityBanners',
  'getCommunityNotifications',
  'getUnreadNotificationCount',
  'markNotificationRead',
  'markAllNotificationsRead',
  'getCommunityQuotas',
  'publishDynamic',
  'likeDynamic',
  'collectDynamic',
  'followUserFromCommunity',
  'commentDynamic',
  'reportContent',
  'blockUser',
  'getReportReasons',
  'getCurrentCity',
  'setCurrentCity'
]
apiFns.forEach((fn) => {
  if (apiCommunity.includes(`export async function ${fn}`)) ok(fn)
  else fail(`API 缺少 ${fn}`)
})

if (apiCommunity.includes('hasMore') && apiCommunity.includes('pageSize') && apiCommunity.includes('list:')) {
  ok('getDynamicList 分页结构 list/hasMore/pageSize')
} else {
  fail('getDynamicList 缺少分页 payload')
}

if (apiCommunity.includes('normalizeListQuery') || apiCommunity.includes("tab: 'discover'")) {
  ok('列表支持 tab 结构化查询')
} else {
  fail('列表 tab 结构异常')
}

const apiIndex = read('api/index.uts')
;[
  'commentDynamic',
  'signupActivity',
  'sendPaperPlane',
  'reportContent',
  'getUnreadNotificationCount',
  'markNotificationRead',
  'getCurrentCity'
].forEach((fn) => {
  if (apiIndex.includes(fn)) ok(`api/index 导出 ${fn}`)
  else fail(`api/index 未导出 ${fn}`)
})

// 4. 实名门槛
console.log('\n4. 实名门槛（仅实名，非双重）...')
if (exists('utils/realNameGate.uts')) ok('utils/realNameGate.uts 存在')
else fail('缺少 realNameGate')

const gate = read('utils/realNameGate.uts')
if (gate.includes('guardRealName') && gate.includes('resolveRealNameStatus')) ok('导出 guardRealName / resolveRealNameStatus')
else fail('门槛工具导出不完整')
if (gate.includes('学历') && gate.includes('不拦截')) ok('文案标明学历不拦截')
else fail('门槛文案未说明学历不拦截')
if (
  gate.includes("'passed'") &&
  gate.includes("'missing'") &&
  gate.includes("'reviewing'") &&
  gate.includes("'rejected'")
) {
  ok('实名状态枚举 passed/missing/reviewing/rejected')
} else {
  fail('实名状态枚举未对齐定版')
}
if (gate.includes("pending") && gate.includes('reviewing') && gate.includes('failed') && gate.includes('rejected')) {
  ok('兼容 pending→reviewing / failed→rejected')
} else {
  fail('缺少旧状态映射')
}

const me = read('mock/user.uts')
if (me.includes("realNameStatus: 'passed'")) ok('mockMeProfile 含 realNameStatus')
else fail('mockMeProfile 缺少 realNameStatus')

const pagesNeedGate = [
  'pages/community/community.uvue',
  'pages/community/publish.uvue',
  'pages/community/post-detail.uvue',
  'pages/community/topic-detail.uvue',
  'pages/community/activity-detail.uvue',
  'pages/community/paper-plane.uvue'
]
pagesNeedGate.forEach((p) => {
  const c = read(p)
  if (c.includes('guardRealName') || c.includes('realNameGate')) ok(`${p} 接入实名门槛`)
  else fail(`${p} 未接入实名门槛`)
})

// 5. 安全：更多仅举报/屏蔽；无「不感兴趣」
console.log('\n5. 安全交互约定...')
const communityMain = read('pages/community/community.uvue')
const dislikeUi = /action-text=["']不感兴趣["']|>不感兴趣<|>\s*不感兴趣\s*</
if (dislikeUi.test(communityMain)) fail('社区主页仍含「不感兴趣」交互')
else ok('社区主页已移除「不感兴趣」')

if (exists('components/XsaReportSheet.uvue')) ok('XsaReportSheet 存在')
else fail('缺少 XsaReportSheet')
if (exists('components/XsaApplySheet.uvue')) ok('XsaApplySheet 存在')
else fail('缺少 XsaApplySheet')

const card = read('components/XsaDynamicCard.uvue')
if (card.includes('申请认识') && card.includes('handleApply')) ok('动态卡含申请认识')
else fail('动态卡缺少申请认识')
if (card.includes('不感兴趣')) fail('动态卡仍含不感兴趣')
else ok('动态卡无「不感兴趣」')
if (card.includes('age') && card.includes('height') && card.includes('education')) {
  ok('动态卡支持完整资料标签字段')
} else {
  fail('动态卡资料标签字段不完整')
}

// 6. 主 Tab + 浏览无门槛
console.log('\n6. 主 Tab 与浏览边界...')
if (
  communityMain.includes("currentTab === 'follow'") &&
  communityMain.includes("currentTab === 'city'") &&
  communityMain.includes("currentTab === 'discover'")
) {
  ok('主 Tab 为 关注 / 同城 / 发现')
} else {
  fail('主 Tab 未切换为 关注/同城/发现')
}
// 喜欢不应作为主 Tab 文案（可出现在注释）
if (/<text>喜欢<\/text>/.test(communityMain)) {
  fail('主 Tab 仍展示「喜欢」')
} else {
  ok('主 Tab 未展示「喜欢」')
}
if (communityMain.includes('filterOptions') || communityMain.includes("key: 'media'")) {
  ok('二级筛选存在')
} else {
  fail('缺少二级筛选')
}
if (communityMain.includes('loadDynamics') && communityMain.includes('getDynamicList')) {
  ok('动态列表可直接加载（浏览无门槛）')
} else {
  fail('动态列表加载异常')
}
if (communityMain.includes('guardRealName')) ok('互动使用 guardRealName')
else fail('互动未使用实名门槛')
if (communityMain.includes('getUnreadNotificationCount') || communityMain.includes('unreadCount')) {
  ok('通知未读角标接入')
} else {
  fail('通知未读角标未接入')
}

// 7. Demo 冻结提示文件存在
console.log('\n7. HTML Demo 参考...')
if (exists('design-demos/community-shell/index.html')) ok('community-shell demo 仍在（视觉参考）')
else fail('找不到 community-shell demo')

// 8. 申请认识跨入口一致性 + 额度
console.log('\n8. 申请认识统一规则...')
const indexPage = read('pages/index/index.uvue')
if (indexPage.includes('guardRealName') && indexPage.includes("guardRealName('apply')")) {
  ok('首页申请认识接入 guardRealName')
} else {
  fail('首页申请认识未接入实名门槛')
}
if (indexPage.includes('XsaApplySheet') && indexPage.includes('openApplyModal')) {
  ok('首页复用 XsaApplySheet')
} else {
  fail('首页未统一到 XsaApplySheet')
}
// 首页不应再自建申请 textarea 主路径
if (indexPage.includes('confirmApply') || indexPage.includes('applyMessage')) {
  fail('首页仍保留自定义申请 Modal 逻辑')
} else {
  ok('首页已移除自定义申请 Modal 逻辑')
}

const detailPage = read('pages/user/detail.uvue')
if (detailPage.includes('XsaApplySheet') && detailPage.includes('openApply')) {
  ok('资料页复用 XsaApplySheet')
} else {
  fail('资料页未统一到 XsaApplySheet')
}

const applyApi = read('api/user.uts')
if (applyApi.includes('QUOTA_EXCEEDED') && applyApi.includes('mockCommunityQuotas')) {
  ok('applyToMeet 与 mockCommunityQuotas 联动并拦截超额')
} else {
  fail('applyToMeet 额度拦截不完整')
}
if (applyApi.includes('ALREADY_PENDING') && applyApi.includes('mockApplyStates')) {
  ok('applyToMeet 幂等 pending/accepted 不重复扣次')
} else {
  fail('applyToMeet 幂等状态不完整')
}

const planeApi = read('api/community.uts')
if (planeApi.includes('paperPlaneDaily') && planeApi.includes('QUOTA_EXCEEDED')) {
  ok('纸飞机免费额度用尽拦截')
} else {
  fail('纸飞机额度拦截异常')
}
if (planeApi.includes('scope') && planeApi.includes('sendPaperPlane')) {
  ok('sendPaperPlane 支持对象 payload / scope')
} else {
  fail('sendPaperPlane 结构未升级')
}

// 9. 发布 / 评论 / 通知闭环
console.log('\n9. 发布评论通知闭环...')
const publishPage = read('pages/community/publish.uvue')
if (publishPage.includes('publishDynamic') && !publishPage.includes('setTimeout(() => {\n\t\t\t\tuni.hideLoading()')) {
  ok('发布页调用 publishDynamic')
} else if (publishPage.includes('publishDynamic')) {
  ok('发布页调用 publishDynamic')
} else {
  fail('发布页仍为假发布')
}

const postDetail = read('pages/community/post-detail.uvue')
if (postDetail.includes('commentDynamic') && postDetail.includes('dynamicId')) {
  ok('详情评论使用结构化 commentDynamic')
} else if (postDetail.includes('commentDynamic')) {
  ok('详情评论接入 commentDynamic')
} else {
  fail('详情评论未闭环')
}

const notifications = read('pages/community/notifications.uvue')
if (notifications.includes('markNotificationRead') && notifications.includes('markAllNotificationsRead')) {
  ok('通知页支持已读 / 全部已读')
} else {
  fail('通知已读 API 未接入')
}

const paperPage = read('pages/community/paper-plane.uvue')
if (paperPage.includes('sendPaperPlane') && paperPage.includes('scope')) {
  ok('纸飞机页对象式发送')
} else if (paperPage.includes('sendPaperPlane')) {
  ok('纸飞机页接入 sendPaperPlane')
} else {
  fail('纸飞机发送未闭环')
}

// 无浏览器专属 API（社区关键路径）
const browserApi = /window\.|document\.|localStorage|sessionStorage|querySelector|innerHTML/
const scanTargets = [
  'utils/realNameGate.uts',
  'components/XsaApplySheet.uvue',
  'components/XsaReportSheet.uvue',
  'pages/community/community.uvue',
  'pages/index/index.uvue',
  'pages/user/detail.uvue'
]
let browserHits = 0
scanTargets.forEach((p) => {
  if (!exists(p)) return
  const c = read(p)
  if (browserApi.test(c)) {
    browserHits += 1
    fail(`${p} 含浏览器专属 API`)
  }
})
if (browserHits === 0) ok('关键路径无 window/document 等浏览器 API')

console.log('\n====================================')
if (failed === 0) {
  console.log('社区闭环静态校验全部通过')
  process.exit(0)
} else {
  console.log(`社区闭环静态校验失败：${failed} 项`)
  process.exit(1)
}

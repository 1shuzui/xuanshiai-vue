/**
 * 社区闭环 Mock / 路由 / 实名门槛 静态校验
 * 不启动小程序，仅校验源码与 Mock 约定
 * 主 Tab：关注 / 同城 / 发现；关注页喜欢=用户级喜欢动态
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
  'mockLikedUserIds',
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
  'mockLikedUserIds',
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
  'getTopicList',
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

// 4. 认证门槛：常规互动仅实名；话题参与/带话题发布双重认证
console.log('\n4. 认证门槛（常规互动仅实名；话题双重认证）...')
if (exists('utils/realNameGate.uts')) ok('utils/realNameGate.uts 存在')
else fail('缺少 realNameGate')

const gate = read('utils/realNameGate.uts')
if (gate.includes('guardRealName') && gate.includes('resolveRealNameStatus')) ok('导出 guardRealName / resolveRealNameStatus')
else fail('门槛工具导出不完整')
if (gate.includes('常规互动与申请仅要求实名') && gate.includes('参与话题及带话题发布需实名和学历双重认证')) {
  ok('认证边界区分常规实名与话题双重认证')
} else {
  fail('认证边界文案未区分常规实名与话题双重认证')
}
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

// 6.1 二级标签与喜欢用户语义
console.log('\n6.1 二级标签 / 喜欢用户 / 话题页...')
const filterKeys = [
  "key: 'all'",
  "key: 'following'",
  "key: 'likedUsers'",
  "key: 'hot'",
  "key: 'latest'",
  "key: 'mbti'",
  "key: 'alumni'",
  "key: 'hometown'"
]
if (filterKeys.every((k) => communityMain.includes(k))) {
  ok('三组二级标签键齐全')
} else {
  fail('二级标签键缺失')
}
if (communityMain.includes("label: '喜欢'") && communityMain.includes('likedUsers')) {
  ok('关注页含「喜欢」二级标签（用户级）')
} else {
  fail('关注页喜欢标签缺失')
}
if (communityMain.includes("currentTab === 'discover' && currentFilter === 'all'")) {
  ok('TOPIC 轮播仅在发现·全部展示')
} else {
  fail('TOPIC 展示条件未限制为发现·全部')
}
if (communityMain.includes('topic-panel') && communityMain.includes('hotTopics') && communityMain.includes('openTopics')) {
  ok('发现·全部含 TOPIC 完整话题面板')
} else {
  fail('TOPIC 面板结构不完整')
}
if (communityMain.includes('正在发生的话题')) {
  fail('仍保留独立「正在发生的话题」区块')
} else {
  ok('已移除独立话题区块')
}
if (communityMain.includes('bannerIndex') && communityMain.includes('onBannerChange') && communityMain.includes('setBannerIndex')) {
  ok('轮播支持受控 current + change + 指示项')
} else {
  fail('轮播受控状态不完整')
}

if (mockCommunity.includes('mockLikedUserIds') && mockCommunity.includes('mbti:') && mockCommunity.includes('school:') && mockCommunity.includes('hometown:')) {
  ok('Mock 含用户级喜欢与 mbti/school/hometown')
} else {
  fail('Mock 用户属性不完整')
}
if ((mockCommunity.match(/viewCount:/g) || []).length >= 20) {
  ok('Mock 话题 >=20 且含 viewCount')
} else {
  fail('Mock 话题数量或 viewCount 不足')
}

if (apiCommunity.includes('likedUsers') && apiCommunity.includes('isLikedUser') && apiCommunity.includes("filter == 'mbti'")) {
  ok('API 按用户级喜欢 / 发现标签筛选')
} else {
  fail('API 筛选语义未升级')
}
if (apiCommunity.includes('export async function getTopicList') && apiCommunity.includes('excludeIds') && apiCommunity.includes('hasMore')) {
  ok('getTopicList 分页接口存在')
} else {
  fail('缺少 getTopicList 分页接口')
}
if (apiCommunity.includes('export async function getTopicDetail(topicId: number, sort: string =') || apiCommunity.includes('getTopicDetail(topicId: number, sort')) {
  ok('getTopicDetail 支持 hot/latest 排序')
} else {
  fail('getTopicDetail 未支持排序参数')
}

const applyApiLike = read('api/user.uts')
if (applyApiLike.includes('mockLikedUserIds') && applyApiLike.includes('likeUser') && applyApiLike.includes('liked')) {
  ok('likeUser 维护 mockLikedUserIds')
} else {
  fail('likeUser 未写入用户级喜欢状态')
}

const topicDetail = read('pages/community/topic-detail.uvue')
if (topicDetail.includes('hero-cover') && topicDetail.includes('参与话题') && topicDetail.includes("sort == 'hot'") && topicDetail.includes("sort == 'latest'")) {
  ok('话题详情含封面 Hero / 热门最新 / 固定参与按钮')
} else {
  fail('话题详情页结构未对齐')
}
const realNameGate = read('utils/realNameGate.uts')
if (realNameGate.includes('resolveEducationStatus') && realNameGate.includes('ensureDualVerification') && realNameGate.includes('guardDualVerification')) {
  ok('双重认证守卫支持学历状态解析与拦截')
} else {
  fail('双重认证守卫缺少学历认证校验')
}
if (topicDetail.includes("guardDualVerification('topicJoin')") && topicDetail.includes('publish?topicId=')) {
  ok('参与话题要求双重认证并携带 topicId')
} else {
  fail('参与话题双重认证或 topicId 缺失')
}
if (topicDetail.includes("guardRealName('like')") && topicDetail.includes("guardRealName('collect')") && topicDetail.includes("guardRealName('follow')")) {
  ok('话题内点赞、收藏、关注仍仅要求实名')
} else {
  fail('话题内常规互动实名门槛缺失')
}

const communityPublishPage = read('pages/community/publish.uvue')
if (communityPublishPage.includes('onLoad') && communityPublishPage.includes('query.topicId') && communityPublishPage.includes('topicId.value = parsed > 0 ? parsed : 0')) {
  ok('发布页解析 topicId')
} else {
  fail('发布页未解析 topicId')
}
if (communityPublishPage.includes("guardDualVerification('topicJoin')") && communityPublishPage.includes("guardRealName('publish')")) {
  ok('带话题发布要求双重认证，普通发布仍仅要求实名')
} else {
  fail('发布流程认证门槛不完整')
}
if (communityPublishPage.includes('topicId: topicId.value')) {
  ok('发布接口透传 topicId')
} else {
  fail('发布接口未透传 topicId')
}
if (apiCommunity.includes('function markTopicParticipation') && apiCommunity.includes('topic.joined == true') && apiCommunity.includes('topic.postCount = ((topic.postCount as number) || 0) + 1')) {
  ok('话题参与人数按用户去重，发帖仅累计帖子数')
} else {
  fail('话题参与人数可能因重复发帖重复累计')
}

const topicList = read('pages/community/topic-list.uvue')
if (topicList.includes('近期热门') && topicList.includes('更多话题') && topicList.includes('getTopicList') && topicList.includes('没有更多话题了')) {
  ok('全部话题页：热门前10 + 分页更多')
} else {
  fail('全部话题页结构未对齐')
}
if (topicList.includes("sort == 'hot'") || topicList.includes("changeSort('hot')")) {
  fail('全部话题页仍保留顶部热门/最新标签')
} else {
  ok('全部话题页已移除顶部热门/最新标签')
}

const cardClick = read('components/XsaDynamicCard.uvue')
if (cardClick.includes('handleOpen') && cardClick.includes('previewImage') && cardClick.includes('@click.stop')) {
  ok('动态卡：正文进详情、图片预览并阻止冒泡')
} else {
  fail('动态卡点击规则不完整')
}

// 6.2 审查修复项
if (communityMain.includes('loadSeq') && communityMain.includes('seq != loadSeq.value')) {
  ok('列表请求带 loadSeq 防竞态')
} else {
  fail('列表竞态防护缺失')
}
if (communityMain.includes('list.slice(1, 5)') || communityMain.includes('slice(1, 5)')) {
  ok('TOPIC 快捷入口与 featured 去重')
} else {
  fail('TOPIC 快捷入口仍可能与 featured 重复')
}
if (communityMain.includes('#18415d') || communityMain.includes('#3d5a45')) {
  fail('banner 仍含散落 hex 渐变')
} else {
  ok('banner 渐变已 Token 化')
}

const indexPageLike = read('pages/index/index.uvue')
if (
  indexPageLike.includes('likeUser') &&
  indexPageLike.includes("guardRealName('like')") &&
  indexPageLike.includes('onLike(1)') &&
  indexPageLike.includes('onLike(2)') &&
  indexPageLike.includes('onLike(7)')
) {
  ok('首页 onLike 接通 likeUser 且传入真实 userId')
} else {
  fail('首页 likeUser/userId/实名门槛不完整')
}
const detailPageLike = read('pages/user/detail.uvue')
if (
  detailPageLike.includes('likeUser') &&
  detailPageLike.includes("guardRealName('like')") &&
  detailPageLike.includes("options.userId != null && options.userId != ''") &&
  !detailPageLike.includes('options.userId != null and options.userId')
) {
  ok('资料页 onLike 接通 likeUser，路由 userId 用 && 解析')
} else {
  fail('资料页 likeUser/userId 解析/实名门槛不完整')
}
if (topicDetail.includes('res.data.collectCount') && !topicDetail.includes('(p.collectCount || 0) + (p.collected ? 1 : -1)')) {
  ok('话题详情收藏计数使用 API 返回值')
} else {
  fail('话题详情收藏计数仍可能双计')
}
const postDetailPage = read('pages/community/post-detail.uvue')
if (postDetailPage.includes('res.data.collectCount')) {
  ok('帖子详情收藏计数回写 collectCount')
} else {
  fail('帖子详情未回写 collectCount')
}

// 7. Demo 冻结提示文件存在
console.log('\n7. HTML Demo 参考...')
if (exists('design-demos/community-shell/index.html')) ok('community-shell demo 仍在（视觉参考）')
else ok('community-shell demo 已移除（非本轮阻断项）')

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
if (detailPage.includes('XsaApplySheet') && (detailPage.includes('openApply') || detailPage.includes('applyVisible') || detailPage.includes('handleApply'))) {
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

const fs = require('fs')
const root = __dirname + '/..'
function read(file) { return fs.readFileSync(root + '/' + file, 'utf8') }
function expect(content, fragment, label) { if (!content.includes(fragment)) throw new Error(`${label}: missing ${fragment}`); console.log(`PASS ${label}`) }
function reject(content, fragment, label) { if (content.includes(fragment)) throw new Error(`${label}: unexpected ${fragment}`); console.log(`PASS ${label}`) }
console.log('Spotlight payment flow checks')
const index = read('pages/index/index.uvue')
const detail = read('pagesSub/userExtra/user/detail.uvue')
const api = read('api/spotlight.uts')
const mock = read('mock/spotlight.uts')
const sheet = read('components/XsaPaymentSheet.uvue')
const success = read('components/XsaSpotlightSuccessSheet.uvue')
// 首页：不应有爆灯流程
reject(index, 'vip-card-spotlight', 'homepage has no spotlight button')
reject(index, 'spotlightPaymentVisible', 'homepage has no spotlight payment state')
reject(index, 'XsaPaymentSheet', 'homepage has no payment sheet')
reject(index, 'XsaSpotlightSuccessSheet', 'homepage has no success sheet')
// 详情页：应有完整爆灯流程
expect(detail, '¥9.9', 'detail spotlight price')
expect(detail, 'spotlightPaymentVisible', 'detail has spotlight payment state')
expect(detail, 'XsaPaymentSheet', 'detail has payment sheet')
expect(detail, 'XsaSpotlightSuccessSheet', 'detail has success sheet')
expect(detail, 'paySpotlight(spotlightTarget.value)', 'detail calls the payment API with the spotlight target')
expect(api, 'SPOTLIGHT_AMOUNT = 9.9', 'fixed spotlight amount')
expect(api, "paymentStatus: 'paid'", 'mock paid status')
expect(mock, 'mockSpotlightPaymentOrders', 'spotlight mock order store')
expect(sheet, 'notice', 'payment boundary notice')
expect(success, '爆灯已送达', 'success sheet title')
expect(success, '继续浏览', 'success sheet action')
reject(success, 'import type', 'UTS-safe local success target type')
console.log('Spotlight payment flow checks passed')

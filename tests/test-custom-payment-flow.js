const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8')
}

function expect(content, fragment, label) {
  if (!content.includes(fragment)) {
    throw new Error(`${label}: missing ${fragment}`)
  }
  console.log(`PASS ${label}`)
}

console.log('Custom service payment flow checks')

const api = read('api/matchmaker.uts')
expect(api, 'saveCustomServiceApplicationDraft', 'application draft API')
expect(api, 'getCustomServiceApplicationDraft', 'draft lookup API')
expect(api, 'payCustomServiceApplication', 'payment API')
expect(api, "paymentStatus: 'paid'", 'paid status')
expect(api, "applicationStatus: 'submitted'", 'submitted status')

const mock = read('mock/matchmaker.uts')
expect(mock, 'mockCustomServicePaymentOrders', 'payment mock order')
expect(mock, "paymentStatus: 'paid'", 'paid mock data')

const applyPage = read('pages/matchmaker/apply.uvue')
expect(applyPage, '提交资料并去付款', 'application CTA')
expect(applyPage, '/pages/matchmaker/payment?draftId=', 'payment navigation')
expect(applyPage, 'planId.value <= 0', 'plan validation')

const paymentPage = read('pages/matchmaker/payment.uvue')
expect(paymentPage, '确认支付 ¥', 'payment CTA')
expect(paymentPage, '提交成功', 'success state')
expect(paymentPage, 'payCustomServiceApplication', 'payment completion')
expect(paymentPage, 'uni.navigateBack({ delta: 2 })', 'returns from payment to the original custom page')

const pages = read('pages.json')
expect(pages, 'pages/matchmaker/payment', 'payment route')

console.log('Custom service payment flow checks passed')

const fs = require('fs')
const path = require('path')
const { hasRegisteredPage } = require('./page-route-helper.cjs')

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

function expectAbsent(content, fragment, label) {
  if (content.includes(fragment)) {
    throw new Error(`${label}: should not contain ${fragment}`)
  }
  console.log(`PASS ${label}`)
}

console.log('Role application flow checks')

const api = read('api/matchmaker.uts')
expect(api, "url: '/matchmaker/applications'", 'backend application endpoint')
expect(api, 'ROLE_APPLICATION_USE_MOCK', 'role application Mock switch')
expect(api, 'createMockRoleApplication', 'role application Mock creation')
expect(api, "ROLE_APPLICATION_MOCK_STORAGE_KEY = 'xsa_role_application_mock_records'", 'local Mock persistence')
expect(api, "submitRoleApplication('service_matchmaker', data)", 'service matchmaker Mock routing')
expect(api, "submitRoleApplication('partner', data)", 'partner Mock routing')
expect(api, "submitRoleApplication('promoter', data)", 'promoter Mock routing')
expect(api, 'wechat:', 'WeChat field mapping')
expect(api, 'specialties:', 'specialties mapping')
expect(api, 'expected_price:', 'expected price mapping')
expect(api, 'success_cases:', 'case mapping')

for (const page of [
  'pagesSub/matchmaker/become-matchmaker.uvue',
  'pagesSub/matchmaker/become-partner.uvue',
  'pagesSub/matchmaker/become-promoter.uvue'
]) {
  const content = read(page)
  expect(content, 'uni.redirectTo({', `${page} success navigation`)
  expect(content, '/pagesSub/matchmaker/application-success?type=', `${page} success route`)
  expect(content, 'result.message != null', `${page} backend error handling`)
}

const promoterPage = read('pagesSub/matchmaker/become-promoter.uvue')
expect(promoterPage, '个人介绍', 'promoter personal introduction section')
expect(promoterPage, 'submitPromoterApplication(formData)', 'promoter submission routing')
expectAbsent(promoterPage, 'uni.chooseImage', 'promoter image picker removed')
expectAbsent(promoterPage, '上传头像', 'promoter avatar field removed')
expectAbsent(promoterPage, '擅长渠道', 'promoter specialties field removed')
expectAbsent(promoterPage, '推广佣金预期', 'promoter expected price field removed')
expectAbsent(promoterPage, '推广经验', 'promoter case field removed')

const successPage = read('pagesSub/matchmaker/application-success.uvue')
expect(successPage, '申请成功', 'success heading')
expect(successPage, '模拟资料已保存到本设备', 'Mock submission notice')
expect(successPage, "uni.switchTab({ url: '/pages/matchmaker/matchmaker' })", 'stable return target')

const pages = read('pages.json')
if (!hasRegisteredPage(root, 'pagesSub/matchmaker/application-success')) {
  throw new Error('success route registration: missing pagesSub/matchmaker/application-success')
}
console.log('PASS success route registration')

const customerServiceQrCode = path.join(root, 'static', 'qrcodes', 'kefu-wechat.png')
if (!fs.existsSync(customerServiceQrCode)) {
  throw new Error('customer service QR code asset is missing')
}
if (fs.statSync(customerServiceQrCode).size < 100) {
  throw new Error('customer service QR code asset is unexpectedly small')
}
console.log('PASS customer service QR code asset')

console.log('Role application flow checks passed')

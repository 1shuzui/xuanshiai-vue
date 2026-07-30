const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const readJson = (file) => {
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  return JSON.parse(source.replace(/\/\*[\s\S]*?\*\//g, ''))
}

const manifest = readJson('manifest.json')
const pages = readJson('pages.json')
const mainPages = pages.pages.map((page) => page.path)
const subpackagePages = new Map(
  (pages.subPackages || []).map((subpackage) => [
    subpackage.root,
    new Set(subpackage.pages.map((page) => page.path))
  ])
)

assert.equal(
  manifest['mp-weixin'].lazyCodeLoading,
  'requiredComponents',
  'WeChat build must enable requiredComponents lazy loading'
)

assert.deepEqual(mainPages, [
  'pages/index/index',
  'pages/community/community',
  'pages/matchmaker/matchmaker',
  'pages/message/message',
  'pages/profile/profile',
  'pages/auth/login',
  'pages/auth/register'
])

const expectedSubpackages = {
  'pagesSub/community': [
    'publish',
    'topic-list',
    'topic-detail',
    'post-detail',
    'activity-list',
    'activity-detail',
    'my-activities',
    'paper-plane',
    'dating-plane',
    'dating-plane-compose',
    'paper-plane-messages',
    'paper-plane-sent',
    'notifications'
  ],
  'pagesSub/matchmaker': [
    'apply',
    'detail',
    'payment',
    'become-matchmaker',
    'become-partner',
    'become-promoter',
    'application-success',
    'custom'
  ],
  'pagesSub/profileExtra': ['settings', 'certification', 'vip', 'my-moments'],
  'pagesSub/chat': ['detail'],
  'pagesSub/about': ['about', 'article'],
  'pagesSub/userExtra': [
    'onboarding/profile',
    'user/detail',
    'user/edit',
    'mytags/edit',
    'index/top-placement'
  ]
}

assert.equal(subpackagePages.size, Object.keys(expectedSubpackages).length)
for (const [rootPath, expectedPages] of Object.entries(expectedSubpackages)) {
  assert.deepEqual([...subpackagePages.get(rootPath)], expectedPages, `${rootPath} route set changed`)
}

console.log('PASS mp-weixin subpackage contract')

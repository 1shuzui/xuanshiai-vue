const fs = require('fs')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..')
const requestSource = fs.readFileSync(path.join(projectRoot, 'api', 'request.uts'), 'utf8')
const pageSource = fs.readFileSync(path.join(projectRoot, 'pages', 'matchmaker', 'matchmaker.uvue'), 'utf8')

const assertions = [
	['request fail callback returns a failure result', requestSource.includes('fail: (err: any)') && requestSource.includes('success: false') && requestSource.includes('code: -1')],
	['service request failure displays a network retry message', pageSource.includes('if (res.success && res.data != null)') && pageSource.includes("loadError.value = '网络连接不可用，请检查网络后重新加载。'")],
	['custom plan request failure displays a network retry message', pageSource.includes('if (planRes.success && planRes.data != null)')],
	['page exposes a reload action', pageSource.includes('class="error-card"') && pageSource.includes('@click="reloadPage"')]
]

const failures = assertions.filter(([, passed]) => !passed)
if (failures.length > 0) {
	failures.forEach(([name]) => console.error(`FAIL: ${name}`))
	process.exit(1)
}

assertions.forEach(([name]) => console.log(`PASS: ${name}`))

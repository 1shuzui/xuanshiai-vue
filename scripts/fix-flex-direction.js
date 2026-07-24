const fs = require('fs')
const path = require('path')

function walk(dir, out = []) {
	for (const name of fs.readdirSync(dir)) {
		if (
			[
				'node_modules',
				'unpackage',
				'dist',
				'.git',
				'design-demos',
				'.playwright-mcp',
				'.zcode',
				'graphify-out',
				'scripts'
			].includes(name)
		) {
			continue
		}
		const p = path.join(dir, name)
		const st = fs.statSync(p)
		if (st.isDirectory()) walk(p, out)
		else if (/\.(uvue|vue|scss|css)$/.test(name)) out.push(p)
	}
	return out
}

function processCss(css) {
	let i = 0
	let result = ''
	let changes = 0

	while (i < css.length) {
		const open = css.indexOf('{', i)
		if (open === -1) {
			result += css.slice(i)
			break
		}
		result += css.slice(i, open + 1)

		let depth = 1
		let j = open + 1
		while (j < css.length && depth > 0) {
			if (css[j] === '{') depth++
			else if (css[j] === '}') depth--
			j++
		}

		let body = css.slice(open + 1, j - 1)
		if (body.includes('{')) {
			const nested = processCss(body)
			body = nested.css
			changes += nested.changes
		} else {
			const hasDisplayFlex =
				/display\s*:\s*flex\s*;?/.test(body) || /display\s*:\s*inline-flex\s*;?/.test(body)
			const hasDirection = /flex-direction\s*:/.test(body)
			const isGrid = /display\s*:\s*grid\s*;?/.test(body)
			if (hasDisplayFlex && !hasDirection && !isGrid) {
				body = body.replace(/(display\s*:\s*(?:inline-)?flex\s*;?)/, (m) => {
					const endsWithSemi = m.trim().endsWith(';')
					return m + (endsWithSemi ? '' : ';') + '\n\t\tflex-direction: row;'
				})
				changes++
			}
		}

		result += body + '}'
		i = j
	}

	return { css: result, changes }
}

const root = process.cwd()
const files = walk(root)
let changedFiles = 0
let changedRules = 0
const report = []

for (const file of files) {
	const raw = fs.readFileSync(file, 'utf8')
	let next = raw
	let fileChanges = 0
	const rel = path.relative(root, file).replace(/\\/g, '/')

	if (/\.(uvue|vue)$/.test(file)) {
		next = raw.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/g, (full, css) => {
			const { css: out, changes } = processCss(css)
			fileChanges += changes
			return full.replace(css, out)
		})
	} else if (/\.(scss|css)$/.test(file)) {
		if (rel.startsWith('components/') || rel.startsWith('pages/')) {
			const { css: out, changes } = processCss(raw)
			next = out
			fileChanges = changes
		}
	}

	if (fileChanges > 0 && next !== raw) {
		fs.writeFileSync(file, next)
		changedFiles++
		changedRules += fileChanges
		report.push(rel + ': ' + fileChanges)
	}
}

console.log(JSON.stringify({ changedFiles, changedRules, report }, null, 2))

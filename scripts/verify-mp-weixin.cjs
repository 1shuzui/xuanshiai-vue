const fs = require('node:fs')
const path = require('node:path')
const { parseArgs } = require('node:util')
const { listFiles, sourceFingerprint, artifactFingerprint, buildPaths } = require('./mp-build-state.cjs')

const projectRoot = path.resolve(__dirname, '..')
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''))
const portablePath = value => value.split(path.sep).join('/')
const kib = bytes => `${(bytes / 1024).toFixed(1)} KiB`

function pageEntries(config) {
  const pages = (config.pages || []).map(page => ({ path: typeof page === 'string' ? page : page.path, owner: 'main' }))
  for (const sub of config.subPackages || config.subpackages || []) {
    for (const page of sub.pages) pages.push({ path: `${sub.root}/${typeof page === 'string' ? page : page.path}`, owner: sub.root })
  }
  return pages
}

function inspectArtifact(options = {}) {
  const root = path.resolve(options.projectRoot || projectRoot)
  const mode = options.mode || 'production'
  const defaults = buildPaths(root, mode)
  const artifactPath = path.resolve(options.artifactPath || defaults.artifactPath)
  const source = readJson(options.pagesPath || path.join(root, 'pages.json'))
  const app = readJson(path.join(artifactPath, 'app.json'))
  const config = readJson(options.configPath || path.join(artifactPath, 'project.config.json'))
  const limits = { main: options.mainLimitBytes ?? 2097152, subpackage: options.subpackageLimitBytes ?? 2097152, media: options.mediaLimitBytes ?? 204800 }
  if (Object.values(limits).some(value => !Number.isSafeInteger(value) || value <= 0)) throw Error('Size limits must be positive integer byte counts')
  const files = listFiles(artifactPath).map(file => ({ file, path: portablePath(path.relative(artifactPath, file)), bytes: fs.statSync(file).size }))
  const known = new Set(files.map(file => file.path))
  const roots = (app.subPackages || app.subpackages || []).map(sub => sub.root)
  const ownerOf = file => roots.find(root => file.startsWith(root + '/')) || 'main'
  const checks = []
  function check(name, failures) { checks.push({ name, passed: failures.length === 0, failures }) }
  check('lazy loading', app.lazyCodeLoading === 'requiredComponents' ? [] : ['lazyCodeLoading must be requiredComponents'])
  check('project root', path.resolve(artifactPath, config.miniprogramRoot || './') === artifactPath ? [] : ['miniprogramRoot does not point to the compiled artifact'])
  const packages = ['main', ...roots].map(name => ({ name, bytes: files.filter(file => ownerOf(file.path) === name).reduce((sum, file) => sum + file.bytes, 0) }))
  check('package sizes', packages.filter(pkg => pkg.bytes > (pkg.name === 'main' ? limits.main : limits.subpackage)).map(pkg => `${pkg.name}: ${kib(pkg.bytes)}`))
  const mediaExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.mp3', '.wav', '.aac', '.m4a', '.mp4'])
  check('media sizes', files.filter(file => mediaExtensions.has(path.extname(file.path).toLowerCase()) && file.bytes > limits.media).map(file => `${file.path}: ${kib(file.bytes)}`))

  const expected = pageEntries(source)
  const generated = pageEntries(app)
  const actualOwners = new Map(generated.map(page => [page.path, page.owner]))
  const routeFailures = expected.filter(page => actualOwners.get(page.path) !== page.owner).map(page => `${page.path}: expected ${page.owner}, generated ${actualOwners.get(page.path) || 'missing'}`)
  const expectedPaths = new Set(expected.map(page => page.path))
  for (const page of generated) if (!expectedPaths.has(page.path)) routeFailures.push(`Unexpected route: ${page.path}`)
  if (actualOwners.size !== generated.length) routeFailures.push('Duplicate generated page declarations')
  check('source routes and package ownership', routeFailures)
  const missingFiles = []
  for (const page of expected) for (const extension of ['.js', '.json', '.wxml']) {
    if (!known.has(page.path + extension)) missingFiles.push(page.path + extension)
  }
  check('complete page files', missingFiles)
  check('tab pages stay in main', (source.tabBar?.list || []).filter(tab => actualOwners.get(tab.pagePath) !== 'main').map(tab => tab.pagePath))

  const mediaManifest = readJson(options.mediaManifestPath || path.join(root, 'scripts/mp-media-manifest.json'))
  const assetFailures = []
  for (const asset of mediaManifest.assets) {
    const compiled = path.join(artifactPath, asset.path)
    if (!fs.existsSync(compiled)) assetFailures.push(`Missing media: ${asset.path}`)
    else if (!fs.readFileSync(compiled).equals(fs.readFileSync(path.join(root, asset.path)))) assetFailures.push(`Media differs from source: ${asset.path}`)
    if (asset.source !== asset.path && fs.existsSync(path.join(artifactPath, asset.source))) assetFailures.push(`Old media copied twice: ${asset.source}`)
  }
  if (fs.existsSync(path.join(artifactPath, 'static/location.json'))) assetFailures.push('Raw location.json copied in addition to its imported module')
  check('packaged media inventory', assetFailures)

  const referenceFailures = []
  for (const file of files.filter(file => /\.(js|wxml|wxss)$/.test(file.path))) {
    const text = fs.readFileSync(file.file, 'utf8')
    for (const match of text.matchAll(/["'](\/(?:static\/|pagesSub\/[^/]+\/static\/)[^"'\s?#]+)["']/g)) {
      const target = match[1].slice(1)
      if (!known.has(target)) referenceFailures.push(`${file.path}: missing ${target}`)
      else if (ownerOf(target) !== 'main' && ownerOf(target) !== ownerOf(file.path)) referenceFailures.push(`${file.path}: cannot load media from ${ownerOf(target)}`)
    }
  }
  for (const file of files.filter(file => file.path.endsWith('.json'))) {
    const localConfig = readJson(file.file)
    for (const component of Object.values(localConfig.usingComponents || {})) {
      if (/^plugin:\/\//.test(component)) continue
      const resolved = component.startsWith('/') ? component.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(file.path), component))
      if (!known.has(resolved + '.js')) referenceFailures.push(`${file.path}: missing component ${component}`)
      else if (ownerOf(resolved) !== 'main' && ownerOf(resolved) !== ownerOf(file.path)) referenceFailures.push(`${file.path}: cannot use component from ${ownerOf(resolved)}`)
    }
  }
  check('local asset and component references', [...new Set(referenceFailures)])

  const fonts = listFiles(path.join(root, 'components/assets/icons')).filter(file => /\.(woff2?|ttf)$/.test(file))
  const embeddedFonts = files.filter(file => file.path.endsWith('.wxss')).flatMap(file =>
    [...fs.readFileSync(file.file, 'utf8').matchAll(/url\(["']?data:[^,)]*;base64,([A-Za-z0-9+/=]+)["']?\)/g)].map(match => Buffer.from(match[1], 'base64')))
  check('shared font inventory', fonts.flatMap(font => {
    const bytes = fs.readFileSync(font)
    const count = embeddedFonts.filter(embedded => embedded.equals(bytes)).length
    return count === 1 ? [] : [`${portablePath(path.relative(root, font))}: expected one embedded copy, found ${count}`]
  }))

  let build = null
  if (options.requireBuild) {
    const failures = []
    const receiptPath = options.receiptPath || defaults.receiptPath
    if (!fs.existsSync(receiptPath)) failures.push('No successful build receipt; run the HBuilderX build command first')
    else {
      build = readJson(receiptPath)
      if (build.mode !== mode || path.resolve(build.artifactPath) !== artifactPath) failures.push('Build receipt belongs to a different mode or artifact')
      if (build.sourceHash !== sourceFingerprint(root)) failures.push('Source changed since the successful build')
      if (build.artifactHash !== artifactFingerprint(artifactPath)) failures.push('Artifact changed since the successful build')
    }
    check('successful build provenance', failures)
  }
  const warnings = files.filter(file => /\.(pen|psd|sketch|fig|zip|rar)$/i.test(file.path)).map(file => `Review static file: ${file.path}`)
  return { passed: checks.every(check => check.passed), artifactPath, mode, limits, packages, pageCount: generated.length, checks, warnings, build }
}

function formatReport(report) {
  const lines = [`mp-weixin ${report.mode}: ${report.artifactPath}`]
  for (const pkg of report.packages) lines.push(`${pkg.name}: ${kib(pkg.bytes)} / ${kib(pkg.name === 'main' ? report.limits.main : report.limits.subpackage)}`)
  for (const check of report.checks) lines.push(`[${check.passed ? 'PASS' : 'FAIL'}] ${check.name}`, ...check.failures.map(failure => `  ${failure}`))
  for (const warning of report.warnings) lines.push(`[WARN] ${warning}`)
  lines.push(`${report.pageCount} pages; ${report.passed ? 'PASS' : 'FAIL'}`)
  return lines.join('\n')
}

if (require.main === module) {
  try {
    const { values } = parseArgs({ options: {
      project: { type: 'string' }, artifact: { type: 'string' }, config: { type: 'string' }, pages: { type: 'string' }, media: { type: 'string' },
      mode: { type: 'string', default: 'production' }, 'require-build': { type: 'boolean' }, receipt: { type: 'string' },
      'main-limit': { type: 'string' }, 'sub-limit': { type: 'string' }, 'media-limit': { type: 'string' }, report: { type: 'string' }
    } })
    const report = inspectArtifact({ projectRoot: values.project, artifactPath: values.artifact, configPath: values.config, pagesPath: values.pages,
      mediaManifestPath: values.media, mode: values.mode, requireBuild: values['require-build'], receiptPath: values.receipt,
      mainLimitBytes: values['main-limit'] === undefined ? undefined : Number(values['main-limit']),
      subpackageLimitBytes: values['sub-limit'] === undefined ? undefined : Number(values['sub-limit']),
      mediaLimitBytes: values['media-limit'] === undefined ? undefined : Number(values['media-limit']) })
    console.log(formatReport(report))
    if (values.report) { fs.mkdirSync(path.dirname(path.resolve(values.report)), { recursive: true }); fs.writeFileSync(values.report, JSON.stringify(report, null, 2) + '\n') }
    process.exitCode = report.passed ? 0 : 2
  } catch (error) { console.error(`ERROR: ${error.message}`); process.exitCode = 1 }
}

module.exports = { inspectArtifact, formatReport, pageEntries }

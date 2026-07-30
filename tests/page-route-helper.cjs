const fs = require('node:fs')
const path = require('node:path')

function readPagesConfig(root) {
  return JSON.parse(fs.readFileSync(path.join(root, 'pages.json'), 'utf8'))
}

function hasRegisteredPage(root, route) {
  const config = readPagesConfig(root)
  if ((config.pages || []).some((page) => page.path === route)) return true

  return (config.subPackages || config.subpackages || []).some((subpackage) => {
    const prefix = `${subpackage.root}/`
    return route.startsWith(prefix) && (subpackage.pages || []).some(
      (page) => `${subpackage.root}/${page.path}` === route
    )
  })
}

module.exports = { hasRegisteredPage }

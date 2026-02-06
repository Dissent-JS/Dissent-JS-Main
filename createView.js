const fs = require('fs')
const path = require('path')

const viewName = process.argv[2]
if (!viewName) {
  console.error('Please specify a View name')
  process.exit(1)
}

// Validate view name to prevent path traversal
if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(viewName)) {
  console.error('View name must start with a letter and contain only letters, numbers, hyphens, and underscores')
  process.exit(1)
}

// Create the component directory
const componentDir = path.join(__dirname, 'src', 'views', viewName)
fs.mkdirSync(componentDir)

// Create the HTML file
const htmlContent = `<section id="${viewName}view">
  <h1>${viewName}</h1>
</section>
`
const htmlPath = path.join(componentDir, `${viewName}.html`)
fs.writeFileSync(htmlPath, htmlContent)

// Create the SCSS file
const scssContent = `@import '../../styles/mixin.scss';  // remove if not needed

#${viewName}view {
  // Component styles go here
}
`
const scssPath = path.join(componentDir, `${viewName}.scss`)
fs.writeFileSync(scssPath, scssContent)

// Create the JS file
const jsContent = `function ${viewName}() {
    console.log("${viewName}");
}
`
const jsPath = path.join(componentDir, `${viewName}.js`)
fs.writeFileSync(jsPath, jsContent)

console.log(`Component '${viewName}' created successfully`)


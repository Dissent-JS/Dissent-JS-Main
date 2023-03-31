const fs = require('fs')
const path = require('path')

const componentName = process.argv[2]
if (!componentName) {
  console.error('Please specify a component name')
  process.exit(1)
}

// Create the component directory
const componentDir = path.join(__dirname, 'src', 'components', componentName)
fs.mkdirSync(componentDir)

// Create the HTML file
const htmlContent = `<!-- Component HTML goes here -->`
const htmlPath = path.join(componentDir, `${componentName}.html`)
fs.writeFileSync(htmlPath, htmlContent)

// Create the SCSS file
const scssContent = `@import '../../styles/mixin.scss';  // remove if not needed

.${componentName} {
  // Component styles go here
}
`
const scssPath = path.join(componentDir, `${componentName}.scss`)
fs.writeFileSync(scssPath, scssContent)

// Create the JS file
const jsContent = `import './${componentName}.scss'

export default class ${componentName} {
  constructor(element) {
    this.element = element
  }

  async init() {
    const response = await fetch('components/${componentName}/${componentName}.html');
    const ${componentName}html = await response.text();
    this.element.innerHTML = ${componentName}html;
  }
}
`
const jsPath = path.join(componentDir, `${componentName}.js`)
fs.writeFileSync(jsPath, jsContent)

console.log(`Component '${componentName}' created successfully`)

const fs = require('fs')
const path = require('path')

const componentName = process.argv[2]
if (!componentName) {
  console.error('Please specify a component name')
  process.exit(1)
}

// Validate component name to prevent path traversal
if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(componentName)) {
  console.error('Component name must start with a letter and contain only letters, numbers, hyphens, and underscores')
  process.exit(1)
}

const useTypeScript = fs.existsSync(path.join(__dirname, 'tsconfig.json'));
const ext = useTypeScript ? 'ts' : 'js';

// Create the component directory
const componentDir = path.join(__dirname, 'src', 'components', componentName)
fs.mkdirSync(componentDir)

// Create the HTML file
const htmlContent = `<!-- Component HTML goes here -->
<h2>${componentName}</h2>`

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

// Create the JS/TS file
const jsContent = `import './${componentName}.scss'

export default class ${componentName} {
  constructor(element${useTypeScript ? ': HTMLElement' : ''}) {
    this.element = element
  }

  async init()${useTypeScript ? ': Promise<void>' : ''} {
    if (process.env.NODE_ENV !== 'production') {
      const response = await fetch('components/${componentName}/${componentName}.html');
      const ${componentName}html = await response.text();
      this.element.innerHTML = ${componentName}html;
    }
    // your code goes here
  }
}
`
const jsPath = path.join(componentDir, `${componentName}.${ext}`)
fs.writeFileSync(jsPath, jsContent)

console.log(`Component '${componentName}' created successfully`)

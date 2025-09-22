const fs = require('fs');
const path = require('path');
const sass = require('sass');
const glob = require('glob');
const CleanCSS = require('clean-css');

const outputPath = path.join(__dirname, 'dist', 'main.min.css');

const foldersToSearch = [
  './src/styles/**/*.scss',
  './src/views/**/*.scss',
  './src/layout/**/*.scss',
  './src/components/**/*.scss',
];

const files = foldersToSearch.flatMap((pattern) => glob.sync(pattern));

const cssContent = files
  .map((filePath) => {
    const result = sass.renderSync({ file: filePath });
    return result.css;
  })
  .join('\n');

const cleanCSSOptions = {
  level: {
    1: {
      all: true,
    },
    2: {
      removeDuplicateRules: true,
      removeEmpty: true,
    },
  },
};

const minifiedCSS = new CleanCSS(cleanCSSOptions).minify(cssContent).styles;

fs.writeFileSync(outputPath, minifiedCSS);

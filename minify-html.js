const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');

const distFolder = './dist';

function processDirectory(dir) {
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error(`Error reading the ${dir} folder:`, err);
            process.exit(1);
        }

        files.forEach((file) => {
            const filePath = path.join(dir, file);

            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(`Error reading file stats for ${file}:`, err);
                    process.exit(1);
                }

                if (stats.isDirectory()) {
                    processDirectory(filePath);
                } else if (path.extname(file) === '.html') {
                    minifyHtmlFile(filePath);
                }
            });
        });
    });
}

function minifyHtmlFile(inputPath) {
    const outputPath = path.join(path.dirname(inputPath), path.basename(inputPath, '.html') + '.min.html');

    fs.readFile(inputPath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading ${inputPath}:`, err);
            process.exit(1);
        }

        minify(data, {
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true,
            minifyCSS: true,
        })
            .then((minifiedHtml) => {
                fs.writeFile(outputPath, minifiedHtml, 'utf8', (err) => {
                    if (err) {
                        console.error(`Error writing minified ${inputPath}:`, err);
                        process.exit(1);
                    }

                    fs.rename(outputPath, inputPath, (err) => {
                        if (err) {
                            console.error(`Error replacing ${inputPath} with minified version:`, err);
                            process.exit(1);
                        }
                        console.log(`Successfully minified ${inputPath}`);
                    });
                });
            })
            .catch((err) => {
                console.error(`Error minifying ${inputPath}:`, err);
                process.exit(1);
            });
    });
}

processDirectory(distFolder);

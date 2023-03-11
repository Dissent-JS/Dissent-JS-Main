const path = require('path')
const fs = require('fs');

const viewsPath = path.join(__dirname, 'src', 'views');
const navigationPath = path.join(__dirname, 'navigation.js');

// Get a list of directories in the views folder
const viewsDirectories = fs.readdirSync(viewsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

// Generate the contents of the navigation.js file
const navigationFileContent = `module.exports = [${viewsDirectories.map(viewsName => `'${viewsName}'`).join(', ')}];`;

// Write the navigation.js file
fs.writeFile(navigationPath, navigationFileContent, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log(`Navigation updated with ${viewsDirectories.length} views`);

        // Create the Nav.js file
        const viewsNames = require('./navigation.js');
        const viewsArray = Object.values(viewsNames);
        const navTemplate = `<nav><ul><li><a href="/#home">Home</a></li>${viewsArray
            .map((viewsName) => {
                if (viewsName !== '404' && viewsName !== 'home') {
                    return `<li><a href="/#${viewsName}">${viewsName}</a></li>`;
                }
            })
            .join(' ')}</ul></nav>`;

        fs.writeFile('./src/layout/nav/nav.html', navTemplate, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log('Nav.js created successfully');
            }
        });
    }
});

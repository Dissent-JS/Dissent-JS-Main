function initiate() {
    const requireComponent = require.context(
        './components', // Let's have a gander at the files in the  directory
        true, // Shall we look in the subfolders?
        /\.(js|scss)$/ // Let's see if we can match all the files .js or .scss

    )

    const requireLayout = require.context(
        './layout',
        true,
        /\.(js|scss)$/
    )

    const requireView = require.context(
        './views',
        true,
        /\.(js|scss)$/

    );

    const componentFiles = requireComponent.keys()
    const layoutFiles = requireLayout.keys()
    const viewFiles = requireView.keys();

    for (let i = 0; i < componentFiles.length + layoutFiles.length; i++) {
        let fileName, name, module, Class;

        if (i < componentFiles.length) {
            fileName = componentFiles[i]
            name = fileName.split('/').pop().replace(/\.\w+$/, '')
            module = requireComponent(fileName)
            require(`./components/${name}/${name}.scss`)
            Class = Object.values(module).find((exportedValue) => typeof exportedValue === 'function')
        } else if (i < componentFiles.length + layoutFiles.length) {
            fileName = layoutFiles[i - componentFiles.length];
            name = fileName.split('/').pop().replace(/\.\w+$/, '');
            module = requireLayout(fileName);
            require(`./layout/${name}/${name}.scss`);
            Class = Object.values(module).find((exportedValue) => typeof exportedValue === 'function');
        } else {
            fileName = viewFiles[i - componentFiles.length - layoutFiles.length];
            name = fileName.split('/').pop().replace(/\.\w+$/, '');
            module = requireView(fileName);
            require(`./views/${name}/${name}.scss`);
            Class = Object.values(module).find((exportedValue) => typeof exportedValue === 'function');
        }

        if (Class) {
            let elements = document.querySelectorAll(`.${name}`)
            elements.forEach(function (element) {
                let instance = new Class(element)
                instance.init()
            })
        } else {
            let elements = document.querySelectorAll(`.${name}`)
        }
    }
}
window.onload = () => {
    setTimeout(() => {
        initiate();
    }, 500);
}
window.onpopstate = function (event) {
    setTimeout(() => {
        initiate();
    }, 300);
};
function initiate() {

    const requireComponent = require.context(
        './components',
        true,
        /\.(js)$/
    );

    const requireLayout = require.context(
        './layout',
        true,
        /\.(js)$/
    );

    const requireView = require.context(
        './views',
        true,
        /\.(js)$/
    );

    const componentFiles = requireComponent.keys();
    const layoutFiles = requireLayout.keys();
    const viewFiles = requireView.keys();

    for (let i = 0; i < componentFiles.length + layoutFiles.length; i++) {
        let fileName, name, module, Class;

        if (i < componentFiles.length) {
            fileName = componentFiles[i]
            name = fileName.split('/').pop().replace(/\.\w+$/, '')
            module = requireComponent(fileName)
            if (process.env.NODE_ENV !== 'production') {
                console.log("arrrggeeeee");
                require(`./components/${name}/${name}.scss`)
            }
            Class = Object.values(module).find((exportedValue) => typeof exportedValue === 'function')
        } else if (i < componentFiles.length + layoutFiles.length) {
            fileName = layoutFiles[i - componentFiles.length];
            name = fileName.split('/').pop().replace(/\.\w+$/, '');
            module = requireLayout(fileName);
            if (process.env.NODE_ENV !== 'production') {
                console.log("arrrggeeeee");
                require(`./layout/${name}/${name}.scss`);
            }
            Class = Object.values(module).find((exportedValue) => typeof exportedValue === 'function');
        } else {
            fileName = viewFiles[i - componentFiles.length - layoutFiles.length];
            name = fileName.split('/').pop().replace(/\.\w+$/, '');
            module = requireView(fileName);
            if (process.env.NODE_ENV !== 'production') {
                console.log("arrrggeeeee");
                require(`./views/${name}/${name}.scss`);
            }
            Class = Object.values(module).find((exportedValue) => typeof exportedValue === 'function');
        }

        if (Class) {
            let elements = document.querySelectorAll(`.${name}`);
            elements.forEach(async function (element) {
                let instance = new Class(element);
                await instance.init();
            });
        } else {
            let elements = document.querySelectorAll(`.${name}`);
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

// Import all test files

if (process.env.NODE_ENV === 'test') {
    // Import all test files
    const requireComponentTests = require.context('../__tests__/components', true, /\.test\.js$/);
    const requireLayoutTests = require.context('../__tests__/layouts', true, /\.test\.js$/);
    const requireViewTests = require.context('../__tests__/views', true, /\.test\.js$/);

    requireComponentTests.keys().forEach(requireComponentTests);
    requireLayoutTests.keys().forEach(requireLayoutTests);
    requireViewTests.keys().forEach(requireViewTests);
} else {
    console.log('Not in test mode');
}


if (process.env.NODE_ENV === 'production') {
    console.log('production mode', process.env.NODE_ENV);
} else {
    console.log('development mode', process.env.NODE_ENV);
}


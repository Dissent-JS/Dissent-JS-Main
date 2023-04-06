async function initiate() {

    const requireComponent = require.context('./components', true, /\.(js)$/);
    const requireLayout = require.context('./layout', true, /\.(js)$/);
    const requireView = require.context('./views', true, /\.(js)$/);
    const viewFiles = requireView.keys();

    const viewPromises = [];
    for (let i = 0; i < viewFiles.length; i++) {
        let fileName = viewFiles[i];
        viewPromises.push(requireView(fileName));
        let name = fileName.split('/').pop().replace(/\.\w+$/, '');
        if (process.env.NODE_ENV !== 'production') {
            require(`./views/${name}/${name}.scss`);
        }
    }
    await Promise.all(viewPromises).then(async () => {

        const componentLayoutPromises = [];
        const componentFiles = requireComponent.keys();
        const layoutFiles = requireLayout.keys();
        for (let i = 0; i < componentFiles.length + layoutFiles.length; i++) {
            let fileName, name, module, Class;

            if (i < componentFiles.length) {
                fileName = componentFiles[i];
                name = fileName.split('/').pop().replace(/\.\w+$/, '');
                module = requireComponent(fileName);
                if (process.env.NODE_ENV !== 'production') {
                    require(`./components/${name}/${name}.scss`);
                }
                Class = Object.values(module).find(
                    (exportedValue) => typeof exportedValue === 'function'
                );
            } else {
                fileName = layoutFiles[i - componentFiles.length];
                name = fileName.split('/').pop().replace(/\.\w+$/, '');
                module = requireLayout(fileName);
                if (process.env.NODE_ENV !== 'production') {
                    require(`./layout/${name}/${name}.scss`);
                }
                Class = Object.values(module).find(
                    (exportedValue) => typeof exportedValue === 'function'
                );
            }

            if (Class) {
                let elements = document.querySelectorAll(`.${name}`);
                elements.forEach(function (element) {
                    let instance = new Class(element);
                    componentLayoutPromises.push(instance.init());
                });
            } else {
                let elements = document.querySelectorAll(`.${name}`);
                break;
            }
        }
        await Promise.all(componentLayoutPromises);
    });
}

window.onload = () => {
    initiate();
};

window.onpopstate = () => {
    setTimeout(() => {
        initiate();
    }, 100);
};

if (process.env.NODE_ENV === 'test') {
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


function home() {
    console.log('Home');
}

/* istanbul ignore else */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { home };
}


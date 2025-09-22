function notfound() {
    console.log('404 page initialized');

    // Content is now directly embedded in the HTML, no component initialization needed
}

try {
    if (process.env.NODE_ENV === 'test') {
        module.exports = { notfound };
    }
} catch (error) {
    if (!(error.name === 'ReferenceError' && error.message.includes('process is not defined'))) {
        console.error('An unexpected error occurred:', error);
    }
}
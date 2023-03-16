function home() {
    console.log('Home');
}


try {
    if (process.env.NODE_ENV === 'test') {
        module.exports = { home };
    }
} catch (error) {
    if (!(error.name === 'ReferenceError' && error.message.includes('process is not defined'))) {
        console.error('An unexpected error occurred:', error);
    }
}


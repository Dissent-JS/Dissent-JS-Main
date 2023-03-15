function home() {
    console.log('Home');
}


try {
    if (process.env.NODE_ENV === 'test') {
        console.log('HomeXXXX');
        module.exports = { home };
    } else {
        console.log('We are in production mode');
    }
} catch (error) {
    if (error.name === 'ReferenceError' && error.message.includes('process is not defined')) {
        console.log('We are in production mode');
    } else {
        console.error('An unexpected error occurred:', error);
    }
}

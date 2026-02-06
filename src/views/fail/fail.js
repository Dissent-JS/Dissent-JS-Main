function fail() {
    // Handle any additional logic for failed logins if needed
    console.log('Login failed');
}

/* istanbul ignore else */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fail };
}

module.exports = {
    testEnvironment: 'jsdom',
    setupFiles: ['<rootDir>/__tests__/setupTests.js'],
    testMatch: [
        '<rootDir>/__tests__/components/**/*.test.js',
        '<rootDir>/__tests__/layouts/**/*.test.js',
        '<rootDir>/__tests__/views/**/*.test.js',
    ],
    transform: {
        "^.+\\.jsx?$": "babel-jest"
    },
    moduleDirectories: ['node_modules', '<rootDir>/src'],
    moduleNameMapper: {
        '\\.scss$': 'identity-obj-proxy',
    },
};
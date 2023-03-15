module.exports = {
    testEnvironment: 'jsdom',
    testMatch: [
        '<rootDir>/__tests__/components/**/*.test.js',
        '<rootDir>/__tests__/layouts/**/*.test.js',
        '<rootDir>/__tests__/views/**/*.test.js',
    ],
    moduleDirectories: ['node_modules', '<rootDir>/src'],
    moduleNameMapper: {
        '\\.scss$': 'identity-obj-proxy',
    },
};

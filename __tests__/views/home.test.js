const { home } = require('../../src/views/home/home');

describe('home function', () => {
    test('should log "Home"', () => {
        console.log = jest.fn();
        home();
        expect(console.log).toHaveBeenCalledWith('Home');
    });
});

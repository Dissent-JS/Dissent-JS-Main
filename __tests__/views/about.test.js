const { waitFor } = require('@testing-library/dom');
const fetchMock = require('jest-fetch-mock');
const { about } = require('../../src/views/about/about');

describe('about function', () => {
    beforeEach(() => {
        fetchMock.resetMocks(); // Reset fetch mock before each test
    });

    test('should display correct name and age', async () => {
        // Create a mock element with an ID of 'ty'
        const ty = document.createElement('div');
        ty.id = 'ty';
        document.body.appendChild(ty);

        // Set up fetch mock to return a specific response
        fetchMock.mockResponseOnce(JSON.stringify({
            name: 'anna',
            age: 51,
        }));

        // Call the about function and wait for it to complete
        await about();

        // Wait for the 'ty' element to be updated
        await waitFor(() => expect(ty.textContent).toBe('The ladies name is anna and she is 51 years old.'), {
            timeout: 2000, // Increase timeout to 2 seconds to allow for network latency
        });
    });
});
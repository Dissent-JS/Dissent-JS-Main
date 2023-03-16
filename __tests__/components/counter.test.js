import Counter from '../../src/components/counter/counter';

describe('Counter', () => {
    let mockFetch;

    beforeEach(() => {
        mockFetch = jest.fn();
    });

    test('should initialize counter correctly', async () => {
        const fakeElement = document.createElement('div');
        const fakeResponse = {
            text: jest.fn().mockResolvedValue('<button class="myButton"></button><span class="myCounter">0</span>'),
        };
        mockFetch.mockResolvedValue(fakeResponse);

        const counter = new Counter(fakeElement, mockFetch);
        await counter.init();

        expect(mockFetch).toHaveBeenCalledWith('./components/counter/counter.html');
        expect(fakeElement.innerHTML).toBe('<button class="myButton"></button><span class="myCounter">0</span>');

        const button = fakeElement.querySelector('.myButton');
        const counterElement = fakeElement.querySelector('.myCounter');

        expect(counterElement.innerHTML).toBe('0');

        button.click();

        expect(counterElement.innerHTML).toBe('1');
    });
});

import dataBinding from '../../src/components/dataBinding/dataBinding';

// Mock server for fetching the HTML content
const originalFetch = global.fetch;
global.fetch = jest.fn(() =>
    Promise.resolve({
        text: () => Promise.resolve(`
      <h2>Two way data binding Example</h2>
      <label for="dataFirstName">Name: </label>
      <input id="dataFirstName" data-tw-bind="name" type="text">
      <p data-tw-bind="name"></p>
      <label for="dataSurName">Surname: </label>
      <input id="dataSurName" data-tw-bind="surname" type="text">
      <label for="dataSurNameTwo">Two way Surname: </label>
      <input id="dataSurNameTwo" data-tw-bind="surname" type="text">
    `),
    })
);

// Helper function to simulate keyup event
function simulateKeyup(element, value) {
    element.value = value;
    const event = new Event('keyup');
    element.dispatchEvent(event);
}

describe('dataBinding', () => {
    afterAll(() => {
        global.fetch = originalFetch;
    });

    beforeEach(async () => {
        document.body.innerHTML = '<div id="app"></div>';
        const element = document.getElementById('app');
        const dataBind = new dataBinding(element);
        await dataBind.init();
    });

    test('should bind name data from input to the paragraph', () => {
        const input = document.getElementById('dataFirstName');
        const target = document.querySelector('p[data-tw-bind="name"]');

        simulateKeyup(input, 'John Doe');

        expect(target.textContent).toBe('John Doe');
    });

    test('should bind surname data from one input to another input', () => {
        const input1 = document.getElementById('dataSurName');
        const input2 = document.getElementById('dataSurNameTwo');

        simulateKeyup(input1, 'Doe');

        expect(input2.value).toBe('Doe');
    });

    test('should bind surname data from one input to another input (reverse)', () => {
        const input1 = document.getElementById('dataSurName');
        const input2 = document.getElementById('dataSurNameTwo');

        simulateKeyup(input2, 'Doe');

        expect(input1.value).toBe('Doe');
    });
});

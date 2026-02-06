function about() {

    const ty = document.getElementById('ty');
    const getSomeDataForAnExample = {

        async getData() {
            try {
                const response = await fetch('https://api.agify.io?name=anna');
                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Failed to fetch data:', error);
                return null;
            }
        },

        async render() {
            const data = await this.getData();
            if (data && ty) {
                const text2 = `The ladies name is ${data.name} and she is ${data.age} years old.`;
                ty.textContent = text2;
            }
        }
    };
    getSomeDataForAnExample.render();

};

/* istanbul ignore else */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { about };
}


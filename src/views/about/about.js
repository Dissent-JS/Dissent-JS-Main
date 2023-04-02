function about() {

    const ty = document.getElementById('ty');
    const getSomeDataForAnExample = {

        async getData() {
            const response = await fetch('https://api.agify.io?name=anna');
            const data = await response.json();
            return data;
        },

        async render() {
            const data = await this.getData();
            const text2 = `The ladies name is ${data.name} and she is ${data.age} years old.`;
            ty.innerHTML = text2;

        }
    };
    getSomeDataForAnExample.render();

};

try {
    if (process.env.NODE_ENV === 'test') {
        module.exports = { about };
    }
} catch (error) {
    if (!(error.name === 'ReferenceError' && error.message.includes('process is not defined'))) {
        console.error('An unexpected error occurred:', error);
    }
}


function login() {
    const loginButton = document.getElementById('login-button');
    loginButton.addEventListener('click', () => {

        const clientId = '605430936679-n1a7njcju23a7pgqmsjs6lpg2pevnj2q.apps.googleusercontent.com';
        const redirectUri = '/#home';
        const scope = 'rohanleach4@gmail.com';
        const responseType = 'code';

        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=${responseType}&state=123`;

        function login() {
            const loginButton = document.getElementById('login-button');
            loginButton.addEventListener('click', () => {
                window.location.href = oauthUrl;
            });
        }

        window.login = login;



    });
}

window.login = login;

function login() {
    const loginButton = document.getElementById('login-button');
    if (!loginButton) return;

    loginButton.addEventListener('click', () => {
        // OAuth configuration — set these via webpack DefinePlugin or environment config
        const clientId = typeof OAUTH_CLIENT_ID !== 'undefined' ? OAUTH_CLIENT_ID : '';
        const redirectUri = typeof OAUTH_REDIRECT_URI !== 'undefined' ? OAUTH_REDIRECT_URI : window.location.origin + '/#home';
        const scope = 'openid email profile';
        const responseType = 'code';

        if (!clientId) {
            console.error('OAuth client ID is not configured. Set OAUTH_CLIENT_ID via webpack DefinePlugin.');
            return;
        }

        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=${responseType}&state=123`;

        window.location.href = oauthUrl;
    });
}

window.login = login;

function loadView(view) {
    fetch(`views/${view}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("View not found");
            }
            return response.text();
        })
        .then(html => {
            document.querySelector('#view-container').innerHTML = html;
        })
        .catch(error => {
            console.error(error);
            loadView('404/404.html');
        });
}

function userIsLoggedIn() {
    // Check for logged-in status, e.g., using local storage or session storage
    // Return true if the user is logged in, false otherwise
    // This is just an example, replace with your actual login status check
    const loggedIn = localStorage.getItem('loggedIn');
    return loggedIn === 'true';
}

function router() {
    const path = getRouteFromUrl();
    console.log("Path", path);
    if (!path) {

        // Check if the user is logged in
        if (userIsLoggedIn()) {
            console.log("User is logged in");
            window.location.hash = '#home';
        } else {
            loadView('/login/login.html');
            console.log("User is not logged in");
        }
    } else if (path === "fail") {
        loadView('/fail/fail.html');
    } else if (path) {
        loadView(path + "/" + path + ".html");
        setTimeout(() => {
            const currentPath = path;
            const script = document.createElement('script');
            script.src = `./views/${currentPath}/${currentPath}.js`;
            script.onload = function () {

                if (window[currentPath]) {
                    window[currentPath]();
                } else {
                    console.error(`No function found for path ${currentPath}`);
                }
            };
            document.head.appendChild(script);

        }, 300);
    } else {
        loadView('404/404.html');
    }
}



function getRouteFromUrl() {
    const hash = window.location.hash;
    const route = hash.slice(1);
    return route || '/';
}

router();
window.addEventListener('hashchange', router);

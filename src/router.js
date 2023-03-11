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

function router() {
    const path = getRouteFromUrl();

    if (!path || path === "/") {
        loadView('/home/home.html');
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

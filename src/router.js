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

function loadViewScript(path) {
    const scriptId = `view-script-${path}`;

    // Check if script is already loaded
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
        // Script already loaded, just call the function
        if (window[path]) {
            window[path]();
        } else {
            console.error(`Function ${path} not found in already loaded script`);
        }
        return;
    }

    // Script not loaded, create and load it
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `./views/${path}/${path}.js`;
    script.onload = function () {
        if (window[path]) {
            window[path]();
        } else {
            console.error(`No function found for path ${path}`);
        }
    };
    script.onerror = function () {
        console.error(`Failed to load script for path ${path}`);
    };
    document.head.appendChild(script);
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

    // Handle root path - redirect to home
    if (!path || path === '') {
        navigateTo('home');
        return;
    }

    if (path === "fail") {
        loadView('/fail/fail.html');
    } else if (path) {
        loadView(path + "/" + path + ".html");
        setTimeout(() => {
            loadViewScript(path);
        }, 300);
    } else {
        loadView('404/404.html');
    }
}



function getRouteFromUrl() {
    // Use pathname for clean URLs
    let path = window.location.pathname.slice(1); // Remove leading slash

    // Fallback for GitHub Pages: check query string (from 404.html redirect)
    if (!path && window.location.search.startsWith('/?')) {
        path = window.location.search.slice(2); // Remove '/?'
        // Clean up the URL
        window.history.replaceState(null, null, '/' + path);
    }

    return path || ''; // Return empty string for root path
}

function navigateTo(path) {
    // Use History API for clean URLs
    window.history.pushState(null, null, `/${path}`);

    // Clear any existing content before routing to ensure clean initialization
    const viewContainer = document.querySelector('#view-container');
    if (viewContainer) {
        viewContainer.innerHTML = '';
    }

    // Run the router to load the new view
    router();
}

function handleLinkClick(event) {
    // Intercept link clicks for SPA navigation
    const link = event.target.closest('a[href]');
    if (link && link.getAttribute('href').startsWith('/')) {
        event.preventDefault();
        const path = link.getAttribute('href').slice(1); // Remove leading slash
        navigateTo(path);
    }
}

// Initialize router
router();

// Listen for browser back/forward buttons
window.addEventListener('popstate', router);

// Intercept link clicks for SPA navigation
document.addEventListener('click', handleLinkClick);

// Whitelist of allowed view names to prevent path traversal and script injection
const ALLOWED_VIEWS = ['home', 'about', 'contact', 'login', 'fail', '404'];

function isValidViewName(name) {
    return ALLOWED_VIEWS.includes(name);
}

function loadView(view) {
    // Extract the view name from the path for validation
    const viewName = view.split('/')[0];
    if (!isValidViewName(viewName)) {
        console.error(`Invalid view name: ${viewName}`);
        loadView('404/404.html');
        return;
    }

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
    // Validate against whitelist before creating script element
    if (!isValidViewName(path)) {
        console.error(`Invalid view path: ${path}`);
        return;
    }

    const scriptId = `view-script-${path}`;

    // Check if script is already loaded
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
        // Script already loaded, just call the function
        if (path === '404') {
            if (window.notfound) {
                window.notfound();
            } else {
                console.error(`Function notfound not found in already loaded script`);
            }
        } else if (window[path]) {
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
        // Special handling for 404 since "404" is not a valid function name
        if (path === '404') {
            if (window.notfound) {
                window.notfound();
            } else {
                console.error(`Function notfound not found for path ${path}`);
            }
        } else if (window[path]) {
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
        // Wait for view HTML to be injected, then load scripts and re-init components
        const waitForView = setInterval(() => {
            const container = document.querySelector('#view-container');
            if (container && container.innerHTML.trim() !== '') {
                clearInterval(waitForView);
                loadViewScript(path);
                if (window.initiate) {
                    window.initiate();
                }
            }
        }, 50);
        // Safety timeout to prevent infinite polling
        setTimeout(() => clearInterval(waitForView), 5000);
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
// Only initialize SPA routing if not in static build context
if (!document.querySelector('meta[name="static-build"]')) {
    router();

    // Listen for browser back/forward buttons
    window.addEventListener('popstate', router);

    // Intercept link clicks for SPA navigation
    document.addEventListener('click', handleLinkClick);
}

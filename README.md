# Dissent.js

## Introduction

Dissent.js is a JavaScript library that allows you to easily create reusable components for your website or web application. It uses Yarn as its package manager, Sass for styling, and Webpack to bundle everything together. This README file will provide you with the instructions you need to get started with Dissent.js.

## Installation

1. Clone the repository to your local machine
2. Navigate to the root folder of the project in your terminal
3. Run `yarn install` to install all the necessary dependencies

During the installation process, you'll be prompted to choose between JavaScript (the original implementation) or TypeScript support. Choose based on your preference - TypeScript will add type checking and modern language features to your components.

## Usage

### Starting the local development server

To start the local development server, run the following command:

yarn start

This will launch the server and automatically open the application in your default browser. Any changes you make to the code will automatically trigger a browser refresh.

### Building the library for production

To build the library for production, run the following command:

yarn build

This will create a `dist` folder in the root of your project that contains all the necessary files for deployment as a dynamic single-page application with clean URLs (e.g., `/home`, `/about` instead of `/#home`, `/#about`).

**Clean URL Routing:**

- Uses History API instead of hash-based routing
- Clean URLs like `yoursite.com/home`, `yoursite.com/about`
- Automatic redirect from root URL (`/`) to `/home`
- Browser back/forward button support
- **Server Configuration for Clean URLs:**

For clean URL routing to work, your server must serve `index.html` for all routes. Here are examples for common hosting platforms:

- **Apache (.htaccess):**

  ```apache
  <IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
  </IfModule>
  ```

- **Nginx:**

  ```nginx
  server {
    listen 80;
    server_name yoursite.com;
    root /path/to/dist;
    index index.html;

    location / {
      try_files $uri $uri/ /index.html;
    }
  }
  ```

- **Netlify/Vercel:** No configuration needed - handled automatically
- **GitHub Pages:** Automatic support included (uses `404.html` redirect)

### Building static HTML pages for SEO

For better search engine optimization, you can build static HTML pages:

yarn build-static

This generates individual HTML files for each view (e.g., `home.html`, `about.html`) with content pre-rendered, making them SEO-friendly while maintaining the component architecture. Each page includes unique meta tags, full HTML content that's immediately available to search engines, and minified HTML for optimal performance.

**Asset Behavior:**

- When run independently: Creates minimal CSS and JS assets for basic styling and functionality
- When run after `yarn build`: Uses the full compiled assets from the regular build for complete functionality
- The static build always creates a clean dist folder with only the necessary files for deployment

### Creating a new component

To create a new component, run the following command in your terminal:

`yarn create-component <component-name>`

Replace `component-name` with the name of your new component. This will create a new folder in the `src/components` directory with the name of your component, and it will include an HTML file, a JavaScript file, and a Sass file. You can then import your new component into your project and use it like any other component, using:

`<div class="component-name"></div>`

### Creating a view

`yarn create-view <view-name>`

The import it with

`<div class="view-name"></div>`

To add a view to the navigation/menu, use this

`yarn create-nav`

and the view will be added to the navigation/menu in the header

### Testing

'yarn jest`

although the intention is to make Dissent.js agnostic, Jest hass been added as a kickstarter to add testing. Other testing libraries will be considered later. In this version of Dissent.js, the tests are removed from the src folder and placed in the **test** folder. This is allow us ease in adding libraries as we move on.

## Conclusion

Dissent.js provides a simple and easy way to create reusable components for your web application. If you have any questions or run into any issues, feel free to open an issue on the GitHub repository.

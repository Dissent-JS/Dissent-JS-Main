# Dissent.js

## Introduction

Dissent.js is a JavaScript library that allows you to easily create reusable components for your website or web application. It uses Yarn as its package manager, Sass for styling, and Webpack to bundle everything together. This README file will provide you with the instructions you need to get started with Dissent.js.

## Installation

1. Clone the repository to your local machine
2. Navigate to the root folder of the project in your terminal
3. Run `yarn install` to install all the necessary dependencies

## Usage

### Starting the local development server

To start the local development server, run the following command:

yarn start

This will launch the server and automatically open the application in your default browser. Any changes you make to the code will automatically trigger a browser refresh.

### Building the library for production

To build the library for production, run the following command:

yarn build

This will create a `dist` folder in the root of your project that contains all the necessary files for deployment.

### Creating a new component

To create a new component, run the following command in your terminal:

yarn create-component component-name

Replace `component-name` with the name of your new component. This will create a new folder in the `src/components` directory with the name of your component, and it will include an HTML file, a JavaScript file, and a Sass file. You can then import your new component into your project and use it like any other component, using:

`<div class="component-name"></div>`

### Creating a view

`yarn create-view <view-name>`

The import it with

`<div class="view-name"></div>`

## Conclusion

Dissent.js provides a simple and easy way to create reusable components for your website or web application. By following the instructions provided in this README file, you should be able to get up and running with Dissent.js in no time. If you have any questions or run into any issues, feel free to open an issue on the GitHub repository.

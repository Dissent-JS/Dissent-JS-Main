const { input, select } = require('@inquirer/prompts');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function setup() {
    console.log('Welcome to Dissent.js setup!');
    console.log('This will configure your project with your preferred language.\n');

    const language = await select({
        message: 'Choose your preferred language:',
        choices: [
            { name: 'JavaScript (as Dissent.js was intended)', value: 'js' },
            { name: 'TypeScript', value: 'ts' }
        ],
        default: 'js'
    });

    if (language === 'ts') {
        console.log('\nSetting up TypeScript support...');
        // Add TypeScript dependencies
        const tsDeps = ['typescript', 'ts-loader', '@types/node'];
        console.log(`Installing TypeScript dependencies: ${tsDeps.join(', ')}`);
        try {
            execSync(`yarn add --dev ${tsDeps.join(' ')}`, { stdio: 'inherit' });
            console.log('TypeScript dependencies installed successfully.');
        } catch (error) {
            console.error('Failed to install TypeScript dependencies:', error.message);
            return;
        }

        // Create tsconfig.json
        const tsconfig = {
            "compilerOptions": {
                "target": "es2018",
                "module": "esnext",
                "lib": ["dom", "es6", "es2017", "esnext.asynciterable"],
                "allowJs": true,
                "skipLibCheck": true,
                "esModuleInterop": true,
                "allowSyntheticDefaultImports": true,
                "strict": true,
                "forceConsistentCasingInFileNames": true,
                "moduleResolution": "node",
                "resolveJsonModule": true,
                "isolatedModules": true,
                "noEmit": true,
                "jsx": "react-jsx"
            },
            "include": [
                "src"
            ]
        };

        fs.writeFileSync(path.join(process.cwd(), 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
        console.log('Created tsconfig.json');

        // Rename index.js to index.ts if it exists
        const indexJsPath = path.join(process.cwd(), 'src', 'index.js');
        const indexTsPath = path.join(process.cwd(), 'src', 'index.ts');
        if (fs.existsSync(indexJsPath) && !fs.existsSync(indexTsPath)) {
            fs.renameSync(indexJsPath, indexTsPath);
            console.log('Renamed src/index.js to src/index.ts');
        }

        // Update webpack.config.js to include ts-loader
        // This would require reading and modifying the webpack config
        console.log('TypeScript setup complete!');
    } else {
        console.log('\nUsing JavaScript as intended. No additional setup needed.');
    }

    console.log('\nSetup complete! You can now run your Dissent.js project.');
}

setup().catch(console.error);

// generate.js
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const moduleName = args[0];

if (!moduleName) {
    console.error('❌ Error: Debes proporcionar un nombre de módulo');
    console.log('📖 Uso: node generate.js <nombre-modulo>');
    process.exit(1);
}

const pascalCase = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
const camelCase = moduleName.charAt(0).toLowerCase() + moduleName.slice(1);
const kebabCase = moduleName.toLowerCase();

// Directorios
const controllersDir = './src/controllers';
const routesDir = './src/routes';
const servicesDir = './src/services';

// Crear directorios si no existen
[controllersDir, routesDir, servicesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// ✅ Controller vacío con imports
const controllerTemplate = `import { Request, Response } from 'express';
import { ${pascalCase}Service } from '../services/${kebabCase}.service';

export class ${pascalCase}Controller {
    private ${camelCase}Service: ${pascalCase}Service;

    constructor() {
        this.${camelCase}Service = new ${pascalCase}Service();
    }

    // TODO: Add your controller methods here
}
`;

// ✅ Service vacío
const serviceTemplate = `export class ${pascalCase}Service {
    // TODO: Add your service methods here
}
`;

// ✅ Routes vacío con imports
const routesTemplate = `import { Router } from 'express';
import { ${pascalCase}Controller } from '../controllers/${kebabCase}.controller';

const router = Router();
const ${camelCase}Controller = new ${pascalCase}Controller();

// TODO: Add your routes here

export default router;
`;

// ✅ Generar archivos
try {
    fs.writeFileSync(path.join(controllersDir, `${kebabCase}.controller.ts`), controllerTemplate);
    fs.writeFileSync(path.join(servicesDir, `${kebabCase}.service.ts`), serviceTemplate);
    fs.writeFileSync(path.join(routesDir, `${kebabCase}.routes.ts`), routesTemplate);

    console.log(`✅ Archivos generados para módulo '${moduleName}':`);
    console.log(`   📁 ${controllersDir}/${kebabCase}.controller.ts`);
    console.log(`   📁 ${servicesDir}/${kebabCase}.service.ts`);
    console.log(`   📁 ${routesDir}/${kebabCase}.routes.ts`);
} catch (error) {
    console.error('❌ Error:', error);
}
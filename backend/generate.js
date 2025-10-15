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
const entityDir = './src/entities';

// Crear directorios si no existen
[controllersDir, routesDir, servicesDir, entityDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Controller vacío con imports
const controllerTemplate = `import { Request, Response } from 'express';
import { GenResponse } from './genResponse';
import { ${pascalCase}Service } from '../services/${camelCase}.service';

export class ${pascalCase}Controller {
}
`;

const serviceTemplate = `import { DB } from '../config/typeorm';
import { ${pascalCase} } from '../entities/${camelCase}.entity';

export class ${pascalCase}Service {
}
`;

const routesTemplate = `import { Router } from 'express';
import { ${pascalCase}Controller } from '../controllers/${camelCase}.controller';

const router = Router();

export default router;
`;

const entityTemplate = `import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: "${kebabCase}" })
export class ${pascalCase} {
    @PrimaryGeneratedColumn({ name: "id" })
    id!: number;

}
`

try {
    fs.writeFileSync(path.join(controllersDir, `${camelCase}.controller.ts`), controllerTemplate);
    fs.writeFileSync(path.join(servicesDir, `${camelCase}.service.ts`), serviceTemplate);
    fs.writeFileSync(path.join(routesDir, `${camelCase}.routes.ts`), routesTemplate);
    fs.writeFileSync(path.join(entityDir, `${camelCase}.entity.ts`), entityTemplate);

    console.log(`Archivos generados para módulo '${moduleName}':`);
    console.log(`${controllersDir}/${camelCase}.controller.ts`);
    console.log(`${servicesDir}/${camelCase}.service.ts`);
    console.log(`${routesDir}/${camelCase}.routes.ts`);
    console.log(`${entityDir}/${camelCase}.entity.ts`);
} catch (error) {
    console.error('Error:', error);
}
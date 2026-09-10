const fs = require('fs');
let code = fs.readFileSync('src/components/ui/CrudTable.tsx', 'utf8');

const loaderImport = `import { Loader } from './Loader';`;
code = code.replace("import { Button }", `${loaderImport}\nimport { Button }`);

const oldLoaderBlock = `<div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>`;
const newLoaderBlock = `<div className="flex items-center justify-center min-h-[400px]">
          <Loader />
        </div>`;

code = code.replace(oldLoaderBlock, newLoaderBlock);
fs.writeFileSync('src/components/ui/CrudTable.tsx', code);

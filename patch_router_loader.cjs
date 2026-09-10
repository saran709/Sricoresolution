const fs = require('fs');
let code = fs.readFileSync('src/router.tsx', 'utf8');

// Replace local PageLoader definition
const oldLoader = `const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
  </div>
);`;

// Add import for PageLoader
const importToAdd = `import { PageLoader } from './components/ui/Loader';`;

code = code.replace(oldLoader, importToAdd);

fs.writeFileSync('src/router.tsx', code);

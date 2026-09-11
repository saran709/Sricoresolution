const fs = require('fs');
let r = fs.readFileSync('src/App.tsx', 'utf8');

r = r.replace("import { AuthProvider } from './contexts/AuthContext';", "import { AuthProvider } from './contexts/AuthContext';\nimport { ErrorBoundary } from './components/ui/ErrorBoundary';");
r = r.replace(/<AuthProvider>/g, "<ErrorBoundary>\n    <AuthProvider>");
r = r.replace(/<\/AuthProvider>/g, "</AuthProvider>\n    </ErrorBoundary>");

fs.writeFileSync('src/App.tsx', r);

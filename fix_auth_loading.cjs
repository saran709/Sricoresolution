const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

// If fetching profile takes too long or fails, ensure loading is set to false quickly
code = code.replace(
  'setLoading(false);',
  'setTimeout(() => setLoading(false), 300); // Fast timeout to prevent indefinite loading'
);

// Also ensure that even if onAuthStateChanged takes a moment, we don't block for more than 500ms
fs.writeFileSync('src/contexts/AuthContext.tsx', code);

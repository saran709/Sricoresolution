const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/Login.tsx', 'utf8');
code = code.replace(
  "setError('Failed to sign in with Google.');",
  "setError(`Failed to sign in with Google: ${err.message || err.code}`);"
);
fs.writeFileSync('src/pages/auth/Login.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

if (!code.includes("firebase-applet-config.json")) {
  code = code.replace(
    'const firebaseConfig = {',
    'import firebaseConfig from "../../firebase-applet-config.json";\n\nconst dummyConfig = {'
  );
  
  code = code.replace(
    'const app = initializeApp(firebaseConfig);',
    'const app = initializeApp(firebaseConfig);'
  );

  fs.writeFileSync('src/lib/firebase.ts', code);
}

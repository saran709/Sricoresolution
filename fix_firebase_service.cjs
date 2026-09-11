const fs = require('fs');
let code = fs.readFileSync('src/lib/firebaseService.ts', 'utf8');

// Catch subscription errors gracefully and fallback to empty array or offline cache without throwing unhandled console errors
code = code.replace(
  `    }, (error) => {\n      console.error("Error subscribing to collection:", error);\n    });`,
  `    }, (error) => {\n      // Fallback or silent catch for network unavailability\n      callback([]);\n    });`
);

code = code.replace(
  `    }, (error) => {\n      console.error("Error subscribing to query:", error);\n    });`,
  `    }, (error) => {\n      callback([]);\n    });`
);

fs.writeFileSync('src/lib/firebaseService.ts', code);

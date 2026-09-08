const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

code = code.replace(
  "import { auth, db } from '../lib/firebase';",
  "import { auth, db } from '../lib/firebase';\nimport { setCachedAccessToken, getIsSigningIn, getCachedAccessToken } from '../lib/auth';"
);

code = code.replace(
  "const [loading, setLoading] = useState(true);",
  "const [loading, setLoading] = useState(true);\n  const [accessToken, setAccessToken] = useState<string | null>(null);"
);

code = code.replace(
  "if (user) {",
  "if (user) {\n        const currentToken = getCachedAccessToken();\n        if (currentToken) {\n          setAccessToken(currentToken);\n        } else if (!getIsSigningIn()) {\n          setCachedAccessToken(null);\n          setAccessToken(null);\n        }\n"
);

code = code.replace(
  "setUserProfile(null);\n      }",
  "setUserProfile(null);\n        setCachedAccessToken(null);\n        setAccessToken(null);\n      }"
);

code = code.replace(
  "interface AuthContextType {",
  "interface AuthContextType {\n  accessToken: string | null;"
);

code = code.replace(
  "isAdmin: false,\n});",
  "isAdmin: false,\n  accessToken: null,\n});"
);

code = code.replace(
  "const value = {",
  "const value = {\n    accessToken,"
);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);

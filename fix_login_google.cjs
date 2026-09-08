const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/Login.tsx', 'utf8');

code = code.replace(
  "import { googleSignIn } from '../../lib/auth';\nimport { auth } from '../../lib/firebase';",
  "import { googleSignIn } from '../../lib/auth';\nimport { auth, db } from '../../lib/firebase';\nimport { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';"
);

const newGoogleSignIn = `
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await googleSignIn();
      if (result?.user) {
        // Create user profile if it doesn't exist
        const userRef = doc(db, 'users', result.user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: result.user.email,
            firstName: result.user.displayName?.split(' ')[0] || '',
            lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
            role: 'CANDIDATE', // default role
            createdAt: serverTimestamp(),
            status: 'active'
          });
        }
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError('Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };
`;

code = code.replace(
  /const handleGoogleSignIn = async \(\) => \{[\s\S]*?^\s*};\n/m,
  newGoogleSignIn + "\n"
);

fs.writeFileSync('src/pages/auth/Login.tsx', code);

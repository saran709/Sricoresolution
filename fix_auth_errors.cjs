const fs = require('fs');

function mapAuthError(errCode, defaultMessage) {
  if (errCode === 'auth/operation-not-allowed') return 'Email/Password sign-in is not enabled in Firebase. Please enable it in the Firebase Console under Authentication > Sign-in method.';
  if (errCode === 'auth/weak-password') return 'Your password must be at least 6 characters long.';
  if (errCode === 'auth/email-already-in-use') return 'An account already exists with this email.';
  if (errCode === 'auth/invalid-credential' || errCode === 'auth/wrong-password' || errCode === 'auth/user-not-found') return 'Incorrect email or password.';
  return defaultMessage;
}

const mapFnStr = `
function mapAuthError(err) {
  if (err.code === 'auth/operation-not-allowed') return 'Email/Password sign-in is not enabled in Firebase. Please enable it in the Firebase Console under Authentication > Sign-in method.';
  if (err.code === 'auth/weak-password') return 'Your password must be at least 6 characters long.';
  if (err.code === 'auth/email-already-in-use') return 'An account already exists with this email.';
  if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') return 'Incorrect email or password.';
  return err.message || 'An error occurred';
}
`;

let registerCode = fs.readFileSync('src/pages/auth/Register.tsx', 'utf8');
registerCode = registerCode.replace('export default function Register', mapFnStr + '\nexport default function Register');
registerCode = registerCode.replace("setError(err.message || 'Failed to create an account');", "setError(mapAuthError(err));");
fs.writeFileSync('src/pages/auth/Register.tsx', registerCode);

let loginCode = fs.readFileSync('src/pages/auth/Login.tsx', 'utf8');
loginCode = loginCode.replace('export default function Login', mapFnStr + '\nexport default function Login');
loginCode = loginCode.replace("setError('Failed to log in. Please check your credentials.');", "setError(mapAuthError(err));");
loginCode = loginCode.replace("setError(\`Failed to sign in with Google: ${err.message || err.code}\`);", "setError(mapAuthError(err));");
fs.writeFileSync('src/pages/auth/Login.tsx', loginCode);

import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth } from './firebase';

const provider = new GoogleAuthProvider();

// Request Workspace scopes
provider.addScope('https://mail.google.com/');
provider.addScope('https://www.googleapis.com/auth/gmail.addons.current.action.compose');
provider.addScope('https://www.googleapis.com/auth/gmail.addons.current.message.action');
provider.addScope('https://www.googleapis.com/auth/gmail.addons.current.message.metadata');
provider.addScope('https://www.googleapis.com/auth/gmail.addons.current.message.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.compose');
provider.addScope('https://www.googleapis.com/auth/gmail.insert');
provider.addScope('https://www.googleapis.com/auth/gmail.labels');
provider.addScope('https://www.googleapis.com/auth/gmail.metadata');
provider.addScope('https://www.googleapis.com/auth/gmail.modify');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.settings.basic');
provider.addScope('https://www.googleapis.com/auth/gmail.settings.sharing');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const getCachedAccessToken = () => cachedAccessToken;

export const setIsSigningIn = (value: boolean) => {
  isSigningIn = value;
};

export const getIsSigningIn = () => isSigningIn;

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

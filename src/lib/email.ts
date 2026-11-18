import { auth } from './firebase';

export const sendEmailNotification = async (to: string, subject: string, html: string) => {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        if (token) headers.Authorization = `Bearer ${token}`;
      } catch {
        // Proceed without token for public endpoints
      }
    }

    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({ to, subject, html }),
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error triggering email via API:', error);
    return false;
  }
};

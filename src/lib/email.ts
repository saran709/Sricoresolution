export const sendEmailNotification = async (to: string, subject: string, html: string) => {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });
    
    if (!response.ok) {
      console.error("Failed to send email API");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error triggering email via API:", error);
    return false;
  }
};

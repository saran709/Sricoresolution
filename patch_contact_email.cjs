const fs = require('fs');
let code = fs.readFileSync('src/pages/Contact.tsx', 'utf8');

const apiCall = `
      await firebaseService.create('enquiries', payload);
      
      try {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: payload.email,
            subject: 'Thank you for contacting Sricore Solutions',
            html: \`
              <h3>Message Received</h3>
              <p>Dear \${payload.firstName},</p>
              <p>Thank you for reaching out. We have received your message regarding "<strong>\${payload.serviceInterest}</strong>".</p>
              <p>One of our team members will respond to your query shortly.</p>
              <br/>
              <p>Best Regards,</p>
              <p>Sricore Solutions Team</p>
            \`
          })
        });
      } catch (e) {
        console.error('Failed to send confirmation email', e);
      }
      
      setIsSuccess(true);
`;

code = code.replace(/await firebaseService\.create\('enquiries', payload\);\s*setIsSuccess\(true\);/m, apiCall);
fs.writeFileSync('src/pages/Contact.tsx', code);

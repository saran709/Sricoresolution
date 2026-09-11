const fs = require('fs');
let code = fs.readFileSync('src/pages/Enquiry.tsx', 'utf8');

const apiCall = `
      await firebaseService.create('enquiries', data);
      
      // Send confirmation email via backend API
      try {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: data.email,
            subject: 'Project Enquiry Received - Sricore Solutions',
            html: \`
              <h3>Thank you for your enquiry!</h3>
              <p>Dear \${data.firstName},</p>
              <p>We have successfully received your project enquiry.</p>
              <p>Our sales and engineering team will review your requirements and get back to you within 24-48 business hours.</p>
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

code = code.replace(/await firebaseService\.create\('enquiries', data\);\s*setIsSuccess\(true\);/m, apiCall);
fs.writeFileSync('src/pages/Enquiry.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/TellUsYourProblem.tsx', 'utf8');

const apiCall = `
      await firebaseService.create('solutionRequests', payload);
      
      // Send confirmation email via backend API
      try {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: payload.email,
            subject: 'Solution Request Received - Sricore Solutions',
            html: \`
              <h3>Thank you for reaching out to Sricore Solutions!</h3>
              <p>Dear \${payload.name},</p>
              <p>We have successfully received your problem/solution request regarding <strong>\${payload.serviceCategory}</strong>.</p>
              <p>Our engineering team will review your requirements and get back to you shortly to schedule a discovery call.</p>
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

code = code.replace(/await firebaseService\.create\('solutionRequests', payload\);\s*setIsSuccess\(true\);/m, apiCall);
fs.writeFileSync('src/pages/TellUsYourProblem.tsx', code);

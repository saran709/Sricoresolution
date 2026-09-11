const fs = require('fs');
let code = fs.readFileSync('src/pages/InternshipRegistration.tsx', 'utf8');

const apiCall = `
      await firebaseService.create('internship_applications', data);
      
      // Send confirmation email via backend API
      try {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: data.email,
            subject: 'Internship Application Received - Sricore Solutions',
            html: \`
              <h3>Application Received</h3>
              <p>Dear \${data.firstName},</p>
              <p>Your application for the <strong>\${data.programTitle}</strong> internship program has been successfully submitted.</p>
              <p>Your application ID is: <strong>\${id}</strong></p>
              <p>Our technical team will review your profile and reach out to you with the next steps.</p>
              <br/>
              <p>Best Regards,</p>
              <p>Sricore Solutions HR Team</p>
            \`
          })
        });
      } catch (e) {
        console.error('Failed to send confirmation email', e);
      }
      
      setApplicationId(id);
`;

code = code.replace(/await firebaseService\.create\('internship_applications', data\);\s*setApplicationId\(id\);/m, apiCall);
fs.writeFileSync('src/pages/InternshipRegistration.tsx', code);

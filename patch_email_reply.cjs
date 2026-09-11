const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Enquiries.tsx', 'utf8');

const oldHandleSendReply = `const handleSendReply = async () => {
    if (!selectedEnquiry?.email) return;
    window.location.href = \`mailto:\${selectedEnquiry?.email}?subject=\${encodeURIComponent(replySubject)}&body=\${encodeURIComponent(replyBody)}\`;
    setReplyModalOpen(false);
  };`;

const newHandleSendReply = `const handleSendReply = async () => {
    if (!selectedEnquiry?.email) return;
    setSendingEmail(true);
    setEmailError('');
    setEmailSuccess('');
    
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedEnquiry.email,
          subject: replySubject,
          html: replyBody.replace(/\\n/g, '<br/>')
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }
      
      setEmailSuccess('Email sent successfully!');
      
      // Update status to CONTACTED if it was NEW
      if (selectedEnquiry.status === 'NEW') {
        handleStatusChange(selectedEnquiry.id!, 'CONTACTED');
      }
      
      setTimeout(() => {
        setReplyModalOpen(false);
        setEmailSuccess('');
        setReplyBody('');
        setReplySubject('');
      }, 2000);
      
    } catch (error: any) {
      console.error(error);
      setEmailError(error.message || 'Failed to send email. Please check server configuration.');
    } finally {
      setSendingEmail(false);
    }
  };`;

// Because the regex might fail with whitespace variations, I'll use a regex that matches the function block:
code = code.replace(/const handleSendReply = async \(\) => {[\s\S]*?setReplyModalOpen\(false\);\n  };/, newHandleSendReply);

// Let's also update the text to say "sent via Sricore Server" instead of "Google Workspace" to reflect the actual SMTP.
code = code.replace(/This email will be sent directly from your connected Google Workspace account\./g, 'This email will be sent securely via the Sricore mail server.');
code = code.replace(/Reply via Gmail/g, 'Reply to Enquiry');

fs.writeFileSync('src/pages/admin/Enquiries.tsx', code);

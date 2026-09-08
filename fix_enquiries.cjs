const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Enquiries.tsx', 'utf8');

code = code.replace(
  "import { useNavigate } from 'react-router-dom';",
  "import { useNavigate } from 'react-router-dom';\nimport { Mail, X } from 'lucide-react';\nimport { getCachedAccessToken } from '../../lib/auth';\nimport { sendGmailMessage } from '../../lib/gmailApi';\nimport { Input } from '../../components/ui/Input';\nimport { Textarea } from '../../components/ui/Textarea';"
);

code = code.replace(
  "const [searchTerm, setSearchTerm] = useState('');",
  "const [searchTerm, setSearchTerm] = useState('');\n  const [replyModalOpen, setReplyModalOpen] = useState(false);\n  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);\n  const [replySubject, setReplySubject] = useState('');\n  const [replyBody, setReplyBody] = useState('');\n  const [sendingEmail, setSendingEmail] = useState(false);\n  const [emailSuccess, setEmailSuccess] = useState('');\n  const [emailError, setEmailError] = useState('');"
);

const replyHandler = `
  const openReplyModal = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setReplySubject(\`Re: Your enquiry regarding \${enq.serviceInterest || 'our services'}\`);
    setReplyBody(\`Hi \${enq.firstName},\\n\\nThank you for reaching out to us. We have received your enquiry regarding \${enq.projectDetails ? 'your project' : 'our services'}.\\n\\n\\n\\nBest regards,\\n\${userProfile?.firstName || 'Our Team'}\`);
    setReplyModalOpen(true);
    setEmailSuccess('');
    setEmailError('');
  };

  const handleSendReply = async () => {
    if (!selectedEnquiry?.email) return;
    
    const token = getCachedAccessToken();
    if (!token) {
      if (window.confirm("You need to sign in with Google to send emails via Gmail. Please log out and sign in with Google.")) {
        // Just show error for now
      }
      setEmailError('Gmail access token not found. You must be signed in with Google.');
      return;
    }

    setSendingEmail(true);
    setEmailError('');
    setEmailSuccess('');

    try {
      // Confirm before sending
      if (!window.confirm(\`Are you sure you want to send this email to \${selectedEnquiry.email}?\`)) {
        setSendingEmail(false);
        return;
      }
      
      const htmlBody = replyBody.replace(/\\n/g, '<br/>');
      await sendGmailMessage(token, selectedEnquiry.email, replySubject, htmlBody);
      setEmailSuccess('Email sent successfully!');
      
      // Update status to contacted
      if (selectedEnquiry.status === 'NEW') {
        await handleStatusChange(selectedEnquiry.id!, 'CONTACTED');
      }
      
      setTimeout(() => {
        setReplyModalOpen(false);
      }, 2000);
    } catch (err: any) {
      setEmailError(err.message || 'Failed to send email.');
    } finally {
      setSendingEmail(false);
    }
  };
`;

code = code.replace(
  "useEffect(() => {",
  replyHandler + "\n  useEffect(() => {"
);

const replyButton = `
                      <Button
                        onClick={() => openReplyModal(enq)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        title="Reply via Gmail"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </Button>
`;

code = code.replace(
  "<select \n                        value={enq.status}",
  replyButton + "\n                      <select \n                        value={enq.status}"
);

const replyModal = `
      {replyModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Reply via Gmail
              </h2>
              <button onClick={() => setReplyModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {emailError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                  {emailError}
                </div>
              )}
              {emailSuccess && (
                <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">
                  {emailSuccess}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-600">
                  {selectedEnquiry.firstName} {selectedEnquiry.lastName} &lt;{selectedEnquiry.email}&gt;
                </div>
              </div>
              
              <Input
                label="Subject"
                value={replySubject}
                onChange={e => setReplySubject(e.target.value)}
                placeholder="Email Subject"
              />
              
              <Textarea
                label="Message Body"
                value={replyBody}
                onChange={e => setReplyBody(e.target.value)}
                rows={10}
                className="font-sans"
              />
              <p className="text-xs text-slate-500">
                This email will be sent directly from your connected Google Workspace account.
              </p>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
              <Button variant="outline" onClick={() => setReplyModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendReply} isLoading={sendingEmail} className="bg-blue-600 hover:bg-blue-700">
                Send Email
              </Button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  "</div>\n  );\n}",
  "</div>\n" + replyModal + "\n  );\n}"
);

fs.writeFileSync('src/pages/admin/Enquiries.tsx', code);

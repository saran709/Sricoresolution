const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `    const info = await transporter.sendMail({
      from: \`"Sricore Solutions" <\${process.env.SMTP_USER}>\`,
      to,
      subject,
      html,
    });
    res.json({ status: "success", messageId: info.messageId });`;

const newCode = `    transporter.sendMail({
      from: \`"Sricore Solutions" <\${process.env.SMTP_USER}>\`,
      to,
      subject,
      html,
    }).catch(e => console.error("Async email error:", e));
    res.json({ status: "success", message: "Email queued" });`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);

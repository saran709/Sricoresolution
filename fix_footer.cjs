const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');

code = code.replace(
  "import { APP_CONFIG } from '../../config';",
  "import { APP_CONFIG } from '../../config';\nimport { NewsletterSignup } from '../NewsletterSignup';"
);

// We'll change grid-cols-1 md:grid-cols-2 lg:grid-cols-4
// To lg:grid-cols-5 
code = code.replace(
  "className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12\"",
  "className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12\""
);

// Insert Newsletter Signup column at the end
const contactInfoCol = `          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <address className="not-italic space-y-2 text-sm">
              <p>{APP_CONFIG.company.contact.address}</p>
              <p>
                <a href={\`mailto:\${APP_CONFIG.company.contact.email}\`} className="hover:text-white transition-colors">
                  {APP_CONFIG.company.contact.email}
                </a>
              </p>
            </address>
          </div>
          
          {/* Newsletter */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
              <NewsletterSignup className="max-w-none text-slate-300" />
            </div>
          </div>
`;

code = code.replace(
  /\{\/\* Contact Info \*\/\}[\s\S]*?<\/div>\n        <\/div>/m,
  contactInfoCol + "\n        </div>"
);

fs.writeFileSync('src/components/layout/Footer.tsx', code);

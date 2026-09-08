const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

code = code.replace(/<Link[\s\n]*to="\/enquiry"[\s\n]*className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"[\s\n]*>[\s\n]*Get a Project Quote[\s\n]*<\/Link>/g, 
  `<Link 
              to="/tell-us-your-problem" 
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Tell Us Your Problem
            </Link>`);
            
code = code.replace(/<Link[\s\n]*to="\/enquiry"[\s\n]*onClick=\{closeMobileMenu\}[\s\n]*className="block w-full text-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"[\s\n]*>[\s\n]*Get a Project Quote[\s\n]*<\/Link>/g, 
  `<Link
                to="/tell-us-your-problem"
                onClick={closeMobileMenu}
                className="block w-full text-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Tell Us Your Problem
              </Link>`);

fs.writeFileSync('src/components/layout/Navbar.tsx', code);

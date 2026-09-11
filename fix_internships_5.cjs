const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Internships.tsx', 'utf8');

const targetStr = `      }));
      setApplications(items);

  };`;

const newStr = `      }));
      setApplications(items);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
  };`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/pages/admin/Internships.tsx', code);

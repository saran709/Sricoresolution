const fs = require('fs');
let code = fs.readFileSync('src/router.tsx', 'utf8');

code = code.replace(
  "import { BrowserRouter, Routes, Route } from 'react-router-dom';",
  "import { BrowserRouter, Routes, Route } from 'react-router-dom';\nimport { ScrollToTop } from './components/ScrollToTop';"
);

code = code.replace(
  "<BrowserRouter>\n      <Suspense fallback={<PageLoader />}>",
  "<BrowserRouter>\n      <ScrollToTop />\n      <Suspense fallback={<PageLoader />}>"
);

fs.writeFileSync('src/router.tsx', code);

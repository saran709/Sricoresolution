const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  const content = await page.content();
  console.log("Includes 'Login': ", content.includes('Login'));
  console.log("Includes 'Sign In': ", content.includes('Sign In'));
  console.log("Includes 'Dashboard': ", content.includes('Dashboard'));
  await browser.close();
})();

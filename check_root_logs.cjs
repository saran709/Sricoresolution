const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));

  console.log('Navigating...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  console.log('Navigated. Waiting 5 seconds...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  await page.screenshot({path: 'screenshot_root.png'});
  console.log('Done.');
  
  await browser.close();
})();

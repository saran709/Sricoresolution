const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  console.log('Navigating...');
  await page.goto('https://ais-dev-uw3xgq6ujkfwotkj4hoeeb-161047103982.asia-east1.run.app', { waitUntil: 'networkidle0', timeout: 30000 });
  console.log('Navigated. Waiting 5 seconds...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log('--- BODY TEXT START ---');
  console.log(text.substring(0, 1000));
  console.log('--- BODY TEXT END ---');
  
  await browser.close();
})();

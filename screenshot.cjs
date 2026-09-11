const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 2000));
  await page.screenshot({path: 'home_desktop.png'});
  
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 2000));
  await page.screenshot({path: 'home_mobile.png'});
  
  console.log("Screenshots taken.");
  await browser.close();
})();

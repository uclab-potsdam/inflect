#!/usr/bin/env node
const puppeteer = require('puppeteer');

(async ()=>{
  const url = process.env.TEST_URL || 'http://localhost:8000/';
  const browser = await puppeteer.launch({headless: 'new'});
  const page = await browser.newPage();
  page.setDefaultTimeout(10000);
  try{
    console.log('Visiting', url);
    await page.goto(url, {waitUntil: 'networkidle2'});
    // wait up to 4s for main .pin to exist in DOM
    const pin = await page.waitForSelector('main .pin', {timeout: 4000});
    if(!pin){ throw new Error('No .pin element found'); }
    // check if it's in viewport
    const visible = await page.evaluate(() => {
      const el = document.querySelector('main .pin');
      if(!el) return false;
      const r = el.getBoundingClientRect();
      return (r.top >= 0 && r.bottom <= (window.innerHeight || document.documentElement.clientHeight));
    });
    if(visible){
      console.log('SUCCESS: .pin is present and within viewport');
      await browser.close(); process.exit(0);
    } else {
      // attempt to wait a bit for potential scroll effects
      await page.waitForTimeout(800);
      const visible2 = await page.evaluate(() => {
        const el = document.querySelector('main .pin');
        if(!el) return false;
        const r = el.getBoundingClientRect();
        return (r.top >= 0 && r.bottom <= (window.innerHeight || document.documentElement.clientHeight));
      });
      if(visible2){ console.log('SUCCESS (delayed): .pin in viewport'); await browser.close(); process.exit(0); }
      throw new Error('.pin not in viewport after wait');
    }
  }catch(err){
    console.error('TEST FAILED:', err && err.message || err);
    await browser.close(); process.exit(2);
  }
})();

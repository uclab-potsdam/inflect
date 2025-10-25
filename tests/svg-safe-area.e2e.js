/*
E2E test for SVG safe-area coordinate system.
Assumes a static server is running at http://localhost:8000
Run with: npm run test:svg
*/

const puppeteer = require('puppeteer');

const BASE = 'http://localhost:8000/svg/#';
const FILE = 'opening.svg';
const EPS = 2; // px tolerance

const viewports = [
  { width: 1200, height: 800 },
  { width: 900, height: 1200 },
  { width: 1440, height: 900 }
];

async function waitReady(page){
  await page.waitForFunction('window.viewerReady === true', { timeout: 10000 });
}

async function getRects(page){
  return page.evaluate(() => {
    const rf = document.getElementById('referenceFrame');
    const svg = document.querySelector('#svgContainer > svg');
    const r = rf.getBoundingClientRect();
    const s = svg.getBoundingClientRect();
    return {
      ref: { left: r.left, top: r.top, width: r.width, height: r.height, cx: r.left + r.width/2, cy: r.top + r.height/2 },
      svg: { left: s.left, top: s.top, width: s.width, height: s.height, cx: s.left + s.width/2, cy: s.top + s.height/2 }
    };
  });
}

function assert(cond, msg){
  if (!cond) throw new Error(msg);
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Case 1: s=1, centered; SVG must fully fit in the square and be centered
  for (const vp of viewports){
    await page.setViewport(vp);
    await page.goto(`${BASE}${FILE}/0,0,1`, { waitUntil: 'domcontentloaded' });
    await waitReady(page);
    const rects = await getRects(page);
    const { ref, svg } = rects;
    // fully contained
    assert(svg.width <= ref.width + EPS, `svg wider than frame (${svg.width} > ${ref.width}) at ${vp.width}x${vp.height}`);
    assert(svg.height <= ref.height + EPS, `svg taller than frame (${svg.height} > ${ref.height}) at ${vp.width}x${vp.height}`);
    // one side should touch (fits)
    const touchesW = Math.abs(svg.width - ref.width) <= EPS;
    const touchesH = Math.abs(svg.height - ref.height) <= EPS;
    assert(touchesW || touchesH, `neither width nor height matches frame at ${vp.width}x${vp.height}`);
    // centered
    assert(Math.abs(svg.cx - ref.cx) <= EPS, `not centered X at ${vp.width}x${vp.height}`);
    assert(Math.abs(svg.cy - ref.cy) <= EPS, `not centered Y at ${vp.width}x${vp.height}`);
  }

  // Case 2: s=1.6, pan 0.12,-0.08 (normalized units). Crop should be consistent across viewports
  const samples = [];
  for (const vp of viewports){
    await page.setViewport(vp);
    await page.goto(`${BASE}${FILE}/0.12,-0.08,1.6`, { waitUntil: 'domcontentloaded' });
    await waitReady(page);
    const rects = await getRects(page);
    samples.push({ vp, rects });
  }
  // Compare the relative crop: normalized svg rect inside frame should be equal-ish
  function toNormalized({ ref, svg }){
    return {
      w: svg.width / ref.width,
      h: svg.height / ref.height,
      cx: (svg.cx - ref.left) / ref.width,
      cy: (svg.cy - ref.top) / ref.height
    };
  }
  const norm = samples.map(s => ({ vp: s.vp, n: toNormalized(s.rects) }));
  const base = norm[0].n;
  for (let i=1;i<norm.length;i++){
    const n = norm[i].n;
    const close = (a,b)=> Math.abs(a-b) <= 0.02; // 2%
    assert(close(n.w, base.w), `width ratio differs (${n.w} vs ${base.w}) at ${norm[i].vp.width}x${norm[i].vp.height}`);
    assert(close(n.h, base.h), `height ratio differs (${n.h} vs ${base.h}) at ${norm[i].vp.width}x${norm[i].vp.height}`);
    assert(close(n.cx, base.cx), `centerX ratio differs (${n.cx} vs ${base.cx}) at ${norm[i].vp.width}x${norm[i].vp.height}`);
    assert(close(n.cy, base.cy), `centerY ratio differs (${n.cy} vs ${base.cy}) at ${norm[i].vp.width}x${norm[i].vp.height}`);
  }

  await browser.close();
  // eslint-disable-next-line no-console
  console.log('SVG safe-area E2E: PASS');
})().catch(err => {
  // eslint-disable-next-line no-console
  console.error('SVG safe-area E2E: FAIL');
  // eslint-disable-next-line no-console
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});

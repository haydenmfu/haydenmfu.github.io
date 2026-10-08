import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

// Use the installed Playwright runtime; no browser or dependency download.
const require = createRequire(import.meta.url);
const runtime = process.env.PLAYWRIGHT_MODULE || 'playwright';
const { chromium } = require(runtime);
const output = path.resolve('qa.local');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
const results = [];
const baseURL = process.env.PREVIEW_URL || 'http://127.0.0.1:5174';
for (const width of (process.env.QA_WIDTHS || '1440,1024,390,320').split(',').map(Number)) {
  const page = await browser.newPage({ viewport: { width, height: Number(process.env.QA_HEIGHT || 960) }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const view of ['desk', 'projects', 'research', 'about', 'experience', 'resume', 'contact']) {
    await page.goto(`${baseURL}/#${view === 'desk' ? '' : view}`);
    await page.locator('main').waitFor();
    await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 10000))]));
    await page.locator('img').evaluateAll(images => {
      images.forEach(img => { img.loading = 'eager'; });
      return Promise.race([Promise.all(images.map(img => img.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve, 10000))]);
    });
    const metrics = await page.evaluate(() => ({
      pageWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      brokenImages: [...document.images].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src),
      headings: [...document.querySelectorAll('h1,h2')].map(e => e.textContent),
      overflow: [...document.querySelectorAll('.about-story,.about-facts,.postcard-message,.postcard-links,.project-screen,.research-left,.research-right')].map(e => ({
        className: e.className, height: e.clientHeight, contentHeight: e.scrollHeight,
        left: e.getBoundingClientRect().left, right: e.getBoundingClientRect().right,
      })),
    }));
    results.push({ width, view, ...metrics, errors: [...errors] });
    await page.screenshot({ path: path.join(output, `${view}-${width}.png`), fullPage: true, animations: 'disabled', timeout: 20000 });
    console.log(`Checked ${view} at ${width}px`);
  }
  await page.close();
}
const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: 'reduce', permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
await page.goto(baseURL);
await page.locator('.selector-projects').focus();
await page.keyboard.press('Enter');
await page.waitForURL('**/#projects');
await page.waitForFunction(() => document.activeElement?.tagName === 'H1');
assert.equal(await page.locator('.laptop-reader').count(), 1);
assert.equal(await page.locator('.screen-project h3').first().textContent(), 'LLM Prediction Markets');
assert.equal(await page.getByRole('heading', { name: 'SASH: Search Across Six Hops' }).count(), 1);
await page.locator('.laptop-scroll').focus();
await page.keyboard.press('End');
await page.waitForFunction(() => { const e = document.querySelector('.laptop-scroll'); return e.scrollTop > 0; });
await page.keyboard.press('Escape');
await page.waitForFunction(() => document.querySelector('.desk-page') === document.activeElement);
await page.getByRole('navigation', { name: 'Desk index' }).getByRole('link', { name: 'Research', exact: true }).click();
await page.waitForURL('**/#research');
assert.match(await page.locator('.research-object').first().textContent(), /Primary research.*Linking Trajectory Drift/s);
assert.equal(await page.locator('.research-object').first().getByRole('link').getAttribute('href'), 'https://openreview.net/forum?id=UXthrIAHqX');
assert.equal(await page.locator('.research-object').count(), 1);
assert.equal(await page.locator('.research-history').count(), 0);
await page.getByRole('button', {name:'Homelessness policy'}).click();
assert.match(await page.locator('.research-object h2').textContent(), /Encampment/);
await page.getByRole('button', {name:'AI bias',exact:true}).click();
assert.match(await page.locator('.research-object h2').textContent(), /ChatGPT/);
await page.getByRole('navigation', { name: 'Content navigation' }).getByRole('link', { name: 'Experience', exact: true }).click();
await page.getByRole('button', { name: 'Work', exact: true }).click();
assert.equal(await page.evaluate(() => document.activeElement?.id), 'experience-work');
await page.getByRole('navigation', { name: 'Content navigation' }).getByRole('link', { name: 'Resume', exact: true }).click();
assert.equal(await page.getByRole('link', {name:'Download PDF'}).getAttribute('href'), '/resumes/Hayden-Fu-SWE.pdf');
await page.getByRole('button', {name:'Flip to Data Analytics'}).click();
assert.equal(await page.getByRole('link', {name:'Download PDF'}).getAttribute('href'), '/resumes/Hayden-Fu-Data-Analytics.pdf');
assert.match(await page.locator('.resume-original-sheet img').getAttribute('src'), /data-analytics/);
await page.getByRole('button', {name:'Readable text view'}).click();
assert.match(await page.locator('.resume-readable').textContent(), /PROFESSIONAL SUMMARY/);
await page.getByRole('button', {name:'Flip to Software Engineering'}).click();
assert.match(await page.locator('.resume-readable').textContent(), /OCaml Chess/);
await page.getByRole('navigation', { name: 'Content navigation' }).getByRole('link', { name: 'Contact', exact: true }).click();
await page.getByRole('button', { name: 'Copy email', exact: true }).click();
await page.getByRole('button', { name: 'Email copied', exact: true }).waitFor();
assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'haydenmfu@gmail.com');
assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
for (const file of ['Hayden-Fu-SWE.pdf','Hayden-Fu-Data-Analytics.pdf']) assert.equal((await page.request.get(`${baseURL}/resumes/${file}`)).status(), 200);
for (const name of ['projects', 'research', 'about', 'experience', 'resume', 'contact']) {
  assert.equal((await page.request.get(`${baseURL}/subpage-art/${name}.png`)).status(), 200);
}
await context.close();
await browser.close();
await writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
const issues = results.filter(r => r.documentWidth > r.width || r.brokenImages.length || r.errors.length || r.overflow.some(e => e.contentHeight > e.height + 1));
console.log(JSON.stringify({ screenshots: results.length, interactionChecks: 'passed', issues }, null, 2));
assert.equal(issues.length, 0, 'Layout issues found; inspect qa.local/results.json');

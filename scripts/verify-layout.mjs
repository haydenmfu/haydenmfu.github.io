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
    // Hash navigation runs a view transition; measure the incoming view, not the outgoing one.
    await page.waitForFunction(v => !document.documentElement.dataset.vt && document.querySelector(v === 'desk' ? '.desk-page' : `.reading-${v}`), view);
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
      offscreenTargets: innerWidth / innerHeight >= 1.4 ? [...document.querySelectorAll('a.workspace-selector')].filter(a => { const r = a.getBoundingClientRect(); return r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight; }).map(a => a.getAttribute('aria-label')) : [],
      offPage: !matchMedia('(min-width: 1000px) and (min-aspect-ratio: 13/10)').matches ? [] : [...document.querySelectorAll('.stage-viewport .about-story, .stage-viewport .about-facts')].filter(e => { const stage = e.closest('.stage').getBoundingClientRect(); return e.getBoundingClientRect().bottom > stage.top + stage.height * 0.82; }).map(e => e.className),
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
// Menus are hidden until a keyboard reaches them, so open them the way a keyboard user would.
const openFromNav = async name => { const link = page.getByRole('navigation', { name: 'Desk objects' }).getByRole('link', { name, exact: true }); await link.focus(); await page.keyboard.press('Enter'); };
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
await openFromNav('Research');
await page.waitForURL('**/#research');
assert.match(await page.locator('.research-object').first().textContent(), /Primary research.*Linking Trajectory Drift/s);
assert.equal(await page.locator('.research-object').first().getByRole('link').getAttribute('href'), 'https://openreview.net/forum?id=UXthrIAHqX');
assert.equal(await page.locator('.research-object').count(), 1);
// The book turns between papers from its page corners or the arrow keys.
assert.equal(await page.locator('.corner-prev').count(), 0);
await page.getByRole('button', { name: 'Next paper: Homelessness policy' }).click();
await page.waitForFunction(() => /Encampment/.test(document.querySelector('.research-left h2').textContent));
await page.keyboard.press('ArrowRight');
await page.waitForFunction(() => /ChatGPT/.test(document.querySelector('.research-left h2').textContent));
assert.equal(await page.locator('.corner-next').count(), 0);
assert.match(await page.locator('.page-count').textContent(), /3 \/ 3/);
await page.keyboard.press('ArrowLeft');
await page.waitForFunction(() => /Encampment/.test(document.querySelector('.research-left h2').textContent));
await openFromNav('Experience');
// One category per sheet; the corner sends the top sheet to the back of the stack.
assert.equal(await page.locator('.sheet-title').textContent(), 'Research');
await page.getByRole('button', { name: 'Next: Work' }).click();
await page.waitForFunction(() => document.querySelector('.sheet-title').textContent === 'Work');
await page.getByRole('button', { name: 'Next: Community' }).click();
await page.getByRole('button', { name: 'Next: Research' }).click();
await page.waitForFunction(() => document.querySelector('.sheet-title').textContent === 'Research');
await openFromNav('Resume');
// Two sheets: the clip downloads, the stamp opens, the lower sheet comes up when picked.
assert.equal(await page.getByRole('link', { name: 'Download the Software Engineering résumé PDF' }).getAttribute('href'), '/resumes/Hayden-Fu-SWE.pdf');
await page.getByRole('button', { name: 'Show the Data Analytics résumé' }).focus();
await page.keyboard.press('Enter');
await page.waitForFunction(() => document.querySelector('.is-top').classList.contains('sheet-analytics'));
assert.equal(await page.getByRole('link', { name: 'Download the Data Analytics résumé PDF' }).getAttribute('href'), '/resumes/Hayden-Fu-Data-Analytics.pdf');
assert.equal(await page.getByRole('link', { name: 'Open the Data Analytics résumé PDF in a new tab' }).getAttribute('target'), '_blank');
assert.match(await page.locator('.is-top img').getAttribute('src'), /data-analytics/);
await openFromNav('Contact');
// The address lines are the links; the stamp copies the email.
assert.equal(await page.locator('.postcard-links a').first().getAttribute('href'), 'mailto:haydenmfu@gmail.com');
await page.getByRole('button', { name: 'Copy email address' }).click();
await page.waitForFunction(() => document.querySelector('.postmark-ink').dataset.inked === 'true');
assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'haydenmfu@gmail.com');
assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
// Putting an object down: a clean click on the wood returns to the desk; a click on the object does not.
await page.mouse.click(720, 480);
assert.equal(await page.evaluate(() => location.hash), '#contact');
await page.mouse.click(30, 480);
await page.waitForFunction(() => location.hash === '');
await page.goto(`${baseURL}/#about`);
await page.locator('.snorlax-peek').click();
await page.waitForFunction(() => location.hash === '');
for (const file of ['Hayden-Fu-SWE.pdf','Hayden-Fu-Data-Analytics.pdf']) assert.equal((await page.request.get(`${baseURL}/resumes/${file}`)).status(), 200);
for (const name of ['projects', 'research', 'about', 'experience', 'resume', 'contact']) {
  assert.equal((await page.request.get(`${baseURL}/subpage-art/${name}.png`)).status(), 200);
}
await context.close();
await browser.close();
await writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
const issues = results.filter(r => r.documentWidth > r.width || r.offscreenTargets.length || r.offPage.length || r.brokenImages.length || r.errors.length || r.overflow.some(e => e.contentHeight > e.height + 1));
console.log(JSON.stringify({ screenshots: results.length, interactionChecks: 'passed', issues }, null, 2));
assert.equal(issues.length, 0, 'Layout issues found; inspect qa.local/results.json');

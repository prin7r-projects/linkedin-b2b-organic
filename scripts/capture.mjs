import { chromium } from "playwright";

const URL = "https://linkedin-b2b-organic.prin7r.com";
const OUTDIR = "docs/screenshots";

const shots = [
  { file: "landing-desktop.png", viewport: { width: 1440, height: 900 }, fullPage: true },
  { file: "landing-mobile.png",  viewport: { width: 390,  height: 844 }, fullPage: true }
];

const browser = await chromium.launch();
for (const s of shots) {
  const ctx = await browser.newContext({ viewport: s.viewport, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60_000 });
  // Wait for fonts
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUTDIR}/${s.file}`, fullPage: s.fullPage });
  await ctx.close();
  console.log(`[CAPTURED] ${s.file} (${s.viewport.width}×${s.viewport.height})`);
}
await browser.close();

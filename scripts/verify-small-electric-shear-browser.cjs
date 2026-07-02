const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const baseUrl = process.env.BASE_URL || "http://localhost:3100";
const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const productPath = "/products/compact-electric-shearing-machine";

async function inspectPage(page, viewportName) {
  const consoleErrors = [];
  const failedRequests = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? "failed"}`);
  });

  const response = await page.goto(`${baseUrl}${productPath}`, { waitUntil: "networkidle" });
  assert.equal(response?.status(), 200, `${viewportName}: product page did not return 200`);
  assert.equal(
    await page.title(),
    "Small Electric Shearing Machine | Compact Sheet Metal Cutting Solution | ZYRON",
    `${viewportName}: unexpected page title`,
  );

  const h1 = page.locator("h1");
  assert.equal(await h1.count(), 1, `${viewportName}: expected exactly one H1`);
  assert.equal(
    (await h1.textContent()).trim(),
    "Small Electric Shearing Machine for Fast Thin Sheet Cutting",
    `${viewportName}: unexpected H1`,
  );

  const productImages = page.locator('img[alt="Small electric shearing machine for thin sheet metal cutting"]');
  assert.equal(await productImages.count(), 2, `${viewportName}: expected hero and structure product images`);
  for (let index = 0; index < 2; index += 1) {
    const image = productImages.nth(index);
    await image.scrollIntoViewIfNeeded();
    await image.waitFor({ state: "visible" });
    await page.waitForFunction(
      (target) => target instanceof HTMLImageElement && target.complete && target.naturalWidth > 0,
      await image.elementHandle(),
    );
    const state = await image.evaluate((target) => ({
      complete: target.complete,
      naturalWidth: target.naturalWidth,
      naturalHeight: target.naturalHeight,
      objectFit: getComputedStyle(target).objectFit,
    }));
    assert.ok(state.complete && state.naturalWidth > 0 && state.naturalHeight > 0, `${viewportName}: image ${index + 1} failed to load`);
    assert.equal(state.objectFit, "contain", `${viewportName}: image ${index + 1} may be cropped`);
  }

  const parameterTable = page.locator("table").filter({ hasText: "Q11G-2 x 600" });
  assert.equal(await parameterTable.count(), 1, `${viewportName}: original Q11G parameter table is missing`);
  assert.equal(await parameterTable.locator("tbody tr").count(), 8, `${viewportName}: expected all eight original parameter rows`);
  const parameterText = await parameterTable.textContent();
  for (const value of ["Q11G-2 x 600", "Q11G-2 x 1600", "Q11G-1.2 x 2500", "3100 x 640 x 1100"]) {
    assert.ok(parameterText.includes(value), `${viewportName}: missing original parameter value ${value}`);
  }

  const headers = parameterTable.locator("thead th");
  assert.equal(await headers.count(), 8, `${viewportName}: expected eight table headings`);
  assert.equal(await headers.nth(1).locator("[data-table-heading-unit]").textContent(), "(mm)");
  assert.equal(await headers.nth(3).locator("[data-table-heading-unit]").textContent(), "(deg)");
  assert.equal(await headers.nth(4).locator("[data-table-heading-unit]").textContent(), "(times/min)");
  assert.equal(await headers.nth(6).locator("[data-table-heading-unit]").textContent(), "(kW)");
  const headingLayout = await headers.nth(1).evaluate((header) => {
    const label = header.querySelector("span:not([data-table-heading-unit])");
    const unit = header.querySelector("[data-table-heading-unit]");
    return {
      labelWhiteSpace: label ? getComputedStyle(label).whiteSpace : "",
      unitDisplay: unit ? getComputedStyle(unit).display : "",
      unitAlign: unit ? getComputedStyle(unit).textAlign : "",
    };
  });
  assert.equal(headingLayout.labelWhiteSpace, "nowrap", `${viewportName}: heading label wraps`);
  assert.equal(headingLayout.unitDisplay, "block", `${viewportName}: unit is not on its own line`);
  assert.equal(headingLayout.unitAlign, "center", `${viewportName}: unit is not centered`);

  const faqItems = page.locator("[data-shearing-solution-faq] details");
  assert.equal(await faqItems.count(), 7, `${viewportName}: expected seven FAQ items`);
  await faqItems.first().locator("summary").click();
  assert.equal(await faqItems.first().evaluate((item) => item.open), true, `${viewportName}: FAQ interaction failed`);

  const schemaTypes = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
    scripts
      .map((script) => {
        try {
          return JSON.parse(script.textContent || "{}")["@type"];
        } catch {
          return null;
        }
      })
      .filter(Boolean),
  );
  for (const schemaType of ["Product", "BreadcrumbList", "FAQPage"]) {
    assert.ok(schemaTypes.includes(schemaType), `${viewportName}: missing ${schemaType} structured data`);
  }

  const overflow = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  assert.ok(
    overflow.documentWidth <= overflow.viewportWidth + 1,
    `${viewportName}: page-level horizontal overflow (${overflow.documentWidth} > ${overflow.viewportWidth})`,
  );

  assert.deepEqual(consoleErrors, [], `${viewportName}: browser console errors\n${consoleErrors.join("\n")}`);
  assert.deepEqual(failedRequests, [], `${viewportName}: failed requests\n${failedRequests.join("\n")}`);

  await page.evaluate(() => window.scrollTo(0, 0));
  return { overflow, schemaTypes };
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });

  try {
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const desktopPage = await desktopContext.newPage();
    const desktop = await inspectPage(desktopPage, "desktop");
    await desktopPage.screenshot({ path: "/tmp/zyron-small-electric-shear-desktop.png", fullPage: true });

    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    const mobile = await inspectPage(mobilePage, "mobile");
    await mobilePage.screenshot({ path: "/tmp/zyron-small-electric-shear-mobile.png", fullPage: true });

    console.log(JSON.stringify({ desktop, mobile }, null, 2));
    console.log("Small Electric Shear browser contract passed.");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

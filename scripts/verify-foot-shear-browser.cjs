const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const baseUrl = process.env.BASE_URL || "http://localhost:3100";
const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function inspectPage(page, viewportName) {
  const consoleErrors = [];
  const failedRequests = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? "failed"}`);
  });

  const response = await page.goto(`${baseUrl}/products/foot-shear`, {
    waitUntil: "networkidle",
  });
  assert.equal(response?.status(), 200, `${viewportName}: Foot Shear page did not return 200`);

  assert.equal(
    await page.title(),
    "Foot Operated Shearing Machine | Sheet Metal Foot Pedal Shear | ZYRON",
    `${viewportName}: unexpected page title`,
  );
  assert.equal(
    await page.locator('meta[name="description"]').getAttribute("content"),
    "Foot operated shearing machine for thin sheet metal cutting, HVAC duct workshops, roofing sheet processing and small batch fabrication. Get a practical cutting solution from ZYRON Heavy Industry.",
    `${viewportName}: unexpected meta description`,
  );

  const h1 = page.locator("h1");
  assert.equal(await h1.count(), 1, `${viewportName}: expected exactly one H1`);
  assert.equal(
    (await h1.textContent()).trim(),
    "Foot Operated Shearing Machine for Efficient Thin Sheet Cutting",
    `${viewportName}: unexpected H1`,
  );

  const productImages = page.locator('img[alt="Foot operated shearing machine for sheet metal cutting"]');
  assert.equal(await productImages.count(), 2, `${viewportName}: expected hero and structure product images`);
  const imageStates = [];
  for (let index = 0; index < 2; index += 1) {
    const image = productImages.nth(index);
    await image.scrollIntoViewIfNeeded();
    await image.waitFor({ state: "visible" });
    await page.waitForFunction(
      (target) => target instanceof HTMLImageElement && target.complete && target.naturalWidth > 0,
      await image.elementHandle(),
    );
    const imageState = await image.evaluate((target) => ({
      naturalWidth: target.naturalWidth,
      naturalHeight: target.naturalHeight,
      clientWidth: target.clientWidth,
      clientHeight: target.clientHeight,
    }));
    assert.ok(imageState.naturalWidth > 0 && imageState.naturalHeight > 0, `${viewportName}: product image ${index + 1} failed to load`);
    assert.ok(imageState.clientWidth > 0 && imageState.clientHeight > 0, `${viewportName}: product image ${index + 1} has no layout size`);
    imageStates.push(imageState);
  }

  const parameterTable = page.locator("table").filter({ hasText: "Q11-1 x 1000" });
  assert.equal(await parameterTable.count(), 1, `${viewportName}: original Q11 table is missing`);
  const parameterText = await parameterTable.textContent();
  for (const value of ["Q11-1 x 1000", "Q11-1 x 1300", "Q11-1 x 1500"]) {
    assert.ok(parameterText.includes(value), `${viewportName}: missing original parameter row ${value}`);
  }

  assert.equal(
    await page.locator("[data-foot-shear-faq] details").count(),
    6,
    `${viewportName}: expected six FAQ items`,
  );

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
  return { imageStates, overflow, schemaTypes };
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
  });

  try {
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const desktopPage = await desktopContext.newPage();
    const desktop = await inspectPage(desktopPage, "desktop");
    await desktopPage.screenshot({ path: "/tmp/zyron-foot-shear-desktop.png", fullPage: true });

    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    const mobile = await inspectPage(mobilePage, "mobile");
    await mobilePage.screenshot({ path: "/tmp/zyron-foot-shear-mobile.png", fullPage: true });

    await desktopPage.goto(`${baseUrl}/products/foot-operated-shearing-machine`, { waitUntil: "networkidle" });
    assert.ok(
      desktopPage.url().endsWith("/products/foot-shear"),
      `Legacy product URL did not redirect to the canonical page: ${desktopPage.url()}`,
    );

    await desktopPage.goto(`${baseUrl}/products/compact-electric-shearing-machine`, { waitUntil: "networkidle" });
    assert.equal(
      (await desktopPage.locator("h1").textContent()).trim(),
      "Small Electric Shearing Machine for Fast Thin Sheet Cutting",
      "Small Electric Shearing Machine solution page is missing",
    );

    console.log(JSON.stringify({ desktop, mobile }, null, 2));
    console.log("Foot Shear browser contract passed.");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

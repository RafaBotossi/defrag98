import { test, expect } from "@playwright/test";
test("complete optimization, pause, restart and loop", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Original", exact: true }).click();
  await expect(page.getByRole("heading")).toContainText("breathing room");
  await page.getByLabel("Auto loop").uncheck();
  await expect.poll(async () => Number(await page.getByRole("progressbar").getAttribute("aria-valuenow"))).toBeGreaterThan(0);
  await expect(
    page.getByRole("button", { name: "Pause", exact: false }),
  ).toBeEnabled();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Pause", exact: false }).click();
  await page.waitForTimeout(150);
  const paused = await page
    .getByRole("progressbar")
    .getAttribute("aria-valuenow");
  await page.waitForTimeout(250);
  expect(
    await page.getByRole("progressbar").getAttribute("aria-valuenow"),
  ).toBe(paused);
  await page.getByLabel("Speed", { exact: true }).fill("16");
  await page.getByRole("button", { name: "Resume" }).click();
  await expect(page.locator("[role=status]")).toHaveText(
    "Optimization complete",
    { timeout: 30000 },
  );
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  await page.getByLabel("Auto loop").check();
  await expect(page.locator("[role=status]")).toHaveText(
    "Finding a place for everything…",
    { timeout: 6000 },
  );
  await page.getByRole("button", { name: "Restart" }).click();
  await page.getByRole("button", { name: "Mute", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Unmute", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Volume", { exact: true }).fill("35");
  await page.getByRole("button", { name: "Relax Mode", exact: true }).click();
  await expect(page.getByRole("button", { name: "Restart" })).toBeHidden();
  await page
    .getByRole("button", { name: "Exit Relax Mode", exact: true })
    .last()
    .click();
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  expect(errors).toEqual([]);
});
test("small viewport, keyboard, reduced motion and fullscreen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Original", exact: true }).click();
  await expect(page.getByLabel("Less motion")).toBeChecked();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Pause", exact: false }).click();
  await page.getByRole("button", { name: "Resume" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Pause", exact: false }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Fullscreen ↗", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
    .toBe(true);
  await page.evaluate(() => document.exitFullscreen());
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});

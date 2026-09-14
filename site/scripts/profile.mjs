import { chromium } from "@playwright/test";
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:5173/");
  await page.getByRole("button", { name: "Start Defrag" }).click();
  const result = await page.evaluate(async () => {
    const frames = [];
    let previous = performance.now();
    await new Promise((resolve) => {
      function sample(now) {
        frames.push(now - previous);
        previous = now;
        if (frames.length < 180) requestAnimationFrame(sample);
        else resolve();
      }
      requestAnimationFrame(sample);
    });
    const sorted = frames.slice(5).sort((a, b) => a - b);
    return {
      medianFrameMs: sorted[Math.floor(sorted.length / 2)],
      p95FrameMs: sorted[Math.floor(sorted.length * 0.95)],
      frames: frames.length,
    };
  });
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}

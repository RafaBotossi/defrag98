import { test, expect } from '@playwright/test';
test('ultrawide themes preserve the disk and repaint while paused', async ({page}) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({width:3440,height:1440}); await page.goto('/');
  await expect(page.locator('main')).toHaveClass(/theme-win98/);
  await page.getByRole('button',{name:'Original',exact:true}).click();
  const windowBox = await page.locator('.window').boundingBox();
  expect(windowBox!.width / 3440).toBeGreaterThan(.97);
  await page.waitForTimeout(300);
  await page.getByRole('button',{name:'Pause',exact:false}).click(); await page.waitForTimeout(150);
  const before = await page.getByRole('progressbar').getAttribute('aria-valuenow');
  const snapshots = new Set<string>();
  for (const [name,id] of [['Original','original'],['Windows 98','win98'],['Futuristic','future'],['Rainbow','rainbow']]) {
    await page.getByRole('button',{name,exact:true}).click();
    await expect(page.locator('main')).toHaveClass(new RegExp(`theme-${id}`));
    await page.waitForTimeout(150);
    expect(await page.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(before);
    snapshots.add(await page.locator('canvas').evaluate(canvas=>(canvas as HTMLCanvasElement).toDataURL()));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollHeight <= innerHeight)).toBe(true);
    await page.screenshot({path:`test-results/theme-${id}.png`});
  }
  expect(snapshots.size).toBe(4);
  await page.reload(); await expect(page.locator('main')).toHaveClass(/theme-rainbow/);
  expect(errors).toEqual([]);
});
test('all styles work on mobile and classic details controls work', async ({page}) => {
  await page.setViewportSize({width:390,height:844}); await page.goto('/');
  for (const name of ['Original','Windows 98','Futuristic','Rainbow']) {
    await page.getByRole('button',{name,exact:true}).click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({path:`test-results/mobile-${name.replace(' ','')}.png`,fullPage:true});
  }
  await page.getByRole('button',{name:'Windows 98',exact:true}).click();
  await page.getByRole('button',{name:'Hide Details',exact:true}).click(); await expect(page.locator('canvas')).toBeHidden();
  await page.getByRole('button',{name:'Relax Mode',exact:true}).click(); await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button',{name:'Exit Relax Mode',exact:true}).last().click();
  await page.getByRole('button',{name:'Show Details',exact:true}).click(); await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button',{name:'Legend',exact:true}).click(); await expect(page.getByLabel('Cluster legend')).toBeHidden();
  await expect(page.getByRole('button',{name:'Stop',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Stop',exact:true}).click(); await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','0');
});

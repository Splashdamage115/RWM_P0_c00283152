import {  } from '../lab/checklist/+page.svelte';
import { test, expect } from '@playwright/test';

test.beforeAll(async ({ page }) => {
    await page.goto('/lab/checklist');
});

test("title should contain data-testid='title'", async ({ page }) => {
    const title = page.locator('h1[data-testid="title"]');
    test.expect(title).toHaveText('Progress Checklist');
});
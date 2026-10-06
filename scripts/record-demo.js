// Drives the KPay demo end-to-end: records a video and captures screenshots.
// Usage: node scripts/record-demo.js   (expects the app served on http://127.0.0.1:8765)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.KPAY_URL || 'http://127.0.0.1:8765';
const OUT = path.join(__dirname, '..');
const W = 1440, H = 900;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, recordVideo: { dir: path.join(OUT, 'video', 'raw'), size: { width: W, height: H } } });
  const page = await ctx.newPage();
  let n = 0;
  const wait = (ms) => page.waitForTimeout(ms);
  const shot = async (name) => { n++; await page.evaluate(() => { document.querySelector('#caption').style.visibility='hidden'; document.querySelector('#cursor').style.visibility='hidden'; }); await page.screenshot({ path: path.join(OUT, 'screenshots', `${String(n).padStart(2, '0')}-${name}.png`) }); await page.evaluate(() => { document.querySelector('#caption').style.visibility=''; document.querySelector('#cursor').style.visibility=''; }); };
  const cap = (t, s) => page.evaluate(([t, s]) => window.kpCaption(t, s), [t, s]);
  const nocap = () => page.evaluate(() => window.kpCaption(null));
  async function click(sel, pause = 600) {
    const el = page.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    const b = await el.boundingBox();
    const x = b.x + b.width / 2, y = b.y + b.height / 2;
    await page.evaluate(([x, y]) => window.kpCursor(x, y), [x, y]);
    await wait(450);
    await page.evaluate(([x, y]) => window.kpCursor(x, y, true), [x, y]);
    await el.click();
    await page.evaluate(([x, y]) => window.kpCursor(x, y, false), [x, y]).catch(() => {});
    await wait(pause);
  }
  async function type(sel, text, delay = 45) { await click(sel, 150); await page.locator(sel).first().fill(''); await page.locator(sel).first().pressSequentially(text, { delay }); await wait(250); }

  // 1. Admin login ---------------------------------------------------------------
  await page.goto(BASE + '/#/login');
  await wait(800);
  await cap('KPay · Admin login', 'One login for platform admins and merchants — MFA enforced');
  await shot('admin-login');
  await type('#email', 'priya@kpay.dev');
  await type('#pw', 'correct-horse-battery', 30);
  await click('#signin', 700);
  for (let i = 0; i < 6; i++) await page.locator('#otp' + i).pressSequentially('482913'[i], { delay: 80 });
  await shot('admin-mfa');
  await click('#verify', 1600);

  // 2. Dashboard -------------------------------------------------------------------
  await cap('Dashboard', 'Live volume across cards, UPI and stablecoins — every chain auto-settles as USDT on Solana');
  await wait(2600);
  await shot('dashboard');
  await wait(1500);

  // 3. Merchant onboarding ------------------------------------------------------------
  await click('[data-nav="merchants"]', 800);
  await cap('Merchant onboarding', 'Every merchant is born “pending” and goes live only after admin approval');
  await shot('merchants');
  await click('#onboard', 700);
  await type('#f_name', 'Lumen Labs Inc.');
  await type('#f_email', 'finance@lumenlabs.io', 30);
  await type('#f_web', 'https://lumenlabs.io', 30);
  await shot('onboard-step1-business');
  await click('#wiznext', 700);
  await cap('Merchant onboarding', 'KYC documents with OCR, liveness, sanctions and UBO checks');
  for (let i = 0; i < 4; i++) await click('#doc' + i, 300);
  await shot('onboard-step2-kyc');
  await click('#wiznext', 700);
  await cap('Merchant onboarding', 'Choose payment methods and processors — failover is automatic');
  await click('#m_card', 300); await click('#m_upi', 300); await click('#m_crypto', 500);
  await shot('onboard-step3-methods');
  await click('#wiznext', 700);
  await cap('Merchant onboarding', 'Settlement destination: the merchant’s own Solana wallet, auto-settled in USDT');
  await type('#f_wallet', '5ZWj7a1f8tWkjBESHKgrLmXshuXxqeY9SYcfbshpAqPG', 18);
  await shot('onboard-step4-solana-settlement');
  await click('#wiznext', 1200);
  await shot('merchant-pending');
  await click('[data-approve]', 900);
  await cap('Merchant approval', 'Maker-checker: admin reviews KYC + wallet proof, then approves to live');
  await shot('merchant-approve-modal');
  await click('#confirmapprove', 1500);
  await shot('merchant-live');

  // 4. Payment link creation -----------------------------------------------------------
  await click('[data-nav="payment-links"]', 800);
  await cap('Payment links', 'Create a shareable link — no code needed');
  await shot('payment-links');
  await click('#newlink', 700);
  await type('#l_title', 'Lumen Pro - annual licence', 35);
  await type('#l_amount', '499.00', 80);
  await click('#createlink', 1200);
  await cap('Payment links', 'Link is live — also available via POST /api/v1/payment_links');
  await shot('payment-link-created');
  await click('#opencheckout', 1400);

  // 5. Checkout: crypto on Solana ------------------------------------------------------
  await cap('Hosted checkout', 'Payer picks a method — USDT via Solana Pay, or USDT on Tron/Ethereum/Polygon merged to Solana');
  await wait(1500);
  await shot('checkout-solana-pay');
  await click('#tab_card', 900);
  await cap('Multi-payment checkout', 'Same link also takes cards and UPI — merchant still auto-settles in USDT on Solana');
  await shot('checkout-card');
  await click('#tab_crypto', 900);
  await cap('Hosted checkout', 'Wallet pays → detected → confirmed → finalized in seconds');
  await click('#paywallet', 4600);
  await shot('checkout-paid-solana');
  await wait(1200);

  // 6. Crypto rollout ------------------------------------------------------------------
  await page.goto(BASE + '/#/crypto-rollout'); await wait(900);
  await cap('Crypto rollout', 'Per-chain inflow toggles (all merge to Solana), kill switch, cohorts & caps');
  await shot('crypto-rollout');
  await page.locator('#stage').fill('75'); await page.evaluate(() => KP.stage(75)); await wait(600);
  await click('#net_bsc', 900);
  await click('#coh_2', 900);
  await click('#kill', 1300);
  await shot('crypto-kill-switch');
  await click('#kill', 900);

  // 7. Multi-payment integration ----------------------------------------------------------
  await click('[data-nav="processors"]', 900);
  await cap('Multi-payment integration', 'Cards, UPI, Solana Pay and multichain rails behind one API, with smart failover');
  await wait(1200);
  await shot('processors-routing');
  await wait(1200);

  // 8. Solana settlement --------------------------------------------------------------------
  await click('[data-nav="settlements"]', 900);
  await cap('Solana settlement', 'Other chains merge into Solana and auto-settle — only large payouts need approval');
  await shot('solana-settlement-queue');
  await click('[id^="appr_"]', 2600);
  await shot('solana-settlement-finalized');

  // 9. Modular ---------------------------------------------------------------------------------
  await click('[data-nav="modules"]', 900);
  await cap('Modular', 'Turn modules on per deployment — every integration is a plug-in seam');
  await click('#mod_7', 1000);
  await shot('modules');

  // 10. Developers + self-hosted ------------------------------------------------------------
  await click('[data-nav="developers"]', 900);
  await cap('Developers & API', 'REST + OpenAPI, idempotency keys, HMAC-signed requests and webhooks');
  await wait(1800);
  await shot('developers-api');
  await click('[data-nav="deployment"]', 900);
  await cap('Self-hosted', 'Runs in your VPC with your keys — commercial licence, not open source');
  await wait(2200);
  await shot('self-hosted');
  await click('[data-nav="dashboard"]', 900);
  await cap('KPay', 'Accept anything. Settle on Solana. Own the stack.');
  await wait(2500);

  const vid = page.video();
  await ctx.close();
  const raw = await vid.path();
  fs.renameSync(raw, path.join(OUT, 'video', 'kpay-demo.webm'));
  await browser.close();
  console.log('screens:', n);
})().catch((e) => { console.error(e); process.exit(1); });

// Builds deck/KPay-Solana-Pitch.pptx from the demo screenshots + video.
// Usage: node scripts/build-deck.js
const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');
const sharp = require('sharp');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const Fi = require('react-icons/fi');
const { applyTheme } = require(process.env.PPTX_SKILL + '/scripts/apply_theme.js');

const ROOT = path.join(__dirname, '..');
const SHOT = (f) => path.join(ROOT, 'screenshots', f);
const ASSETS = path.join(ROOT, 'deck', 'assets');
fs.mkdirSync(ASSETS, { recursive: true });

const THEME = {
  name: 'KPay Solana',
  headFontFace: 'Arial',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '0B0B14', lt1: 'FFFFFF', dk2: '171728', lt2: 'ECECF5',
    accent1: '9945FF', accent2: '14F195', accent3: '00C2FF', accent4: 'FFB547', accent5: 'FF5C7A', accent6: '9A9AB5',
    hlink: '00C2FF', folHlink: '9945FF',
  },
};
const HEX = THEME.colors;

// ---------- generated imagery ----------------------------------------------------
async function svgPng(svg, file) { const p = path.join(ASSETS, file); await sharp(Buffer.from(svg)).png().toFile(p); return p; }
async function background(file, a, b) {
  return svgPng(`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><defs>
    <radialGradient id="g1" cx="0" cy="0" r="1"><stop offset="0" stop-color="#9945FF" stop-opacity="${a}"/><stop offset="1" stop-color="#9945FF" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="1" cy="1" r="1"><stop offset="0" stop-color="#14F195" stop-opacity="${b}"/><stop offset="1" stop-color="#14F195" stop-opacity="0"/></radialGradient></defs>
    <rect width="1920" height="1080" fill="#0B0B14"/><rect width="1920" height="1080" fill="url(#g1)"/><rect width="1920" height="1080" fill="url(#g2)"/></svg>`, file);
}
const badgeCache = {};
async function badge(icon) {
  if (badgeCache[icon]) return badgeCache[icon];
  const inner = renderToStaticMarkup(React.createElement(Fi[icon], { size: 120, color: '#0B0B14', strokeWidth: 2.4 }));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#9945FF"/><stop offset=".55" stop-color="#00C2FF"/><stop offset="1" stop-color="#14F195"/></linearGradient></defs>
    <circle cx="128" cy="128" r="128" fill="url(#g)"/><g transform="translate(68,68)">${inner}</g></svg>`;
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return (badgeCache[icon] = 'image/png;base64,' + buf.toString('base64'));
}
async function videoCover() {
  const play = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900"><rect width="1440" height="900" fill="#0B0B14" fill-opacity=".35"/>
    <circle cx="720" cy="450" r="90" fill="#14F195"/><polygon points="695,400 695,500 780,450" fill="#0B0B14"/></svg>`);
  const buf = await sharp(SHOT('03-dashboard.png')).composite([{ input: play }]).png().toBuffer();
  return 'data:image/png;base64,' + buf.toString('base64');
}

(async () => {
  const BG_TITLE = await background('bg-title.png', 0.55, 0.4);
  const BG_SECTION = await background('bg-section.png', 0.35, 0.25);

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
  pres.title = 'KPay — Self-hosted payment gateway settling on Solana';
  pres.author = 'KPay';
  pres.company = 'KPay';
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  // ---------- layouts --------------------------------------------------------------
  const footer = { text: { text: 'KPay  ·  Solana ecosystem deck  ·  Confidential', options: { x: 0.6, y: 7.0, w: 6, h: 0.3, fontSize: 10, color: C.accent6, margin: 0 } } };
  pres.defineSlideMaster({
    title: 'KP_TITLE', background: { path: BG_TITLE },
    objects: [
      { placeholder: { options: { name: 'title', type: 'title', x: 0.7, y: 2.2, w: 6.6, h: 1.9, fontSize: 44, bold: true, align: 'left', color: C.background1, valign: 'bottom', margin: 0 }, text: '' } },
      { placeholder: { options: { name: 'body', type: 'body', x: 0.7, y: 4.25, w: 6.4, h: 1.2, fontSize: 18, color: C.background2, valign: 'top', margin: 0 }, text: '' } },
    ],
  });
  pres.defineSlideMaster({
    title: 'KP_SECTION', background: { path: BG_SECTION },
    objects: [
      { placeholder: { options: { name: 'title', type: 'title', x: 0.7, y: 0.45, w: 11.9, h: 0.8, fontSize: 36, bold: true, align: 'left', color: C.background1, margin: 0 }, text: '' } },
      { placeholder: { options: { name: 'body', type: 'body', x: 0.7, y: 1.25, w: 11.9, h: 0.5, fontSize: 16, color: C.accent6, margin: 0 }, text: '' } },
      footer,
    ],
    slideNumber: { x: 12.2, y: 7.0, w: 0.5, h: 0.3, fontSize: 10, color: C.accent6, align: 'right' },
  });
  pres.defineSlideMaster({
    title: 'KP_CONTENT', background: { color: HEX.dk1 },
    objects: [
      { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.38, w: 12.1, h: 0.75, fontSize: 36, bold: true, align: 'left', color: C.background1, valign: 'middle', margin: 0 }, text: '' } },
      { placeholder: { options: { name: 'body', type: 'body', x: 0.6, y: 1.12, w: 12.1, h: 0.42, fontSize: 16, color: C.accent6, valign: 'top', margin: 0 }, text: '' } },
      footer,
    ],
    slideNumber: { x: 12.2, y: 7.0, w: 0.5, h: 0.3, fontSize: 10, color: C.accent6, align: 'right' },
  });

  // ---------- helpers ---------------------------------------------------------------
  let section = '';
  const sec = (t) => { section = t; pres.addSection({ title: t }); };
  function content(title, sub, notes) {
    const s = pres.addSlide({ masterName: 'KP_CONTENT', sectionTitle: section });
    s.addText(title, { placeholder: 'title' });
    if (sub) s.addText(sub, { placeholder: 'body' });
    if (notes) s.addNotes(notes);
    return s;
  }
  function panel(s, x, y, w, h, name, opts = {}) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: opts.fill || C.text2 }, line: { color: opts.line || '2A2A44', width: opts.lineW || 1 }, objectName: name });
  }
  function shot(s, file, x, y, w, name) {
    const h = w / 1.6;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x - 0.07, y: y - 0.07, w: w + 0.14, h: h + 0.14, rectRadius: 0.1, fill: { color: '1C1C30' }, line: { color: '3A2A66', width: 1.25 },
      shadow: { type: 'outer', blur: 14, offset: 4, angle: 90, color: '000000', opacity: 0.55 }, objectName: name + ' frame' });
    s.addImage({ path: SHOT(file), x, y, w, h, objectName: name, altText: name });
    return h;
  }
  async function icon(s, name, x, y, d = 0.6) { s.addImage({ data: await badge(name), x, y, w: d, h: d, objectName: 'icon ' + name }); }
  const T = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontSize: 15, color: C.background2, valign: 'top' }, o));
  // icon + bold header + description rows
  async function rows(s, items, x, y, w, gap = 1.0, opt = {}) {
    for (let i = 0; i < items.length; i++) {
      const [ic, head, body] = items[i];
      const yy = y + i * gap;
      await icon(s, ic, x, yy, 0.5);
      T(s, [{ text: head, options: { bold: true, color: C.background1, fontSize: opt.hs || 16, breakLine: true } }, { text: body, options: { fontSize: opt.bs || 14, color: C.accent6 } }],
        { x: x + 0.7, y: yy - 0.04, w: w - 0.7, h: gap - 0.1, objectName: 'row ' + head });
    }
  }

  // =============================== 1. TITLE =====================================
  sec('Opening');
  let s = pres.addSlide({ masterName: 'KP_TITLE', sectionTitle: section });
  s.addText([{ text: 'KPay', options: { breakLine: true } }, { text: 'Accept anything.', options: { breakLine: true, fontSize: 36 } }, { text: 'Auto-settle on Solana.', options: { fontSize: 36, color: C.accent2 } }], { placeholder: 'title' });
  s.addText('Self-hosted private payment infrastructure for humans & AI agents. Card and crypto in, USDT on Solana out.', { placeholder: 'body' });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: 1.35, w: 4.0, h: 0.45, rectRadius: 0.22, fill: { color: C.accent2, transparency: 85 }, line: { color: C.accent2, width: 1 }, objectName: 'tag pill' });
  T(s, 'Self-hosted · permissionless', { x: 0.7, y: 1.35, w: 4.0, h: 0.45, align: 'center', valign: 'middle', fontSize: 14, bold: true, color: C.accent2, objectName: 'tag' });
  shot(s, '03-dashboard.png', 7.55, 1.75, 5.2, 'Dashboard screenshot');
  T(s, 'Live product · demo video inside', { x: 7.55, y: 5.25, w: 5.2, h: 0.35, fontSize: 12, color: C.accent6, align: 'right', objectName: 'caption' });
  s.addNotes('KPay is a self-hosted payment gateway. Merchants accept cards, UPI and stablecoins through one checkout, and every merchant is settled in USDT on Solana. This deck covers the problem, the product (with a live demo), the APIs and why Solana is the settlement layer.');

  // =============================== 2. PROBLEM ===================================
  s = content('Money moves in seconds. Merchants wait days', 'Settlement, cost and control are still broken for global merchants', 'Three pains we hear from every merchant and PSP we talk to.');
  const probs = [
    ['FiClock', 'Slow settlement', 'Bank rails settle T+1 to T+3, with weekend and holiday cut-offs. Working capital is stuck in transit.'],
    ['FiGlobe', 'Costly cross-border', 'FX spreads, correspondent and wire fees stack up, and high-risk or emerging-market merchants pay the most.'],
    ['FiLock', 'Rented infrastructure', 'Hosted gateways own your data, pricing and uptime. Crypto processors skip cards and UPI entirely.'],
  ];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 4.15;
    panel(s, x, 1.95, 3.85, 4.55, 'problem card ' + (i + 1));
    await icon(s, probs[i][0], x + 0.35, 2.3, 0.75);
    T(s, probs[i][1], { x: x + 0.35, y: 3.3, w: 3.15, h: 0.5, fontSize: 22, bold: true, color: C.background1, fontFace: 'Arial' });
    T(s, probs[i][2], { x: x + 0.35, y: 3.9, w: 3.15, h: 2.3, fontSize: 16, color: C.accent6 });
  }

  // =============================== 3. SOLUTION ==================================
  s = content('KPay: one gateway, settled on Solana', 'Accept every local method, account for every cent, settle in USDT within seconds', 'KPay does three jobs end to end. Accept: cards, UPI and stablecoins on five networks. Account: a double-entry ledger with oracle-priced conversion. Settle: USDT to the merchant wallet on Solana, maker-checker approved and chain-verified.');
  panel(s, 0.6, 1.95, 4.6, 4.55, 'solution statement', { fill: '1A1230', line: '4B2F8A' });
  T(s, [{ text: 'Fiat & crypto in.', options: { breakLine: true } }, { text: 'USDT out.', options: { color: C.accent2, breakLine: true } }, { text: 'On your servers.', options: { color: C.accent3 } }], { x: 0.95, y: 2.3, w: 4.0, h: 2.0, fontSize: 30, bold: true, color: C.background1, fontFace: 'Arial' });
  T(s, 'Every payment method a merchant needs, converted at a locked oracle quote and paid out as USDT to the merchant’s own Solana wallet — no bank cut-off, no weekends.', { x: 0.95, y: 4.4, w: 3.95, h: 1.9, fontSize: 15, color: C.background2 });
  await rows(s, [
    ['FiCreditCard', 'Accept', 'Cards, UPI, Solana Pay, and USDT on Tron, Ethereum, Polygon, BNB Chain'],
    ['FiShuffle', 'Merge', 'Other-chain USDT is swept and bridged straight into the Solana treasury'],
    ['FiBookOpen', 'Account', 'Append-only double-entry ledger, MDR + tax per rule, rolling reserve, FX buffer earned on conversion'],
    ['FiSend', 'Settle', 'USDT auto-settles to the merchant Solana wallet; approval only above threshold'],
    ['FiServer', 'Own it', 'Self-hosted in your VPC with your keys. Commercial licence, closed source'],
  ], 5.65, 1.95, 7.05, 0.95);

  // =============================== 4. INFOGRAPHIC ===============================
  s = content('How KPay works, end to end', 'From any payer to a finalized USDT settlement in the merchant wallet', 'Walk left to right. Payers use whatever they have. KPay core routes, prices, records and risk-checks the payment. Settlement runs on Solana as an SPL USDT transfer. Merchants receive funds in their own wallet and can hold, treasury-manage or off-ramp.');
  const cols = [
    { x: 0.6, w: 2.3, t: 'Payers', ic: 'FiUsers', items: ['Solana Pay', 'Tron · Ethereum', 'Polygon · BSC', 'Card · UPI'] },
    { x: 8.0, w: 2.25, t: 'Solana rail', ic: 'FiZap', items: ['USDT treasury', 'Auto-settle', 'Finalized'] },
    { x: 10.65, w: 2.05, t: 'Merchant', ic: 'FiBriefcase', items: ['Own wallet', 'Treasury', 'Off-ramp'] },
  ];
  for (const c of cols) {
    panel(s, c.x, 1.95, c.w, 4.15, c.t + ' column');
    await icon(s, c.ic, c.x + 0.2, 2.12, 0.5);
    T(s, c.t, { x: c.x + 0.75, y: 2.18, w: c.w - 0.8, h: 0.4, fontSize: 15, bold: true, color: C.background1 });
    c.items.forEach((it, i) => {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: c.x + 0.2, y: 2.85 + i * 0.78, w: c.w - 0.4, h: 0.6, rectRadius: 0.08, fill: { color: '22223A' }, line: { color: '33334D', width: 1 }, objectName: c.t + ' item ' + i });
      T(s, it, { x: c.x + 0.2, y: 2.85 + i * 0.78, w: c.w - 0.4, h: 0.6, fontSize: 14, align: 'center', valign: 'middle', color: C.background1 });
    });
  }
  panel(s, 3.3, 1.95, 4.3, 4.15, 'KPay core', { fill: '1A1230', line: '9945FF', lineW: 1.5 });
  await icon(s, 'FiCpu', 3.5, 2.12, 0.5);
  T(s, 'KPay core', { x: 4.1, y: 2.18, w: 3.3, h: 0.4, fontSize: 16, bold: true, color: C.background1 });
  ['Routing + failover', 'Sweep + bridge', 'Double-entry ledger', 'Risk + rollout', 'Hosted checkout', 'API + webhooks'].forEach((m, i) => {
    const x = 3.5 + (i % 2) * 2.0, y = 2.85 + Math.floor(i / 2) * 1.0;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 1.9, h: 0.8, rectRadius: 0.08, fill: { color: '2A1D4D' }, line: { color: '5A3A9E', width: 1 }, objectName: 'core module ' + i });
    T(s, m, { x, y, w: 1.9, h: 0.8, fontSize: 14, bold: true, align: 'center', valign: 'middle', color: C.background1 });
  });
  for (const [x1, x2] of [[2.9, 3.3], [7.6, 8.0], [10.25, 10.65]]) {
    s.addShape(pres.shapes.LINE, { x: x1 + 0.02, y: 4.0, w: x2 - x1 - 0.04, h: 0, line: { color: C.accent2, width: 2.5, endArrowType: 'triangle' }, objectName: 'flow arrow' });
  }
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 6.3, w: 12.1, h: 0.5, rectRadius: 0.1, fill: { color: C.accent2, transparency: 88 }, line: { color: C.accent2, width: 1 }, objectName: 'self-hosted band' });
  T(s, 'Everything above runs in your VPC  ·  your keys (MPC / HSM)  ·  your data  ·  one licence', { x: 0.6, y: 6.3, w: 12.1, h: 0.5, fontSize: 14, bold: true, align: 'center', valign: 'middle', color: C.accent2 });

  // =============================== 5. LEVELS ====================================
  s = content('One install, four levels of use', 'The same gateway scales from one brand to a regulated bank', 'KPay is used at four levels. A single merchant runs its own checkout. A platform or marketplace onboards sub-merchants. A PSP or acquirer white-labels KPay for its merchants. A bank or enterprise runs it multi-region with its own HSM and data residency. Same code, different modules switched on.');
  const lv = [
    ['FiShoppingBag', 'L1 · Merchant', 'One brand, own checkout', 'Links + API'],
    ['FiGrid', 'L2 · Platform', 'Marketplace onboards sellers', 'Onboarding + approval'],
    ['FiLayers', 'L3 · PSP', 'White-label for its merchants', 'Reseller + routing'],
    ['FiShield', 'L4 · Bank', 'Regulated, multi-region', 'HSM keys + residency'],
  ];
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + i * 3.1, h = 2.6 + i * 0.65, y = 6.65 - h;
    panel(s, x, y, 2.9, h, 'level ' + (i + 1), { fill: i === 3 ? '1A1230' : HEX.dk2, line: i === 3 ? '9945FF' : '2A2A44' });
    await icon(s, lv[i][0], x + 0.25, y + 0.25, 0.55);
    T(s, lv[i][1], { x: x + 0.25, y: y + 0.95, w: 2.45, h: 0.4, fontSize: 18, bold: true, color: C.background1 });
    T(s, lv[i][2], { x: x + 0.25, y: y + 1.4, w: 2.45, h: 0.6, fontSize: 14, color: C.background2 });
    T(s, lv[i][3], { x: x + 0.25, y: y + h - 0.55, w: 2.45, h: 0.35, fontSize: 14, bold: true, color: C.accent2 });
  }

  // =============================== 6. WHY SOLANA ================================
  sec('Why Solana');
  s = content('Why Solana is the settlement layer', 'Stablecoin payments have already moved here', 'Sources: Blockeden / Artemis data on stablecoin transfer volume (Feb and Apr 2026); Visa USDC settlement on Solana for US banks (late 2025). Fee figure is the 5,000-lamport base fee; priority fees can add a little at peak. Alpenglow aims for ~150ms finality and is expected later in 2026.');
  s.addChart(pres.charts.BAR, [{ name: 'Share of weekly adjusted stablecoin transfer volume (%)', labels: ['Solana', 'Ethereum', 'Tron', 'Base'], values: [32.6, 27.8, 18.5, 14.6] }], {
    x: 0.6, y: 1.9, w: 6.3, h: 4.6, barDir: 'bar', showTitle: true, title: 'Stablecoin transfer share, April 2026 (%)', titleColor: 'ECECF5', titleFontSize: 14, titleFontFace: '+mn-lt',
    chartColors: ['14F195', '6B6B8A', '6B6B8A', '6B6B8A'], showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: 'ECECF5', dataLabelFontSize: 14, dataLabelFormatCode: '0.0', dataLabelFontFace: '+mn-lt',
    catAxisLabelColor: 'ECECF5', catAxisLabelFontSize: 14, catAxisLabelFontFace: '+mn-lt', catAxisOrientation: 'maxMin', valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
    showLegend: false, valAxisMaxVal: 40, objectName: 'stablecoin share chart',
  });
  const stats = [['$650B', 'stablecoin transfers on Solana in Feb 2026'], ['400 ms', 'slot time; Alpenglow targets ~150 ms finality'], ['≈$0.001', 'base network fee per settlement transfer'], ['Visa', 'settles USDC with US banks on Solana']];
  stats.forEach(([v, l], i) => {
    const x = 7.3 + (i % 2) * 2.75, y = 1.9 + Math.floor(i / 2) * 2.35;
    panel(s, x, y, 2.6, 2.15, 'stat ' + v);
    T(s, v, { x: x + 0.25, y: y + 0.25, w: 2.2, h: 0.8, fontSize: 32, bold: true, color: i === 0 ? C.accent2 : C.background1, fontFace: 'Arial' });
    T(s, l, { x: x + 0.25, y: y + 1.1, w: 2.2, h: 0.9, fontSize: 14, color: C.accent6 });
  });
  T(s, 'Sources: Blockeden.xyz (Artemis data), Mar–Apr 2026; Visa, Dec 2025. Figures rounded.', { x: 0.6, y: 6.6, w: 9, h: 0.3, fontSize: 10, color: C.accent6 });

  // =============================== 7. UNIQUENESS ================================
  s = content('What only KPay does', 'The only self-hosted gateway that takes fiat and crypto in and settles on Solana', 'Comparison is by category, not against any one company. Hosted card gateways are strong on cards but you rent them and they settle in fiat on bank rails. Crypto processors take crypto only. KPay combines both and runs on your own infrastructure.');
  const Y = '●', N = '○', P = '◐';
  const hdr = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: '22223A' }, align: 'center', fontSize: 14 } });
  const cell = (t, k) => ({ text: t, options: { align: 'center', fontSize: 18, color: k ? C.accent2 : t === N ? '55556F' : C.accent4, fill: { color: k ? '16231F' : HEX.dk2 } } });
  const rowsU = [
    ['Self-hosted in your own VPC, your keys', N, N],
    ['Cards + UPI + stablecoins in one checkout', P, P],
    ['Any chain in, merged and auto-settled on Solana', N, P],
    ['Double-entry ledger + chain-verified finality', P, N],
    ['Multi-processor routing with failover', P, N],
    ['Governed crypto rollout: cohorts, caps, kill switch', N, N],
  ];
  s.addTable([[{ text: 'Capability', options: { bold: true, color: C.background1, fill: { color: '22223A' }, fontSize: 14 } }, hdr('Hosted card gateways'), hdr('Crypto-only processors'), { text: 'KPay', options: { bold: true, color: '0B0B14', fill: { color: '14F195' }, align: 'center', fontSize: 14 } }],
    ...rowsU.map((r) => [{ text: r[0], options: { color: C.background2, fontSize: 15, fill: { color: HEX.dk2 } } }, cell(r[1]), cell(r[2]), cell(Y, true)])],
  { x: 0.6, y: 1.9, w: 12.1, colW: [5.6, 2.15, 2.15, 2.2], rowH: 0.6, valign: 'middle', border: { type: 'solid', color: '0B0B14', pt: 2 }, fontFace: 'Calibri', objectName: 'comparison table' });
  T(s, '●  full     ◐  partial / limited     ○  not offered', { x: 0.6, y: 6.25, w: 8, h: 0.35, fontSize: 12, color: C.accent6 });

  // =============================== 8. VIDEO =====================================
  sec('Product demo');
  s = pres.addSlide({ masterName: 'KP_SECTION', sectionTitle: section });
  s.addText('Product demo', { placeholder: 'title' });
  s.addText('Login → onboarding → payment link → Solana Pay → rollout → routing → settlement', { placeholder: 'body' });
  s.addMedia({ type: 'video', path: path.join(ROOT, 'video', 'kpay-demo.mp4'), x: 2.87, y: 1.95, w: 7.6, h: 4.75, cover: await videoCover(), objectName: 'KPay demo video' });
  s.addNotes('Play the embedded 110-second demo (also saved as video/kpay-demo.mp4). Each feature is captioned on screen. The following slides show the same flow as stills.');

  // =============================== 9. ADMIN LOGIN ===============================
  s = content('Admin login', 'One identity source for platform admins and merchants', 'Unified login: one URL for every principal. Passwords are argon2-hashed with lockout. Admins must use MFA (TOTP or WebAuthn). Five platform roles, IP allow-listing on admin routes, and a fixation-safe session cookie.');
  shot(s, '01-admin-login.png', 0.6, 1.95, 7.2, 'Admin login screenshot');
  await rows(s, [
    ['FiKey', 'Unified login', 'One URL resolves admin and merchant contexts'],
    ['FiShield', 'Argon2 + lockout', 'Brute-force protection on every account'],
    ['FiSmartphone', 'MFA enforced', 'TOTP or WebAuthn for every admin'],
    ['FiUsers', 'Roles + IP rules', 'Five platform roles, IP allow-list'],
  ], 8.3, 2.0, 4.4, 1.12);

  // =============================== 10. ONBOARDING ===============================
  s = content('Merchant onboarding', 'Four guided steps, then a mandatory admin approval', 'Admin-driven onboarding. Every merchant is born pending_approval; no auto-approve path exists. Step 4 captures the merchant Solana wallet and verifies it on-chain (on curve, USDT token account exists, ownership proven by a signed message). Approval enables exactly the selected connectors and flips the merchant live in one transaction.');
  [['05-onboard-step1-business.png', 0.6, 1.9], ['06-onboard-step2-kyc.png', 4.45, 1.9], ['07-onboard-step3-methods.png', 0.6, 4.4], ['08-onboard-step4-solana-settlement.png', 4.45, 4.4]].forEach(([f, x, y], i) => shot(s, f, x, y, 3.6, 'onboarding step ' + (i + 1)));
  await rows(s, [
    ['FiFileText', '1 · Business profile', 'Legal entity, MCC, expected volume'],
    ['FiUploadCloud', '2 · KYC documents', 'OCR, liveness, sanctions and UBO checks'],
    ['FiSliders', '3 · Methods & processors', 'Card, UPI, Solana Pay, with failover order'],
    ['FiZap', '4 · Solana settlement', 'Merchant wallet verified on-chain'],
    ['FiCheckCircle', 'Admin approves', 'Maker-checker gate, then the merchant goes live'],
  ], 8.45, 1.95, 4.25, 0.95);

  // =============================== 11. PAYMENT LINKS ============================
  s = content('Payment link creation', 'No-code links in the console, or one API call', 'The link carries the full checkout config: amount, currency, accepted methods, expiry and the crypto quote lock. The same thing is available through POST /api/v1/payment_links with an idempotency key.');
  shot(s, '13-payment-link-created.png', 0.6, 1.95, 5.95, 'Payment link created screenshot');
  shot(s, '15-checkout-card.png', 6.75, 1.95, 5.95, 'Card checkout screenshot');
  T(s, [{ text: 'Create', options: { bold: true, color: C.background1, breakLine: true } }, { text: 'Amount, currency, methods, expiry and a 15-minute crypto quote lock.', options: { color: C.accent6 } }], { x: 0.6, y: 5.85, w: 5.95, h: 0.9, fontSize: 15 });
  T(s, [{ text: 'Share', options: { bold: true, color: C.background1, breakLine: true } }, { text: 'One link takes card, UPI or stablecoin. The merchant always settles in USDT.', options: { color: C.accent6 } }], { x: 6.75, y: 5.85, w: 5.95, h: 0.9, fontSize: 15 });

  // =============================== 12. SOLANA PAY ===============================
  s = content('Stablecoin checkout with Solana Pay', 'Scan, pay, finalized: credited in seconds', 'Checkout encodes a Solana Pay transfer request: recipient, amount, spl-token mint and a unique reference public key. KPay finds the transaction by that reference, validates amount and mint, and credits only once the signature reaches finalized commitment.');
  shot(s, '14-checkout-solana-pay.png', 0.6, 1.95, 5.95, 'Solana Pay QR screenshot');
  shot(s, '16-checkout-paid-solana.png', 6.75, 1.95, 5.95, 'Payment complete screenshot');
  const steps = ['QR = Solana Pay transfer request', 'Unique reference key per order', 'Amount + mint validated', 'Credited at finalized'];
  steps.forEach((t, i) => {
    const x = 0.6 + i * 3.05;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 5.9, w: 2.85, h: 0.75, rectRadius: 0.1, fill: { color: C.text2 }, line: { color: '2A2A44', width: 1 }, objectName: 'step ' + i });
    T(s, `${i + 1}  ${t}`, { x: x + 0.15, y: 5.9, w: 2.6, h: 0.75, fontSize: 14, bold: true, valign: 'middle', color: C.background1 });
  });

  // =============================== 13. CRYPTO ROLLOUT ===========================
  s = content('Crypto rollout, governed', 'Turn crypto on gradually and switch it off in one click', 'This is what lets a regulated PSP or bank say yes to crypto. Crypto rollout is controlled per network and environment, per merchant cohort with daily exposure caps, by staged percentage, and through a global kill switch that halts crypto pay-in and settlement while fiat keeps working.');
  shot(s, '17-crypto-rollout.png', 0.6, 1.95, 7.2, 'Crypto rollout screenshot');
  await rows(s, [
    ['FiPower', 'Global kill switch', 'Halts crypto in and out; fiat keeps running'],
    ['FiToggleRight', 'Per-network control', 'Solana, Tron, Polygon, Ethereum, BNB, per env'],
    ['FiPercent', 'Staged rollout', 'Offer stablecoins to a % of eligible merchants'],
    ['FiTarget', 'Cohorts + caps', 'Allow-list merchants with daily exposure caps'],
  ], 8.3, 2.0, 4.4, 1.12);

  // =============================== 14. MULTI-PAYMENT ============================
  s = content('Multi-payment integration', 'Every acquirer, rail and chain behind one API', 'Processors plug in through one adapter seam (authorize, capture, sync, void, refund, payout). Routing picks connectors by priority and fails over on soft declines and timeouts. Unknown outcomes are never blind-retried; they are status-synced first. A coverage matrix shows exactly which method and currency combinations can be offered.');
  await rows(s, [
    ['FiCreditCard', 'Cards + UPI + crypto', 'Card acquirers, UPI rail, Solana Pay, multichain USDT'],
    ['FiShuffle', 'Smart failover', 'Priority + health routing; unknowns synced first'],
    ['FiGrid', 'Coverage matrix', 'Method × currency × credentials, at a glance'],
    ['FiPlusCircle', 'Add a processor', 'One adapter class + register(). No core edits'],
  ], 0.6, 2.0, 4.4, 1.12);
  shot(s, '19-processors-routing.png', 5.5, 1.95, 7.2, 'Processors and routing screenshot');

  // =============================== 15. SETTLEMENT ===============================
  s = content('Auto-settlement on Solana', 'Every chain merges into Solana; approval only above threshold', 'A merchant requests settlement. The ledger reserves the balance and an admin approves it (merchants can never self-settle to chain). MPC custody signs the SPL USDT transfer, broadcast with a priority fee. The ledger marks it paid only after the signature reaches finalized, then a webhook fires.');
  shot(s, '21-solana-settlement-finalized.png', 0.6, 1.95, 7.2, 'Solana settlement screenshot');
  [['412 ms', 'to confirmed'], ['≈ 13 s', 'to finalized today'], ['$0.0008', 'average network fee'], ['24 / 7', 'no bank cut-off']].forEach(([v, l], i) => {
    const x = 8.3 + (i % 2) * 2.25, y = 1.95 + Math.floor(i / 2) * 2.3;
    panel(s, x, y, 2.1, 2.1, 'settlement stat ' + i);
    T(s, v, { x: x + 0.2, y: y + 0.35, w: 1.8, h: 0.7, fontSize: 26, bold: true, color: i === 0 ? C.accent2 : C.background1, fontFace: 'Arial' });
    T(s, l, { x: x + 0.2, y: y + 1.1, w: 1.8, h: 0.8, fontSize: 14, color: C.accent6 });
  });
  T(s, 'Demo figures from devnet. Finalized ≈ 12.8 s today; Alpenglow targets ~150 ms.', { x: 0.6, y: 6.6, w: 9, h: 0.3, fontSize: 10, color: C.accent6 });

  // =============================== 16. MODULAR ==================================
  s = content('Modular by design', 'Switch on only what each deployment needs', 'Twelve modules, each with its own switch: payments core, ledger, checkout, Solana settlement, crypto pay-in, oracle, disputes, subscriptions, rolling reserve, reporting, webhooks and the white-label reseller module. Four extension seams mean new processors, custody providers, oracles and settlement rails plug in without core changes.');
  shot(s, '22-modules.png', 0.6, 1.95, 7.2, 'Modules screenshot');
  await rows(s, [
    ['FiCpu', 'ProcessorAdapter', 'Cards, UPI, wallets, chains'],
    ['FiKey', 'WalletProvider', 'MPC custody, HSM, self-custody'],
    ['FiActivity', 'PriceOracle', 'CoinGecko, Chainlink, Pyth'],
    ['FiSend', 'SettlementRail', 'BridgeRoute: any chain → Solana'],
  ], 8.3, 2.0, 4.4, 1.12);

  // =============================== 17. API SURFACE ==============================
  sec('APIs');
  s = content('API surface', 'REST + OpenAPI 3 · Bearer scopes · idempotency · HMAC on money moves', 'These are real routes from the KPay codebase. Partner routes take Bearer keys with scopes and an Idempotency-Key. Money-moving mutations also need an HMAC X-KP-Signature. The full contract, including every webhook event, is published at /openapi.json.');
  const api = [
    ['POST', '/api/v1/payment_links', 'Create a hosted payment link', 'Bearer + idempotency'],
    ['POST', '/api/v1/payment_intents', 'Create a server-side payment', 'Bearer + idempotency'],
    ['POST', '/api/v1/payment_intents/:id/capture', 'Confirm / capture / cancel', 'HMAC signed'],
    ['POST', '/api/v1/refunds', 'Refund a payment', 'HMAC signed'],
    ['POST', '/api/v1/payouts', 'Pay out to a wallet', 'HMAC signed'],
    ['POST', '/v2/api/web/admin/merchants/onboard', 'Onboard a merchant (pending)', 'Admin session'],
    ['POST', '/v2/api/web/admin/merchants/:id/approve', 'Approve to live', 'Admin session'],
    ['GET', '/openapi.json', 'Full contract incl. webhooks', 'Public'],
  ];
  const th = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: '22223A' }, fontSize: 14 } });
  s.addTable([[th('Method'), th('Endpoint'), th('Purpose'), th('Auth')], ...api.map(([m, p, d, a]) => [
    { text: m, options: { bold: true, color: m === 'GET' ? C.accent3 : C.accent2, fontSize: 14, fill: { color: HEX.dk2 } } },
    { text: p, options: { fontFace: 'Courier New', fontSize: 13, color: C.background1, fill: { color: HEX.dk2 } } },
    { text: d, options: { fontSize: 14, color: C.background2, fill: { color: HEX.dk2 } } },
    { text: a, options: { fontSize: 14, color: C.accent6, fill: { color: HEX.dk2 } } }])],
  { x: 0.6, y: 1.85, w: 12.1, colW: [1.15, 5.0, 3.3, 2.65], rowH: 0.5, valign: 'middle', border: { type: 'solid', color: '0B0B14', pt: 2 }, fontFace: 'Calibri', objectName: 'API table' });

  // =============================== 18. API + SOLANA =============================
  s = content('Integrate in minutes, settle on Solana', 'One request in, one signed webhook out, Solana primitives underneath', 'Left: create a link that accepts card, UPI and Solana stablecoins and settles in USDT on Solana. Middle: the signed webhook the merchant receives, with the Solana signature and commitment. Right: the Solana building blocks KPay uses. The settlement block in the request is the Solana rail being added on the existing settlement-rail seam.');
  const code1 = 'POST /api/v1/payment_links\nAuthorization: Bearer sk_live_…\nIdempotency-Key: ord_2231\n\n{\n  "amount": "249.00",\n  "currency": "USD",\n  "methods": ["card","upi","crypto"],\n  "pay_in_chains": ["solana","tron",\n    "ethereum","polygon","bsc"],\n  "settlement": {\n    "chain": "solana",\n    "asset": "USDT",\n    "mode": "auto"\n  }\n}';
  const code2 = '// header x-kp-signature: t,v1\n{\n  "type": "payment.succeeded",\n  "data": {\n    "id": "pay_01J8…",\n    "amount": "249.00",\n    "method": "crypto",\n    "paid_on": "tron",\n    "asset": "USDT",\n    "signature": "5h3Kq…xP9",\n    "commitment": "finalized"\n  }\n}';
  panel(s, 0.6, 1.9, 4.1, 4.85, 'request code', { fill: '0F0F1C' });
  T(s, 'Request', { x: 0.85, y: 2.05, w: 3.6, h: 0.35, fontSize: 14, bold: true, color: C.accent2 });
  T(s, code1, { x: 0.85, y: 2.45, w: 3.7, h: 4.2, fontSize: 12, fontFace: 'Courier New', color: C.background2 });
  panel(s, 4.9, 1.9, 3.7, 4.85, 'webhook code', { fill: '0F0F1C' });
  T(s, 'Signed webhook', { x: 5.15, y: 2.05, w: 3.2, h: 0.35, fontSize: 14, bold: true, color: C.accent2 });
  T(s, code2, { x: 5.15, y: 2.45, w: 3.35, h: 4.2, fontSize: 12, fontFace: 'Courier New', color: C.background2 });
  await rows(s, [
    ['FiMaximize', 'Solana Pay', 'Transfer requests with reference keys'],
    ['FiDollarSign', 'SPL + Token-2022', 'USDT, USDC, PYUSD, ATAs'],
    ['FiZap', 'Priority fees', 'Reliable landing at peak'],
    ['FiCheckSquare', 'Finalized only', 'Ledger credits at finalized'],
    ['FiActivity', 'Pyth / Chainlink', 'Quorum pricing for quotes'],
  ], 8.85, 1.95, 3.85, 0.96, { hs: 15, bs: 14 });

  // =============================== 19. SELF-HOSTED ==============================
  sec('Business');
  s = content('Self-hosted, not open source', 'Your servers, your keys, your data, under a commercial licence', 'KPay ships as signed container images with Helm charts: gateway, worker and scheduler on PostgreSQL 16 and Redis 7, with your Solana RPC. Keys stay in your MPC or HSM, so KPay never touches funds. Licence is commercial and closed source, with source escrow for enterprises.');
  shot(s, '24-self-hosted.png', 0.6, 1.95, 7.2, 'Self-hosted deployment screenshot');
  await rows(s, [
    ['FiBox', 'Docker + Kubernetes', 'Signed images, Helm chart, migrations included'],
    ['FiDatabase', 'PostgreSQL 16 + Redis 7', 'Your database, your region'],
    ['FiKey', 'Your MPC / HSM', 'KPay never holds merchant funds'],
    ['FiFileText', 'Commercial licence', 'Closed source; escrow for enterprise'],
  ], 8.3, 2.0, 4.4, 1.12);

  // =============================== 20. BUSINESS MODEL ===========================
  s = content('Business model', 'Recurring licence plus usage that grows with settled volume', 'Three revenue lines. Annual licence per deployment, tiered by level (merchant, platform, PSP, bank). A basis-point usage fee on volume settled through the Solana rail. Enterprise support, SLAs and white-label onboarding. On top, operators earn MDR and the FX buffer on conversion inside their own deployment.');
  const bm = [['FiAward', 'Licence', 'Annual, per deployment, tiered L1 to L4'], ['FiTrendingUp', 'Usage', 'Basis points on volume settled on Solana'], ['FiLifeBuoy', 'Enterprise', 'SLA support, white-label onboarding, escrow']];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 4.15;
    panel(s, x, 1.95, 3.85, 3.0, 'revenue ' + bm[i][1]);
    await icon(s, bm[i][0], x + 0.35, 2.25, 0.7);
    T(s, bm[i][1], { x: x + 0.35, y: 3.15, w: 3.15, h: 0.5, fontSize: 22, bold: true, color: C.background1, fontFace: 'Arial' });
    T(s, bm[i][2], { x: x + 0.35, y: 3.7, w: 3.15, h: 1.0, fontSize: 16, color: C.accent6 });
  }
  panel(s, 0.6, 5.2, 12.1, 1.45, 'operator economics', { fill: '16231F', line: '1F6B4E' });
  T(s, [{ text: 'Operators keep their own economics.  ', options: { bold: true, color: C.accent2 } }, { text: 'MDR per method and the FX buffer on conversion are earned inside each deployment and reported per asset in Platform Earnings. KPay never sits in the flow of funds.', options: { color: C.background2 } }], { x: 0.9, y: 5.3, w: 11.5, h: 1.25, fontSize: 16, valign: 'middle' });

  // =============================== 21. ROADMAP ==================================
  s = content('Roadmap', 'From demo to every operator on Solana', 'Now (demo): Solana Pay checkout, other-chain USDT merged into Solana, and auto-settlement in USDT. Next: a mainnet pilot with design partners, then new stablecoins, faster finality and local off-ramps.');
  const rm = [
    ['Now · demo', C.accent2, '16231F', '1F6B4E', ['Solana Pay USDT checkout', 'Other-chain USDT merged to Solana', 'Auto-settle USDT to merchant wallets', 'Onboarding, rollout, routing']],
    ['Q4 2026', C.accent1, '1A1230', '4B2F8A', ['Mainnet pilot with design partners', 'Bridge routes hardened per chain', 'Pyth in the oracle quorum', 'Devnet sandbox for integrators']],
    ['2027', C.accent3, '0F1E2A', '1F4E6B', ['Token-2022 stablecoins (PYUSD, USDG)', 'Alpenglow-era sub-second finality', 'Off-ramp partners in India, SEA, MENA', 'White-label PSP program']],
  ];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 4.15;
    panel(s, x, 1.95, 3.85, 4.75, 'roadmap ' + rm[i][0], { fill: rm[i][2], line: rm[i][3] });
    T(s, rm[i][0], { x: x + 0.3, y: 2.15, w: 3.3, h: 0.5, fontSize: 22, bold: true, color: rm[i][1], fontFace: 'Arial' });
    T(s, rm[i][4].map((t, j, a) => ({ text: t, options: { bullet: true, breakLine: j < a.length - 1, paraSpaceAfter: 8 } })), { x: x + 0.3, y: 2.8, w: 3.3, h: 3.7, fontSize: 15, color: C.background2 });
  }

  // =============================== 22. ASK / CLOSE ==============================
  sec('Close');
  s = pres.addSlide({ masterName: 'KP_TITLE', sectionTitle: section });
  s.addText([{ text: 'Own the stack.', options: { breakLine: true } }, { text: 'Settle on Solana.', options: { color: C.accent2 } }], { placeholder: 'title' });
  s.addText('KPay brings every PSP, platform and bank that installs it onto Solana as a settlement layer.', { placeholder: 'body' });
  T(s, 'Our ask to the Solana ecosystem', { x: 7.7, y: 1.6, w: 5.0, h: 0.5, fontSize: 20, bold: true, color: C.background1, fontFace: 'Arial' });
  await rows(s, [
    ['FiAward', 'Grant + co-marketing', 'Ship the Solana settlement rail GA'],
    ['FiLink', 'Stablecoin + off-ramp intros', 'Issuers and local off-ramp partners'],
    ['FiServer', 'RPC infrastructure', 'Dedicated RPC for self-hosted installs'],
    ['FiUsers', 'Pilot merchants + PSPs', 'Five design partners for Q4 2026'],
  ], 7.7, 2.3, 5.0, 1.05);
  s.addNotes('Close on the ask. Every KPay install becomes a PSP, platform or bank settling on Solana, so the ecosystem gets distribution through operators rather than one merchant at a time.');

  const out = path.join(ROOT, 'deck', 'KPay-Solana-Pitch.pptx');
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log('wrote', out);
})().catch((e) => { console.error(e); process.exit(1); });

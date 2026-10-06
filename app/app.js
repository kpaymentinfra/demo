/* KPay demo console - self-contained, in-memory, no backend. */
(function () {
  const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const b58 = (n) => Array.from({ length: n }, () => B58[Math.floor(Math.random() * 58)]).join('');
  const short = (s, a = 6, b = 6) => s.slice(0, a) + '…' + s.slice(-b);
  const fmt = (n, c = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: c, maximumFractionDigits: 2 }).format(n);
  const id = (p) => p + '_' + Math.random().toString(36).slice(2, 10);
  const USDT_MINT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';
  const TREASURY = 'KPay' + b58(40);

  const S = {
    user: null,
    loginStep: 'creds',
    merchants: [
      { id: 'mer_01HZBOOTH', name: 'Booth Coffee Co.', country: 'United States', state: 'live', methods: ['card', 'upi', 'crypto'], wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', volume: 184320 },
      { id: 'mer_01HZNOVA', name: 'Nova Games Ltd', country: 'Singapore', state: 'live', methods: ['card', 'crypto'], wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', volume: 402115 },
      { id: 'mer_01HZSARI', name: 'Saree Studio', country: 'India', state: 'live', methods: ['card', 'upi'], wallet: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH', volume: 96440 },
      { id: 'mer_01HZPEND', name: 'Atlas Travel', country: 'UAE', state: 'pending_approval', methods: ['card'], wallet: '—', volume: 0 },
    ],
    links: [
      { id: 'plink_8f2k1q', title: 'Annual Pro plan', amount: 249, currency: 'USD', methods: ['card', 'crypto'], status: 'active', paid: 37, merchant: 'Nova Games Ltd' },
      { id: 'plink_3mz9xa', title: 'Coffee subscription', amount: 18, currency: 'USD', methods: ['card', 'upi', 'crypto'], status: 'active', paid: 412, merchant: 'Booth Coffee Co.' },
      { id: 'plink_q71dd0', title: 'Silk saree - order #2231', amount: 7499, currency: 'INR', methods: ['card', 'upi'], status: 'paid', paid: 1, merchant: 'Saree Studio' },
    ],
    settlements: [
      { id: 'stl_01J8A1', merchant: 'Nova Games Ltd', amount: 38240.55, src: 'Tron · USDT', status: 'pending_approval', wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' },
      { id: 'stl_01J8A0', merchant: 'Booth Coffee Co.', amount: 6402.1, src: 'Ethereum · USDT', status: 'finalized', auto: true, wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', sig: b58(87), ms: 431 },
      { id: 'stl_01J89Z', merchant: 'Saree Studio', amount: 2210.0, src: 'UPI · INR', status: 'finalized', auto: true, wallet: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH', sig: b58(87), ms: 412 },
      { id: 'stl_01J89Y', merchant: 'Nova Games Ltd', amount: 12904.0, src: 'Solana Pay · USDT', status: 'finalized', auto: true, wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', sig: b58(87), ms: 388 },
      { id: 'stl_01J89X', merchant: 'Booth Coffee Co.', amount: 3120.75, src: 'Polygon · USDT', status: 'finalized', auto: true, wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', sig: b58(87), ms: 455 },
    ],
    rollout: {
      kill: false, stage: 40,
      networks: [
        { k: 'solana', n: 'Solana', tok: 'USDT (SPL)', on: true, primary: true, fin: '~0.4s slot · finalized', fee: '< $0.001' },
        { k: 'tron', n: 'Tron', tok: 'USDT (TRC-20)', on: true, fin: '~57s solidified', fee: '~$1-2' },
        { k: 'ethereum', n: 'Ethereum', tok: 'USDT (ERC-20)', on: true, fin: '~13 min', fee: '$0.5-5' },
        { k: 'polygon', n: 'Polygon', tok: 'USDT (PoS)', on: true, fin: '~5s', fee: '~$0.01' },
        { k: 'bsc', n: 'BNB Chain', tok: 'USDT (BEP-20)', on: false, fin: '~7.5s', fee: '~$0.05' },
      ],
      cohort: [
        { m: 'Nova Games Ltd', cap: 50000, used: 31420, on: true },
        { m: 'Booth Coffee Co.', cap: 10000, used: 2140, on: true },
        { m: 'Saree Studio', cap: 5000, used: 0, on: false },
      ],
    },
    connectors: [
      { k: 'card', n: 'Card Acquirer', d: 'Visa · Mastercard · Amex — 13 currencies', kind: 'Card', c: '#00C2FF', on: true, pr: 1, sr: 96.4 },
      { k: 'upi', n: 'UPI Rail', d: 'India UPI collect + intent, INR', kind: 'UPI', c: '#FFB547', on: true, pr: 1, sr: 94.1 },
      { k: 'solpay', n: 'Solana Pay', d: 'USDT SPL pay-in, reference-tracked', kind: 'Crypto', c: '#14F195', on: true, pr: 1, sr: 99.7 },
      { k: 'multi', n: 'Multichain → Solana', d: 'USDT on Tron · Ethereum · Polygon · BSC, auto-merged to Solana', kind: 'Crypto', c: '#9945FF', on: true, pr: 2, sr: 98.9 },
      { k: 'card2', n: 'Backup Card Acquirer', d: 'Failover route for declines & outages', kind: 'Card', c: '#5C7CFF', on: true, pr: 2, sr: 93.0 },
      { k: 'custody', n: 'Custody (MPC)', d: 'Treasury wallets + payouts, policy-signed', kind: 'Payout', c: '#FF5C7A', on: true, pr: 1, sr: 100 },
    ],
    modules: [
      ['Payments core', 'Intents, attempts, routing & failover', true, 'core'],
      ['Double-entry ledger', 'Append-only, per-asset zero-sum balances', true, 'core'],
      ['Hosted checkout', 'Branded payment pages & links', true, 'core'],
      ['Solana settlement', 'Auto-settle USDT to merchant wallets on Solana', true, 'crypto'],
      ['Cross-chain merge', 'Sweep + bridge other-chain USDT into Solana', true, 'crypto'],
      ['Rate oracle', 'Quorum pricing (CoinGecko + Chainlink/Pyth)', true, 'crypto'],
      ['Disputes & chargebacks', 'Ledger holds and evidence flow', true, 'ops'],
      ['Subscriptions & mandates', 'Recurring charges on saved tokens', false, 'ops'],
      ['Rolling reserve', 'Risk holdback per merchant', true, 'risk'],
      ['MIS & reporting', 'CSV / XLSX / PDF exports', true, 'ops'],
      ['Webhooks', 'Signed, retried, replayable events', true, 'dev'],
      ['White-label reseller', 'Multi-tenant partners on one install', false, 'ops'],
    ],
    feed: [],
    wiz: { step: 0, data: {} },
    co: null,
  };

  // --- helpers ---------------------------------------------------------------
  const $ = (s) => document.querySelector(s);
  const root = $('#root');
  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = '✓ ' + msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2600);
  }
  function go(h) { location.hash = h; }
  const pill = (state) => ({
    live: '<span class="pill p-green"><i class="dot"></i>Live</span>',
    pending_approval: '<span class="pill p-amber"><i class="dot"></i>Pending approval</span>',
    active: '<span class="pill p-green">Active</span>',
    paid: '<span class="pill p-cyan">Paid</span>',
    finalized: '<span class="pill p-green"><i class="dot"></i>Finalized</span>',
    broadcasting: '<span class="pill p-amber"><i class="dot"></i>Broadcasting</span>',
    approved: '<span class="pill p-purple">Approved</span>',
  }[state] || `<span class="pill p-gray">${state}</span>`);
  const mchips = (ms) => ms.map((m) => `<span class="pill ${m === 'crypto' ? 'p-purple' : m === 'upi' ? 'p-amber' : 'p-cyan'}">${m === 'crypto' ? 'Crypto · SOL' : m.toUpperCase()}</span>`).join(' ');

  // --- shell -------------------------------------------------------------------
  const NAV = [
    ['Overview', [['dashboard', '◎', 'Dashboard'], ['merchants', '▣', 'Merchants'], ['payment-links', '⛓', 'Payment links'], ['transactions', '≋', 'Transactions']]],
    ['Money movement', [['settlements', '◈', 'Solana settlement'], ['crypto-rollout', '⚑', 'Crypto rollout'], ['processors', '⇄', 'Processors & routing']]],
    ['Platform', [['modules', '⬡', 'Modules'], ['developers', '{ }', 'Developers & API'], ['deployment', '⛁', 'Self-hosted']]],
  ];
  function shell(key, title, sub, body, actions = '') {
    return `<div class="shell"><aside class="side">
      <div class="brand"><div class="logo">K</div><div><b>KPay</b><small>Payment Gateway Console</small></div></div>
      <nav class="nav">${NAV.map(([s, items]) => `<div class="sec">${s}</div>` + items.map(([k, ic, n]) => `<a href="#/${k}" class="${k === key ? 'on' : ''}" data-nav="${k}"><span class="ic">${ic}</span>${n}</a>`).join('')).join('')}</nav>
      <div class="foot"><span class="env"><i class="dot"></i>Self-hosted · devnet</span><div style="margin-top:8px">kpay.yourcompany.com<br>v2.6.0 · licence: Enterprise</div></div>
    </aside><main class="main">
      <div class="top"><div><h1>${title}</h1><div class="sub">${sub}</div></div>
        <div class="row">${actions}<div class="who"><div class="avatar">PA</div><div><b>${S.user ? S.user.name : ''}</b><div class="muted small">Platform admin</div></div></div></div></div>
      <div class="page">${body}</div></main></div>`;
  }

  // --- pages -------------------------------------------------------------------
  function login() {
    const creds = `<h1>Sign in to KPay</h1><p class="muted" style="margin-bottom:26px">One login for platform admins and merchants.</p>
      <div style="margin-bottom:14px"><label>Email</label><input id="email" placeholder="you@company.com" autocomplete="off"></div>
      <div style="margin-bottom:20px"><label>Password</label><input id="pw" type="password" placeholder="••••••••••"></div>
      <button class="btn primary lg" style="width:100%;justify-content:center" id="signin" onclick="KP.signin()">Sign in</button>
      <p class="muted small" style="margin-top:16px">Argon2 hashed · lockout · MFA enforced for admins</p>`;
    const mfa = `<h1>Two-factor verification</h1><p class="muted" style="margin-bottom:26px">Enter the 6-digit code from your authenticator app.</p>
      <div class="otp">${[0, 1, 2, 3, 4, 5].map((i) => `<input maxlength="1" class="otpi" id="otp${i}">`).join('')}</div>
      <button class="btn primary lg mt2" style="width:100%;justify-content:center" id="verify" onclick="KP.verify()">Verify &amp; continue</button>`;
    return `<div class="login-wrap"><div class="login-art">
      <div class="brand"><div class="logo">K</div><div><b>KPay</b><small>Private payment infrastructure</small></div></div>
      <div><span class="pill p-green" style="margin-bottom:18px">◎ Self-hosted · private · permissionless</span>
        <h2>Payment infrastructure for <span class="grad-text">humans &amp; AI agents.</span></h2>
        <p>Accept card and crypto payments on infrastructure you own and control. Every chain auto-settles as USDT on Solana.</p></div>
      <div class="login-stats"><div><b>~0.4s</b><span>Solana slot time</span></div><div><b>&lt;$0.001</b><span>per settlement tx</span></div><div><b>24/7</b><span>settlement, no bank cut-off</span></div></div>
    </div><div class="login-form"><div class="login-box">${S.loginStep === 'creds' ? creds : mfa}</div></div></div>`;
  }

  function dashboard() {
    const bars = [32, 45, 38, 52, 61, 48, 70, 66, 74, 81, 77, 92];
    const feed = S.feed.slice(0, 6).map((f) => `<tr class="${f.fresh ? 'flash' : ''}"><td class="mono small">${f.id}</td><td>${f.m}</td><td>${mchips([f.method])}</td><td><b>${fmt(f.amt)}</b></td><td>${pill(f.st)}</td></tr>`).join('');
    S.feed.forEach((f) => (f.fresh = false));
    return shell('dashboard', 'Dashboard', 'Platform-wide view · all merchants · last 24 hours', `
      <div class="grid g4">
        <div class="card kpi"><div class="l">Gross volume (24h)</div><div class="v">$1.28M</div><div class="d">▲ 18.2% vs yesterday</div></div>
        <div class="card kpi"><div class="l">Authorization rate</div><div class="v">96.8%</div><div class="d">▲ 2.1 pts with smart failover</div></div>
        <div class="card kpi"><div class="l">Settled on Solana (24h)</div><div class="v grad-text">$842,310</div><div class="d">USDT · 1,204 auto-settlements</div></div>
        <div class="card kpi"><div class="l">Median settlement time</div><div class="v">0.9s</div><div class="d">vs T+2 on bank rails</div></div>
      </div>
      <div class="grid g2 mt" style="grid-template-columns:1.4fr 1fr">
        <div class="card"><h3>Volume by hour <span class="legend"><span>■ Card</span><span>■ UPI</span><span>■ Crypto</span></span></h3>
          <div class="bars">${bars.map((h) => `<div style="height:${h}%"></div>`).join('')}</div>
          <div class="between small muted mt"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>now</span></div></div>
        <div class="card"><h3>Payment mix</h3>
          ${[['Card', 52, 'var(--cyan)'], ['UPI', 19, 'var(--amber)'], ['USDT via Solana Pay', 17, 'var(--green)'], ['USDT other chains → Solana', 10, 'var(--purple)']].map(([n, p, c]) => `<div style="margin-bottom:12px"><div class="between small"><span>${n}</span><b>${p}%</b></div><div class="meter"><i style="width:${p}%;background:${c}"></i></div></div>`).join('')}
          <div class="small muted">Every chain and method merges into one USDT treasury on Solana.</div></div>
      </div>
      <div class="grid g2 mt" style="grid-template-columns:1.4fr 1fr">
        <div class="card"><h3>Live transactions <span class="pill p-green"><i class="dot"></i>streaming</span></h3>
          <table><thead><tr><th>ID</th><th>Merchant</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead><tbody id="feed">${feed}</tbody></table></div>
        <div class="card"><h3>Solana settlement health</h3>
          <div class="flow small"><span class="n">Ledger</span><span class="arr">→</span><span class="n">Approval</span><span class="arr">→</span><span class="n">MPC sign</span><span class="arr">→</span><span class="n" style="border-color:var(--green)">Finalized</span></div>
          <table class="mt"><tbody>
            <tr><td class="muted">RPC cluster</td><td><span class="pill p-green">healthy · 3/3</span></td></tr>
            <tr><td class="muted">Solana treasury (USDT)</td><td><b>$2,418,902.11</b></td></tr>
            <tr><td class="muted">SOL fee balance</td><td>14.82 SOL</td></tr>
            <tr><td class="muted">Pending approvals</td><td><a href="#/settlements">${S.settlements.filter((s) => s.status === 'pending_approval').length} requests →</a></td></tr>
          </tbody></table></div>
      </div>`);
  }

  function merchants() {
    return shell('merchants', 'Merchants', 'Every merchant is born pending and goes live only after admin approval', `
      <div class="grid g4">
        <div class="card kpi"><div class="l">Live merchants</div><div class="v">${S.merchants.filter((m) => m.state === 'live').length}</div></div>
        <div class="card kpi"><div class="l">Pending approval</div><div class="v" style="color:var(--amber)">${S.merchants.filter((m) => m.state === 'pending_approval').length}</div></div>
        <div class="card kpi"><div class="l">KYC auto-checks</div><div class="v">98%</div><div class="d">pass first time</div></div>
        <div class="card kpi"><div class="l">Avg. time to live</div><div class="v">11 min</div></div>
      </div>
      <div class="card mt"><table><thead><tr><th>Merchant</th><th>Country</th><th>Methods</th><th>Settlement wallet (Solana)</th><th>30d volume</th><th>Status</th><th></th></tr></thead><tbody>
        ${S.merchants.map((m) => `<tr class="${m.fresh ? 'flash' : ''}"><td><b>${m.name}</b><div class="mono small muted">${m.id}</div></td><td>${m.country}</td><td>${mchips(m.methods)}</td><td class="mono small">${m.wallet.length > 20 ? short(m.wallet) : m.wallet}</td><td>${fmt(m.volume)}</td><td>${pill(m.state)}</td>
        <td>${m.state === 'pending_approval' ? `<button class="btn sm green" data-approve="${m.id}" onclick="KP.approve('${m.id}')">Review &amp; approve</button>` : '<button class="btn sm">View</button>'}</td></tr>`).join('')}
      </tbody></table></div>`, `<button class="btn primary" id="onboard" onclick="KP.go('#/merchants/new')">+ Onboard merchant</button>`);
  }

  function onboard() {
    const w = S.wiz; const st = ['Business profile', 'KYC documents', 'Methods & processors', 'Solana settlement'];
    const steps = `<div class="steps">${st.map((s, i) => `<div class="step ${i === w.step ? 'on' : i < w.step ? 'done' : ''}"><b>Step ${i + 1}</b>${i < w.step ? '✓ ' : ''}${s}</div>`).join('')}</div>`;
    let body = '';
    if (w.step === 0) body = `<div class="form">
      <div><label>Legal business name</label><input id="f_name" value="${w.data.name || ''}"></div>
      <div><label>Country of incorporation</label><select id="f_country"><option>United States</option><option>Singapore</option><option>India</option><option>UAE</option><option>United Kingdom</option></select></div>
      <div><label>Business email</label><input id="f_email" value="${w.data.email || ''}"></div>
      <div><label>Website</label><input id="f_web" value="${w.data.web || ''}"></div>
      <div><label>Category (MCC)</label><select><option>5734 · Computer software stores</option><option>5812 · Restaurants</option><option>4722 · Travel agencies</option></select></div>
      <div><label>Expected monthly volume</label><select><option>$50k – $250k</option><option>$250k – $1M</option><option>$1M+</option></select></div></div>`;
    if (w.step === 1) body = `<div class="grid g2">
      ${['Certificate of incorporation', 'Director ID (passport)', 'Proof of address', 'Bank / wallet ownership proof'].map((d, i) => `<div class="drop ${w.data['doc' + i] ? 'ok' : ''}" id="doc${i}" onclick="KP.doc(${i})"><span style="font-size:22px">${w.data['doc' + i] ? '✓' : '⇪'}</span><div><b>${d}</b><div class="small">${w.data['doc' + i] ? 'verified · OCR + liveness passed' : 'Click to upload PDF / JPG'}</div></div></div>`).join('')}
      </div><div class="card mt small muted">Sanctions screening, UBO check and website review run automatically. Results are attached to the approval request.</div>`;
    if (w.step === 2) body = `<label>Payment methods</label><div class="row" style="flex-wrap:wrap;margin-bottom:20px">
      ${[['card', 'Cards'], ['upi', 'UPI'], ['crypto', 'Stablecoins (Solana Pay)']].map(([k, n]) => `<span class="chip ${(w.data.methods || []).includes(k) ? 'on' : ''}" id="m_${k}" onclick="KP.toggleMethod('${k}')">${(w.data.methods || []).includes(k) ? '✓' : '+'} ${n}</span>`).join('')}</div>
      <label>Processors (priority order — failover is automatic)</label>
      <table><tbody>${S.connectors.filter((c) => c.kind !== 'Payout').map((c) => `<tr><td><b>${c.n}</b><div class="small muted">${c.d}</div></td><td><span class="pill p-gray">${c.kind}</span></td><td>Priority ${c.pr}</td><td><button class="tg on"></button></td></tr>`).join('')}</tbody></table>`;
    if (w.step === 3) body = `<div class="form">
      <div class="full"><label>Merchant settlement wallet (Solana address)</label><input id="f_wallet" class="mono" value="${w.data.wallet || ''}" placeholder="e.g. 7xKX…sgAsU"></div>
      <div><label>Settlement asset</label><select><option>USDT (SPL) — all chains merged</option><option>USDC (SPL)</option></select></div>
      <div><label>Schedule</label><select><option>Auto-settle (approval above $25,000)</option><option>Instant, after admin approval</option><option>Daily sweep 00:00 UTC</option><option>Weekly</option></select></div>
      <div><label>MDR (card / UPI / crypto)</label><input value="2.4% / 1.2% / 0.8%"></div>
      <div><label>Rolling reserve</label><input value="5% · 90 days"></div>
      <div class="full card small"><b class="grad-text">Wallet verified on-chain</b> <span class="muted">— address is on curve, USDT associated token account exists, not on sanctions list. Ownership proven by signed message.</span></div></div>`;
    const nav = `<div class="between mt2"><button class="btn" onclick="KP.wizBack()" ${w.step === 0 ? 'disabled style="opacity:.4"' : ''}>← Back</button>
      <button class="btn primary" id="wiznext" onclick="KP.wizNext()">${w.step === 3 ? 'Submit for approval' : 'Continue →'}</button></div>`;
    return shell('merchants', 'Onboard merchant', 'Admin-driven onboarding · merchant is created in pending_approval', `<div style="max-width:880px">${steps}<div class="card">${body}</div>${nav}</div>`);
  }

  function links() {
    return shell('payment-links', 'Payment links', 'Share a link — payer chooses card, UPI or stablecoin; merchant auto-settles in USDT on Solana', `
      <div class="card"><table><thead><tr><th>Link</th><th>Merchant</th><th>Amount</th><th>Methods</th><th>Payments</th><th>Status</th><th></th></tr></thead><tbody>
      ${S.links.map((l) => `<tr class="${l.fresh ? 'flash' : ''}"><td><b>${l.title}</b><div class="mono small muted">pay.kpay.dev/${l.id}</div></td><td>${l.merchant}</td><td><b>${fmt(l.amount, l.currency)}</b></td><td>${mchips(l.methods)}</td><td>${l.paid}</td><td>${pill(l.status)}</td><td><button class="btn sm" onclick="KP.go('#/checkout/${l.id}')">Open checkout ↗</button></td></tr>`).join('')}
      </tbody></table></div>`, `<button class="btn primary" id="newlink" onclick="KP.go('#/payment-links/new')">+ Create payment link</button>`);
  }

  function newLink() {
    const d = S.newLink || (S.newLink = { methods: ['card', 'upi', 'crypto'] });
    const res = d.created ? `<div class="card mt" style="border-color:var(--green)"><h3>Link created ${pill('active')}</h3>
      <div class="row"><input class="mono" readonly value="https://pay.kpay.dev/${d.created}" id="linkurl"><button class="btn" onclick="KP.toast('Link copied')">Copy</button><button class="btn primary" id="opencheckout" onclick="KP.go('#/checkout/${d.created}')">Open checkout ↗</button></div>
      <div class="small muted mt">Also available via API: <span class="mono">POST /api/v1/payment_links</span></div></div>` : '';
    return shell('payment-links', 'Create payment link', 'Full checkout config is carried by the link', `<div style="max-width:880px"><div class="card"><div class="form">
      <div><label>Merchant</label><select id="l_merchant">${S.merchants.filter((m) => m.state === 'live').map((m) => `<option>${m.name}</option>`).join('')}</select></div>
      <div><label>Title</label><input id="l_title" value="${d.title || ''}" placeholder="What is the customer paying for?"></div>
      <div><label>Amount</label><input id="l_amount" value="${d.amount || ''}" placeholder="0.00"></div>
      <div><label>Currency</label><select id="l_cur"><option>USD</option><option>EUR</option><option>INR</option><option>SGD</option><option>AED</option></select></div>
      <div class="full"><label>Accepted methods</label><div class="row">${[['card', 'Card'], ['upi', 'UPI'], ['crypto', 'USDT · any chain → Solana']].map(([k, n]) => `<span class="chip ${d.methods.includes(k) ? 'on' : ''}" onclick="KP.linkMethod('${k}')">${d.methods.includes(k) ? '✓' : '+'} ${n}</span>`).join('')}</div></div>
      <div><label>Expires</label><select><option>In 7 days</option><option>In 24 hours</option><option>Never</option></select></div>
      <div><label>Quote lock for crypto</label><select><option>15 minutes (+10m grace)</option><option>30 minutes</option></select></div>
      <div class="full between"><span class="small muted">Webhook <span class="mono">payment.succeeded</span> fires to the merchant on completion.</span><button class="btn primary" id="createlink" onclick="KP.createLink()">Create link</button></div>
    </div></div>${res}</div>`);
  }

  function checkout(lid) {
    const l = S.links.find((x) => x.id === lid) || S.links[0];
    const co = S.co && S.co.id === l.id ? S.co : (S.co = { id: l.id, tab: l.methods.includes('crypto') ? 'crypto' : 'card', stage: 0, ref: b58(44) });
    const usdc = l.currency === 'INR' ? (l.amount / 83.2).toFixed(2) : l.currency === 'EUR' ? (l.amount * 1.09).toFixed(2) : Number(l.amount).toFixed(2);
    let pane = '';
    if (co.stage >= 4) pane = `<div class="success"><div class="big">✓</div><h2>Payment complete</h2><p class="muted">${co.tab === 'crypto' ? usdc + ' USDT received on Solana' : 'Paid by ' + co.tab.toUpperCase()}</p>
      <table class="mt" style="text-align:left"><tbody><tr><td class="muted">Payment</td><td class="mono">${co.pay}</td></tr>
      ${co.tab === 'crypto' ? `<tr><td class="muted">Signature</td><td class="mono"><a>${short(co.sig, 10, 8)}</a></td></tr><tr><td class="muted">Confirmed in</td><td><b>${co.ms} ms</b> · finalized</td></tr>` : ''}
      <tr><td class="muted">Merchant settles</td><td>USDT on Solana · auto</td></tr></tbody></table></div>`;
    else if (co.tab === 'crypto') {
      const url = `solana:${TREASURY}?amount=${usdc}&spl-token=${USDT_MINT}&reference=${co.ref}&label=${encodeURIComponent(l.merchant)}&message=${encodeURIComponent(l.title)}`;
      pane = `<div class="net" style="margin-bottom:14px"><span class="chip on">◎ Solana · USDT</span><span class="chip">Tron · USDT → Solana</span><span class="chip">Ethereum · USDT → Solana</span><span class="chip">Polygon · USDT</span></div>
        <div class="row" style="align-items:flex-start;gap:20px"><div class="qr" id="qr"></div><div style="flex:1">
          <div class="muted small">Scan with Phantom, Solflare or Backpack</div><div style="font-size:26px;font-weight:800;margin:6px 0">${usdc} <span class="grad-text">USDT</span></div>
          <div class="small muted">Rate locked · <b style="color:var(--amber)">14:52</b> remaining</div>
          <div class="small mt"><span class="muted">Reference</span><div class="mono" style="font-size:11px">${short(co.ref, 12, 8)}</div></div>
          <div class="timeline">${['Waiting for transfer', 'Transaction detected', 'Confirmed on-chain', 'Finalized & credited'].map((t, i) => `<div class="tl ${co.stage > i ? 'on' : co.stage === i ? 'act' : ''}"><span class="b">${co.stage > i ? '✓' : ''}</span>${t}</div>`).join('')}</div>
        </div></div>
        <button class="btn primary lg mt" style="width:100%;justify-content:center" id="paywallet" onclick="KP.payCrypto()">Pay with Phantom</button>`;
      setTimeout(() => { const q = qrcode(0, 'M'); q.addData(url); q.make(); const el = $('#qr'); if (el) el.innerHTML = q.createImgTag(5, 0); }, 0);
    } else if (co.tab === 'card') pane = `<div class="form"><div class="full"><label>Card number</label><input id="cardno" class="mono" placeholder="4242 4242 4242 4242"></div>
        <div><label>Expiry</label><input id="cardexp" placeholder="MM / YY"></div><div><label>CVC</label><input id="cardcvc" placeholder="123"></div>
        <div class="full"><label>Name on card</label><input id="cardname" placeholder="Full name"></div></div>
        <button class="btn primary lg mt2" style="width:100%;justify-content:center" id="paycard" onclick="KP.payFiat()">Pay ${fmt(l.amount, l.currency)}</button>
        <div class="small muted mt">3-D Secure · routed to best acquirer · auto-failover on decline</div>`;
    else pane = `<div><label>UPI ID</label><input id="upiid" placeholder="name@bank"></div><button class="btn primary lg mt2" style="width:100%;justify-content:center" id="payupi" onclick="KP.payFiat()">Send collect request</button><div class="small muted mt">Or scan with any UPI app — GPay, PhonePe, Paytm</div>`;
    return `<div class="co-wrap"><div class="co"><div class="co-left">
      <div class="brand" style="padding:0"><div class="logo" style="width:30px;height:30px;font-size:15px">${l.merchant[0]}</div><div><b style="font-size:16px">${l.merchant}</b><small>Secured by KPay</small></div></div>
      <div class="muted mt2">${l.title}</div><div class="amt">${fmt(l.amount, l.currency)}</div>
      ${l.methods.includes('crypto') ? `<div class="small muted">≈ ${usdc} USDT</div>` : ''}
      <div class="mt2 small muted" style="line-height:1.9">✓ PCI-DSS hosted fields<br>✓ Quote locked by Rate Quorum oracle<br>✓ Any chain auto-settles in USDT on Solana</div>
      <div class="small muted" style="margin-top:80px">pay.kpay.dev/${l.id}</div></div>
      <div class="co-right">${co.stage >= 4 ? '' : `<div class="tabs">${l.methods.map((m) => `<button class="${co.tab === m ? 'on' : ''}" id="tab_${m}" onclick="KP.coTab('${m}')">${m === 'crypto' ? '◎ Stablecoin' : m === 'card' ? '▭ Card' : '⚡ UPI'}</button>`).join('')}</div>`}${pane}</div></div></div>`;
  }

  function rollout() {
    const r = S.rollout;
    return shell('crypto-rollout', 'Crypto rollout', 'Governed, staged rollout of stablecoin acceptance and settlement', `
      <div class="grid g3">
        <div class="card"><h3>Global kill switch</h3><div class="between"><div class="small muted">Instantly halts all crypto pay-in and Solana settlement.<br>Fiat keeps working.</div><button class="tg red ${r.kill ? 'on' : ''}" id="kill" onclick="KP.kill()"></button></div>
          <div class="mt">${r.kill ? '<span class="pill p-red"><i class="dot"></i>Crypto HALTED</span>' : '<span class="pill p-green"><i class="dot"></i>Crypto operating</span>'}</div></div>
        <div class="card"><h3>Staged rollout <b id="stagev">${r.stage}%</b></h3><input type="range" min="0" max="100" value="${r.stage}" id="stage" oninput="KP.stage(this.value)" style="padding:0;accent-color:#14F195"><div class="small muted mt">Share of eligible merchants offered stablecoin checkout.</div></div>
        <div class="card"><h3>Exposure (24h)</h3><div class="kpi"><div class="v">$33,560</div><div class="small muted">of $65,000 cohort cap</div></div><div class="meter mt"><i style="width:52%"></i></div></div>
      </div>
      <div class="card mt"><h3>Networks <span class="small muted">per network · per environment</span></h3>
        <table><thead><tr><th>Network</th><th>Tokens</th><th>Finality</th><th>Tx fee</th><th>Role</th><th>Enabled</th></tr></thead><tbody>
        ${r.networks.map((n, i) => `<tr><td><b>${n.n}</b></td><td>${n.tok}</td><td>${n.fin}</td><td>${n.fee}</td><td>${n.primary ? '<span class="pill p-green">Pay-in + settlement hub</span>' : '<span class="pill p-purple">Inflow → merges to Solana</span>'}</td><td><button class="tg ${n.on ? 'on' : ''}" id="net_${n.k}" onclick="KP.net(${i})"></button></td></tr>`).join('')}
        </tbody></table></div>
      <div class="card mt"><h3>Merchant cohort &amp; exposure caps</h3><table><thead><tr><th>Merchant</th><th>Daily cap</th><th>Used today</th><th></th><th>Allow-listed</th></tr></thead><tbody>
        ${r.cohort.map((c, i) => `<tr><td><b>${c.m}</b></td><td>${fmt(c.cap)}</td><td>${fmt(c.used)}</td><td style="width:200px"><div class="meter"><i style="width:${Math.round((c.used / c.cap) * 100)}%"></i></div></td><td><button class="tg ${c.on ? 'on' : ''}" id="coh_${i}" onclick="KP.coh(${i})"></button></td></tr>`).join('')}
      </tbody></table></div>`);
  }

  function processors() {
    const cur = ['USD', 'EUR', 'INR', 'SGD', 'AED', 'GBP'];
    const cov = { card: [1, 1, 1, 1, 1, 1], upi: [0, 0, 1, 0, 0, 0], solpay: [1, 1, 1, 1, 1, 1], multi: [1, 1, 1, 1, 1, 1], card2: [1, 1, 0, 1, 0, 1] };
    return shell('processors', 'Processors & routing', 'Multi-payment integration — plug in any acquirer, rail or chain behind one API', `
      <div class="grid g3">${S.connectors.map((c) => `<div class="card conn"><div class="lg" style="background:${c.c}22;color:${c.c}">${c.n[0]}</div><div style="flex:1"><div class="between"><b>${c.n}</b><button class="tg ${c.on ? 'on' : ''}"></button></div><div class="small muted">${c.d}</div>
        <div class="row mt small"><span class="pill p-gray">${c.kind}</span><span class="muted">priority ${c.pr}</span><span class="muted">· success ${c.sr}%</span></div></div></div>`).join('')}
        <div class="card conn" style="border-style:dashed;cursor:pointer" onclick="KP.toast('Adapter SDK: implement ProcessorAdapter + register()')"><div class="lg" style="background:#22222f;color:var(--muted)">+</div><div><b>Add connector</b><div class="small muted">One adapter class + register(). No core changes.</div></div></div></div>
      <div class="grid g2 mt">
        <div class="card"><h3>Coverage matrix <span class="small muted">method × currency</span></h3><table class="matrix"><thead><tr><th>Connector</th>${cur.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>
          ${S.connectors.filter((c) => cov[c.k]).map((c) => `<tr><td><b>${c.n}</b></td>${cov[c.k].map((v) => `<td class="${v ? 'ok' : 'no'}">${v ? '●' : '○'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
        <div class="card"><h3>Routing rule · Cards (USD)</h3>
          <div class="flow"><span class="n">Payer</span><span class="arr">→</span><span class="n" style="border-color:var(--cyan)">Card Acquirer</span><span class="arr">— decline / timeout →</span><span class="n">Backup Acquirer</span></div>
          <table class="mt"><tbody><tr><td class="muted">Strategy</td><td>Priority + health-weighted</td></tr><tr><td class="muted">Failover on</td><td>soft decline, 5xx, timeout &gt; 8s</td></tr><tr><td class="muted">Never retried</td><td><span class="pill p-amber">unknown</span> outcomes → status sync first</td></tr><tr><td class="muted">Recovered last 7d</td><td><b style="color:var(--green)">$48,210</b> · 312 payments</td></tr></tbody></table></div>
      </div>`);
  }

  function modules() {
    const tag = { core: 'p-cyan', crypto: 'p-purple', ops: 'p-gray', risk: 'p-amber', dev: 'p-green' };
    return shell('modules', 'Modules', 'Modular by design — enable only what each deployment needs', `
      <div class="grid g3">${S.modules.map((m, i) => `<div class="card"><div class="between"><b>${m[0]}</b><button class="tg ${m[2] ? 'on' : ''}" id="mod_${i}" onclick="KP.mod(${i})"></button></div><div class="small muted" style="margin:6px 0 10px">${m[1]}</div><span class="pill ${tag[m[3]]}">${m[3]}</span></div>`).join('')}</div>
      <div class="card mt"><h3>Extension seams</h3><div class="grid g4 small">
        ${[['ProcessorAdapter', 'cards, UPI, wallets, chains'], ['WalletProvider', 'MPC custody, HSM, self-custody'], ['PriceOracle', 'CoinGecko, Chainlink, Pyth'], ['SettlementRail', 'Solana USDT (all chains merge here)']].map(([a, b]) => `<div><div class="mono" style="color:#c39bff">${a}</div><div class="muted">${b}</div></div>`).join('')}</div></div>`);
  }

  function settlements() {
    return shell('settlements', 'Solana settlement', 'Every chain merges into Solana — USDT auto-settles to merchant wallets, chain-verified', `
      <div class="grid g4">
        <div class="card kpi"><div class="l">Awaiting approval (over $25k)</div><div class="v" style="color:var(--amber)">${fmt(S.settlements.filter((s) => s.status === 'pending_approval').reduce((a, s) => a + s.amount, 0))}</div></div>
        <div class="card kpi"><div class="l">Auto-settled today</div><div class="v grad-text">$842,310</div><div class="d">from 5 chains + fiat</div></div>
        <div class="card kpi"><div class="l">Avg. confirmation</div><div class="v">412 ms</div><div class="d">confirmed · finalized ≈ 13s</div></div>
        <div class="card kpi"><div class="l">Avg. network fee</div><div class="v">$0.0008</div><div class="d">vs $1–2 on Tron</div></div>
      </div>
      <div class="card mt"><table><thead><tr><th>Request</th><th>Merchant</th><th>Paid on → settled on</th><th>Amount</th><th>Destination</th><th>Status</th><th>Signature</th><th></th></tr></thead><tbody>
      ${S.settlements.map((s) => `<tr class="${s.fresh ? 'flash' : ''}"><td class="mono small">${s.id}</td><td><b>${s.merchant}</b></td><td class="small">${s.src} <span class="muted">→</span> <b style="color:var(--green)">Solana</b></td><td><b>${fmt(s.amount)}</b> <span class="muted small">USDT</span></td><td class="mono small">${short(s.wallet)}</td><td>${s.auto && s.status === 'finalized' ? '<span class="pill p-green"><i class="dot"></i>Auto-settled</span>' : pill(s.status)}</td>
        <td class="mono small">${s.sig ? `<a>${short(s.sig, 8, 6)}</a><div class="muted">${s.ms} ms</div>` : '—'}</td>
        <td>${s.status === 'pending_approval' ? `<button class="btn sm green" id="appr_${s.id}" onclick="KP.settle('${s.id}')">Approve (over $25k)</button>` : ''}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="card mt"><h3>How every chain lands on Solana</h3><div class="flow">${['Payer pays on any chain', 'Deposit verified on-chain', 'Swept + bridged to Solana treasury', 'Auto-settle (approval only over $25k)', 'MPC signs USDT SPL transfer', 'Finalized on Solana', 'Ledger marks paid · webhook'].map((t, i, a) => `<span class="n">${t}</span>${i < a.length - 1 ? '<span class="arr">→</span>' : ''}`).join('')}</div></div>`);
  }

  function developers() {
    return shell('developers', 'Developers & API', 'REST API · HMAC-signed money mutations · signed webhooks · OpenAPI 3', `
      <div class="grid g2">
        <div class="card"><h3>Create a payment link</h3><pre class="code"><span class="c"># Bearer key + idempotency</span>
curl https://api.kpay.dev/api/v1/payment_links \\
  -H <span class="s">"Authorization: Bearer sk_live_…"</span> \\
  -H <span class="s">"Idempotency-Key: ord_2231"</span> \\
  -d <span class="s">'{
    "amount": "249.00", "currency": "USD",
    "methods": ["card","upi","crypto"],
    "crypto": { "networks": ["solana"],
                "assets": ["USDT"] },
    "settlement": { "rail": "solana",
                    "asset": "USDT", "mode": "auto" }
  }'</span></pre></div>
        <div class="card"><h3>Webhook: payment.succeeded</h3><pre class="code">{
  <span class="k">"type"</span>: <span class="s">"payment.succeeded"</span>,
  <span class="k">"data"</span>: {
    <span class="k">"id"</span>: <span class="s">"pay_01J8…"</span>, <span class="k">"amount"</span>: <span class="s">"249.00"</span>,
    <span class="k">"method"</span>: <span class="s">"crypto"</span>, <span class="k">"network"</span>: <span class="s">"solana"</span>,
    <span class="k">"asset"</span>: <span class="s">"USDT"</span>,
    <span class="k">"signature"</span>: <span class="s">"5h3Kq…xP9"</span>,
    <span class="k">"commitment"</span>: <span class="s">"finalized"</span>
  }
}
<span class="c"># x-kp-signature: t=1759740000,v1=HMAC-SHA256</span></pre></div>
      </div>
      <div class="card mt"><h3>API keys</h3><table><tbody>
        <tr><td><b>Production server key</b></td><td class="mono">sk_live_••••••••3f9a</td><td><span class="pill p-gray">payments:write · links · payouts</span></td><td class="muted small">SHA-256 at rest</td></tr>
        <tr><td><b>Sandbox key</b></td><td class="mono">sk_test_••••••••a17c</td><td><span class="pill p-gray">all scopes</span></td><td class="muted small">devnet</td></tr></tbody></table></div>`);
  }

  function deployment() {
    return shell('deployment', 'Self-hosted deployment', 'Your servers, your keys, your data — commercial licence, not open source', `
      <div class="grid g3">
        ${[['Gateway API', '3 replicas', 'healthy'], ['Worker (webhooks, sweeps)', '2 replicas', 'healthy'], ['Scheduler', '1 replica', 'healthy'], ['PostgreSQL 16', 'primary + replica', 'healthy'], ['Redis 7', 'sentinel', 'healthy'], ['Solana RPC', 'dedicated + 2 fallbacks', 'healthy']].map(([n, r]) => `<div class="card"><div class="between"><b>${n}</b><span class="pill p-green"><i class="dot"></i>healthy</span></div><div class="small muted mt">${r}</div></div>`).join('')}
      </div>
      <div class="grid g2 mt">
        <div class="card"><h3>Install</h3><pre class="code"><span class="c"># licensed images from the KPay registry</span>
helm repo add kpay https://charts.kpay.dev
helm install kpay kpay/gateway \\
  --set licence.key=$KPAY_LICENCE \\
  --set solana.cluster=mainnet-beta \\
  --set solana.rpc=$RPC_URL \\
  --set custody.provider=mpc</pre></div>
        <div class="card"><h3>Licence</h3><table><tbody>
          <tr><td class="muted">Edition</td><td><b>Enterprise · self-hosted</b></td></tr><tr><td class="muted">Source</td><td>Closed source, escrow available</td></tr>
          <tr><td class="muted">Data residency</td><td>100% in your VPC</td></tr><tr><td class="muted">Keys</td><td>Your MPC / HSM — KPay never holds funds</td></tr>
          <tr><td class="muted">Updates</td><td>Signed releases · migrations included</td></tr></tbody></table></div>
      </div>`);
  }

  function transactions() {
    const rows = S.feed.concat(Array.from({ length: 8 }, () => mkTxn())).slice(0, 12);
    return shell('transactions', 'Transactions', 'Every attempt, every connector call, every ledger line', `<div class="card"><table><thead><tr><th>ID</th><th>Merchant</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead><tbody>
      ${rows.map((f) => `<tr><td class="mono small">${f.id}</td><td>${f.m}</td><td>${mchips([f.method])}</td><td><b>${fmt(f.amt)}</b></td><td>${pill(f.st)}</td></tr>`).join('')}</tbody></table></div>`);
  }

  // --- router ------------------------------------------------------------------
  function render() {
    const h = location.hash.replace(/^#\/?/, '') || 'login';
    const [p, a] = h.split('/');
    if (!S.user && p !== 'login' && p !== 'checkout') return go('#/login');
    const pages = { login, dashboard, merchants, 'payment-links': links, 'crypto-rollout': rollout, processors, modules, settlements, developers, deployment, transactions };
    let html;
    if (p === 'merchants' && a === 'new') html = onboard();
    else if (p === 'payment-links' && a === 'new') html = newLink();
    else if (p === 'checkout') html = checkout(a);
    else html = (pages[p] || dashboard)();
    root.innerHTML = html;
  }
  window.addEventListener('hashchange', () => { if (!location.hash.includes('payment-links/new')) S.newLink = null; render(); window.scrollTo(0, 0); const m = document.querySelector('.main'); if (m) m.scrollTop = 0; });

  function mkTxn() {
    const ms = ['Nova Games Ltd', 'Booth Coffee Co.', 'Saree Studio'];
    const meth = ['card', 'card', 'crypto', 'upi', 'crypto'][Math.floor(Math.random() * 5)];
    return { id: id('pay'), m: ms[Math.floor(Math.random() * 3)], method: meth, amt: Math.round(Math.random() * 40000) / 100 + 5, st: Math.random() < 0.94 ? 'paid' : 'pending_approval' };
  }
  for (let i = 0; i < 6; i++) S.feed.push(mkTxn());
  setInterval(() => {
    S.feed.unshift(Object.assign(mkTxn(), { fresh: true })); S.feed.length = 20;
    if (location.hash === '#/dashboard' && !document.querySelector('.modal-bg')) {
      const tb = $('#feed'); if (tb) { const f = S.feed[0]; tb.insertAdjacentHTML('afterbegin', `<tr class="flash"><td class="mono small">${f.id}</td><td>${f.m}</td><td>${mchips([f.method])}</td><td><b>${fmt(f.amt)}</b></td><td>${pill(f.st)}</td></tr>`); if (tb.children.length > 6) tb.lastElementChild.remove(); }
    }
  }, 2200);

  // --- actions -----------------------------------------------------------------
  const KP = (window.KP = {
    go, toast,
    signin() { S.loginStep = 'mfa'; render(); },
    verify() { S.user = { name: 'Priya Admin' }; S.loginStep = 'creds'; go('#/dashboard'); toast('Signed in · MFA verified'); },
    approve(mid) {
      const m = S.merchants.find((x) => x.id === mid);
      const bg = document.createElement('div'); bg.className = 'modal-bg';
      bg.innerHTML = `<div class="modal"><h2 style="margin-bottom:6px">Approve ${m.name}?</h2><p class="muted small">KYC ✓ · Sanctions ✓ · UBO ✓ · Website review ✓ · Solana wallet ownership ✓</p>
        <div class="card mt small"><div class="between"><span>Go-live mode</span><b>live</b></div><div class="between mt"><span>Connectors enabled</span><b>${m.methods.length} selected</b></div><div class="between mt"><span>Settlement</span><b>USDT on Solana · auto</b></div></div>
        <div class="between mt2"><button class="btn" onclick="this.closest('.modal-bg').remove()">Cancel</button><button class="btn green" id="confirmapprove">Approve &amp; go live</button></div></div>`;
      document.body.appendChild(bg);
      bg.querySelector('#confirmapprove').onclick = () => { m.state = 'live'; m.fresh = true; bg.remove(); render(); m.fresh = false; toast(m.name + ' is live · merchant notified'); };
    },
    wizNext() {
      const w = S.wiz;
      if (w.step === 0) Object.assign(w.data, { name: $('#f_name').value, email: $('#f_email').value, web: $('#f_web').value, country: $('#f_country').value });
      if (w.step === 2 && !w.data.methods) w.data.methods = ['card', 'crypto'];
      if (w.step === 3) {
        w.data.wallet = $('#f_wallet').value;
        S.merchants.unshift({ id: 'mer_' + Math.random().toString(36).slice(2, 10).toUpperCase(), name: w.data.name || 'New Merchant', country: w.data.country || 'United States', state: 'pending_approval', methods: w.data.methods || ['card', 'crypto'], wallet: w.data.wallet || b58(44), volume: 0, fresh: true });
        S.wiz = { step: 0, data: {} }; go('#/merchants'); toast('Merchant created · pending approval'); setTimeout(() => (S.merchants[0].fresh = false), 50); return;
      }
      w.step++; render();
    },
    wizBack() { if (S.wiz.step > 0) { S.wiz.step--; render(); } },
    doc(i) { S.wiz.data['doc' + i] = true; render(); },
    toggleMethod(k) { const m = (S.wiz.data.methods = S.wiz.data.methods || []); const j = m.indexOf(k); j >= 0 ? m.splice(j, 1) : m.push(k); render(); },
    linkMethod(k) { const d = S.newLink; d.title = $('#l_title').value; d.amount = $('#l_amount').value; const j = d.methods.indexOf(k); j >= 0 ? d.methods.splice(j, 1) : d.methods.push(k); render(); },
    createLink() {
      const d = S.newLink; d.title = $('#l_title').value || 'Payment'; d.amount = $('#l_amount').value || '100';
      const l = { id: 'plink_' + Math.random().toString(36).slice(2, 8), title: d.title, amount: parseFloat(d.amount), currency: $('#l_cur').value, methods: d.methods.slice(), status: 'active', paid: 0, merchant: $('#l_merchant').value, fresh: true };
      S.links.unshift(l); d.created = l.id; render(); toast('Payment link created');
    },
    coTab(t) { S.co.tab = t; render(); },
    payCrypto() {
      const co = S.co; co.stage = 1; render();
      setTimeout(() => { co.stage = 2; render(); }, 1400);
      setTimeout(() => { co.stage = 3; render(); }, 2600);
      setTimeout(() => { co.stage = 4; co.sig = b58(87); co.ms = 380 + Math.floor(Math.random() * 120); co.pay = id('pay'); render(); }, 3800);
    },
    payFiat() { const co = S.co; const btn = document.querySelector('#paycard,#payupi'); if (btn) { btn.textContent = 'Authorizing…'; btn.disabled = true; } setTimeout(() => { co.stage = 4; co.pay = id('pay'); render(); }, 1600); },
    kill() { S.rollout.kill = !S.rollout.kill; render(); toast(S.rollout.kill ? 'Crypto kill switch ENGAGED' : 'Crypto resumed'); },
    stage(v) { S.rollout.stage = +v; const e = $('#stagev'); if (e) e.textContent = v + '%'; },
    net(i) { const n = S.rollout.networks[i]; n.on = !n.on; render(); toast(n.n + (n.on ? ' enabled' : ' disabled')); },
    coh(i) { const c = S.rollout.cohort[i]; c.on = !c.on; render(); toast(c.m + (c.on ? ' added to cohort' : ' removed from cohort')); },
    mod(i) { const m = S.modules[i]; m[2] = !m[2]; render(); toast(m[0] + (m[2] ? ' module enabled' : ' module disabled')); },
    settle(sid) {
      const s = S.settlements.find((x) => x.id === sid); s.status = 'broadcasting'; render();
      setTimeout(() => { s.status = 'finalized'; s.sig = b58(87); s.ms = 350 + Math.floor(Math.random() * 150); s.fresh = true; render(); s.fresh = false; toast(fmt(s.amount) + ' USDT settled on Solana'); }, 1800);
    },
  });
  // demo-recording helpers
  window.kpCaption = (title, text) => { const c = $('#caption'); if (!title) { c.style.display = 'none'; return; } c.innerHTML = `<small class="grad-text">${title}</small>${text}`; c.style.display = 'block'; };
  window.kpCursor = (x, y, click) => { const c = $('#cursor'); c.style.display = 'block'; c.style.left = x + 'px'; c.style.top = y + 'px'; c.classList.toggle('click', !!click); };
  render();
})();

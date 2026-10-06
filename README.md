# KPay — Solana ecosystem demo kit

> **Self-hosted private payment infrastructure for humans & AI agents.**
> Accept card and crypto payments on infrastructure you own and control. Self-hosted, permissionless, and built for human + AI transactions.

**Live demo:** https://kpaymentinfra.github.io/demo/ · video: [`media/kpay-demo.mp4`](https://kpaymentinfra.github.io/demo/media/kpay-demo.mp4) · deck: [`media/KPay-Solana-Pitch.pdf`](https://kpaymentinfra.github.io/demo/media/KPay-Solana-Pitch.pdf)

Payers pay on Solana (Solana Pay, USDT) or on any other chain (Tron, Ethereum, Polygon, BSC) or by card/UPI.
Everything merges into one USDT treasury on Solana and auto-settles to each merchant's Solana wallet
(admin approval only above a threshold). Demo data only — nothing here is wired to a real gateway.

Everything needed to present KPay (the self-hosted payment gateway that settles on Solana).
This folder is separate from the production app in `/root/app`, and nothing here touches production.

| Path | What it is |
|---|---|
| `deck/KPay-Solana-Pitch.pptx` | 22-slide pitch deck with speaker notes and the demo video embedded on slide 8 |
| `deck/KPay-Solana-Pitch.pdf` | PDF export of the deck |
| `video/kpay-demo.mp4` | ~110 s captioned product demo (1440×900, H.264) |
| `screenshots/*.png` | 24 clean screenshots of every step |
| `app/` | Clickable KPay console + hosted checkout (static, in-memory demo data) |
| `scripts/record-demo.js` | Playwright script: drives the app, records the video and takes the screenshots |
| `scripts/build-deck.js` | pptxgenjs script that builds the deck from the screenshots + video |

## Run the demo app

```bash
cd /root/kpay-demo
python3 -m http.server 8765 --bind 127.0.0.1 -d app
# open http://127.0.0.1:8765  (any email/password, any 6-digit MFA code)
```

Demo flow: admin login + MFA → dashboard → onboard merchant (4 steps, Solana wallet) → approve →
create payment link → hosted checkout (Solana Pay QR / card / UPI) → crypto rollout (kill switch,
networks, cohorts) → processors & routing → Solana settlement approval → modules → developers → self-hosted.

## Regenerate video, screenshots and deck

```bash
cd /root/kpay-demo
export PATH=$PWD/.tools/node-v22.11.0-linux-x64/bin:$PATH NODE_PATH=$PWD/node_modules
export PPTX_SKILL=<path to the pptx skill dir>   # provides scripts/apply_theme.js
node scripts/record-demo.js            # needs the app served on :8765
ffmpeg -y -i video/kpay-demo.webm -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart video/kpay-demo.mp4
node scripts/build-deck.js
```

## What is real and what is a demo

- This is a **demo**: the console, checkout and every number in it run on in-memory demo data in `app/app.js`.
- The cross-chain merge into Solana and USDT auto-settlement are shown as the KPay demo configuration,
  not as a shipped product feature.
- The Solana market stats on the "Why Solana" slide are cited on the slide.
- Licence: proprietary, all rights reserved (self-hosted commercial product, not open source).

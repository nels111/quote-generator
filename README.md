# Signature Cleans — n8n Quote Frontend (Vercel)

A clean, branded Next.js frontend that submits quote requests to your n8n workflow.

## 1) Run locally

```bash
npm install
cp .env.example .env.local
# set N8N_WEBHOOK_URL in .env.local
npm run dev
```

Open http://localhost:3000

## 2) Connect to n8n

This app POSTs to `/api/quote` which forwards the payload to `process.env.N8N_WEBHOOK_URL`.

### Expected payload keys
They match your n8n Form Trigger field labels:
- Company Name
- Address
- Contact Name
- Contact Email
- Contact Phone
- Hours Per Day
- Frequency Per Week
- On Which Days? (array)
- Site Type
- Margin %
- Product Cost (Weekly)
- Overhead Cost (Weekly)
- Apply Pilot Pricing (25% off for 30 days) (checkbox -> [] or ["yes"])

## 3) Deploy to Vercel

1. Push this repo to GitHub
2. Import project into Vercel
3. Add Environment Variable:
   - `N8N_WEBHOOK_URL` = your n8n webhook URL (production)
4. Deploy

## Notes
- The n8n webhook URL is kept server-side (Vercel env var) so it is not exposed in the browser.
- Logo is included at `public/logo.jpeg`.

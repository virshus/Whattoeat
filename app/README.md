<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ef1f7a72-60e3-4500-bef4-afdadff298f7

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) (copy from `.env.example`).
   Get a key at https://aistudio.google.com/apikey (starts with `AIza...`).
3. Start both the app and import API:
   `npm run dev`

   Or run them separately: `npm run dev:server` and `npm run dev:client`.

Vite proxies `/api/*` to the import server. **Restart `dev:server` after changing `.env.local`.**

Optional: `IMPORT_API_PORT=3001` to change the API port.

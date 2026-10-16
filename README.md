# Disaster Warning Admin

This Next.js App Router application contains the DMC Officer interface for Issue Hazard Warning and the existing shelter and hazard-report workflows.

## Issue Hazard Warning

Open `/warnings/create` after signing in as a DMC Officer. The workflow has three explicit screens:

1. Select a target mode, target areas, and severity.
2. Compose the warning, choose languages, and select SMS or Push channels.
3. Review the complete preview and tick the acknowledgement before selecting **Confirm & dispatch**.

The first two screens never call the dispatch endpoint. A POST to `/api/alerts` is made only after explicit confirmation. Drafts are saved to this browser's local storage and do not dispatch notifications. Recipient counts shown before dispatch are clearly simulated estimates; the backend performs the authoritative recipient resolution and deduplication.

The API client defaults to `http://localhost:5000/api`. Set `NEXT_PUBLIC_API_URL` in the environment when the backend runs elsewhere.

## Local setup

From this directory:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. The backend must be running separately, with `CORS_ORIGINS` allowing the frontend origin. Production validation uses:

```powershell
npm test
npm run lint
npm run build
```

## Default Next.js instructions

This project was bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

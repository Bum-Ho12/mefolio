This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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


## Environment variables

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-07
```

The public site needs no Sanity token: the dataset is public and the read client never sends one.

## Content admin (`/admin`)

A built-in replacement for Sanity Studio: schema-driven forms, drafts, publishing, uploads and a
live preview that renders the site's own components. It is off unless every variable below is set;
if anything is missing, every admin route returns 404.

```
ADMIN_ENABLED=true
ADMIN_GITHUB_ID=            # your numeric GitHub id: curl https://api.github.com/users/<login>
GITHUB_CLIENT_ID=           # GitHub OAuth app (one per environment)
GITHUB_CLIENT_SECRET=
ADMIN_SESSION_SECRET=       # openssl rand -base64 32
ADMIN_SESSION_VERSION=1     # bump to sign out every browser
ADMIN_BASE_URL=             # optional, e.g. https://bum-ho.vercel.app (pins the OAuth callback)
SANITY_WRITE_TOKEN=         # Sanity token with the Editor role; server only

# Optional: Cloudinary account that videos play from (defaults to the built-in one)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
# Optional: enables "Upload video to Cloudinary" in the admin (same account as above)
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=mefolio
```

**GitHub OAuth app:** github.com → Settings → Developer settings → OAuth Apps. Set the callback URL to
`<site>/api/auth/callback`. Only the account whose numeric id matches `ADMIN_GITHUB_ID` can sign in.

**How it's secured**
- Login is GitHub OAuth (state + PKCE) with an allowlist of one numeric user id. The access token is discarded after the identity check.
- Sessions are encrypted JWTs (A256GCM) in an HttpOnly, Secure, SameSite=Lax `__Host-` cookie, with an 8-hour absolute lifetime.
- Every admin page, Server Action and route handler checks the session itself (`src/lib/auth/dal.ts`). `src/proxy.ts` only adds an early redirect, rate limiting and `noindex`/anti-framing headers.
- The write token lives only in `server-only` modules. Input is validated against zod schemas generated from `src/lib/content/registry.ts`. URLs are limited to http(s)/mailto/tel. Uploads are identified by magic bytes (no SVG, max 4 MB), and saves use optimistic revision locks.
- Edits are saved as Sanity drafts (`drafts.<id>`), which the public site cannot see, until you publish.

**Videos:** each video is a Cloudinary public id, a direct `https` link to a video file, or a YouTube/Vimeo
link (`src/utils/video.ts`). Cloudinary clips are compressed and resized per device; linked files are served
as-is, so add a poster image for them.

**Empty sections:** a home section and its nav button only appear while it has content. The rules live in
`src/utils/sections.ts` and the editor shows a notice when a document would be hidden.

**Journeys:** each journey (`/journeys/<slug>`) has a cover, a date and a body of paragraphs mixed with image,
video and gallery blocks. In the editor, drag a block's handle to reorder it and use the Left / Inline / Wide /
Full / Right control to place it; the preview shows the result per device. The home page shows the three newest
journeys marked *Featured* (the section is hidden while none is); `/journeys` lists all of them. Block types are
declared in `src/lib/content/blocks.ts` and rendered by `src/components/RichText.tsx`.

**Adding a content type:** add an entry to `src/lib/content/registry.ts`, an adapter in `src/lib/content/adapters.ts`,
and a case in `src/components/admin/PreviewRenderer.tsx`.

import { createClient } from '@sanity/client';
import { sanityConfig } from '@/lib/sanity/config';

// Verify required environment variables are present
if (!process.env.NEXT_PUBLIC_SANITY_API_VERSION) {
    throw new Error('NEXT_PUBLIC_SANITY_API_VERSION is not set in environment variables');
}

// Read-only client for the public site. It is imported by client components, so it
// must never carry a token. The dataset is public; `published` keeps drafts out even
// if a token is ever added here by mistake.
export const sanityClient = createClient({
    ...sanityConfig,
    useCdn: true,
    perspective: 'published',
});

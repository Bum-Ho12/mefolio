import { createClient } from '@sanity/client';

// Verify required environment variables are present
if (!process.env.NEXT_PUBLIC_SANITY_API_VERSION) {
    throw new Error('NEXT_PUBLIC_SANITY_API_VERSION is not set in environment variables');
}

export const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
    useCdn: true,
    token: process.env.SANITY_API_TOKEN
});
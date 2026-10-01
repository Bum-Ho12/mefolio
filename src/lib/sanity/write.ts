import 'server-only';
import { createClient, type SanityClient } from '@sanity/client';
import { sanityConfig } from './config';

let client: SanityClient | null = null;

// Token-bearing client for the admin. `raw` perspective returns drafts and published
// documents side by side, which the editor needs to show draft state.
export function writeClient(): SanityClient {
    const token = process.env.SANITY_WRITE_TOKEN;
    if (!token) throw new Error('SANITY_WRITE_TOKEN is not set');
    client ??= createClient({
        ...sanityConfig,
        token,
        useCdn: false,
        perspective: 'raw',
    });
    return client;
}

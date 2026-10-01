import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { FaGithub } from 'react-icons/fa';
import { adminEnv } from '@/lib/auth/env';
import { getOwner } from '@/lib/auth/dal';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    await connection();
    if (!adminEnv()) notFound();
    if (await getOwner()) redirect('/admin');
    const { error } = await searchParams;

    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <h1 className="text-xl font-semibold">Sign in</h1>
                <p className="mt-2 text-sm text-white/50">Content admin</p>
                {error && <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">Sign-in failed.</p>}
                {/* A plain link: the OAuth flow starts with a top-level GET navigation. */}
                <a
                    href="/api/auth/github"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-white/90"
                >
                    <FaGithub className="h-4 w-4" /> Continue with GitHub
                </a>
            </div>
        </main>
    );
}

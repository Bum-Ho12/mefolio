'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ExternalLink, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { DOC_GROUPS, DOC_TYPES } from '@/lib/content/registry';
import { logout } from '@/lib/auth/actions';

export default function Sidebar({ login }: { login: string }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const linkClass = (active: boolean) =>
        `flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`;

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className="fixed left-3 top-3 z-40 rounded-md border border-white/10 bg-black p-2 md:hidden" aria-label="Open menu">
                <Menu className="h-4 w-4" />
            </button>
            {open && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setOpen(false)} />}
            <aside className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-white/10 bg-neutral-950 transition-transform md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between px-4 py-4">
                    <Link href="/admin" className="font-semibold" onClick={() => setOpen(false)}>MeFolio Admin</Link>
                    <button type="button" onClick={() => setOpen(false)} className="md:hidden" aria-label="Close menu"><X className="h-4 w-4" /></button>
                </div>
                <nav className="flex-1 space-y-5 overflow-y-auto px-2 pb-4" onClick={() => setOpen(false)}>
                    <Link href="/admin" className={linkClass(pathname === '/admin')}>
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    {DOC_GROUPS.map((group) => (
                        <div key={group}>
                            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-white/30">{group}</p>
                            {DOC_TYPES.filter((d) => d.group === group).map((d) => (
                                <Link key={d.type} href={`/admin/${d.type}`} className={linkClass(pathname === `/admin/${d.type}` || pathname.startsWith(`/admin/${d.type}/`))}>
                                    {d.title}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>
                <div className="space-y-1 border-t border-white/10 p-2">
                    <a href="/" target="_blank" rel="noopener noreferrer" className={linkClass(false)}>
                        <ExternalLink className="h-4 w-4" /> View site
                    </a>
                    <form action={logout}>
                        <button type="submit" className={`${linkClass(false)} w-full`}>
                            <LogOut className="h-4 w-4" /> Sign out <span className="ml-auto truncate text-xs text-white/30">{login}</span>
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}

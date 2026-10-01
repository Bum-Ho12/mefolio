import type { ButtonHTMLAttributes, ReactNode } from 'react';

export const inputClass =
    'w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50';

const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500',
    secondary: 'border border-white/15 bg-white/5 text-white hover:bg-white/10',
    danger: 'border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20',
    ghost: 'text-white/70 hover:bg-white/10 hover:text-white',
};

export function Button({ variant = 'secondary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
    return (
        <button
            type="button"
            {...props}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
        />
    );
}

const tones = {
    green: 'bg-emerald-500/15 text-emerald-300',
    amber: 'bg-amber-500/15 text-amber-300',
    gray: 'bg-white/10 text-white/60',
    red: 'bg-red-500/15 text-red-300',
    blue: 'bg-blue-500/15 text-blue-300',
};

export function Badge({ tone = 'gray', children }: { tone?: keyof typeof tones; children: ReactNode }) {
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function StatusBadges({ isPublished, hasDraft }: { isPublished: boolean; hasDraft: boolean }) {
    if (!isPublished) return <Badge tone="amber">Unpublished draft</Badge>;
    if (hasDraft) return <Badge tone="blue">Published · changes pending</Badge>;
    return <Badge tone="green">Published</Badge>;
}

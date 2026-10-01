// Fixed-window limiter kept in memory. On serverless each instance has its own
// window, so this is a speed bump against scripted hammering, not a guarantee;
// pair it with a platform firewall rule for /api/auth/* in production.
const windows = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = windows.get(key);
    if (!entry || entry.resetAt <= now) {
        if (windows.size > 10_000) windows.clear();
        windows.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }
    entry.count += 1;
    return entry.count <= limit;
}

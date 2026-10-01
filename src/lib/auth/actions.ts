'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE } from './session';

export async function logout() {
    (await cookies()).delete(SESSION_COOKIE);
    redirect('/admin/login');
}

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-very-secure-secret-key-change-this-in-production'
);

export type UserPayload = {
    sub: string;
    email: string;
    name: string;
    role: 'SYSTEM_ADMIN' | 'USER';
};

export async function signToken(payload: UserPayload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET, {
            algorithms: ['HS256'],
        });
        return payload as UserPayload;
    } catch {
        return null;
    }
}

export async function setTokenCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
    });
}

export async function getToken() {
    const cookieStore = await cookies();
    return cookieStore.get('token')?.value;
}

/**
 * Extracts the JWT from either the Authorization header (Bearer) or cookies.
 * Prioritizes the Authorization header for local storage compatibility.
 */
export async function getTokenFromRequest(request?: Request | { headers: Headers }) {
    // 1. Check Authorization Header
    if (request) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
    }

    // 2. Fallback to Cookies (for backward compatibility/SSR)
    try {
        const cookieStore = await cookies();
        return cookieStore.get('token')?.value;
    } catch {
        return undefined;
    }
}

export async function removeTokenCookie() {
    const cookieStore = await cookies();
    cookieStore.delete('token');
}

/**
 * Validates if the request comes from an authorized microservice
 * using a shared service API key.
 */
export function isAuthorizedService(request: Request | { headers: Headers }) {
    const apiKey = request.headers.get('X-Exploree-Service-Key');
    const systemKey = process.env.SERVICE_API_KEY;

    if (!systemKey || !apiKey) return false;
    return apiKey === systemKey;
}

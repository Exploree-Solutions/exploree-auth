// Token storage utilities for localStorage persistence

const TOKEN_KEY = 'exploree_auth_token';
const TOKEN_EXPIRY_KEY = 'exploree_auth_token_expiry';

// Default token expiry: 7 days (in milliseconds)
const DEFAULT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Store token in localStorage with expiration
 */
export function storeToken(token: string, expiryMs: number = DEFAULT_EXPIRY_MS): void {
    if (typeof window === 'undefined') return;

    const expiryTime = Date.now() + expiryMs;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
}

/**
 * Get stored token if valid (not expired)
 * Returns null if no token or expired
 */
export function getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem(TOKEN_KEY);
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiryStr) return null;

    const expiryTime = parseInt(expiryStr, 10);
    if (Date.now() > expiryTime) {
        // Token expired, clear it
        clearToken();
        return null;
    }

    return token;
}

/**
 * Clear stored token
 */
export function clearToken(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

/**
 * Check if user has a valid stored token
 */
export function hasValidToken(): boolean {
    return getStoredToken() !== null;
}

/**
 * Centralized API client for Exploree Auth Go Backend
 *
 * All API calls to the Go backend are routed through this module.
 * Configure the base URL via NEXT_PUBLIC_API_URL environment variable.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Types
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'SYSTEM_ADMIN' | 'USER';
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    forcePasswordReset?: boolean;
}

export interface LoginResponse {
    success: boolean;
    user: User;
    token: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    phoneNumber?: string;
}

export interface AuthMeResponse {
    authenticated: boolean;
    user?: User;
}

export interface WaitlistEntry {
    email: string;
    name?: string;
    service: 'jobs' | 'tender' | 'events' | 'opportunities';
    userId?: string;
}

// Helper for making authenticated requests
async function fetchWithAuth(
    url: string,
    token?: string,
    options: RequestInit = {}
): Promise<Response> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
        ...options,
        headers,
    });
}

// Auth API
export const authApi = {
    /**
     * Login with email and password
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Login failed');
        }
        return data;
    },

    /**
     * Register a new user
     */
    async register(data: RegisterData): Promise<LoginResponse> {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const responseData = await res.json();
        if (!res.ok) {
            throw new Error(responseData.error || 'Registration failed');
        }
        return responseData;
    },

    /**
     * Get current authenticated user
     */
    async me(token: string): Promise<AuthMeResponse> {
        const res = await fetchWithAuth(`${API_BASE_URL}/api/auth/me`, token);

        const data = await res.json();
        if (!res.ok) {
            return { authenticated: false };
        }
        return data;
    },

    /**
     * Logout - clears server-side session if applicable
     */
    async logout(token?: string): Promise<void> {
        await fetchWithAuth(`${API_BASE_URL}/api/auth/login`, token, {
            method: 'DELETE',
        });
    },

    /**
     * Get user profile
     */
    async getProfile(token: string): Promise<{ user: User & { masterProfile?: Record<string, unknown> } }> {
        const res = await fetchWithAuth(`${API_BASE_URL}/api/auth/profile`, token);

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Failed to fetch profile');
        }
        return data;
    },

    /**
     * Update user profile
     */
    async updateProfile(
        token: string,
        updates: { fullName?: string; phoneNumber?: string; company?: string; password?: string }
    ): Promise<{ success: boolean; user: User }> {
        const res = await fetchWithAuth(`${API_BASE_URL}/api/auth/profile`, token, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Failed to update profile');
        }
        return data;
    },
};

// Waitlist API
export const waitlistApi = {
    /**
     * Join waitlist for a service
     */
    async join(entry: WaitlistEntry): Promise<{ message: string; id?: string; alreadyExists?: boolean }> {
        const res = await fetch(`${API_BASE_URL}/api/waitlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
        });

        const data = await res.json();
        if (!res.ok && !data.alreadyExists) {
            throw new Error(data.error || 'Failed to join waitlist');
        }
        return data;
    },

    /**
     * Get waitlist count for a service
     */
    async getCount(service: string): Promise<{ service: string; count: number }> {
        const res = await fetch(`${API_BASE_URL}/api/waitlist?service=${encodeURIComponent(service)}`);

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Failed to get waitlist count');
        }
        return data;
    },
};

export default { authApi, waitlistApi };

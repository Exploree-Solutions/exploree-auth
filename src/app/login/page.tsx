'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { storeToken, getStoredToken } from '@/lib/tokenStorage';

function LoginContent() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const redirectUri = searchParams.get('redirect_uri') || '';
    const service = searchParams.get('service') || 'tender';

    // Check for existing valid token on mount
    useEffect(() => {
        const existingToken = getStoredToken();
        if (existingToken) {
            // User already authenticated, redirect appropriately
            if (redirectUri) {
                const separator = redirectUri.includes('?') ? '&' : '?';
                window.location.href = `${redirectUri}${separator}token=${existingToken}`;
            } else {
                window.location.href = `/select-service?token=${existingToken}`;
            }
        }
    }, [redirectUri]);

    const getServiceName = () => {
        const services: Record<string, string> = {
            tender: t('services.tender'),
            jobs: t('services.jobs'),
            events: t('services.events'),
            opportunities: t('services.opportunities'),
        };
        return services[service] || service;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t('login.invalidCredentials'));
            }

            // Store token in localStorage for persistence
            storeToken(data.token);

            // If successful, redirect
            if (redirectUri) {
                const separator = redirectUri.includes('?') ? '&' : '?';
                window.location.href = `${redirectUri}${separator}token=${data.token}`;
            } else {
                // No redirect_uri: go to service selection page with token
                window.location.href = `/select-service?token=${data.token}`;
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('login.invalidCredentials'));
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent/5 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">E</span>
                    </div>
                    <span className="font-semibold text-foreground">{t('brand.name')}</span>
                </div>
                <LanguageSwitcher />
            </header>

            {/* Main */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    {/* Logo & Title */}
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-2xl">E</span>
                        </div>
                        <h1 className="text-xl font-bold text-foreground">{t('login.title')}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('login.subtitle')} <span className="font-medium text-primary">{getServiceName()}</span>
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-danger-light text-danger text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                                    {t('login.email')}
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input pl-10 py-2.5 text-sm"
                                        placeholder={t('login.emailPlaceholder')}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                        {t('login.password')}
                                    </label>
                                    <a href="#" className="text-xs text-primary hover:underline">
                                        {t('login.forgotPassword')}
                                    </a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input pl-10 pr-10 py-2.5 text-sm"
                                        placeholder={t('login.passwordPlaceholder')}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full py-2.5 text-sm"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {t('login.signingIn')}
                                    </>
                                ) : (
                                    <>
                                        {t('login.submit')}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-5 text-center">
                            <p className="text-sm text-muted-foreground">
                                {t('login.noAccount')}{' '}
                                <Link
                                    href={{
                                        pathname: '/signup',
                                        query: Object.fromEntries(searchParams.entries())
                                    }}
                                    className="text-primary font-medium hover:underline"
                                >
                                    {t('login.createAccount')}
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Tagline */}
                    <p className="text-center text-xs text-muted-foreground mt-6">
                        {t('brand.tagline')}
                    </p>
                </div>
            </main>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
            <LoginContent />
        </Suspense>
    );
}

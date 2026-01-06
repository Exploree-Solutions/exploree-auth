'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { storeToken, getStoredToken } from '@/lib/tokenStorage';
import { authApi } from '@/lib/api';

function SignupContent() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const redirectUri = searchParams.get('redirect_uri') || '';

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError(t('signup.passwordMismatch'));
            return;
        }

        setIsLoading(true);

        try {
            const data = await authApi.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phone || undefined,
            });

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
            setError(err instanceof Error ? err.message : t('signup.error'));
            setIsLoading(false);
        }
    };

    const passwordRequirements = [
        { label: t('signup.passwordReq8Chars'), met: formData.password.length >= 8 },
        { label: t('signup.passwordReqNumber'), met: /\d/.test(formData.password) },
    ];

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
            <main className="flex-1 flex items-center justify-center p-4 py-8">
                <div className="w-full max-w-sm">
                    {/* Logo & Title */}
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-2xl">E</span>
                        </div>
                        <h1 className="text-xl font-bold text-foreground">{t('signup.title')}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{t('signup.subtitle')}</p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-3">
                            {error && (
                                <div className="p-3 rounded-lg bg-danger-light text-danger text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                                    {t('signup.fullName')}
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input pl-10 py-2.5 text-sm"
                                        placeholder={t('signup.namePlaceholder')}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                                    {t('signup.email')}
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input pl-10 py-2.5 text-sm"
                                        placeholder={t('signup.emailPlaceholder')}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
                                    {t('signup.phone')}
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input pl-10 py-2.5 text-sm"
                                        placeholder={t('signup.phonePlaceholder')}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                                    {t('signup.password')}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input pl-10 pr-10 py-2.5 text-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {formData.password && (
                                    <div className="mt-1.5 flex gap-3">
                                        {passwordRequirements.map((req, i) => (
                                            <span key={i} className={`flex items-center gap-1 text-xs ${req.met ? 'text-success' : 'text-muted-foreground'}`}>
                                                <Check className={`w-3 h-3 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                                                {req.label}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
                                    {t('signup.confirmPassword')}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="input pl-10 py-2.5 text-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full py-2.5 text-sm mt-2"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {t('signup.creatingAccount')}
                                    </>
                                ) : (
                                    <>
                                        {t('signup.submit')}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-5 text-center">
                            <p className="text-sm text-muted-foreground">
                                {t('signup.hasAccount')}{' '}
                                <Link
                                    href={{
                                        pathname: '/login',
                                        query: Object.fromEntries(searchParams.entries())
                                    }}
                                    className="text-primary font-medium hover:underline"
                                >
                                    {t('signup.signIn')}
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

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
            <SignupContent />
        </Suspense>
    );
}

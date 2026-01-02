import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const LoginPage = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const redirectUri = searchParams.get('redirect_uri') || '';
    const service = searchParams.get('service') || 'tender';

    const getServiceName = () => {
        const services: Record<string, string> = {
            tender: t('services.tender'),
            jobs: t('services.jobs'),
            news: t('services.news'),
        };
        return services[service] || service;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (email && password.length >= 6) {
            // Generate mock token
            const mockToken = btoa(JSON.stringify({ email, exp: Date.now() + 3600000 }));

            // Redirect back to the calling service
            if (redirectUri) {
                const separator = redirectUri.includes('?') ? '&' : '?';
                window.location.href = `${redirectUri}${separator}token=${mockToken}`;
            } else {
                // Default redirect to tender
                window.location.href = `http://localhost:5174?token=${mockToken}`;
            }
        } else {
            setError(t('login.invalidCredentials'));
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
                                    to={`/signup${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
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
};

export default LoginPage;

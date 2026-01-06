'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Briefcase, Gavel, Calendar, Sparkles, LogOut, User, ArrowRight, Bell, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { clearToken, getStoredToken } from '@/lib/tokenStorage';
import { authApi, waitlistApi } from '@/lib/api';

// Service configuration - URL can be null for coming soon services
const services = [
    {
        id: 'jobs',
        name: 'services.jobs',
        description: 'services.jobsDesc',
        icon: Briefcase,
        color: 'bg-blue-500',
        url: process.env.NEXT_PUBLIC_JOBS_URL || null, // Set to null for "Coming Soon"
    },
    {
        id: 'tender',
        name: 'services.tender',
        description: 'services.tenderDesc',
        icon: Gavel,
        color: 'bg-emerald-500',
        url: process.env.NEXT_PUBLIC_TENDER_URL || null,
    },
    {
        id: 'events',
        name: 'services.events',
        description: 'services.eventsDesc',
        icon: Calendar,
        color: 'bg-indigo-500',
        url: process.env.NEXT_PUBLIC_EVENTS_URL || null, // Set to null for "Coming Soon"
    },
    {
        id: 'opportunities',
        name: 'services.opportunities',
        description: 'services.opportunitiesDesc',
        icon: Sparkles,
        color: 'bg-amber-500',
        url: process.env.NEXT_PUBLIC_OPPORTUNITIES_URL || null, // Set to null for "Coming Soon"
    },
];

interface Service {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    url: string | null;
}

function ServiceSelectionContent() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);

    // Coming Soon Modal state
    const [showWaitlistModal, setShowWaitlistModal] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [waitlistLoading, setWaitlistLoading] = useState(false);
    const [waitlistSuccess, setWaitlistSuccess] = useState(false);
    const [waitlistError, setWaitlistError] = useState('');

    // Get token from URL query params (passed from login/signup)
    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchUser = async () => {
            const storedToken = getStoredToken();
            if (!storedToken && !token) {
                router.push('/login');
                setLoading(false);
                return;
            }

            const authToken = storedToken || token;
            if (!authToken) {
                router.push('/login');
                setLoading(false);
                return;
            }

            try {
                const data = await authApi.me(authToken);
                if (data.authenticated && data.user) {
                    setUser(data.user);
                } else {
                    router.push('/login');
                }
            } catch {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [router, token]);

    const handleSelectService = (service: Service) => {
        if (service.url) {
            // Service is available, redirect
            if (token) {
                const separator = service.url.includes('?') ? '&' : '?';
                window.location.href = `${service.url}${separator}token=${token}`;
            } else {
                window.location.href = service.url;
            }
        } else {
            // Service coming soon, show waitlist modal
            setSelectedService(service);
            setShowWaitlistModal(true);
            setWaitlistSuccess(false);
            setWaitlistError('');
        }
    };

    const handleJoinWaitlist = async () => {
        if (!selectedService || !user) return;

        setWaitlistLoading(true);
        setWaitlistError('');

        try {
            const data = await waitlistApi.join({
                email: user.email,
                name: user.name,
                service: selectedService.id as 'jobs' | 'tender' | 'events' | 'opportunities',
            });

            if (data.alreadyExists || data.id) {
                setWaitlistSuccess(true);
            }
        } catch (err) {
            setWaitlistError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
            setWaitlistLoading(false);
        }
    };

    const handleLogout = async () => {
        const storedToken = getStoredToken();
        clearToken();
        await authApi.logout(storedToken || undefined);
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">E</span>
                    </div>
                    <span className="font-bold text-lg text-foreground">{t('brand.name')}</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                        <User className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">{user.name}</span>
                    </div>
                    <LanguageSwitcher />
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-foreground mb-3">{t('selection.title')}</h1>
                    <p className="text-muted-foreground">{t('selection.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => handleSelectService(service)}
                            className="group relative bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
                        >
                            {/* Coming Soon Badge */}
                            {!service.url && (
                                <div className="absolute top-3 right-3 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                                    Coming Soon
                                </div>
                            )}

                            <div className={`w-12 h-12 ${service.color} ${!service.url ? 'opacity-60' : ''} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-white`}>
                                <service.icon className="w-6 h-6" />
                            </div>

                            <h3 className="text-lg font-bold text-foreground mb-2">{t(service.name)}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                {t(service.description)}
                            </p>

                            <div className="flex items-center text-sm font-semibold group-hover:gap-2 transition-all">
                                {service.url ? (
                                    <>
                                        <span className="text-primary">{t('selection.continueTo')}</span>
                                        <ArrowRight className="w-4 h-4 ml-1 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </>
                                ) : (
                                    <>
                                        <Bell className="w-4 h-4 mr-1 text-amber-600" />
                                        <span className="text-amber-600">Notify me</span>
                                    </>
                                )}
                            </div>

                            {/* Decorative background element */}
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${service.color} opacity-0 group-hover:opacity-5 rounded-full transition-opacity`} />
                        </button>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-danger transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign out of your Exploree account
                    </button>
                </div>
            </main>

            {/* Waitlist Modal */}
            {showWaitlistModal && selectedService && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowWaitlistModal(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className={`w-16 h-16 ${selectedService.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white`}>
                            <selectedService.icon className="w-8 h-8" />
                        </div>

                        <h2 className="text-xl font-bold text-foreground text-center mb-2">
                            {t(selectedService.name)} is Coming Soon!
                        </h2>
                        <p className="text-muted-foreground text-center mb-6">
                            Be the first to know when we launch. Join our waitlist and we&apos;ll notify you.
                        </p>

                        {waitlistSuccess ? (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-success" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">You&apos;re on the list!</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    We&apos;ll send an email to <span className="font-medium">{user?.email}</span> when {t(selectedService.name)} launches.
                                </p>
                                <button
                                    onClick={() => setShowWaitlistModal(false)}
                                    className="btn btn-secondary w-full"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                                    <p className="text-sm text-muted-foreground mb-1">Notification email:</p>
                                    <p className="font-medium text-foreground">{user?.email}</p>
                                </div>

                                {waitlistError && (
                                    <div className="p-3 rounded-lg bg-danger-light text-danger text-sm mb-4">
                                        {waitlistError}
                                    </div>
                                )}

                                <button
                                    onClick={handleJoinWaitlist}
                                    disabled={waitlistLoading}
                                    className="btn btn-primary w-full"
                                >
                                    {waitlistLoading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Joining...
                                        </>
                                    ) : (
                                        <>
                                            <Bell className="w-4 h-4" />
                                            Notify me when it launches
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <footer className="py-8 text-center border-t border-border mt-auto">
                <p className="text-xs text-muted-foreground">
                    © 2026 Exploree Solutions. All rights reserved.
                </p>
            </footer>
        </div>
    );
}

export default function ServiceSelectionPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
            <ServiceSelectionContent />
        </Suspense>
    );
}

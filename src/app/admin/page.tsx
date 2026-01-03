'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    UserCheck,
    UserPlus,
    ShieldCheck,
    MoreVertical,
    Search,
    LayoutDashboard,
    Settings,
    LogOut,
    ArrowUpRight
} from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const [data, setData] = useState<{
        users: Array<{
            id: string;
            name: string;
            email: string;
            role: string;
            createdAt: string;
        }>;
        stats: {
            total: number;
            active: number;
            newToday: number;
        };
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const res = await fetch('/api/admin/users');
                if (!res.ok) {
                    if (res.status === 403 || res.status === 401) {
                        router.push('/login');
                        return;
                    }
                    throw new Error('Failed to fetch admin data');
                }
                const jsonData = await res.json();
                setData(jsonData);
            } catch {
                setError('Failed to fetch admin data');
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-danger mb-2">Error</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn btn-primary mt-4">Retry</button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-border flex flex-col sticky top-0 h-screen">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-white font-bold text-sm">ES</span>
                        </div>
                        <span className="font-bold text-lg text-foreground">Exploree Admin</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-slate-100 transition-colors">
                        <Users className="w-5 h-5" />
                        User Management
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-slate-100 transition-colors">
                        <Settings className="w-5 h-5" />
                        Settings
                    </a>
                </nav>

                <div className="p-4 border-t border-border">
                    <button onClick={() => router.push('/login')} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-danger hover:bg-danger/5 transition-colors">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">System Overview</h1>
                            <p className="text-muted-foreground">Manage users and monitor system health.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="bg-white border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all w-64"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="flex items-center text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                                    +12% <ArrowUpRight className="w-3 h-3 ml-0.5" />
                                </span>
                            </div>
                            <h3 className="text-muted-foreground text-sm font-medium">Total Users</h3>
                            <p className="text-2xl font-bold text-foreground">{data.stats.total}</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                    <UserCheck className="w-6 h-6" />
                                </div>
                                <span className="flex items-center text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                                    +5% <ArrowUpRight className="w-3 h-3 ml-0.5" />
                                </span>
                            </div>
                            <h3 className="text-muted-foreground text-sm font-medium">Active Users</h3>
                            <p className="text-2xl font-bold text-foreground">{data.stats.active}</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <span className="flex items-center text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                                    Today
                                </span>
                            </div>
                            <h3 className="text-muted-foreground text-sm font-medium">New Registrations</h3>
                            <p className="text-2xl font-bold text-foreground">{data.stats.newToday}</p>
                        </div>
                    </div>

                    {/* User Table */}
                    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="font-bold text-lg text-foreground">User Management</h2>
                            <button className="text-sm font-medium text-primary hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-border">
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Joined At</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {data.users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground">{user.name}</div>
                                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    {user.role === 'SYSTEM_ADMIN' ? (
                                                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
                                                            <ShieldCheck className="w-3 h-3" /> Admin
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                                                            User
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="p-1.5 rounded-lg hover:bg-slate-100 text-muted-foreground transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

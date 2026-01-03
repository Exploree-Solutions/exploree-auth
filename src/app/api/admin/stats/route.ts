import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET /api/admin/stats - Dashboard statistics
export async function GET(request: NextRequest) {
    try {
        const token = await getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'SYSTEM_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const now = new Date();
        const today = new Date(now.setHours(0, 0, 0, 0));
        const thisWeek = new Date(now.setDate(now.getDate() - 7));
        const thisMonth = new Date(now.setMonth(now.getMonth() - 1));

        // User stats
        const [
            totalUsers,
            activeUsers,
            inactiveUsers,
            suspendedUsers,
            totalAdmins,
            newToday,
            newThisWeek,
            newThisMonth,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { status: 'ACTIVE' } }),
            prisma.user.count({ where: { status: 'INACTIVE' } }),
            prisma.user.count({ where: { status: 'SUSPENDED' } }),
            prisma.user.count({ where: { role: 'SYSTEM_ADMIN' } }),
            prisma.user.count({ where: { createdAt: { gte: today } } }),
            prisma.user.count({ where: { createdAt: { gte: thisWeek } } }),
            prisma.user.count({ where: { createdAt: { gte: thisMonth } } }),
        ]);

        // Activity stats
        const [
            loginsToday,
            loginsThisWeek,
            recentActivities,
        ] = await Promise.all([
            prisma.activityLog.count({
                where: { type: 'LOGIN', createdAt: { gte: today } },
            }),
            prisma.activityLog.count({
                where: { type: 'LOGIN', createdAt: { gte: thisWeek } },
            }),
            prisma.activityLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { name: true, email: true },
                    },
                },
            }),
        ]);

        // Users needing attention
        const usersNeedingPasswordReset = await prisma.user.count({
            where: { forcePasswordReset: true },
        });

        return NextResponse.json({
            users: {
                total: totalUsers,
                active: activeUsers,
                inactive: inactiveUsers,
                suspended: suspendedUsers,
                admins: totalAdmins,
                regularUsers: totalUsers - totalAdmins,
            },
            growth: {
                today: newToday,
                thisWeek: newThisWeek,
                thisMonth: newThisMonth,
            },
            activity: {
                loginsToday,
                loginsThisWeek,
                recentActivities,
            },
            alerts: {
                usersNeedingPasswordReset,
            },
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

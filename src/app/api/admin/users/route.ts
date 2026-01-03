import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken, verifyToken } from '@/lib/auth';

export async function GET() {
    try {
        const token = await getToken();
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'SYSTEM_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Mock stats for now (active users etc.)
        const stats = {
            total: users.length,
            active: users.length, // We don't have an 'active' field in schema yet, but we could add it
            newToday: users.filter((u: { createdAt: Date }) => {
                const today = new Date();
                return u.createdAt.toDateString() === today.toDateString();
            }).length,
        };

        return NextResponse.json({ users, stats });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

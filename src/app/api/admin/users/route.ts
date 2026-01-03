import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { logActivity, getClientInfo } from '@/lib/activity';
import bcrypt from 'bcryptjs';

// GET /api/admin/users - List users with search/filter/pagination
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

        // Parse query params
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || '';
        const status = searchParams.get('status') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

        // Build where clause
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (role && ['USER', 'SYSTEM_ADMIN'].includes(role)) {
            where.role = role;
        }

        if (status && ['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
            where.status = status;
        }

        // Get total count
        const total = await prisma.user.count({ where });

        // Get users with pagination
        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                lastLoginAt: true,
                forcePasswordReset: true,
                createdAt: true,
                masterProfile: {
                    select: {
                        fullName: true,
                        phoneNumber: true,
                        company: true,
                    },
                },
            },
            orderBy: { [sortBy]: sortOrder },
            skip: (page - 1) * limit,
            take: limit,
        });

        // Get stats
        const [totalUsers, activeUsers, inactiveUsers, suspendedUsers, admins, newToday] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { status: 'ACTIVE' } }),
            prisma.user.count({ where: { status: 'INACTIVE' } }),
            prisma.user.count({ where: { status: 'SUSPENDED' } }),
            prisma.user.count({ where: { role: 'SYSTEM_ADMIN' } }),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),
        ]);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                total: totalUsers,
                active: activeUsers,
                inactive: inactiveUsers,
                suspended: suspendedUsers,
                admins,
                newToday,
            },
        });
    } catch (error) {
        console.error('Admin users list error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/users - Admin create new user
export async function POST(request: NextRequest) {
    try {
        const token = await getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'SYSTEM_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { name, email, password, role, status, phoneNumber, company } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
        }

        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: role && ['USER', 'SYSTEM_ADMIN'].includes(role) ? role : 'USER',
                status: status && ['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status) ? status : 'ACTIVE',
                masterProfile: {
                    create: {
                        fullName: name,
                        email,
                        phoneNumber: phoneNumber || '',
                        company: company || null,
                    },
                },
            },
            include: { masterProfile: true },
        });

        // Log admin action
        const clientInfo = getClientInfo(request);
        await logActivity({
            userId: payload.sub,
            type: 'ADMIN_ACTION',
            description: `Created new user: ${email}`,
            ...clientInfo,
            metadata: { targetUserId: user.id },
        });

        const { passwordHash: _, ...userWithoutPassword } = user;
        return NextResponse.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        console.error('Admin create user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { logActivity, getClientInfo } from '@/lib/activity';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Check user status
        if (user.status === 'SUSPENDED') {
            return NextResponse.json(
                { error: 'Your account has been suspended. Please contact support.' },
                { status: 403 }
            );
        }

        if (user.status === 'INACTIVE') {
            return NextResponse.json(
                { error: 'Your account is inactive. Please contact support to reactivate.' },
                { status: 403 }
            );
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Update last login time
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Log activity
        const clientInfo = getClientInfo(request);
        await logActivity({
            userId: user.id,
            type: 'LOGIN',
            description: 'User logged in',
            ...clientInfo,
        });

        // Sign JWT
        const token = await signToken({
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role as 'SYSTEM_ADMIN' | 'USER',
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                forcePasswordReset: user.forcePasswordReset,
            },
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    const { removeTokenCookie } = await import('@/lib/auth');
    await removeTokenCookie();
    return NextResponse.json({ success: true });
}

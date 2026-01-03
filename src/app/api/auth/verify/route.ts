import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * Token verification endpoint for external services
 * 
 * Usage: POST /api/auth/verify
 * Body: { "token": "eyJhbG..." }
 * 
 * Or: GET /api/auth/verify?token=eyJhbG...
 * 
 * Returns: { valid: true, user: { id, name, email, role } }
 * Or: { valid: false, error: "..." }
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { valid: false, error: 'Token is required' },
                { status: 400 }
            );
        }

        return await verifyAndReturnUser(token);
    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json(
            { valid: false, error: 'Invalid request' },
            { status: 400 }
        );
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json(
            { valid: false, error: 'Token is required' },
            { status: 400 }
        );
    }

    return await verifyAndReturnUser(token);
}

async function verifyAndReturnUser(token: string) {
    try {
        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json(
                { valid: false, error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { valid: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            valid: true,
            user,
        });
    } catch {
        return NextResponse.json(
            { valid: false, error: 'Token verification failed' },
            { status: 401 }
        );
    }
}

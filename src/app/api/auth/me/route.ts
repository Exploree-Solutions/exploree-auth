import { NextResponse } from 'next/server';
import { verifyToken, getToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const token = await getToken();

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
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
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({ authenticated: true, user });
    } catch {
        return NextResponse.json({ authenticated: false }, { status: 500 });
    }
}

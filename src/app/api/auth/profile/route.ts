import { NextResponse } from 'next/server';
import { verifyToken, getToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const token = await getToken();
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.sub },
            include: {
                masterProfile: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...userWithoutPassword } = user;
        return NextResponse.json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const token = await getToken();
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const { name, bio, avatar } = body;

        // Perform update in a transaction
        const updatedUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: payload.sub },
                data: {
                    ...(name && { name }),
                },
                include: {
                    masterProfile: true,
                },
            });

            if (bio !== undefined || avatar !== undefined) {
                await tx.masterProfile.upsert({
                    where: { userId: payload.sub },
                    create: {
                        userId: payload.sub,
                        bio: bio || null,
                        avatar: avatar || null,
                    },
                    update: {
                        ...(bio !== undefined && { bio }),
                        ...(avatar !== undefined && { avatar }),
                    },
                });
            }

            // Return refreshed user
            return await tx.user.findUnique({
                where: { id: payload.sub },
                include: { masterProfile: true }
            });
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

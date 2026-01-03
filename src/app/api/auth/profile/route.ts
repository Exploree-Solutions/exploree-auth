import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
    try {
        const token = await getTokenFromRequest(request);
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

export async function PATCH(request: NextRequest) {
    try {
        const token = await getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const { fullName, email, phoneNumber, company, password } = body;

        // Perform update in a transaction
        const updatedUser = await prisma.$transaction(async (tx) => {
            // 1. Update User fields if necessary
            const userData: any = {};
            if (fullName) userData.name = fullName;
            if (email) userData.email = email;
            if (password) {
                userData.passwordHash = await bcrypt.hash(password, 10);
            }

            if (Object.keys(userData).length > 0) {
                await tx.user.update({
                    where: { id: payload.sub },
                    data: userData,
                });
            }

            // 2. Update MasterProfile fields
            const masterData: any = {};
            if (fullName) masterData.fullName = fullName;
            if (email) masterData.email = email;
            if (phoneNumber) masterData.phoneNumber = phoneNumber;
            if (company !== undefined) masterData.company = company;

            if (Object.keys(masterData).length > 0) {
                await tx.masterProfile.update({
                    where: { userId: payload.sub },
                    data: masterData,
                });
            }

            // Return refreshed user
            return await tx.user.findUnique({
                where: { id: payload.sub },
                include: { masterProfile: true }
            });
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...userWithoutPassword } = updatedUser as any;
        return NextResponse.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

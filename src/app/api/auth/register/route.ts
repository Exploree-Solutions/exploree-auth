import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken, setTokenCookie } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user and master profile in a transaction
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = await prisma.$transaction(async (tx: any) => {
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    role: 'USER', // Default role
                },
            });

            await tx.masterProfile.create({
                data: {
                    userId: newUser.id,
                    fullName: name,
                    email: email,
                    phoneNumber: '', // Initialize empty, can be updated later
                },
            });

            return newUser;
        });

        // Sign JWT
        const token = await signToken({
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role as 'SYSTEM_ADMIN' | 'USER',
        });

        // Return token for local storage storage
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token // Return token as well for URL redirect logic if needed
        });
    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

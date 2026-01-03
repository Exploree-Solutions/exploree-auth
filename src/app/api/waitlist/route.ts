import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name, service, userId } = body;

        if (!email || !service) {
            return NextResponse.json(
                { error: 'Email and service are required' },
                { status: 400 }
            );
        }

        // Validate service name
        const validServices = ['jobs', 'tender', 'events', 'opportunities'];
        if (!validServices.includes(service)) {
            return NextResponse.json(
                { error: 'Invalid service' },
                { status: 400 }
            );
        }

        // Check if already on waitlist
        const existing = await prisma.serviceWaitlist.findUnique({
            where: {
                email_service: {
                    email,
                    service,
                },
            },
        });

        if (existing) {
            return NextResponse.json(
                { message: 'Already on waitlist', alreadyExists: true },
                { status: 200 }
            );
        }

        // Add to waitlist
        const waitlistEntry = await prisma.serviceWaitlist.create({
            data: {
                email,
                name: name || null,
                service,
                userId: userId || null,
            },
        });

        return NextResponse.json({
            message: 'Successfully added to waitlist',
            id: waitlistEntry.id,
        });
    } catch (error) {
        console.error('Waitlist error:', error);
        return NextResponse.json(
            { error: 'Failed to add to waitlist' },
            { status: 500 }
        );
    }
}

// Get waitlist count for a service (optional - for admin)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');

    if (!service) {
        return NextResponse.json(
            { error: 'Service is required' },
            { status: 400 }
        );
    }

    const count = await prisma.serviceWaitlist.count({
        where: { service },
    });

    return NextResponse.json({ service, count });
}

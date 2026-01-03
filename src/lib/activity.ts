import prisma from './prisma';

type ActivityType = 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'PASSWORD_CHANGE' | 'PROFILE_UPDATE' | 'ADMIN_ACTION';

interface LogActivityParams {
    userId: string;
    type: ActivityType;
    description: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams) {
    try {
        await prisma.activityLog.create({
            data: {
                userId: params.userId,
                type: params.type,
                description: params.description,
                ipAddress: params.ipAddress || null,
                userAgent: params.userAgent || null,
                metadata: params.metadata || null,
            },
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw - logging should not break the main flow
    }
}

export function getClientInfo(request: Request) {
    return {
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
    };
}

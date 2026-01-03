import 'dotenv/config';
import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function seed() {
    console.log('🌱 Seeding database...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: 'admin@exploree.com' },
    });

    if (existingAdmin) {
        console.log('⚠️  Admin user already exists, skipping...');
        return;
    }

    // Create SYSTEM_ADMIN user
    const passwordHash = await bcrypt.hash('ExploreeAdmin@2026', 10);

    const admin = await prisma.user.create({
        data: {
            name: 'Exploree Admin',
            email: 'admin@exploree.com',
            passwordHash,
            role: 'SYSTEM_ADMIN',
            masterProfile: {
                create: {
                    fullName: 'Exploree Admin',
                    email: 'admin@exploree.com',
                    phoneNumber: '+251900000000',
                    company: 'Exploree Solutions',
                },
            },
        },
    });

    console.log('✅ Created SYSTEM_ADMIN user:', admin.email);
    console.log('🔐 Default password: ExploreeAdmin@2026');
    console.log('⚠️  IMPORTANT: Change this password immediately after first login!');
}

seed()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

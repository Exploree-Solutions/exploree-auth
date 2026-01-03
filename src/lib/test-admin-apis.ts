import 'dotenv/config';

const BASE_URL = 'http://localhost:3000/api';
const SERVICE_KEY = process.env.SERVICE_API_KEY || 'test-service-key';

async function testAdminAPIs() {
    console.log('--- Testing Admin APIs ---');

    // 1. Login as admin
    console.log('\n[1] Logging in as admin...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@exploree.com',
            password: 'ExploreeAdmin@2026'
        })
    });
    const loginData = await loginRes.json();
    console.log('Login Result:', loginData.success ? 'Success' : 'Failed');

    if (!loginData.success) {
        console.error('Admin login failed:', loginData.error);
        return;
    }

    const adminToken = loginData.token;

    // 2. List all users
    console.log('\n[2] Listing all users...');
    const usersRes = await fetch(`${BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const usersData = await usersRes.json();
    console.log('Users Stats:', usersData.stats);
    console.log('Users Count:', usersData.users?.length || 0);

    if (usersData.users && usersData.users.length > 0) {
        const testUserId = usersData.users.find((u: any) => u.role === 'USER')?.id;

        if (testUserId) {
            // 3. Get single user
            console.log('\n[3] Getting single user...');
            const userRes = await fetch(`${BASE_URL}/admin/users/${testUserId}`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            console.log('Single User Result:', await userRes.json());

            // 4. Update user
            console.log('\n[4] Updating user role...');
            const updateRes = await fetch(`${BASE_URL}/admin/users/${testUserId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    company: 'Test Company Updated by Admin'
                })
            });
            console.log('Update Result:', await updateRes.json());
        }
    }

    console.log('\n✅ Admin API tests completed!');
}

testAdminAPIs().catch(console.error);

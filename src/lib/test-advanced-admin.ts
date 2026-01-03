import 'dotenv/config';

const BASE_URL = 'http://localhost:3000/api';

async function testAdvancedAdminFeatures() {
    console.log('--- Testing Advanced Admin Features ---');

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
    console.log('Login:', loginData.success ? '✅ Success' : '❌ Failed');

    if (!loginData.success) {
        console.error('Error:', loginData.error);
        return;
    }

    const adminToken = loginData.token;
    const headers = { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' };

    // 2. Get dashboard stats
    console.log('\n[2] Getting dashboard stats...');
    const statsRes = await fetch(`${BASE_URL}/admin/stats`, { headers });
    const statsData = await statsRes.json();
    console.log('Stats:', statsData.users ? '✅ Success' : '❌ Failed');
    console.log('  Users:', statsData.users);
    console.log('  Growth:', statsData.growth);

    // 3. Search users
    console.log('\n[3] Searching users (filter by role=USER)...');
    const searchRes = await fetch(`${BASE_URL}/admin/users?role=USER&limit=5`, { headers });
    const searchData = await searchRes.json();
    console.log('Search:', searchData.users ? '✅ Success' : '❌ Failed');
    console.log('  Found:', searchData.pagination?.total, 'users');

    // 4. Create a new user via admin
    console.log('\n[4] Admin creating new user...');
    const createRes = await fetch(`${BASE_URL}/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            name: 'Admin Created User',
            email: `admin_created_${Date.now()}@example.com`,
            password: 'password123',
            role: 'USER',
            phoneNumber: '+251900000001',
            company: 'Test Company'
        })
    });
    const createData = await createRes.json();
    console.log('Create User:', createData.success ? '✅ Success' : '❌ Failed');

    if (createData.user) {
        const newUserId = createData.user.id;

        // 5. Get activity logs for the new user
        console.log('\n[5] Getting activity logs...');
        const logsRes = await fetch(`${BASE_URL}/admin/activity-logs?limit=5`, { headers });
        const logsData = await logsRes.json();
        console.log('Activity Logs:', logsData.logs ? '✅ Success' : '❌ Failed');
        console.log('  Total:', logsData.pagination?.total);

        // 6. Update user status
        console.log('\n[6] Updating user status to SUSPENDED...');
        const updateRes = await fetch(`${BASE_URL}/admin/users/${newUserId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ status: 'SUSPENDED' })
        });
        console.log('Update Status:', (await updateRes.json()).success ? '✅ Success' : '❌ Failed');
    }

    console.log('\n✅ All advanced admin tests completed!');
}

testAdvancedAdminFeatures().catch(console.error);

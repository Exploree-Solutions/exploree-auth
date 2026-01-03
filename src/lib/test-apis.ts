const BASE_URL = 'http://localhost:3000/api/auth';
const SERVICE_KEY = 'test-service-key'; // Assumes SERVICE_API_KEY=test-service-key in .env

async function test() {
    console.log('--- Testing Auth Service APIs ---');

    // 1. Register
    console.log('\n[1] Registering user...');
    const regRes = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Verification User',
            email: `test_${Date.now()}@example.com`,
            password: 'password123'
        })
    });
    const regData = await regRes.json();
    console.log('Register Result:', regData);

    if (!regData.success) {
        console.error('Registration failed');
        return;
    }

    const token = regData.token;

    // 2. Verify with token (JWT)
    console.log('\n[2] Verifying token (JWT)...');
    const verifyRes = await fetch(`${BASE_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });
    console.log('Verify (JWT) Result:', await verifyRes.json());

    // 3. Verify with API Key
    console.log('\n[3] Verifying with Service API Key...');
    const apiVerifyRes = await fetch(`${BASE_URL}/verify`, {
        method: 'GET',
        headers: { 'X-Exploree-Service-Key': SERVICE_KEY }
    });
    console.log('Verify (API Key) Result:', await apiVerifyRes.json());

    // 4. Update Profile
    console.log('\n[4] Updating profile...');
    const updateRes = await fetch(`${BASE_URL}/profile`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            fullName: 'Updated Name',
            phoneNumber: '+1234567890',
            company: 'Exploree Solutions',
            password: 'newpassword123'
        })
    });
    console.log('Update Profile Result:', await updateRes.json());

    // 5. Get Profile
    console.log('\n[5] Getting profile...');
    const getProfileRes = await fetch(`${BASE_URL}/profile`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Get Profile Result:', await getProfileRes.json());
}

test();

// No need for node-fetch in Node 18+

async function testAuth() {
  const baseUrl = 'http://localhost:3000';
  
  const ngoData = {
    name: "Global Help NGO",
    email: "contact@globalhelp.org",
    password: "password123",
    phone: "1234567890",
    registrationNumber: "NGO-001",
    address: "123 Main St, Crisis Zone"
  };

  const volunteerData = {
    name: "John Volunteer",
    email: "john@volunteer.com",
    password: "password123",
    phone: "9876543210",
    skills: ["First Aid", "Driving"],
    availability: "full-time"
  };

  try {
    console.log('--- Registering NGO ---');
    const ngoRes = await fetch(`${baseUrl}/ngo/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ngoData)
    });
    const ngoJson = await ngoRes.json();
    console.log('NGO Response:', ngoRes.status, ngoJson);

    console.log('\n--- Registering Volunteer ---');
    const volRes = await fetch(`${baseUrl}/volunteer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(volunteerData)
    });
    const volJson = await volRes.json();
    console.log('Volunteer Response:', volRes.status, volJson);

  } catch (error) {
    console.error('Test Error:', error.message);
  }
}

testAuth();

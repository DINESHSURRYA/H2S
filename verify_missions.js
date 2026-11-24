const API_BASE = process.env.API_BASE || 'http://localhost:3000';

async function verifyBackend() {
  try {
    console.log(`Checking H2S Backend at ${API_BASE}...`);

    const healthRes = await fetch(`${API_BASE}/health`);
    const health = await healthRes.json();
    console.log('GET /health:', healthRes.status, health);

    const statsRes = await fetch(`${API_BASE}/help-request/stats`);
    const stats = await statsRes.json();
    console.log('GET /help-request/stats:', statsRes.status, JSON.stringify(stats));

    const approvedRes = await fetch(`${API_BASE}/help-request/approved`);
    const approved = await approvedRes.json();
    console.log('GET /help-request/approved count:', approved.length);

    if (approved.length > 0) {
      const first = approved[0];
      console.log('Sample mission:', {
        id: first._id,
        category: first.category,
        urgency: first.urgency,
        status: first.status,
        location: first.location,
      });

      const trackRes = await fetch(`${API_BASE}/help-request/track/${first._id}`);
      const tracked = await trackRes.json();
      console.log('GET /help-request/track/:id fulfillment:', tracked.fulfillment);
    }

    console.log('Verification PASSED');
  } catch (err) {
    console.error('Verification FAILED:', err.message);
    process.exit(1);
  }
}

verifyBackend();

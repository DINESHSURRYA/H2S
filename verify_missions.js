import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function verifyMissions() {
  try {
    console.log('Testing GET /help-request/missions...');
    const response = await axios.get(`${API_BASE}/help-request/missions`);
    console.log('Status:', response.status);
    console.log('Missions count:', response.data.length);
    if (response.data.length > 0) {
      console.log('First mission urgency:', response.data[0].urgency);
      console.log('First mission location:', response.data[0].location);
    }
    console.log('Verification PASSED');
  } catch (err) {
    console.error('Verification FAILED:', err.message);
  }
}

verifyMissions();

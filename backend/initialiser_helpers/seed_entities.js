import mongoose from 'mongoose';
import config from '../config/config.js';
import authService from '../services/authService.js';
import Ngo from '../models/ngoModel.js';
import Volunteer from '../models/volunteerModel.js';
import HelpRequest from '../models/helpRequestModel.js';

async function seedEntities() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB for entity seeding');

    const hashedPassword = await authService.hashPassword('password123');

    // Seed NGOs
    const ngos = [
      {
        name: 'Red Cross Team A',
        email: 'admin@ngo.com',
        password: hashedPassword,
        phone: '9876543210',
        registrationNumber: 'NGO-RC-001',
        isVerified: true,
        status: 'active',
        trustScore: 80
      },
      {
        name: 'Crisis Relief Foundation',
        email: 'help@ngo.com',
        password: hashedPassword,
        phone: '1234567890',
        registrationNumber: 'NGO-CRF-002',
        isVerified: false,
        status: 'pending',
        trustScore: 0
      }
    ];

    for (const ngo of ngos) {
      await Ngo.findOneAndUpdate({ email: ngo.email }, ngo, { upsert: true, new: true });
    }
    console.log('Seeded/Updated NGOs');

    // Seed Volunteers
    const volunteersList = [
      {
        name: 'Jane Doe',
        email: 'jane_doe@gmail.com',
        password: hashedPassword,
        aadharNumber: '1234-5678-9012',
        phone: '9988776655',
        skills: ['Medical', 'First Aid'],
        availability: 'full-time',
        status: 'active',
        trustScore: 75
      },
      {
        name: 'John Smith',
        email: 'john_smith@gmail.com',
        password: hashedPassword,
        aadharNumber: '9876-5432-1098',
        phone: '8877665544',
        skills: ['Logistics', 'Driving'],
        availability: 'weekends',
        status: 'active',
        trustScore: 50
      }
    ];

    for (const v of volunteersList) {
      await Volunteer.findOneAndUpdate({ email: v.email }, v, { upsert: true, new: true });
    }
    console.log('Seeded/Updated Volunteers');

    // Get a volunteer ID for the help request
    const jane = await Volunteer.findOne({ email: 'jane_doe@gmail.com' });

    // Seed Help Requests
    const hRequests = [
      {
        name: 'John Public',
        contactInfo: '555-0199',
        email: 'john_public@test.com',
        location: { latitude: 13.0827, longitude: 80.2707 }, // Chennai
        description: 'Need food and clean water for 5 people due to flooding.',
        products: [
          { product: 'Drinking Water', quantity: '10 Liters', reason: 'Basic survival' },
          { product: 'Dry Food', quantity: '5 Packets', reason: 'No cooking facility' }
        ],
        status: 'pending'
      },
      {
        name: 'Mary Doe',
        contactInfo: '555-0288',
        email: 'mary_doe@test.com',
        location: { latitude: 12.9716, longitude: 77.5946 }, // Bangalore
        description: 'Elderly lady requires urgent medical supplies (Insulin).',
        products: [
          { product: 'Insulin', quantity: '5 Vials', reason: 'Emergency medical need' }
        ],
        status: 'pending',
        raisedBy: jane._id
      }
    ];

    for (const hr of hRequests) {
      await HelpRequest.findOneAndUpdate({ email: hr.email, name: hr.name }, hr, { upsert: true, new: true });
    }
    console.log('Seeded/Updated Help Requests');

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
}

seedEntities();

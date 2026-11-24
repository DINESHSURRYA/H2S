import mongoose from 'mongoose';
import config from '../config/config.js';
import authService from '../services/authService.js';
import Ngo from '../models/ngoModel.js';
import Volunteer from '../models/volunteerModel.js';
import PublicUser from '../models/publicUserModel.js';
import HelpRequest from '../models/helpRequestModel.js';
import GrantedHelp from '../models/grantedHelpModel.js';

async function seedEntities() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB for entity seeding');

    const hashedPassword = await authService.hashPassword('password123');

    // 1. Seed NGOs
    const redCross = await Ngo.findOneAndUpdate(
      { email: 'admin@ngo.com' },
      {
        name: 'Red Cross Response Team A',
        email: 'admin@ngo.com',
        password: hashedPassword,
        phone: '+91 98765 43210',
        registrationNumber: 'NGO-RC-001',
        address: 'Sector 4 Relief Depot, Chennai',
        isVerified: true,
        status: 'active',
        trustScore: 95,
      },
      { upsert: true, returnDocument: 'after' }
    );

    await Ngo.findOneAndUpdate(
      { email: 'help@ngo.com' },
      {
        name: 'Crisis Relief Foundation',
        email: 'help@ngo.com',
        password: hashedPassword,
        phone: '+91 91234 56780',
        registrationNumber: 'NGO-CRF-002',
        address: 'Indiranagar Hub, Bengaluru',
        isVerified: false,
        status: 'pending',
        trustScore: 20,
      },
      { upsert: true, returnDocument: 'after' }
    );
    console.log('Seeded/Updated NGOs');

    // 2. Seed Volunteers (matching current skill schema)
    const jane = await Volunteer.findOneAndUpdate(
      { email: 'jane_doe@gmail.com' },
      {
        name: 'Jane Doe',
        email: 'jane_doe@gmail.com',
        password: hashedPassword,
        aadharNumber: '123456789012',
        phone: '+91 99887 76655',
        skills: [
          {
            name: 'Medical Assistant',
            verified: true,
            verifiedBy: redCross._id,
            verificationReport: 'Verified nursing license and field triage training.',
            verifiedAt: new Date(),
          },
          {
            name: 'First Aid Responder',
            verified: true,
            verifiedBy: redCross._id,
            verificationReport: 'Certified Red Cross First Aid Responder.',
            verifiedAt: new Date(),
          },
          {
            name: 'Search & Rescue',
            verified: false,
          },
        ],
        availability: 'full-time',
        status: 'active',
        trustScore: 85,
      },
      { upsert: true, returnDocument: 'after' }
    );

    await Volunteer.findOneAndUpdate(
      { email: 'john_smith@gmail.com' },
      {
        name: 'John Smith',
        email: 'john_smith@gmail.com',
        password: hashedPassword,
        aadharNumber: '987654321098',
        phone: '+91 88776 65544',
        skills: [
          {
            name: 'Logistics Coordinator',
            verified: true,
            verifiedBy: redCross._id,
            verificationReport: 'Verified supply chain coordinator.',
            verifiedAt: new Date(),
          },
          {
            name: 'Heavy Vehicle Driver',
            verified: false,
          },
        ],
        availability: 'weekends',
        status: 'active',
        trustScore: 60,
      },
      { upsert: true, returnDocument: 'after' }
    );
    console.log('Seeded/Updated Volunteers');

    // 3. Seed Public Users
    const publicReporter = await PublicUser.findOneAndUpdate(
      { phone: '9840011223' },
      {
        name: 'Arjun Kumar',
        phone: '9840011223',
        email: 'arjun.kumar@example.com',
      },
      { upsert: true, returnDocument: 'after' }
    );

    // 4. Seed Sample Crisis Help Requests (only if empty so user edits aren't overwritten)
    const existingCount = await HelpRequest.countDocuments();
    if (existingCount === 0) {
      // Request 1: Unvalidated public SOS (pending volunteer verification)
      await HelpRequest.create({
        publicUser: publicReporter._id,
        category: 'Food & Water',
        urgency: 'high',
        affectedCount: 18,
        location: { latitude: 13.0827, longitude: 80.2707 },
        crisisDescription:
          'Severe waterlogging in low-lying residential block. 18 residents including children need safe drinking water and dry rations.',
        requirements: [
          { itemName: 'Drinking Water Cans (20L)', quantity: 10, description: 'Safe drinking water for 5 families' },
          { itemName: 'Dry Food Packs', quantity: 20, description: 'Ready-to-eat meals since power is out' },
        ],
        status: 'pending',
      });

      // Request 2: Volunteer-validated urgent medical crisis needing supplies & manpower
      const validatedMission = await HelpRequest.create({
        volunteer: jane._id,
        approvedBy: jane._id,
        category: 'Medical',
        urgency: 'critical',
        affectedCount: 12,
        location: { latitude: 12.9716, longitude: 77.5946 },
        crisisDescription:
          'Temporary relief shelter at East Community Hall needs insulin vials, trauma first-aid kits, and additional logistics/medical responders.',
        requirements: [
          { itemName: 'Insulin Vials', quantity: 10, description: 'Critical diabetic patients in shelter' },
          { itemName: 'Trauma First-Aid Kits', quantity: 6, description: 'Wound dressing and emergency care' },
        ],
        requiredVolunteers: [
          { role: 'Medical Assistant', count: 2, assignedVolunteers: [jane._id] },
          { role: 'Logistics Coordinator', count: 2, assignedVolunteers: [] },
        ],
        hype: [{ volunteer: jane._id, points: 5 }],
        status: 'in-progress',
      });

      // Attach one partial NGO grant to Request 2
      const firstReqItem = validatedMission.requirements[0];
      const sampleGrant = await GrantedHelp.create({
        quantityApproved: 4,
        ngoId: redCross._id,
        requirementId: firstReqItem._id,
        helpRequestId: validatedMission._id,
        status: 'pending',
        isReceived: false,
      });

      await HelpRequest.findByIdAndUpdate(
        validatedMission._id,
        {
          $push: { 'requirements.$[elem].grantedList': sampleGrant._id },
        },
        { arrayFilters: [{ 'elem._id': firstReqItem._id }] }
      );

      // Request 3: Resolved relief mission (demonstrates verified impact)
      await HelpRequest.create({
        volunteer: jane._id,
        approvedBy: jane._id,
        category: 'Shelter',
        urgency: 'medium',
        affectedCount: 30,
        location: { latitude: 13.0475, longitude: 80.209 },
        crisisDescription:
          'Tarpaulins and solar lanterns requested for displaced coastal families — fully delivered and confirmed.',
        requirements: [
          { itemName: 'Waterproof Tarpaulins', quantity: 15, description: 'Temporary roof cover' },
          { itemName: 'Solar Lanterns', quantity: 15, description: 'Night-time lighting during power outage' },
        ],
        hype: [{ volunteer: jane._id, points: 3 }],
        status: 'resolved',
      });

      console.log('Seeded 3 sample crisis requests and 1 active NGO grant');
    } else {
      console.log(`Skipping sample help requests (${existingCount} already exist in DB)`);
    }

    console.log('Seeding complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
}

seedEntities();

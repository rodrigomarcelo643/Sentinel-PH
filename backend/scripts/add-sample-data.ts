import * as dotenv from 'dotenv';
import * as path from 'path';
import { db, auth } from '../config/firebase-admin';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function addSampleData() {
  try {
    // Create a sample symptom report
    const sampleReport = {
      userId: 'testUser123',
      userName: 'Test User',
      createdAt: new Date(),
      latitude: 14.5995,
      longitude: 120.9842,
      symptoms: ['Fever', 'Cough'],
      severity: 'mild',
      status: 'pending',
      municipality: 'Test Municipality',
      barangay: 'Test Barangay',
      reportType: 'symptom',
      description: 'Test symptom report for regional observations'
    };

    // Add to symptomReports collection
    await db.collection('symptomReports').add(sampleReport);
    
    console.log('✅ Sample symptom report added:', sampleReport);
    console.log('📊 Collection: symptomReports');
    console.log('🔍 Check RegionalObservations page now');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  }
}

addSampleData();

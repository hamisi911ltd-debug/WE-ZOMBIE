// Simple student data insertion script
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './src/backend/lib/schema';
import bcrypt from 'bcryptjs';

// Student data with calculated totals
const students = [
  { name: "Faith Wambu Matinda", class: "B2", idNumber: "11604", totalPaid: 12000, status: "Cleared" },
  { name: "Kamau Jane Kamani", class: "B2", idNumber: "12600", totalPaid: 5000, status: "Active" },
  { name: "Grace Mwihaki Kamani", class: "B2", idNumber: "12600", totalPaid: 9750, status: "Active" },
  { name: "Bweyeire Njoka", class: "B2", idNumber: "12600", totalPaid: 6000, status: "Active" },
  { name: "Roseline Wanjiku", class: "B2", idNumber: "12600", totalPaid: 3000, status: "Active" },
  { name: "Veronica Olive Onditi", class: "A", idNumber: "9360", totalPaid: 12100, status: "Active" },
  { name: "Fridah Mutiga", class: "B", idNumber: "12600", totalPaid: 5000, status: "Active" },
  { name: "Esther Wambui", class: "B2", idNumber: "12600", totalPaid: 11500, status: "Active" },
  { name: "Antony Mwangi Cimaini", class: "B½", idNumber: "8700", totalPaid: 2000, status: "Active" },
  { name: "Charles Mwangi Rigiti", class: "B½", idNumber: "", totalPaid: 8750, status: "Cleared" },
  { name: "Hamisi Platini Kamau", class: "B", idNumber: "12600", totalPaid: 5000, status: "Active" },
  { name: "Oscan Kalu", class: "B", idNumber: "9360", totalPaid: 1000, status: "Active" },
  { name: "Jane Fauzi Wambua", class: "B½", idNumber: "", totalPaid: 6000, status: "Active" },
  { name: "Chrispin Ochieng", class: "B", idNumber: "", totalPaid: 7000, status: "Active" },
  { name: "Christine Wambui", class: "", idNumber: "", totalPaid: 48000, status: "Active" },
  { name: "Jemimah Kamilia", class: "", idNumber: "", totalPaid: 48000, status: "Active" },
  { name: "Catherine Wanjiku", class: "B½", idNumber: "8700", totalPaid: 28600, status: "Active" },
  { name: "Nicholas Kipkoech", class: "B½", idNumber: "", totalPaid: 1300, status: "Active" },
  { name: "Moses Juma Kinyua", class: "D", idNumber: "", totalPaid: 20000, status: "Active" },
  { name: "Teresiah Mwiti David", class: "B2", idNumber: "", totalPaid: 9850, status: "Active" }
];

function generateEmail(name: string): string {
  return name.toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '')
    + '@drivingschool.com';
}

function mapClassToCourseId(className: string): string {
  const classMap: { [key: string]: string } = {
    'A': 'class-a',
    'A2': 'class-a',
    'B': 'class-b',
    'B1': 'class-b',
    'B2': 'class-b',
    'B+': 'class-b',
    'B½': 'class-b-half',
    'C': 'class-c',
    'C2': 'class-c',
    'D': 'class-d'
  };
  return classMap[className] || 'class-b';
}

async function insertStudents() {
  console.log('🚀 Starting student data insertion...');
  
  // Create database connection
  const sqlite = new Database('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/b31da365-97d1-4155-9214-c2ec8c886766.sqlite');
  const db = drizzle(sqlite, { schema });
  
  let successCount = 0;
  let totalAmount = 0;
  
  for (const student of students) {
    try {
      const now = new Date().toISOString();
      const userId = `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const email = generateEmail(student.name);
      const passwordHash = await bcrypt.hash('password123', 10);
      
      // Insert profile
      await db.insert(schema.profiles).values({
        id: userId,
        email: email,
        passwordHash: passwordHash,
        fullName: student.name,
        phone: null,
        idNumber: student.idNumber || null,
        dateOfBirth: null,
        address: null,
        avatarUrl: null,
        createdAt: now,
        updatedAt: now,
      });
      
      // Insert user role
      await db.insert(schema.userRoles).values({
        id: `role-${userId}`,
        userId: userId,
        role: 'student',
        createdAt: now,
      });
      
      // Insert enrollment if class specified
      if (student.class) {
        const courseId = mapClassToCourseId(student.class);
        await db.insert(schema.enrollments).values({
          id: `enroll-${userId}`,
          userId: userId,
          courseId: courseId,
          status: student.status.toLowerCase() === 'cleared' ? 'completed' : 'active',
          enrolledAt: now,
        });
      }
      
      // Insert payment record
      if (student.totalPaid > 0) {
        await db.insert(schema.payments).values({
          id: `payment-${userId}`,
          userId: userId,
          amount: student.totalPaid * 100, // Convert to cents
          status: 'paid',
          paymentMethod: 'cash',
          transactionRef: null,
          dueDate: now,
          paidDate: now,
          proofUrl: null,
          recordedBy: 'admin',
          notes: `Imported from handwritten records. Class: ${student.class || 'N/A'}`,
          createdAt: now,
          updatedAt: now,
        });
      }
      
      console.log(`✅ ${student.name} - KES ${student.totalPaid.toLocaleString()}`);
      successCount++;
      totalAmount += student.totalPaid;
      
    } catch (error) {
      console.error(`❌ Error inserting ${student.name}:`, error);
    }
  }
  
  sqlite.close();
  
  console.log('\n📊 INSERTION COMPLETE!');
  console.log(`✅ Successfully inserted: ${successCount} students`);
  console.log(`💰 Total payments recorded: KES ${totalAmount.toLocaleString()}`);
  console.log(`📈 Average payment: KES ${Math.round(totalAmount / successCount).toLocaleString()}`);
}

// Run the insertion
insertStudents().catch(console.error);
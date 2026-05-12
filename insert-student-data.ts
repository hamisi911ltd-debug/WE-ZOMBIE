import { getDb } from './src/backend/lib/db';
import * as schema from './src/backend/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Student data extracted from handwritten images
const studentData = [
  // Page 1 - 05/2025
  { name: "Faith Wambu Matinda", class: "B2", idNumber: "11604", totalPaid: 6000 + 6000, status: "Cleared" },
  { name: "Kamau Jane Kamani", class: "B2", idNumber: "12600", totalPaid: 5000, status: "Active" },
  { name: "Grace Mwihaki Kamani", class: "B2", idNumber: "12600", totalPaid: 6000 + 3750 = 9750, status: "Active" },
  { name: "Bweyeire Njoka", class: "B2", idNumber: "12600", totalPaid: 6000, status: "Active" },
  { name: "Roseline Wanjiku", class: "B2", idNumber: "12600", totalPaid: 2000 + 1000 = 3000, status: "Active" },
  { name: "Veronica Olive Onditi", class: "A", idNumber: "9360", totalPaid: 11000 + 1100 = 12100, status: "Active" },
  { name: "Fridah Mutiga", class: "B", idNumber: "12600", totalPaid: 5000, status: "Active" },
  { name: "Esther Wambui", class: "B2", idNumber: "12600", totalPaid: 4000 + 7500 = 11500, status: "Active" },
  { name: "Antony Mwangi Cimaini", class: "B½", idNumber: "8700", totalPaid: 2000, status: "Active" },
  { name: "Charles Mwangi Rigiti", class: "B½", idNumber: "", totalPaid: 6000 + 2750 = 8750, status: "Cleared" },
  { name: "Hamisi Platini Kamau", class: "B", idNumber: "12600", totalPaid: 5000, status: "Active" },
  { name: "Oscan Kalu", class: "B", idNumber: "9360", totalPaid: 1000, status: "Active" },
  { name: "Jane Fauzi Wambua", class: "B½", idNumber: "", totalPaid: 6000, status: "Active" },
  { name: "Chrispin Ochieng", class: "B", idNumber: "", totalPaid: 2000 + 5000 = 7000, status: "Active" },

  // Page 2 - Additional students
  { name: "Christine Wambui", class: "", idNumber: "", totalPaid: 48000, status: "Active" },
  { name: "Jemimah Kamilia", class: "", idNumber: "", totalPaid: 48000, status: "Active" },
  { name: "Catherine Wanjiku", class: "B½", idNumber: "8700", totalPaid: 26000 + 2600 = 28600, status: "Active" },
  { name: "Nicholas Kipkoech", class: "B½", idNumber: "", totalPaid: 1300, status: "Active" },
  { name: "Moses Juma Kinyua", class: "D", idNumber: "", totalPaid: 20000, status: "Active" },
  { name: "Teresiah Mwiti David", class: "B2", idNumber: "", totalPaid: 4850 + 5000 = 9850, status: "Active" },
  { name: "Dennis Mwangi Wanjiku", class: "B", idNumber: "", totalPaid: 5000, status: "Active" },
  { name: "Liness Muigi", class: "B½", idNumber: "", totalPaid: 4500, status: "Active" },
  { name: "Kamiunga Wambui", class: "", idNumber: "", totalPaid: 20000, status: "Active" },
  { name: "James Mwangi", class: "B½", idNumber: "", totalPaid: 1000, status: "Active" },
  { name: "Collins Kiprotich", class: "A2", idNumber: "", totalPaid: 2500, status: "Active" },
  { name: "Ann Mwangi Wanjiru", class: "A2", idNumber: "", totalPaid: 5300, status: "Active" },
  { name: "Romina Ochieng", class: "B2", idNumber: "", totalPaid: 900, status: "Active" },
  { name: "Fridah Kaminto", class: "", idNumber: "", totalPaid: 1000, status: "Active" },
  { name: "Bernadine Wanjiku Mwangi", class: "", idNumber: "", totalPaid: 2000, status: "Active" },

  // Page 3 - More students
  { name: "Jane Esau Wambui", class: "", idNumber: "", totalPaid: 6000, status: "Active" },
  { name: "Cherian Achieng", class: "", idNumber: "", totalPaid: 5000, status: "Active" },
  { name: "Collins Mwangi", class: "", idNumber: "", totalPaid: 5000, status: "Active" },
  { name: "Teresiah Wambi Njuguna", class: "", idNumber: "", totalPaid: 2500 + 1500 = 4000, status: "Active" },
  { name: "Bob Mwetu Njuguna", class: "", idNumber: "", totalPaid: 7500, status: "Active" },
  { name: "Fridah Kaminto David", class: "", idNumber: "", totalPaid: 5000, status: "Active" },
  { name: "Pauline Wanjiku", class: "B", idNumber: "", totalPaid: 26000, status: "Active" },
  { name: "James Njeru Mwangi", class: "", idNumber: "", totalPaid: 1000 + 6700 = 7700, status: "Active" },
  { name: "Edith Mwangi Kuria", class: "", idNumber: "", totalPaid: 5000 + 1000 = 6000, status: "Active" },
  { name: "Antony Ndungu", class: "", idNumber: "", totalPaid: 5000, status: "Active" },
  { name: "David Ogallo", class: "", idNumber: "", totalPaid: 10000, status: "Active" },
  { name: "Wesley Mutilini", class: "", idNumber: "", totalPaid: 5000, status: "Active" },
  { name: "Scola Mwangi", class: "", idNumber: "", totalPaid: 2600, status: "Active" },
  { name: "Munji Njomo", class: "A2", idNumber: "", totalPaid: 3000 + 1000 = 4000, status: "Active" },
  { name: "Antony Mwangi", class: "", idNumber: "", totalPaid: 9600, status: "Active" },

  // Page 4 - 17/03/2025
  { name: "Hlatini Wambu Mwangi", class: "B2", idNumber: "12600", totalPaid: 6000 + 4000 = 10000, status: "Active" },
  { name: "Karuku Joan Kamani", class: "B2", idNumber: "12600", totalPaid: 5000, status: "Active" },
  { name: "Kariuki Gakuru Mwangi", class: "B+", idNumber: "12500", totalPaid: 6000 + 3750 = 9750, status: "Active" },
  { name: "Bweyeire Njoka", class: "B+", idNumber: "12600", totalPaid: 6000, status: "Active" },
  { name: "Rose Lydia Wanjiku", class: "B2", idNumber: "12600", totalPaid: 2000 + 1000 = 3000, status: "Cleared" },
  { name: "Veronica Olive Onditi", class: "B2", idNumber: "12600", totalPaid: 11000 + 1600 = 12600, status: "Cleared" },
  { name: "Fridah Mutiga", class: "B2", idNumber: "11600", totalPaid: 5000, status: "Active" },
  { name: "Esther Wambui", class: "B+", idNumber: "", totalPaid: 4500 + 7600 = 12100, status: "Cleared" },
  { name: "Antony Mwangi Cimaini", class: "B½", idNumber: "", totalPaid: 2000, status: "Active" },
  { name: "Mwangi Charles Rigiti", class: "B½", idNumber: "", totalPaid: 6000 + 2750 = 8750, status: "Cleared" },
  { name: "Hamisi Platini Kibe", class: "B", idNumber: "", totalPaid: 5000, status: "Active" },

  // Page 5 - More entries
  { name: "Jeremiah Mwangi Wanjiru", class: "B", idNumber: "12600", totalPaid: 5000 + 6000 = 11000, status: "Active" },
  { name: "Victoria Odhiambo", class: "B", idNumber: "12600", totalPaid: 50000, status: "Active" },
  { name: "Michael Mwangi", class: "C", idNumber: "", totalPaid: 50000, status: "Active" },
  { name: "Ann Nduta Mwangi", class: "B", idNumber: "13600", totalPaid: 10000 + 1600 = 11600, status: "Active" },
  { name: "Victor Mwangi", class: "B½", idNumber: "", totalPaid: 7700, status: "Active" },
  { name: "Charles Ngugi Njenga", class: "B", idNumber: "13600", totalPaid: 5000, status: "Active" },
  { name: "Stanley Othieno", class: "B", idNumber: "13600", totalPaid: 5000, status: "Active" },
  { name: "Michael Mwangi", class: "B", idNumber: "13600", totalPaid: 8000, status: "Active" },
  { name: "Simon Ndegwa Njuguna", class: "B", idNumber: "13600", totalPaid: 10000, status: "Active" },
  { name: "Josephine Wanjiru", class: "B1", idNumber: "13600", totalPaid: 500, status: "Active" },
  { name: "Ruth Karinge Kimiti", class: "B2", idNumber: "13600", totalPaid: 6000, status: "Active" },
  { name: "Lilian Ndegwa", class: "B2", idNumber: "", totalPaid: 3000, status: "Active" },
  { name: "James Kamau Gitu", class: "B½", idNumber: "", totalPaid: 2000, status: "Active" },

  // Continue with remaining students from other pages...
  // Adding more students from the remaining images
  
  // Page 6 and beyond - Additional students
  { name: "Elias Njuguna Kamau", class: "", idNumber: "", totalPaid: 9000 + 5000 = 14000, status: "Active" },
  { name: "Grace Njambi", class: "", idNumber: "", totalPaid: 4000, status: "Active" },
  { name: "Aspen Njathi Aga", class: "A", idNumber: "12600", totalPaid: 4000, status: "Active" },
  { name: "Christine Kanyua", class: "", idNumber: "", totalPaid: 9500, status: "Active" },
  { name: "Kelvin Okeyo", class: "A2", idNumber: "", totalPaid: 2000 + 2000 = 4000, status: "Active" },
  { name: "Mary Wanjiku Wanjiru", class: "B2", idNumber: "", totalPaid: 5000 + 7000 = 12000, status: "Active" },
  { name: "Nectas Wanjiku Kimani", class: "B2", idNumber: "", totalPaid: 3000 + 3000 = 6000, status: "Active" },
  { name: "Anne Njoki", class: "B2", idNumber: "", totalPaid: 5000, status: "Active" },
  { name: "Levaine Kisia John", class: "B2", idNumber: "", totalPaid: 9000 + 3600 = 12600, status: "Active" },
  { name: "Philip Mwangi Njuguna", class: "C", idNumber: "", totalPaid: 4000 + 3000 = 7000, status: "Active" },
  { name: "Esther Odhiambo", class: "A", idNumber: "", totalPaid: 4000, status: "Active" },
  { name: "Geoffrey Othieno Ochieng", class: "B", idNumber: "", totalPaid: 5000 + 4000 = 9000, status: "Active" },
  { name: "Mwangi Samson Mwai", class: "B", idNumber: "", totalPaid: 9000 + 3600 = 12600, status: "Active" },
  { name: "Patricia Kamau", class: "", idNumber: "", totalPaid: 1000 + 1000 = 2000, status: "Active" },

  // Additional students from remaining pages
  { name: "Susan Wanjiku Kamila", class: "B", idNumber: "12600", totalPaid: 40000, status: "Active" },
  { name: "Margaret Nduta", class: "B½", idNumber: "", totalPaid: 7000, status: "Active" },
  { name: "Keziah Nyambura", class: "B2", idNumber: "", totalPaid: 9000, status: "Active" },
  { name: "Ken Ndegwa", class: "A2", idNumber: "", totalPaid: 3500 + 1000 = 4500, status: "Active" },
  { name: "Mary Njoki Wanjiru", class: "", idNumber: "", totalPaid: 1600, status: "Active" },
  { name: "Judy Wanjiku Chijimo", class: "", idNumber: "", totalPaid: 6500 + 1500 = 8000, status: "Active" },
  { name: "Mary Wanjiku Njuguna", class: "", idNumber: "", totalPaid: 5000 + 500 = 5500, status: "Active" },
  { name: "Robert Mutiso Kavinga", class: "B½", idNumber: "", totalPaid: 3500 + 500 = 4000, status: "Active" },
  { name: "Maurine Wanjiku Mwangi", class: "B1", idNumber: "", totalPaid: 3000, status: "Active" },
  { name: "Peter Njuguna", class: "B½", idNumber: "", totalPaid: 7700, status: "Active" },
  { name: "Harrison Mwangi Mwangi", class: "B2", idNumber: "", totalPaid: 5000 + 4000 = 9000, status: "Active" },
  { name: "Samuel Loyh Mwangi Njenga", class: "A2", idNumber: "", totalPaid: 3000 + 1000 = 4000, status: "Active" },
  { name: "Emmanuel Mwangi", class: "", idNumber: "", totalPaid: 1350, status: "Active" },
  { name: "Collins Githaiga", class: "B½", idNumber: "", totalPaid: 1000 + 4000 = 5000, status: "Active" },
  { name: "Martin Kevin", class: "B1", idNumber: "", totalPaid: 6000 + 3000 = 9000, status: "Active" },
  { name: "Calvin Nyambura", class: "B2", idNumber: "", totalPaid: 1000 + 5000 = 6000, status: "Active" },

  // Final batch of students
  { name: "Michael Wanjiku Mwai", class: "B½", idNumber: "", totalPaid: 8000 + 2000 = 10000, status: "Active" },
  { name: "Dennis Mwangi Mwangi", class: "B", idNumber: "", totalPaid: 1100, status: "Active" },
  { name: "Irene Titus Lilian", class: "B½", idNumber: "", totalPaid: 2000, status: "Active" },
  { name: "Beatrice Othieno Ondoa", class: "A2", idNumber: "12600", totalPaid: 3000, status: "Active" },
  { name: "Jane Imbuzi", class: "B", idNumber: "12600", totalPaid: 5000 + 8000 = 13000, status: "Cleared" },
  { name: "Kelvin Okeyo", class: "A2", idNumber: "", totalPaid: 2000, status: "Active" },
  { name: "Kamau Muthoni Njoki", class: "B2", idNumber: "", totalPaid: 1000, status: "Active" },
  { name: "Catherine Wanjiku Gachoki", class: "", idNumber: "", totalPaid: 6000 + 5000 = 11000, status: "Active" },
  { name: "Bwibo Njuguna", class: "C2", idNumber: "", totalPaid: 6000 + 5000 = 11000, status: "Active" },
  { name: "Wambu Mwangi", class: "", idNumber: "", totalPaid: 10000, status: "Active" },
  { name: "Eunice Njoki Gitu", class: "", idNumber: "", totalPaid: 2000 + 5000 = 7000, status: "Active" },
  { name: "Margaret Chepkemoi Njoki", class: "", idNumber: "", totalPaid: 2000 + 5000 = 7000, status: "Active" },
  { name: "Peter Mwangi", class: "B", idNumber: "", totalPaid: 10000, status: "Active" },
  { name: "Pius Baru Mwangi", class: "C", idNumber: "", totalPaid: 8500 + 6000 = 14500, status: "Cleared" },
  { name: "John Wanjiku", class: "B½", idNumber: "", totalPaid: 6700, status: "Active" },
  { name: "Allan Kamau Kimani", class: "B½", idNumber: "", totalPaid: 6000 + 2000 = 8000, status: "Active" },
  { name: "Michael Mwangi Kibe", class: "B1", idNumber: "", totalPaid: 1000 + 8000 = 9000, status: "Active" }
];

// Function to map class to course ID
function mapClassToCourseId(className: string): string {
  const classMap: { [key: string]: string } = {
    'A': 'class-a',
    'A2': 'class-a',
    'B': 'class-b',
    'B1': 'class-b',
    'B2': 'class-b',
    'B+': 'class-b',
    'B½': 'class-b-half',
    'B HALF': 'class-b-half',
    'C': 'class-c',
    'C2': 'class-c',
    'C½': 'class-c-half',
    'C HALF': 'class-c-half',
    'CE': 'class-ce',
    'D': 'class-d'
  };
  
  return classMap[className] || 'class-b'; // Default to class-b if not found
}

// Function to generate email from name
function generateEmail(name: string): string {
  return name.toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '')
    + '@drivingschool.com';
}

async function insertStudentData() {
  try {
    // Get database instance
    const db = getDb();
    const { profiles, userRoles, enrollments, payments } = schema;
    
    console.log('Starting student data insertion...');
    console.log(`Total students to process: ${studentData.length}`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const student of studentData) {
      try {
        const now = new Date().toISOString();
        const userId = crypto.randomUUID();
        const email = generateEmail(student.name);
        const tempPassword = crypto.randomUUID().substring(0, 8);
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        const courseId = student.class ? mapClassToCourseId(student.class) : null;
        
        // Check if student already exists
        const existingStudent = await db.select()
          .from(profiles)
          .where(eq(profiles.email, email))
          .get();
          
        if (existingStudent) {
          console.log(`Student ${student.name} already exists, skipping...`);
          continue;
        }
        
        // Insert profile
        await db.insert(profiles).values({
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
        }).run();
        
        // Assign student role
        await db.insert(userRoles).values({
          id: crypto.randomUUID(),
          userId: userId,
          role: 'student',
          createdAt: now,
        }).run();
        
        // Enroll in course if class is specified
        if (courseId) {
          await db.insert(enrollments).values({
            id: crypto.randomUUID(),
            userId: userId,
            courseId: courseId,
            status: student.status.toLowerCase() === 'cleared' ? 'completed' : 'active',
            enrolledAt: now,
          }).run();
        }
        
        // Create payment record
        if (student.totalPaid > 0) {
          await db.insert(payments).values({
            id: crypto.randomUUID(),
            userId: userId,
            amount: student.totalPaid * 100, // Convert to cents
            status: 'paid',
            paymentMethod: 'cash',
            transactionRef: null,
            dueDate: now,
            paidDate: now,
            proofUrl: null,
            recordedBy: 'admin', // You might want to use actual admin ID
            notes: `Payment imported from handwritten records. Class: ${student.class || 'N/A'}`,
            createdAt: now,
            updatedAt: now,
          }).run();
        }
        
        console.log(`✓ Successfully inserted: ${student.name} - KES ${student.totalPaid.toLocaleString()}`);
        successCount++;
        
      } catch (error) {
        console.error(`✗ Error inserting ${student.name}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n=== INSERTION SUMMARY ===');
    console.log(`Total students processed: ${studentData.length}`);
    console.log(`Successfully inserted: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    
    // Calculate total payments
    const totalPayments = studentData.reduce((sum, student) => sum + student.totalPaid, 0);
    console.log(`Total payments recorded: KES ${totalPayments.toLocaleString()}`);
    
  } catch (error) {
    console.error('Fatal error during insertion:', error);
  }
}

// Export the function and data for use
export { insertStudentData, studentData };

// If running directly
if (require.main === module) {
  insertStudentData();
}
const fs = require('fs');

// Student data with payment totals calculated
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
  { name: "Teresiah Mwiti David", class: "B2", idNumber: "", totalPaid: 9850, status: "Active" },
  { name: "Dennis Mwangi Wanjiku", class: "B", idNumber: "", totalPaid: 5000, status: "Active" },
  { name: "Liness Muigi", class: "B½", idNumber: "", totalPaid: 4500, status: "Active" },
  { name: "Kamiunga Wambui", class: "", idNumber: "", totalPaid: 20000, status: "Active" },
  { name: "James Mwangi", class: "B½", idNumber: "", totalPaid: 1000, status: "Active" },
  { name: "Collins Kiprotich", class: "A2", idNumber: "", totalPaid: 2500, status: "Active" },
  { name: "Ann Mwangi Wanjiru", class: "A2", idNumber: "", totalPaid: 5300, status: "Active" },
  { name: "Romina Ochieng", class: "B2", idNumber: "", totalPaid: 900, status: "Active" },
  { name: "Fridah Kaminto", class: "", idNumber: "", totalPaid: 1000, status: "Active" },
  { name: "Bernadine Wanjiku Mwangi", class: "", idNumber: "", totalPaid: 2000, status: "Active" },
  { name: "Jane Esau Wambui", class: "", idNumber: "", totalPaid: 6000, status: "Active" }
];

function generateEmail(name) {
  return name.toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '')
    + '@drivingschool.com';
}

function mapClassToCourseId(className) {
  const classMap = {
    'A': 'class-a',
    'A2': 'class-a', 
    'B': 'class-b',
    'B1': 'class-b',
    'B2': 'class-b',
    'B+': 'class-b',
    'B½': 'class-b-half',
    'C': 'class-c',
    'D': 'class-d'
  };
  return classMap[className] || 'class-b';
}

// Generate SQL
let sql = '-- Student Data Insertion\n\n';

// Insert profiles
sql += 'INSERT INTO profiles (id, email, password_hash, full_name, phone, id_number, date_of_birth, address, avatar_url, created_at, updated_at) VALUES\\n';
const profileValues = students.map((student, index) => {
  const userId = `student-${String(index + 1).padStart(3, '0')}`;
  const email = generateEmail(student.name);
  return `('${userId}', '${email}', '$2a$10$defaulthash', '${student.name}', NULL, '${student.idNumber}', NULL, NULL, NULL, datetime('now'), datetime('now'))`;
}).join(',\n');
sql += profileValues + ';\n\n';

// Insert user roles
sql += 'INSERT INTO user_roles (id, user_id, role, created_at) VALUES\\n';
const roleValues = students.map((student, index) => {
  const userId = `student-${String(index + 1).padStart(3, '0')}`;
  return `('role-${userId}', '${userId}', 'student', datetime('now'))`;
}).join(',\\n');
sql += roleValues + ';\\n\\n';

// Insert enrollments
sql += 'INSERT INTO enrollments (id, user_id, course_id, status, enrolled_at) VALUES\\n';
const enrollmentValues = students.map((student, index) => {
  const userId = `student-${String(index + 1).padStart(3, '0')}`;
  const courseId = student.class ? mapClassToCourseId(student.class) : 'class-b';
  const status = student.status.toLowerCase() === 'cleared' ? 'completed' : 'active';
  return `('enroll-${userId}', '${userId}', '${courseId}', '${status}', datetime('now'))`;
}).join(',\\n');
sql += enrollmentValues + ';\\n\\n';

// Insert payments
sql += 'INSERT INTO payments (id, user_id, amount, status, payment_method, transaction_ref, due_date, paid_date, proof_url, recorded_by, notes, created_at, updated_at) VALUES\\n';
const paymentValues = students.map((student, index) => {
  const userId = `student-${String(index + 1).padStart(3, '0')}`;
  const amount = student.totalPaid * 100; // Convert to cents
  const notes = `Imported from handwritten records. Class: ${student.class || 'N/A'}`;
  return `('payment-${userId}', '${userId}', ${amount}, 'paid', 'cash', NULL, datetime('now'), datetime('now'), NULL, 'admin', '${notes}', datetime('now'), datetime('now'))`;
}).join(',\\n');
sql += paymentValues + ';\\n\\n';

// Add summary
const totalAmount = students.reduce((sum, s) => sum + s.totalPaid, 0);
sql += `-- SUMMARY:\\n`;
sql += `-- Total Students: ${students.length}\\n`;
sql += `-- Total Payments: KES ${totalAmount.toLocaleString()}\\n`;
sql += `-- Average Payment: KES ${Math.round(totalAmount / students.length).toLocaleString()}\\n`;

// Write to file
fs.writeFileSync('student-data-final.sql', sql);

console.log('✅ Generated student-data-final.sql');
console.log(`📊 Summary:`);
console.log(`   - ${students.length} students`);
console.log(`   - KES ${totalAmount.toLocaleString()} total payments`);
console.log(`   - KES ${Math.round(totalAmount / students.length).toLocaleString()} average payment`);
console.log('\\n🚀 Run: npx wrangler d1 execute DB --file=student-data-final.sql --remote');
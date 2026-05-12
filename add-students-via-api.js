// Simple script to add students via the existing API endpoint
// First 20 students from your handwritten records

const students = [
  { name: "Faith Wambu Matinda", class: "B2", idNumber: "11604", totalPaid: 12000 },
  { name: "Kamau Jane Kamani", class: "B2", idNumber: "12600", totalPaid: 5000 },
  { name: "Grace Mwihaki Kamani", class: "B2", idNumber: "12600", totalPaid: 9750 },
  { name: "Bweyeire Njoka", class: "B2", idNumber: "12600", totalPaid: 6000 },
  { name: "Roseline Wanjiku", class: "B2", idNumber: "12600", totalPaid: 3000 },
  { name: "Veronica Olive Onditi", class: "A", idNumber: "9360", totalPaid: 12100 },
  { name: "Fridah Mutiga", class: "B", idNumber: "12600", totalPaid: 5000 },
  { name: "Esther Wambui", class: "B2", idNumber: "12600", totalPaid: 11500 },
  { name: "Antony Mwangi Cimaini", class: "B½", idNumber: "8700", totalPaid: 2000 },
  { name: "Charles Mwangi Rigiti", class: "B½", idNumber: "", totalPaid: 8750 },
  { name: "Hamisi Platini Kamau", class: "B", idNumber: "12600", totalPaid: 5000 },
  { name: "Oscan Kalu", class: "B", idNumber: "9360", totalPaid: 1000 },
  { name: "Jane Fauzi Wambua", class: "B½", idNumber: "", totalPaid: 6000 },
  { name: "Chrispin Ochieng", class: "B", idNumber: "", totalPaid: 7000 },
  { name: "Christine Wambui", class: "", idNumber: "", totalPaid: 48000 },
  { name: "Jemimah Kamilia", class: "", idNumber: "", totalPaid: 48000 },
  { name: "Catherine Wanjiku", class: "B½", idNumber: "8700", totalPaid: 28600 },
  { name: "Nicholas Kipkoech", class: "B½", idNumber: "", totalPaid: 1300 },
  { name: "Moses Juma Kinyua", class: "D", idNumber: "", totalPaid: 20000 },
  { name: "Teresiah Mwiti David", class: "B2", idNumber: "", totalPaid: 9850 }
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
    'B': 'class-b', 
    'B2': 'class-b',
    'B½': 'class-b-half',
    'D': 'class-d'
  };
  return classMap[className] || 'class-b';
}

console.log('📋 STUDENT DATA TO INSERT:');
console.log('========================');

let totalAmount = 0;
students.forEach((student, index) => {
  const email = generateEmail(student.name);
  const courseId = student.class ? mapClassToCourseId(student.class) : 'class-b';
  
  console.log(`${index + 1}. ${student.name}`);
  console.log(`   Email: ${email}`);
  console.log(`   Class: ${student.class || 'N/A'} (Course: ${courseId})`);
  console.log(`   ID: ${student.idNumber || 'N/A'}`);
  console.log(`   Payment: KES ${student.totalPaid.toLocaleString()}`);
  console.log('');
  
  totalAmount += student.totalPaid;
});

console.log('💰 SUMMARY:');
console.log(`Total Students: ${students.length}`);
console.log(`Total Payments: KES ${totalAmount.toLocaleString()}`);
console.log(`Average Payment: KES ${Math.round(totalAmount / students.length).toLocaleString()}`);

console.log('\n🚀 TO ADD THESE STUDENTS:');
console.log('1. Start your development server: npm run dev');
console.log('2. Login as admin');
console.log('3. Use the admin panel to add students manually');
console.log('4. Or use the API endpoint POST /api/students');

console.log('\n📝 SAMPLE API CALL:');
console.log('POST /api/students');
console.log('Content-Type: application/json');
console.log(JSON.stringify({
  email: generateEmail(students[0].name),
  fullName: students[0].name,
  idNumber: students[0].idNumber,
  courseId: mapClassToCourseId(students[0].class)
}, null, 2));
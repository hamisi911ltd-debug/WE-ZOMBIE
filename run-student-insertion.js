const { execSync } = require('child_process');

try {
  console.log('Installing required dependencies...');
  execSync('npm install bcryptjs drizzle-orm', { stdio: 'inherit' });
  
  console.log('Compiling TypeScript...');
  execSync('npx tsc insert-student-data.ts --target es2020 --module commonjs --lib es2020 --skipLibCheck', { stdio: 'inherit' });
  
  console.log('Running student data insertion...');
  execSync('node insert-student-data.js', { stdio: 'inherit' });
  
} catch (error) {
  console.error('Error running insertion:', error.message);
}
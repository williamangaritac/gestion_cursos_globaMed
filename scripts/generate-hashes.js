const bcrypt = require('bcrypt');

async function generateHashes() {
  const passwords = {
    admin: 'Admin123!',
    instructor: 'Instructor123!',
    student: 'Student123!',
  };

  console.log('Generating bcrypt hashes...\n');

  for (const [role, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`${role}:`);
    console.log(`  Password: ${password}`);
    console.log(`  Hash: ${hash}`);
    console.log('');
  }
}

generateHashes().catch(console.error);


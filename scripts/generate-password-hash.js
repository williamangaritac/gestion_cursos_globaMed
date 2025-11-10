#!/usr/bin/env node

/**
 * Script to generate bcrypt password hashes for seed data
 * Usage: node scripts/generate-password-hash.js [password]
 */

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const passwords = {
  admin: 'Admin123!',
  instructor: 'Instructor123!',
  student: 'Student123!',
};

async function generateHash(password) {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Error generating hash:', error);
    throw error;
  }
}

async function main() {
  const customPassword = process.argv[2];

  if (customPassword) {
    console.log('\n🔐 Generating hash for custom password...\n');
    const hash = await generateHash(customPassword);
    console.log(`Password: ${customPassword}`);
    console.log(`Hash: ${hash}\n`);
  } else {
    console.log('\n🔐 Generating hashes for default passwords...\n');
    console.log('Copy these hashes to database/init.sql:\n');

    for (const [role, password] of Object.entries(passwords)) {
      const hash = await generateHash(password);
      console.log(`${role.toUpperCase()}:`);
      console.log(`  Password: ${password}`);
      console.log(`  Hash: ${hash}\n`);
    }

    console.log('Usage: node scripts/generate-password-hash.js [custom-password]\n');
  }
}

main().catch(console.error);


import bcrypt from 'bcryptjs';

const passwords = [
  { user: 'Super Administrateur', password: 'superadmin123' },
  { user: 'Administrateur', password: 'admin123' }
];

console.log('\n=== Génération des hash bcrypt ===\n');

for (const item of passwords) {
  const hash = await bcrypt.hash(item.password, 10);
  console.log(`${item.user}:`);
  console.log(`  Mot de passe: ${item.password}`);
  console.log(`  Hash: ${hash}\n`);
}

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const initDatabase = async () => {
  let connection;

  try {
    console.log('\n🚀 Initialisation de la base de données...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || 'stock_management',
      multipleStatements: true
    });

    console.log('✓ Connexion au serveur MySQL réussie');

    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await connection.query(schema);

    console.log('✓ Base de données créée');
    console.log('✓ Tables créées avec succès');
    console.log('✓ Catégories par défaut insérées');
    console.log('✓ Utilisateurs de test créés');

    console.log('\n📝 Informations de connexion:\n');
    console.log('Super Administrateur:');
    console.log('  Email: superadmin@military.gov');
    console.log('  Mot de passe: superadmin123\n');
    console.log('Administrateur:');
    console.log('  Email: admin@military.gov');
    console.log('  Mot de passe: admin123\n');

    console.log('✅ Initialisation terminée avec succès!\n');

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'initialisation:', error.message);
    console.error('\nVérifiez que:');
    console.error('  1. MySQL est installé et démarré');
    console.error('  2. Les informations de connexion dans .env sont correctes');
    console.error('  3. Vous avez les permissions nécessaires\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

initDatabase();

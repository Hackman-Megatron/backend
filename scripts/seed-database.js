import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDatabase = async () => {
  let connection;

  try {
    console.log('\n🌱 Chargement des données de test...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'stock_management',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    console.log('✓ Connexion à la base de données réussie');

    const seedPath = path.join(__dirname, '../database/seed-data.sql');
    const seedData = fs.readFileSync(seedPath, 'utf8');

    await connection.query(seedData);

    console.log('✓ Articles insérés');
    console.log('✓ Commandes insérées');
    console.log('✓ Mouvements insérés');
    console.log('✓ Quantités mises à jour');

    const [articles] = await connection.query('SELECT COUNT(*) as count FROM articles');
    const [commandes] = await connection.query('SELECT COUNT(*) as count FROM commandes');
    const [mouvements] = await connection.query('SELECT COUNT(*) as count FROM mouvements');

    console.log('\n📊 Statistiques:');
    console.log(`  Articles: ${articles[0].count}`);
    console.log(`  Commandes: ${commandes[0].count}`);
    console.log(`  Mouvements: ${mouvements[0].count}`);

    console.log('\n✅ Données de test chargées avec succès!\n');

  } catch (error) {
    console.error('\n❌ Erreur lors du chargement des données:', error.message);
    console.error('\nAssurez-vous que la base de données a été initialisée avec "npm run init-db"\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

seedDatabase();

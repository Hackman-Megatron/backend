import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/stats', async (req, res, next) => {
  try {
    const [totalArticles] = await pool.query('SELECT COUNT(*) as count FROM articles');
    const [uniformesTermines] = await pool.query('SELECT COUNT(*) as count FROM articles WHERE type = ?', ['uniforme_fini']);
    const [matieresPremières] = await pool.query('SELECT COUNT(*) as count FROM articles WHERE type = ?', ['matiere_premiere']);
    const [stockFaible] = await pool.query('SELECT COUNT(*) as count FROM articles WHERE quantite < 10 AND type = ?', ['matiere_premiere']);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const [entreesMois] = await pool.query(
      `SELECT COALESCE(SUM(FLOOR(quantite)), 0) as total FROM mouvements
       WHERE (type = 'Entrée Externe' OR type = 'Entrée Interne')
       AND DATE_FORMAT(date, '%Y-%m') = ?`,
      [currentMonth]
    );

    const [sortiesMois] = await pool.query(
      `SELECT COALESCE(SUM(FLOOR(quantite)), 0) as total FROM mouvements
       WHERE (type = 'Sortie Externe' OR type = 'Sortie Interne')
       AND DATE_FORMAT(date, '%Y-%m') = ?`,
      [currentMonth]
    );

    const [mouvementsMois] = await pool.query(
      `SELECT COUNT(*) as count FROM mouvements
       WHERE DATE_FORMAT(date, '%Y-%m') = ?`,
      [currentMonth]
    );

    const [commandesTotales] = await pool.query('SELECT COUNT(*) as count FROM commandes');
    const [commandesEnAttente] = await pool.query('SELECT COUNT(*) as count FROM commandes WHERE statut = ?', ['En attente']);
    const [commandesEnProduction] = await pool.query('SELECT COUNT(*) as count FROM commandes WHERE statut = ?', ['En production']);
    const [sessionsActives] = await pool.query('SELECT COUNT(*) as count FROM sessions WHERE statut = ?', ['active']);

    res.json({
      total_articles: parseInt(totalArticles[0].count),
      uniformes_termines: parseInt(uniformesTermines[0].count),
      matieres_premieres: parseInt(matieresPremières[0].count),
      stock_faible: parseInt(stockFaible[0].count),
      entrees_ce_mois: parseInt(entreesMois[0].total),
      sorties_ce_mois: parseInt(sortiesMois[0].total),
      mouvements_du_mois: parseInt(mouvementsMois[0].count),
      commandes_totales: parseInt(commandesTotales[0].count),
      commandes_en_attente: parseInt(commandesEnAttente[0].count),
      commandes_en_production: parseInt(commandesEnProduction[0].count),
      sessions_actives: parseInt(sessionsActives[0].count)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/charts/:type', async (req, res, next) => {
  try {
    const { type } = req.params;
    const { period } = req.query;

    switch (type) {
      case 'mouvements': {
        const [data] = await pool.query(`
          SELECT
            DAYNAME(date) as name,
            SUM(CASE WHEN type IN ('Entrée Externe', 'Entrée Interne') THEN FLOOR(quantite) ELSE 0 END) as Entrées,
            SUM(CASE WHEN type IN ('Sortie Externe', 'Sortie Interne') THEN FLOOR(quantite) ELSE 0 END) as Sorties
          FROM mouvements
          WHERE date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          GROUP BY DATE(date), DAYNAME(date)
          ORDER BY DATE(date)
        `);
        return res.json(data);
      }

      case 'categories': {
        const [data] = await pool.query(`
          SELECT
            categorie as name,
            SUM(quantite) as value
          FROM articles
          GROUP BY categorie
        `);
        return res.json(data);
      }

      case 'monthly': {
        const [data] = await pool.query(`
          SELECT
            DATE_FORMAT(created_at, '%b') as name,
            COUNT(*) as stock
          FROM articles
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
          GROUP BY YEAR(created_at), MONTH(created_at)
          ORDER BY YEAR(created_at), MONTH(created_at)
        `);
        return res.json(data);
      }

      case 'raw-materials': {
        const [data] = await pool.query(`
          SELECT
            categorie as name,
            SUM(quantite) as quantite
          FROM articles
          WHERE type = 'matiere_premiere'
          GROUP BY categorie
        `);
        return res.json(data);
      }

      default:
        return res.status(400).json({ message: 'Type de graphique invalide' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

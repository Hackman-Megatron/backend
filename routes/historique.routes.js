import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res, next) => {
  try {
    if (req.user.role !== 'Super Administrateur' && req.user.role !== 'Administrateur') {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    const { startDate, endDate, table_concernee, utilisateur_id, type_activite, search } = req.query;
    let query = 'SELECT * FROM historique WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND date_action >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date_action <= DATE_ADD(?, INTERVAL 1 DAY)';
      params.push(endDate);
    }
    if (table_concernee) {
      query += ' AND table_concernee = ?';
      params.push(table_concernee);
    }
    if (utilisateur_id) {
      query += ' AND utilisateur_id = ?';
      params.push(utilisateur_id);
    }
    if (type_activite) {
      query += ' AND type_activite = ?';
      params.push(type_activite);
    }
    if (search) {
      query += ' AND (action LIKE ? OR details LIKE ? OR utilisateur_nom LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY date_action DESC LIMIT 500';

    const [historique] = await pool.query(query, params);
    res.json({
      status: 'success',
      data: historique,
      count: historique.length
    });
  } catch (error) {
    next(error);
  }
});

router.get('/filter', async (req, res, next) => {
  try {
    if (req.user.role !== 'Super Administrateur' && req.user.role !== 'Administrateur') {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    const { categorie } = req.query;
    let query = 'SELECT * FROM historique WHERE 1=1';
    const params = [];

    if (categorie && categorie !== 'tous') {
      query += ' AND type_activite = ?';
      params.push(categorie);
    }

    query += ' ORDER BY date_action DESC LIMIT 500';

    const [historique] = await pool.query(query, params);
    res.json({
      status: 'success',
      data: historique,
      count: historique.length
    });
  } catch (error) {
    next(error);
  }
});

router.get('/periode', async (req, res, next) => {
  try {
    if (req.user.role !== 'Super Administrateur' && req.user.role !== 'Administrateur') {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    const { startDate, endDate, categorie } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Les dates de début et de fin sont requises'
      });
    }

    let query = 'SELECT * FROM historique WHERE date_action >= ? AND date_action <= DATE_ADD(?, INTERVAL 1 DAY)';
    const params = [startDate, endDate];

    if (categorie && categorie !== 'tous') {
      query += ' AND type_activite = ?';
      params.push(categorie);
    }

    query += ' ORDER BY date_action DESC';

    const [historique] = await pool.query(query, params);
    res.json({
      status: 'success',
      data: historique,
      count: historique.length
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { action, type_activite, table_concernee, record_id, details, montant } = req.body;

    const [result] = await pool.query(
      `INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, details, montant)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        action,
        type_activite || 'autre',
        table_concernee,
        record_id,
        req.user.id,
        req.user.nom_complet,
        req.user.role,
        details,
        montant || null
      ]
    );

    res.status(201).json({
      status: 'success',
      message: 'Transaction enregistrée dans l\'historique',
      id: result.insertId
    });
  } catch (error) {
    next(error);
  }
});

export default router;

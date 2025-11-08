import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res, next) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY nom');
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);

    if (categories.length === 0) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    res.json(categories[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/',
  [
    body('nom').notEmpty().withMessage('Nom requis'),
    body('description').optional()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { nom, description } = req.body;

      const [result] = await pool.query(
        'INSERT INTO categories (nom, description) VALUES (?, ?)',
        [nom, description || null]
      );

      res.status(201).json({
        message: 'Catégorie créée avec succès',
        id: result.insertId
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  [
    body('nom').optional().notEmpty(),
    body('description').optional()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updates = [];
      const params = [];

      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          updates.push(`${key} = ?`);
          params.push(req.body[key]);
        }
      });

      params.push(req.params.id);

      await pool.query(
        `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      res.json({ message: 'Catégorie mise à jour avec succès' });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    next(error);
  }
});

export default router;

import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireRole('Super Administrateur'), async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT id, nom_complet, email, role, telephone, institution, statut, date_creation FROM users ORDER BY date_creation DESC');
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nom_complet, email, role, telephone, institution, statut, date_creation FROM users WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(users[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/',
  requireRole('Super Administrateur'),
  [
    body('nom_complet').notEmpty().withMessage('Nom complet requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('role').isIn(['Administrateur', 'Super Administrateur']).withMessage('Rôle invalide')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { nom_complet, email, password, role, telephone, institution } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await pool.query(
        `INSERT INTO users (nom_complet, email, password, role, telephone, institution, statut)
         VALUES (?, ?, ?, ?, ?, ?, 'Actif')`,
        [nom_complet, email, hashedPassword, role, telephone || null, institution || null]
      );

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        id: result.insertId
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  [
    body('nom_complet').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('role').optional().isIn(['Administrateur', 'Super Administrateur']),
    body('statut').optional().isIn(['Actif', 'Désactivé'])
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updates = [];
      const params = [];

      for (const [key, value] of Object.entries(req.body)) {
        if (value !== undefined) {
          if (key === 'password') {
            updates.push('password = ?');
            params.push(await bcrypt.hash(value, 10));
          } else {
            updates.push(`${key} = ?`);
            params.push(value);
          }
        }
      }

      params.push(req.params.id);

      await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      res.json({ message: 'Utilisateur mis à jour avec succès' });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', requireRole('Super Administrateur'), async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    next(error);
  }
});

export default router;

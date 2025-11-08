import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { sessionService } from '../services/sessionService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe requis')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const [users] = await pool.query(
        'SELECT * FROM users WHERE email = ? AND statut = ?',
        [email, 'Actif']
      );

      if (users.length === 0) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      );

      const refreshToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );

      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      await sessionService.createSession(user.id, token, refreshToken, ipAddress, userAgent);

      await pool.query(
        `INSERT INTO historique (action, table_concernee, utilisateur_id, utilisateur_nom, details)
         VALUES (?, ?, ?, ?, ?)`,
        ['Connexion', 'sessions', user.id, user.nom_complet, `Connexion depuis ${ipAddress}`]
      );

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Connexion réussie',
        token,
        refreshToken,
        user: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/register',
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

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token manquant' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ message: 'Refresh token invalide ou expiré' });
    }

    const session = await sessionService.getSessionByRefreshToken(refreshToken);

    if (!session) {
      return res.status(403).json({ message: 'Session invalide' });
    }

    if (session.user_statut !== 'Actif') {
      await sessionService.endSession(refreshToken, 'logout');
      return res.status(403).json({ message: 'Utilisateur désactivé' });
    }

    const newToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        role: session.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const newRefreshToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    await sessionService.updateTokens(refreshToken, newToken, newRefreshToken);

    const [users] = await pool.query(
      'SELECT id, nom_complet, email, role, telephone, institution, statut, date_creation FROM users WHERE id = ?',
      [decoded.id]
    );

    res.json({
      message: 'Token renouvelé avec succès',
      token: newToken,
      refreshToken: newRefreshToken,
      user: users[0]
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authenticateToken, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await sessionService.endSession(refreshToken, 'logout');

      await pool.query(
        `INSERT INTO historique (action, table_concernee, utilisateur_id, utilisateur_nom, details)
         VALUES (?, ?, ?, ?, ?)`,
        ['Déconnexion', 'sessions', req.user.id, req.user.nom_complet, 'Déconnexion manuelle']
      );
    }

    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    next(error);
  }
});

router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nom_complet, email, role, telephone, institution, statut, date_creation FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      valid: true,
      user: users[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/sessions', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'Super Administrateur') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const sessions = await sessionService.getActiveSessions();
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

router.post('/sessions/end/:sessionId', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'Super Administrateur') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { sessionId } = req.params;

    const [sessions] = await pool.query('SELECT token FROM sessions WHERE id = ?', [sessionId]);
    if (sessions.length > 0) {
      await sessionService.endSession(sessions[0].token, 'logout');
    }

    res.json({ message: 'Session terminée' });
  } catch (error) {
    next(error);
  }
});

export default router;

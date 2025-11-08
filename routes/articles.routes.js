import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res, next) => {
  try {
    const { type, categorie, institution, statut, search, page = 1, limit = 50, quantite_min } = req.query;
    let query = 'SELECT id, nom, categorie, institution, quantite, quantification, statut, type, created_at, updated_at FROM articles WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (categorie) {
      query += ' AND categorie = ?';
      params.push(categorie);
    }
    if (institution) {
      query += ' AND institution = ?';
      params.push(institution);
    }
    if (statut) {
      query += ' AND statut = ?';
      params.push(statut);
    }
    if (quantite_min) {
      query += ' AND quantite >= ?';
      params.push(parseInt(quantite_min));
    }
    if (search) {
      query += ' AND (nom LIKE ? OR categorie LIKE ? OR institution LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [articles] = await pool.query(query, params);

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM articles WHERE 1=1' +
      (type ? ' AND type = ?' : '') +
      (categorie ? ' AND categorie = ?' : '') +
      (institution ? ' AND institution = ?' : '') +
      (statut ? ' AND statut = ?' : '') +
      (quantite_min ? ' AND quantite >= ?' : '') +
      (search ? ' AND (nom LIKE ? OR categorie LIKE ? OR institution LIKE ?)' : ''),
      params.slice(0, -2)
    );

    res.json({
      data: articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [articles] = await pool.query('SELECT id, nom, categorie, institution, quantite, quantification, statut, type, created_at, updated_at FROM articles WHERE id = ?', [req.params.id]);

    if (articles.length === 0) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    res.json(articles[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/',
  [
    body('nom').notEmpty().trim().withMessage('Nom requis'),
    body('categorie').notEmpty().trim().withMessage('Catégorie requise'),
    body('institution').optional().trim(),
    body('quantite').isFloat({ min: 0 }).withMessage('Quantité invalide (doit être un nombre positif)'),
    body('quantification').notEmpty().trim().withMessage('Quantification requise'),
    body('type').isIn(['matiere_premiere', 'uniforme_fini']).withMessage('Type invalide'),
    body('seuil_alerte').optional().isFloat({ min: 0 }).withMessage('Seuil d\'alerte invalide')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { nom, categorie, institution, quantite, quantification, type, seuil_alerte } = req.body;

      const [existing] = await pool.query(
        'SELECT id FROM articles WHERE nom = ? AND (institution = ? OR (institution IS NULL AND ? IS NULL)) AND type = ?',
        [nom, institution, institution, type]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          message: 'Un article avec ce nom existe déjà pour cette institution'
        });
      }

      const statut = quantite < 10 ? 'Faible' : 'Normal';

      const [result] = await pool.query(
        `INSERT INTO articles (nom, categorie, institution, quantite, quantification, statut, type)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nom, categorie, institution || null, quantite, quantification, statut, type]
      );

      // Enregistrer dans l'historique
      await pool.query(
        `INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, details)
         VALUES (?, 'article', 'articles', ?, ?, ?, ?, ?)`,
        [
          `Création d'article: ${nom}`,
          result.insertId,
          req.user.id,
          req.user.nom_complet,
          req.user.role,
          `Article ${nom} créé - Catégorie: ${categorie}, Institution: ${institution}, Quantité: ${quantite}`
        ]
      );

      res.status(201).json({
        message: 'Article créé avec succès',
        id: result.insertId
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Cet article existe déjà' });
      }
      next(error);
    }
  }
);

router.put('/:id',
  [
    body('nom').optional().trim().notEmpty(),
    body('categorie').optional().trim().notEmpty(),
    body('quantite').optional().isFloat({ min: 0 }),
    body('quantification').optional().trim().notEmpty(),
    body('type').optional().isIn(['matiere_premiere', 'uniforme_fini']),
    body('seuil_alerte').optional().isFloat({ min: 0 })
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [article] = await pool.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
      if (article.length === 0) {
        return res.status(404).json({ message: 'Article non trouvé' });
      }

      const oldArticle = article[0];
      const updates = [];
      const params = [];
      const allowedFields = ['nom', 'categorie', 'institution', 'quantite', 'quantification', 'statut', 'type'];

      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined && allowedFields.includes(key)) {
          updates.push(`${key} = ?`);
          params.push(req.body[key]);
        }
      });

      if (req.body.quantite !== undefined) {
        const statut = req.body.quantite < 10 ? 'Faible' : 'Normal';
        if (!updates.includes('statut = ?')) {
          updates.push('statut = ?');
          params.push(statut);
        }
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: 'Aucune modification à apporter' });
      }

      params.push(req.params.id);

      await pool.query(
        `UPDATE articles SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
        params
      );

      // Enregistrer dans l'historique
      const modifications = Object.keys(req.body).filter(key => allowedFields.includes(key))
        .map(key => `${key}: ${oldArticle[key]} → ${req.body[key]}`)
        .join(', ');

      await pool.query(
        `INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, details)
         VALUES (?, 'article', 'articles', ?, ?, ?, ?, ?)`,
        [
          `Modification d'article: ${oldArticle.nom}`,
          req.params.id,
          req.user.id,
          req.user.nom_complet,
          req.user.role,
          `Modifications: ${modifications}`
        ]
      );

      res.json({ message: 'Article mis à jour avec succès' });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', async (req, res, next) => {
  try {
    const [article] = await pool.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
    if (article.length === 0) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    const articleToDelete = article[0];

    await pool.query('DELETE FROM articles WHERE id = ?', [req.params.id]);

    // Enregistrer dans l'historique
    await pool.query(
      `INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, details)
       VALUES (?, 'article', 'articles', ?, ?, ?, ?, ?)`,
      [
        `Suppression d'article: ${articleToDelete.nom}`,
        req.params.id,
        req.user.id,
        req.user.nom_complet,
        req.user.role,
        `Article supprimé - Nom: ${articleToDelete.nom}, Catégorie: ${articleToDelete.categorie}, Institution: ${articleToDelete.institution}`
      ]
    );

    res.json({ message: 'Article supprimé avec succès' });
  } catch (error) {
    next(error);
  }
});

export default router;

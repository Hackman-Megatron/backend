import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM fournisseurs ORDER BY date_creation DESC'
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching fournisseurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des fournisseurs'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM fournisseurs WHERE id = ?',
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }

    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error fetching fournisseur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du fournisseur'
    });
  }
});

router.post('/', requireRole('Administrateur', 'Super Administrateur'), async (req, res) => {
  try {
    const { nom, email, telephone, adresse } = req.body;

    if (!nom) {
      return res.status(400).json({
        success: false,
        message: 'Le nom est requis'
      });
    }

    if (!telephone) {
      return res.status(400).json({
        success: false,
        message: 'Le téléphone est requis'
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email invalide'
      });
    }

    const existingFournisseur = await query(
      'SELECT id FROM fournisseurs WHERE telephone = ?',
      [telephone]
    );

    if (existingFournisseur.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Un fournisseur avec ce numéro de téléphone existe déjà'
      });
    }

    const result = await query(
      'INSERT INTO fournisseurs (nom, email, telephone, adresse) VALUES (?, ?, ?, ?)',
      [nom, email || null, telephone, adresse || null]
    );

    const newFournisseur = await query(
      'SELECT * FROM fournisseurs WHERE id = ?',
      [result.insertId]
    );

    await query(
      'INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        `Création de fournisseur: ${nom}`,
        'fournisseur',
        'fournisseurs',
        result.insertId,
        req.user.id,
        req.user.nom_complet,
        req.user.role,
        `Fournisseur ${nom} créé - Téléphone: ${telephone}, Email: ${email || 'N/A'}`
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Fournisseur créé avec succès',
      data: newFournisseur[0]
    });
  } catch (error) {
    console.error('Error creating fournisseur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du fournisseur'
    });
  }
});

// CORRECTION: Utiliser requireRole avec arguments séparés, pas un tableau
router.put('/:id', requireRole('Administrateur', 'Super Administrateur'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, email, telephone, adresse } = req.body;

    if (!nom) {
      return res.status(400).json({
        success: false,
        message: 'Le nom est requis'
      });
    }

    if (!telephone) {
      return res.status(400).json({
        success: false,
        message: 'Le téléphone est requis'
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email invalide'
      });
    }

    const existingFournisseur = await query(
      'SELECT id FROM fournisseurs WHERE id = ?',
      [id]
    );

    if (existingFournisseur.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }

    const telephoneCheck = await query(
      'SELECT id FROM fournisseurs WHERE telephone = ? AND id != ?',
      [telephone, id]
    );

    if (telephoneCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Un autre fournisseur utilise déjà ce numéro de téléphone'
      });
    }

    await query(
      'UPDATE fournisseurs SET nom = ?, email = ?, telephone = ?, adresse = ? WHERE id = ?',
      [nom, email || null, telephone, adresse || null, id]
    );

    const updatedFournisseur = await query(
      'SELECT * FROM fournisseurs WHERE id = ?',
      [id]
    );

    await query(
      'INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        `Modification de fournisseur: ${nom}`,
        'fournisseur',
        'fournisseurs',
        id,
        req.user.id,
        req.user.nom_complet,
        req.user.role,
        `Fournisseur ${nom} modifié - Téléphone: ${telephone}, Email: ${email || 'N/A'}`
      ]
    );

    res.json({
      success: true,
      message: 'Fournisseur mis à jour avec succès',
      data: updatedFournisseur[0]
    });
  } catch (error) {
    console.error('Error updating fournisseur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du fournisseur'
    });
  }
});

// CORRECTION: Utiliser requireRole avec un seul argument pour Super Administrateur
router.delete('/:id', requireRole('Super Administrateur'), async (req, res) => {
  try {
    const { id } = req.params;

    const existingFournisseur = await query(
      'SELECT * FROM fournisseurs WHERE id = ?',
      [id]
    );

    if (existingFournisseur.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }

    await query('DELETE FROM fournisseurs WHERE id = ?', [id]);

    await query(
      'INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        `Suppression de fournisseur: ${existingFournisseur[0].nom}`,
        'fournisseur',
        'fournisseurs',
        id,
        req.user.id,
        req.user.nom_complet,
        req.user.role,
        `Fournisseur supprimé - Nom: ${existingFournisseur[0].nom}, Téléphone: ${existingFournisseur[0].telephone}`
      ]
    );

    res.json({
      success: true,
      message: 'Fournisseur supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting fournisseur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du fournisseur'
    });
  }
});

export default router;
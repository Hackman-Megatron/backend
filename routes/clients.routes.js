import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM clients ORDER BY date_creation DESC'
    );
    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des clients'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM clients WHERE id = ?',
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    res.json({ data: result[0] });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du client'
    });
  }
});

router.post('/', requireRole('Administrateur', 'Super Administrateur'), async (req, res) => {
  try {
    const { nom, telephone } = req.body;

    if (!nom || !telephone) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le téléphone sont requis'
      });
    }

    const existingClient = await query(
      'SELECT id FROM clients WHERE telephone = ?',
      [telephone]
    );

    if (existingClient.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Un client avec ce numéro de téléphone existe déjà'
      });
    }

    const result = await query(
      'INSERT INTO clients (nom, telephone) VALUES (?, ?)',
      [nom, telephone]
    );

    const newClient = await query(
      'SELECT * FROM clients WHERE id = ?',
      [result.insertId]
    );

    await query(
      'INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        `Création de client: ${nom}`,
        'client',
        'clients',
        result.insertId,
        req.user.id,
        req.user.nom_complet,
        req.user.role,
        `Client ${nom} créé - Téléphone: ${telephone}`
      ]
    );

    res.status(201).json({
      data: newClient[0]
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du client'
    });
  }
});

// CORRECTION: Retirer les crochets [] - utiliser arguments séparés
router.put('/:id', requireRole('Administrateur', 'Super Administrateur'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, telephone } = req.body;

    if (!nom || !telephone) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le téléphone sont requis'
      });
    }

    const existingClient = await query(
      'SELECT id FROM clients WHERE id = ?',
      [id]
    );

    if (existingClient.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    const telephoneCheck = await query(
      'SELECT id FROM clients WHERE telephone = ? AND id != ?',
      [telephone, id]
    );

    if (telephoneCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Un autre client utilise déjà ce numéro de téléphone'
      });
    }

    await query(
      'UPDATE clients SET nom = ?, telephone = ? WHERE id = ?',
      [nom, telephone, id]
    );

    const updatedClient = await query(
      'SELECT * FROM clients WHERE id = ?',
      [id]
    );

    await query(
      'INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        `Modification de client: ${nom}`,
        'client',
        'clients',
        id,
        req.user.id,
        req.user.nom_complet,
        req.user.role,
        `Client ${nom} modifié - Téléphone: ${telephone}`
      ]
    );

    res.json({
      data: updatedClient[0]
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du client'
    });
  }
});

// CORRECTION: Retirer les crochets [] - utiliser un seul argument
router.delete('/:id', requireRole('Super Administrateur'), async (req, res) => {
  try {
    const { id } = req.params;

    const existingClient = await query(
      'SELECT * FROM clients WHERE id = ?',
      [id]
    );

    if (existingClient.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    await query('DELETE FROM clients WHERE id = ?', [id]);

    await query(
      'INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        `Suppression de client: ${existingClient[0].nom}`,
        'client',
        'clients',
        id,
        req.user.id,
        req.user.nom_complet,
        req.user.role,
        `Client supprimé - Nom: ${existingClient[0].nom}, Téléphone: ${existingClient[0].telephone}`
      ]
    );

    res.json({
      message: 'Client supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du client'
    });
  }
});

export default router;
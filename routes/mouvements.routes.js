import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.use(authenticateToken);

// Fonction pour générer une référence chronologique
const generateReference = async (connection, type) => {
  const year = new Date().getFullYear();
  const prefixMap = {
    'Entrée Externe': 'EE',
    'Entrée Interne': 'EI',
    'Sortie Interne': 'SI',
    'Sortie Externe': 'SE'
  };
  const prefix = prefixMap[type] || 'MV';
  
  const [result] = await connection.query(
    `SELECT COUNT(*) as count 
     FROM mouvements 
     WHERE type = ? 
     AND YEAR(date) = ?`,
    [type, year]
  );
  
  const count = result[0].count + 1;
  const paddedCount = String(count).padStart(4, '0');
  
  return `${prefix}-${year}-${paddedCount}`;
};

router.get('/', async (req, res, next) => {
  try {
    const { type, article_id, utilisateur_id, start_date, end_date } = req.query;
    let query = `
      SELECT
        m.*,
        a.nom as article_nom,
        a.quantification,
        u.nom_complet as utilisateur_nom,
        FLOOR(m.quantite) as quantite_entier
      FROM mouvements m
      LEFT JOIN articles a ON m.article_id = a.id
      LEFT JOIN users u ON m.utilisateur_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ' AND m.type = ?';
      params.push(type);
    }
    if (article_id) {
      query += ' AND m.article_id = ?';
      params.push(article_id);
    }
    if (utilisateur_id) {
      query += ' AND m.utilisateur_id = ?';
      params.push(utilisateur_id);
    }
    if (start_date) {
      query += ' AND m.date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND m.date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY m.date DESC';

    const [mouvements] = await pool.query(query, params);
    res.json(mouvements);
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const [stats] = await pool.query(`
      SELECT
        type,
        COUNT(*) as count,
        SUM(FLOOR(quantite)) as total_quantite
      FROM mouvements
      WHERE DATE_FORMAT(date, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
      GROUP BY type
    `);

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [mouvements] = await pool.query(`
      SELECT
        m.*,
        a.nom as article_nom,
        a.quantification,
        u.nom_complet as utilisateur_nom,
        FLOOR(m.quantite) as quantite_entier
      FROM mouvements m
      LEFT JOIN articles a ON m.article_id = a.id
      LEFT JOIN users u ON m.utilisateur_id = u.id
      WHERE m.id = ?
    `, [req.params.id]);

    if (mouvements.length === 0) {
      return res.status(404).json({ message: 'Mouvement non trouvé' });
    }

    res.json(mouvements[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { type, quantite } = req.body;
    
    if (!type || !['Entrée Externe', 'Entrée Interne', 'Sortie Interne', 'Sortie Externe'].includes(type)) {
      return res.status(400).json({ 
        message: 'Type de mouvement invalide',
        errors: [{ field: 'type', message: 'Type invalide' }]
      });
    }
    
    if (!quantite || parseFloat(quantite) <= 0) {
      return res.status(400).json({ 
        message: 'Quantité invalide',
        errors: [{ field: 'quantite', message: 'Quantité doit être supérieure à 0' }]
      });
    }

    console.log('📦 Données reçues:', JSON.stringify(req.body, null, 2));

    await connection.beginTransaction();

    const { 
      fournisseur_id, 
      categorie, 
      article_nom, 
      unite_mesure,
      destination,
      notes,
      article_id,
      commande_id,
      entree_type,
      institution,
      priorite,
      date_livraison_prevue
    } = req.body;
    
    const utilisateur_id = req.user.id;
    let finalArticleId = null;
    let articleName = article_nom;
    let sourceDestination = '';

    const reference = await generateReference(connection, type);

    // ============================================
    // ENTRÉE EXTERNE
    // ============================================
    if (type === 'Entrée Externe') {
      if (!fournisseur_id || !categorie || !article_nom || !unite_mesure) {
        await connection.rollback();
        return res.status(400).json({ 
          message: 'Champs requis manquants pour une entrée externe'
        });
      }

      const [fournisseurs] = await connection.query(
        'SELECT nom FROM fournisseurs WHERE id = ?',
        [fournisseur_id]
      );

      if (fournisseurs.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Fournisseur non trouvé' });
      }

      const fournisseurNom = fournisseurs[0].nom;
      sourceDestination = fournisseurNom;

      const [existingArticles] = await connection.query(
        'SELECT id, quantite FROM articles WHERE nom = ? AND categorie = ? AND type = ? AND institution IS NULL',
        [article_nom, categorie, 'matiere_premiere']
      );

      if (existingArticles.length > 0) {
        const currentQuantite = parseFloat(existingArticles[0].quantite);
        const newQuantite = currentQuantite + parseFloat(quantite);

        await connection.query(
          'UPDATE articles SET quantite = ?, statut = ?, updated_at = NOW() WHERE id = ?',
          [newQuantite, newQuantite < 10 ? 'Faible' : 'Normal', existingArticles[0].id]
        );

        finalArticleId = existingArticles[0].id;
      } else {
        const articleId = uuidv4();
        await connection.query(
          `INSERT INTO articles (id, nom, categorie, institution, quantite, quantification, statut, type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            articleId,
            article_nom,
            categorie,
            null,
            quantite,
            unite_mesure,
            parseFloat(quantite) < 10 ? 'Faible' : 'Normal',
            'matiere_premiere'
          ]
        );

        finalArticleId = articleId;
      }

      const notesComplet = `Fournisseur: ${fournisseurNom} | Catégorie: ${categorie}${notes ? ` | ${notes}` : ''}`;
      
      const [mouvementResult] = await connection.query(
        `INSERT INTO mouvements (type, article_id, quantite, source_destination, reference, notes, utilisateur_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [type, finalArticleId, parseFloat(quantite), sourceDestination, reference, notesComplet, utilisateur_id]
      );

      await connection.query(
        `INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, details)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          `Mouvement de stock: ${type}`,
          'mouvement',
          'mouvements',
          mouvementResult.insertId,
          utilisateur_id,
          req.user.nom_complet,
          `${type} (Réf: ${reference}) de ${quantite} ${unite_mesure} pour ${article_nom} (${categorie}) - Source: ${fournisseurNom}`
        ]
      );

      await connection.commit();

      return res.status(201).json({
        message: 'Entrée externe enregistrée avec succès',
        id: mouvementResult.insertId,
        reference: reference
      });
    }

    // ============================================
    // ENTRÉE INTERNE
    // ============================================
    if (type === 'Entrée Interne') {
      // Entrée sur commande
      if (entree_type === 'commande') {
        if (!commande_id) {
          await connection.rollback();
          return res.status(400).json({ message: 'Commande ID requis' });
        }

        const [commandes] = await connection.query(
          'SELECT * FROM commandes WHERE id = ?',
          [commande_id]
        );

        if (commandes.length === 0) {
          await connection.rollback();
          return res.status(404).json({ message: 'Commande non trouvée' });
        }

        const commande = commandes[0];

        // Créer ou mettre à jour l'article uniforme fini
        const [uniformes] = await connection.query(
          'SELECT id, quantite FROM articles WHERE nom = ? AND institution = ? AND type = "uniforme_fini"',
          [commande.article, commande.institution]
        );

        let uniformeId;

        if (uniformes.length > 0) {
          uniformeId = uniformes[0].id;
          const newQuantite = parseFloat(uniformes[0].quantite) + parseInt(commande.quantite);
          await connection.query(
            'UPDATE articles SET quantite = ?, updated_at = NOW() WHERE id = ?',
            [newQuantite, uniformeId]
          );
        } else {
          uniformeId = uuidv4();
          await connection.query(
            `INSERT INTO articles (id, nom, categorie, institution, quantite, quantification, type, statut)
             VALUES (?, ?, 'Uniformes', ?, ?, 'Pièce', 'uniforme_fini', 'Normal')`,
            [uniformeId, commande.article, commande.institution, commande.quantite]
          );
        }

        // Changer le statut de la commande en "Terminée"
        await connection.query(
          'UPDATE commandes SET statut = "Terminée", updated_at = NOW() WHERE id = ?',
          [commande_id]
        );

        sourceDestination = `Production terminée - ${commande.institution}`;
        const notesComplet = `Commande ${commande.numero} terminée${notes ? ` | ${notes}` : ''}`;

        const [mouvementResult] = await connection.query(
          `INSERT INTO mouvements (type, article_id, quantite, source_destination, reference, notes, utilisateur_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [type, uniformeId, commande.quantite, sourceDestination, reference, notesComplet, utilisateur_id]
        );

        await connection.query(
          `INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, details)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `Mouvement de stock: ${type}`,
            'mouvement',
            'mouvements',
            mouvementResult.insertId,
            utilisateur_id,
            req.user.nom_complet,
            `${type} (Réf: ${reference}) - Commande ${commande.numero} terminée: ${commande.quantite} ${commande.article} pour ${commande.institution}`
          ]
        );

        await connection.commit();

        return res.status(201).json({
          message: 'Entrée interne sur commande enregistrée avec succès',
          id: mouvementResult.insertId,
          reference: reference
        });
      }

      // Entrée hors commande
      if (entree_type === 'hors_commande') {
        if (!institution || !article_nom || !quantite) {
          await connection.rollback();
          return res.status(400).json({ message: 'Champs requis manquants' });
        }

        // Créer ou mettre à jour l'article uniforme fini
        const [uniformes] = await connection.query(
          'SELECT id, quantite FROM articles WHERE nom = ? AND institution = ? AND type = "uniforme_fini"',
          [article_nom, institution]
        );

        let uniformeId;

        if (uniformes.length > 0) {
          uniformeId = uniformes[0].id;
          const newQuantite = parseFloat(uniformes[0].quantite) + parseInt(quantite);
          await connection.query(
            'UPDATE articles SET quantite = ?, updated_at = NOW() WHERE id = ?',
            [newQuantite, uniformeId]
          );
        } else {
          uniformeId = uuidv4();
          await connection.query(
            `INSERT INTO articles (id, nom, categorie, institution, quantite, quantification, type, statut)
             VALUES (?, ?, 'Uniformes', ?, ?, 'Pièce', 'uniforme_fini', 'Normal')`,
            [uniformeId, article_nom, institution, quantite]
          );
        }

        sourceDestination = `Production anticipée - ${institution}`;
        const notesComplet = `Production hors commande - Priorité: ${priorite || 'Normale'}${notes ? ` | ${notes}` : ''}`;

        const [mouvementResult] = await connection.query(
          `INSERT INTO mouvements (type, article_id, quantite, source_destination, reference, notes, utilisateur_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [type, uniformeId, quantite, sourceDestination, reference, notesComplet, utilisateur_id]
        );

        await connection.query(
          `INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, details)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `Mouvement de stock: ${type}`,
            'mouvement',
            'mouvements',
            mouvementResult.insertId,
            utilisateur_id,
            req.user.nom_complet,
            `${type} (Réf: ${reference}) - Production anticipée: ${quantite} ${article_nom} pour ${institution}`
          ]
        );

        await connection.commit();

        return res.status(201).json({
          message: 'Entrée interne hors commande enregistrée avec succès',
          id: mouvementResult.insertId,
          reference: reference
        });
      }
    }

    // ============================================
    // SORTIE INTERNE
    // ============================================
    if (type === 'Sortie Interne') {
      if (!article_nom || !categorie || !destination) {
        await connection.rollback();
        return res.status(400).json({ 
          message: 'Champs requis manquants pour une sortie interne'
        });
      }

      sourceDestination = destination;

      const [articles] = await connection.query(
        'SELECT id, quantite, quantification, nom FROM articles WHERE nom = ? AND categorie = ? AND type = ? AND institution IS NULL',
        [article_nom, categorie, 'matiere_premiere']
      );

      if (articles.length === 0) {
        await connection.rollback();
        return res.status(404).json({ 
          message: 'Article non trouvé en stock. Impossible d\'effectuer une sortie interne.' 
        });
      }

      const article = articles[0];
      const currentQuantite = parseFloat(article.quantite);
      const sortieQuantite = parseFloat(quantite);

      if (currentQuantite < sortieQuantite) {
        await connection.rollback();
        return res.status(400).json({
          message: `Quantité insuffisante en stock. Disponible: ${currentQuantite} ${article.quantification}`
        });
      }

      const newQuantite = currentQuantite - sortieQuantite;
      
      await connection.query(
        'UPDATE articles SET quantite = ?, statut = ?, updated_at = NOW() WHERE id = ?',
        [newQuantite, newQuantite < 10 ? 'Faible' : 'Normal', article.id]
      );

      finalArticleId = article.id;
      articleName = article.nom;

      const notesComplet = notes ? `Destination: ${destination} | ${notes}` : `Destination: ${destination}`;
      
      const [mouvementResult] = await connection.query(
        `INSERT INTO mouvements (type, article_id, quantite, source_destination, reference, notes, utilisateur_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [type, finalArticleId, sortieQuantite, sourceDestination, reference, notesComplet, utilisateur_id]
      );

      await connection.query(
        `INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, details)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          `Mouvement de stock: ${type}`,
          'mouvement',
          'mouvements',
          mouvementResult.insertId,
          utilisateur_id,
          req.user.nom_complet,
          `${type} (Réf: ${reference}) de ${sortieQuantite} ${article.quantification} pour ${articleName} - Destination: ${destination}`
        ]
      );

      await connection.commit();

      return res.status(201).json({
        message: 'Sortie interne enregistrée avec succès',
        id: mouvementResult.insertId,
        reference: reference
      });
    }

    // ============================================
    // SORTIE EXTERNE
    // ============================================
    if (type === 'Sortie Externe') {
      if (!commande_id) {
        await connection.rollback();
        return res.status(400).json({ message: 'Commande ID requis' });
      }

      const [commandes] = await connection.query(
        'SELECT * FROM commandes WHERE id = ?',
        [commande_id]
      );

      if (commandes.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Commande non trouvée' });
      }

      const commande = commandes[0];

      if (commande.statut !== 'Terminée') {
        await connection.rollback();
        return res.status(400).json({ 
          message: 'La commande doit être terminée avant de pouvoir être livrée' 
        });
      }

      // Vérifier le stock d'uniformes finis
      const [uniformes] = await connection.query(
        'SELECT id, quantite FROM articles WHERE nom = ? AND institution = ? AND type = "uniforme_fini"',
        [commande.article, commande.institution]
      );

      if (uniformes.length === 0) {
        await connection.rollback();
        return res.status(404).json({ 
          message: 'Article uniforme non trouvé en stock' 
        });
      }

      const uniforme = uniformes[0];
      const currentQuantite = parseFloat(uniforme.quantite);
      const sortieQuantite = parseInt(commande.quantite);

      if (currentQuantite < sortieQuantite) {
        await connection.rollback();
        return res.status(400).json({ 
          message: `Quantité insuffisante en stock. Disponible: ${currentQuantite} unités` 
        });
      }

      // Déduire du stock
      const newQuantite = currentQuantite - sortieQuantite;
      await connection.query(
        'UPDATE articles SET quantite = ?, updated_at = NOW() WHERE id = ?',
        [newQuantite, uniforme.id]
      );

      // Changer le statut de la commande en "Livrée"
      await connection.query(
        'UPDATE commandes SET statut = "Livrée", updated_at = NOW() WHERE id = ?',
        [commande_id]
      );

      sourceDestination = `Livraison commande - ${commande.institution}`;
      const notesComplet = `Commande ${commande.numero} livrée | Article: ${commande.article}${notes ? ` | ${notes}` : ''}`;

      const [mouvementResult] = await connection.query(
        `INSERT INTO mouvements (type, article_id, quantite, source_destination, reference, notes, utilisateur_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [type, uniforme.id, sortieQuantite, sourceDestination, reference, notesComplet, utilisateur_id]
      );

      await connection.query(
        `INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, details)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          `Mouvement de stock: ${type}`,
          'mouvement',
          'mouvements',
          mouvementResult.insertId,
          utilisateur_id,
          req.user.nom_complet,
          `${type} (Réf: ${reference}) - Commande ${commande.numero} livrée: ${sortieQuantite} ${commande.article} pour ${commande.institution}`
        ]
      );

      await connection.commit();

      return res.status(201).json({
        message: 'Sortie externe enregistrée avec succès',
        id: mouvementResult.insertId,
        reference: reference
      });
    }

    await connection.rollback();
    return res.status(400).json({ message: 'Type de mouvement non supporté' });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Erreur:', error);
    next(error);
  } finally {
    connection.release();
  }
});

router.delete('/:id', async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [mouvements] = await connection.query(
      'SELECT m.*, a.nom as article_nom, a.quantification FROM mouvements m LEFT JOIN articles a ON m.article_id = a.id WHERE m.id = ?',
      [req.params.id]
    );

    if (mouvements.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Mouvement non trouvé' });
    }

    const mouvement = mouvements[0];

    // Annuler l'impact sur le stock si l'article existe
    if (mouvement.article_id) {
      const [articles] = await connection.query(
        'SELECT quantite FROM articles WHERE id = ?',
        [mouvement.article_id]
      );

      if (articles.length > 0) {
        let currentQuantite = parseFloat(articles[0].quantite);
        
        // Inverser l'opération
        if (mouvement.type.includes('Entrée')) {
          currentQuantite -= parseFloat(mouvement.quantite);
        } else if (mouvement.type.includes('Sortie')) {
          currentQuantite += parseFloat(mouvement.quantite);
        }

        await connection.query(
          'UPDATE articles SET quantite = ?, statut = ? WHERE id = ?',
          [Math.max(0, currentQuantite), currentQuantite < 10 ? 'Faible' : 'Normal', mouvement.article_id]
        );
      }
    }

    await connection.query('DELETE FROM mouvements WHERE id = ?', [req.params.id]);

    await connection.query(
      `INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'Suppression de mouvement',
        'mouvement',
        'mouvements',
        req.params.id,
        req.user.id,
        req.user.nom_complet,
        `Suppression: ${mouvement.type} (Réf: ${mouvement.reference}) de ${mouvement.quantite} ${mouvement.quantification || 'unités'} pour ${mouvement.article_nom}`
      ]
    );

    await connection.commit();

    res.json({ message: 'Mouvement supprimé avec succès' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

export default router;
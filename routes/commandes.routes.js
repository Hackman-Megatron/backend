import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Route pour obtenir les statistiques des commandes
router.get('/stats', async (req, res, next) => {
  try {
    // Total des commandes
    const [totalResult] = await pool.query(
      'SELECT COUNT(*) as total FROM commandes'
    );

    // Commandes par statut
    const [statutResult] = await pool.query(
      'SELECT statut, COUNT(*) as count FROM commandes GROUP BY statut'
    );

    // Nombre de commandes livrées
    const [nbLivreesResult] = await pool.query(
      'SELECT COUNT(*) as total FROM commandes WHERE statut = "Livrée"'
    );

    // Nombre de commandes terminées
    const [nbTermineesResult] = await pool.query(
      'SELECT COUNT(*) as total FROM commandes WHERE statut = "Terminée"'
    );

    // Commandes par institution
    const [institutionResult] = await pool.query(
      'SELECT institution, COUNT(*) as count FROM commandes GROUP BY institution'
    );

    // Commandes par priorité
    const [prioriteResult] = await pool.query(
      'SELECT priorite, COUNT(*) as count FROM commandes GROUP BY priorite'
    );

    // Dernières commandes (5 dernières) avec les noms des clients
    const [dernieresCommandes] = await pool.query(
      `SELECT c.*, cl.nom as client_nom, cl.telephone as client_telephone
       FROM commandes c
       LEFT JOIN clients cl ON c.client_id = cl.id
       ORDER BY c.date_commande DESC 
       LIMIT 5`
    );

    res.json({
      data: {
        total_commandes: totalResult[0].total,
        par_statut: statutResult,
        nombre_livrees: nbLivreesResult[0].total || 0,
        nombre_terminees: nbTermineesResult[0].total || 0,
        par_institution: institutionResult,
        par_priorite: prioriteResult,
        dernieres_commandes: dernieresCommandes
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir toutes les commandes avec filtres
router.get('/', async (req, res, next) => {
  try {
    const { 
      statut, 
      institution, 
      priorite, 
      search, 
      date_commande_debut, 
      date_commande_fin, 
      date_livraison_debut,
      date_livraison_fin,
      page = 1, 
      limit = 20 
    } = req.query;
    
    console.log('📥 Paramètres reçus:', { 
      statut, 
      institution, 
      priorite, 
      search, 
      date_commande_debut, 
      date_commande_fin,
      date_livraison_debut,
      date_livraison_fin,
      page, 
      limit 
    });
    
    let query = `
      SELECT c.*,
             cl.nom as client_nom,
             cl.telephone as client_telephone
      FROM commandes c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE 1=1
    `;
    const params = [];

    // Filtres standards
    if (statut) {
      query += ' AND c.statut = ?';
      params.push(statut);
      console.log('✅ Filtre statut:', statut);
    }
    if (institution) {
      query += ' AND c.institution = ?';
      params.push(institution);
      console.log('✅ Filtre institution:', institution);
    }
    if (priorite) {
      query += ' AND c.priorite = ?';
      params.push(priorite);
      console.log('✅ Filtre priorité:', priorite);
    }
    if (search) {
      query += ' AND (c.numero LIKE ? OR c.article LIKE ? OR cl.nom LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      console.log('✅ Filtre recherche:', search);
    }
    
    // ==========================================
    // FILTRAGE PAR DATES DE COMMANDE
    // ==========================================
    if (date_commande_debut) {
      const dateDebutFormatted = date_commande_debut.includes('T') 
        ? date_commande_debut.split('T')[0] 
        : date_commande_debut;
      query += ' AND DATE(c.date_commande) >= ?';
      params.push(dateDebutFormatted);
      console.log('📅 Filtrage date_commande >= ', dateDebutFormatted);
    }
    
    if (date_commande_fin) {
      const dateFinFormatted = date_commande_fin.includes('T') 
        ? date_commande_fin.split('T')[0] 
        : date_commande_fin;
      query += ' AND DATE(c.date_commande) <= ?';
      params.push(dateFinFormatted);
      console.log('📅 Filtrage date_commande <= ', dateFinFormatted);
    }

    // ==========================================
    // FILTRAGE PAR DATES DE LIVRAISON PRÉVUE
    // ==========================================
    if (date_livraison_debut) {
      const dateLivraisonDebutFormatted = date_livraison_debut.includes('T') 
        ? date_livraison_debut.split('T')[0] 
        : date_livraison_debut;
      query += ' AND DATE(c.date_livraison_prevue) >= ?';
      params.push(dateLivraisonDebutFormatted);
      console.log('🚚 Filtrage date_livraison_prevue >= ', dateLivraisonDebutFormatted);
    }
    
    if (date_livraison_fin) {
      const dateLivraisonFinFormatted = date_livraison_fin.includes('T') 
        ? date_livraison_fin.split('T')[0] 
        : date_livraison_fin;
      query += ' AND DATE(c.date_livraison_prevue) <= ?';
      params.push(dateLivraisonFinFormatted);
      console.log('🚚 Filtrage date_livraison_prevue <= ', dateLivraisonFinFormatted);
    }

    console.log('🔍 Requête SQL complète:', query);
    console.log('🔍 Paramètres SQL:', params);

    // Compter le total des résultats
    const countQuery = query.replace(
      'SELECT c.*, cl.nom as client_nom, cl.telephone as client_telephone', 
      'SELECT COUNT(DISTINCT c.id) as total'
    );
    
    const [countResult] = await pool.query(countQuery, params);
    const totalItems = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / parseInt(limit));
    const offset = (parseInt(page) - 1) * parseInt(limit);

    console.log('📊 Total de commandes trouvées:', totalItems);
    console.log('📄 Page:', page, '/', totalPages);

    // Ajouter la pagination et le tri
    query += ' ORDER BY c.date_commande DESC, c.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [commandes] = await pool.query(query, params);

    console.log('✅ Commandes récupérées pour cette page:', commandes.length);

    res.json({
      data: commandes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalItems,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des commandes:', error);
    next(error);
  }
});

// Route pour obtenir une commande par ID
router.get('/:id', async (req, res, next) => {
  try {
    const [commandes] = await pool.query(
      `SELECT c.*, 
              cl.nom as client_nom, 
              cl.telephone as client_telephone
       FROM commandes c
       LEFT JOIN clients cl ON c.client_id = cl.id
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (commandes.length === 0) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    res.json({ data: commandes[0] });
  } catch (error) {
    next(error);
  }
});

// Route POST pour créer une commande
router.post('/',
  [
    body('tirer_du_stock').optional().isBoolean().withMessage('tirer_du_stock doit être un booléen'),
    body('uniforme_id').optional(),
    body('institution').notEmpty().trim().withMessage('Institution requise'),
    body('article').notEmpty().trim().withMessage('Article requis'),
    body('quantite').isInt({ min: 1 }).withMessage('Quantité invalide (doit être un entier supérieur ou égal à 1)'),
    body('priorite').isIn(['Basse', 'Normale', 'Haute', 'Urgente']).withMessage('Priorité invalide'),
    body('date_livraison_prevue').notEmpty().withMessage('Date de livraison requise'),
    body('client_id').notEmpty().withMessage('Client requis'),
  ],
  async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('❌ Erreurs de validation:', errors.array());
        return res.status(400).json({ 
          message: 'Erreur de validation',
          errors: errors.array() 
        });
      }

      console.log('📥 Données reçues:', req.body);

      await connection.beginTransaction();

      const {
        tirer_du_stock,
        uniforme_id,
        institution,
        article,
        quantite,
        priorite,
        date_livraison_prevue,
        client_id
      } = req.body;

      // Générer le numéro de commande
      const year = new Date().getFullYear();
      const [countResult] = await connection.query(
        'SELECT COUNT(*) as count FROM commandes WHERE YEAR(date_commande) = ?',
        [year]
      );
      const numero = `CMD-${year}-${String(countResult[0].count + 1).padStart(4, '0')}`;

      if (tirer_du_stock) {
        // Mode tirage du stock - validation supplémentaire
        if (!uniforme_id) {
          await connection.rollback();
          return res.status(400).json({ message: 'Uniforme requis pour le tirage du stock' });
        }

        // Vérifier que l'uniforme existe et a suffisamment de stock
        const [uniforme] = await connection.query(
          'SELECT id, nom, institution, quantite FROM articles WHERE id = ? AND type = "uniforme_fini"',
          [uniforme_id]
        );

        if (uniforme.length === 0) {
          await connection.rollback();
          return res.status(404).json({ message: 'Uniforme non trouvé' });
        }

        if (uniforme[0].quantite < quantite) {
          await connection.rollback();
          return res.status(400).json({
            message: `Stock insuffisant. Disponible: ${uniforme[0].quantite} unités`
          });
        }

        // Créer la commande avec statut "Livrée"
        const insertQuery = `
          INSERT INTO commandes
          (numero, institution, article, quantite, statut, priorite, date_livraison_prevue, client_id, uniforme_id, tirer_du_stock)
          VALUES (?, ?, ?, ?, 'Livrée', ?, ?, ?, ?, ?)
        `;
        const insertParams = [
          numero,
          institution,
          article,
          quantite,
          priorite,
          date_livraison_prevue,
          client_id,
          uniforme_id,
          true
        ];

        const [result] = await connection.query(insertQuery, insertParams);

        // Créer le mouvement de sortie externe immédiatement
        const [mouvementResult] = await connection.query(
          `INSERT INTO mouvements (type, article_id, quantite, source_destination, reference, utilisateur_id, notes)
           VALUES ('Sortie Externe', ?, ?, ?, ?, ?, ?)`,
          [
            uniforme_id,
            quantite,
            `Livraison commande tirée du stock - ${institution}`,
            numero,
            req.user.id,
            `Article: ${article} - Institution: ${institution} - Tirage du stock`
          ]
        );

        // Mettre à jour le stock
        await connection.query(
          'UPDATE articles SET quantite = quantite - ? WHERE id = ?',
          [quantite, uniforme_id]
        );

        // Enregistrer dans l'historique
        await connection.query(
          `INSERT INTO historique
           (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, montant, details)
           VALUES (?, 'commande', 'commandes', ?, ?, ?, ?, ?, ?)`,
         [
           'Création de commande (tirage du stock) - Livrée',
           result.insertId,
           req.user.id,
           req.user.nom_complet,
           req.user.role,
           0,
           JSON.stringify({
             numero,
             institution,
             article,
             quantite,
             client_id,
             uniforme_id,
             tirer_du_stock: true,
             statut: 'Livrée'
           })
         ]
        );

        // Enregistrer le mouvement dans l'historique
        await connection.query(
          `INSERT INTO historique
           (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, montant, details)
           VALUES (?, 'mouvement', 'mouvements', ?, ?, ?, ?, ?, ?)`,
          [
            'Sortie externe automatique - Commande tirée du stock',
            mouvementResult.insertId,
            req.user.id,
            req.user.nom_complet,
            req.user.role,
            0,
            JSON.stringify({
              commande_numero: numero,
              article,
              quantite,
              institution,
              uniforme_id
            })
          ]
        );

        await connection.commit();

        console.log('✅ Commande créée avec succès (tirage du stock):', numero);

        res.status(201).json({
          message: 'Commande créée avec succès (tirage du stock - Livrée)',
          id: result.insertId,
          numero,
          data: {
            id: result.insertId,
            numero,
            statut: 'Livrée'
          }
        });

      } else {
        // Mode normal de création de commande
        const insertQuery = `
          INSERT INTO commandes
          (numero, institution, article, quantite, statut, priorite, date_livraison_prevue, client_id, tirer_du_stock)
          VALUES (?, ?, ?, ?, 'En attente', ?, ?, ?, ?)
        `;
        const insertParams = [
          numero,
          institution,
          article,
          quantite,
          priorite,
          date_livraison_prevue,
          client_id,
          false
        ];

        const [result] = await connection.query(insertQuery, insertParams);

        await connection.query(
          `INSERT INTO historique
           (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, montant, details)
           VALUES (?, 'commande', 'commandes', ?, ?, ?, ?, ?, ?)`,
         [
           'Création de commande',
           result.insertId,
           req.user.id,
           req.user.nom_complet,
           req.user.role,
           0,
           JSON.stringify({
             numero,
             institution,
             article,
             quantite,
             client_id
           })
         ]
        );

        await connection.commit();

        console.log('✅ Commande créée avec succès:', numero);

        res.status(201).json({
          message: 'Commande créée avec succès',
          id: result.insertId,
          numero,
          data: {
            id: result.insertId,
            numero,
            statut: 'En attente'
          }
        });
      }
    } catch (error) {
      await connection.rollback();
      console.error('❌ Erreur lors de la création de commande:', error);
      next(error);
    } finally {
      connection.release();
    }
  }
);

// Route PUT pour mettre à jour une commande
router.put('/:id',
  [
    body('statut').optional().isIn(['En attente', 'En production', 'Livrée', 'Terminée', 'Annulée']),
    body('priorite').optional().isIn(['Basse', 'Normale', 'Haute', 'Urgente']),
    body('quantite').optional().isInt({ min: 1 }),
    body('date_livraison_prevue').optional().isDate(),
    body('client_id').optional().notEmpty().withMessage('Client ID requis'),
    body('institution').optional().notEmpty(),
    body('article').optional().notEmpty()
  ],
  async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation échouée',
          errors: errors.array() 
        });
      }

      await connection.beginTransaction();

      const [commande] = await connection.query('SELECT * FROM commandes WHERE id = ?', [req.params.id]);
      if (commande.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Commande non trouvée' });
      }

      const oldCommande = commande[0];
      const newStatut = req.body.statut;

      // Gestion des mouvements automatiques selon les changements de statut
      if (newStatut && newStatut !== oldCommande.statut) {
        console.log(`🔄 Commande ${oldCommande.numero} change de "${oldCommande.statut}" à "${newStatut}"`);

        // Si on passe à "Terminée", créer une "Entrée Interne"
        if (newStatut === 'Terminée' && oldCommande.statut !== 'Terminée') {
          console.log('📦 Création d\'une Entrée Interne pour commande terminée');

          const [uniformes] = await connection.query(
            'SELECT id, quantite FROM articles WHERE nom = ? AND institution = ? AND type = "uniforme_fini" LIMIT 1',
            [oldCommande.article, oldCommande.institution]
          );

          let uniformeId;

          if (uniformes.length > 0) {
            uniformeId = uniformes[0].id;
            await connection.query(
              'UPDATE articles SET quantite = quantite + ? WHERE id = ?',
              [oldCommande.quantite, uniformeId]
            );
          } else {
            await connection.query(
              `INSERT INTO articles (nom, categorie, institution, quantite, quantification, type, statut)
               VALUES (?, 'Uniformes', ?, ?, 'Pièce', 'uniforme_fini', 'Normal')`,
              [oldCommande.article, oldCommande.institution, oldCommande.quantite]
            );

            const [selectResult] = await connection.query(
              'SELECT id FROM articles WHERE nom = ? AND institution = ? AND type = "uniforme_fini" ORDER BY created_at DESC LIMIT 1',
              [oldCommande.article, oldCommande.institution]
            );

            uniformeId = selectResult.length > 0 ? selectResult[0].id : null;
          }

          if (!uniformeId || uniformeId === 0) {
            throw new Error('Impossible de créer ou trouver l\'article uniforme');
          }

          const [mouvementResult] = await connection.query(
            `INSERT INTO mouvements (type, article_id, quantite, source_destination, reference, utilisateur_id)
             VALUES ('Entrée Interne', ?, ?, ?, ?, ?)`,
            [
              uniformeId,
              oldCommande.quantite,
              `Production terminée - ${oldCommande.institution}`,
              oldCommande.numero,
              req.user.id
            ]
          );

          await connection.query(
            `INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, montant, details)
             VALUES (?, 'mouvement', 'mouvements', ?, ?, ?, ?, ?, ?)`,
            [
              'Commande terminée - Entrée Interne automatique',
              mouvementResult.insertId,
              req.user.id,
              req.user.nom_complet,
              req.user.role,
              0,
              JSON.stringify({
                commande_numero: oldCommande.numero,
                article: oldCommande.article,
                quantite: oldCommande.quantite,
                institution: oldCommande.institution,
                uniforme_id: uniformeId
              })
            ]
          );
        }

        // Si on passe à "Livrée", créer une "Sortie Externe"
        if (newStatut === 'Livrée' && oldCommande.statut !== 'Livrée') {
          console.log('🚚 Création d\'une Sortie Externe pour livraison');

          const [mouvementResult] = await connection.query(
            `INSERT INTO mouvements (type, article_id, quantite, source_destination, reference, utilisateur_id, notes)
             VALUES ('Sortie Externe', NULL, ?, ?, ?, ?, ?)`,
            [
              oldCommande.quantite,
              `Livraison commande - ${oldCommande.institution}`,
              oldCommande.numero,
              req.user.id,
              `Article: ${oldCommande.article} - Institution: ${oldCommande.institution}`
            ]
          );

          await connection.query(
            `INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, montant, details)
             VALUES (?, 'mouvement', 'mouvements', ?, ?, ?, ?, ?, ?)`,
            [
              'Livraison commande - Sortie Externe automatique',
              mouvementResult.insertId,
              req.user.id,
              req.user.nom_complet,
              req.user.role,
              0,
              JSON.stringify({
                commande_numero: oldCommande.numero,
                article: oldCommande.article,
                quantite: oldCommande.quantite,
                institution: oldCommande.institution
              })
            ]
          );
        }

        // Si on revient en arrière (de "Terminée" à un autre statut)
        if (oldCommande.statut === 'Terminée' && newStatut !== 'Terminée') {
          console.log('🔄 Suppression de l\'Entrée Interne (retour en arrière)');

          const [mouvementsToDelete] = await connection.query(
            'SELECT id FROM mouvements WHERE type = "Entrée Interne" AND reference = ?',
            [oldCommande.numero]
          );

          for (const mouvement of mouvementsToDelete) {
            await connection.query('DELETE FROM mouvements WHERE id = ?', [mouvement.id]);
            await connection.query('DELETE FROM historique WHERE record_id = ? AND type_activite = "mouvement"', [mouvement.id]);
          }

          const [uniformes] = await connection.query(
            'SELECT id FROM articles WHERE nom = ? AND institution = ? AND type = "uniforme_fini" LIMIT 1',
            [oldCommande.article, oldCommande.institution]
          );

          if (uniformes.length > 0) {
            await connection.query(
              'UPDATE articles SET quantite = GREATEST(0, quantite - ?) WHERE id = ?',
              [oldCommande.quantite, uniformes[0].id]
            );
          }
        }

        // Si on revient en arrière (de "Livrée" à un autre statut)
        if (oldCommande.statut === 'Livrée' && newStatut !== 'Livrée') {
          console.log('🔄 Suppression de la Sortie Externe (retour en arrière)');

          const [mouvementsToDelete] = await connection.query(
            'SELECT id FROM mouvements WHERE type = "Sortie Externe" AND reference = ?',
            [oldCommande.numero]
          );

          for (const mouvement of mouvementsToDelete) {
            await connection.query('DELETE FROM mouvements WHERE id = ?', [mouvement.id]);
            await connection.query('DELETE FROM historique WHERE record_id = ? AND type_activite = "mouvement"', [mouvement.id]);
          }
        }
      }

      const updates = [];
      const params = [];
      const allowedFields = ['statut', 'priorite', 'quantite', 'date_livraison_prevue', 'institution', 'article', 'client_id'];

      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined && allowedFields.includes(key)) {
          updates.push(`${key} = ?`);
          params.push(req.body[key]);
        }
      });

      if (updates.length === 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Aucune modification à apporter' });
      }

      params.push(req.params.id);

      await connection.query(
        `UPDATE commandes SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
        params
      );

      await connection.query(
        `INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, details)
         VALUES (?, 'commande', 'commandes', ?, ?, ?, ?, ?)`,
        [
          'Modification de commande',
          req.params.id,
          req.user.id,
          req.user.nom_complet,
          req.user.role,
          JSON.stringify({ modifications: req.body, ancien_statut: oldCommande.statut })
        ]
      );

      await connection.commit();

      res.json({ message: 'Commande mise à jour avec succès' });
    } catch (error) {
      await connection.rollback();
      console.error('❌ Erreur lors de la mise à jour:', error);
      next(error);
    } finally {
      connection.release();
    }
  }
);

// Route DELETE pour supprimer une commande
router.delete('/:id', async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [commande] = await connection.query(
      'SELECT * FROM commandes WHERE id = ?',
      [req.params.id]
    );

    if (commande.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    await connection.query('DELETE FROM commandes WHERE id = ?', [req.params.id]);

    await connection.query(
      `INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, details)
       VALUES (?, 'commande', 'commandes', ?, ?, ?, ?, ?)`,
      [
        'Suppression de commande',
        req.params.id,
        req.user.id,
        req.user.nom_complet,
        req.user.role,
        JSON.stringify({ commande_supprimee: commande[0] })
      ]
    );

    await connection.commit();

    res.json({ message: 'Commande supprimée avec succès' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

export default router;
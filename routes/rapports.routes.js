import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import PDFDocument from 'pdfkit';

const router = express.Router();

router.use(authenticateToken);

// Obtenir toutes les transactions avec filtres
router.get('/', async (req, res, next) => {
  try {
    const { startDate, endDate, categorie, type_activite } = req.query;
    let query = 'SELECT * FROM historique WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND date_action >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date_action <= ?';
      params.push(endDate + ' 23:59:59');
    }
    if (categorie && categorie !== 'tous') {
      query += ' AND type_activite = ?';
      params.push(categorie);
    }
    if (type_activite) {
      query += ' AND type_activite = ?';
      params.push(type_activite);
    }

    query += ' ORDER BY date_action DESC';

    const [transactions] = await pool.query(query, params);
    res.json({ data: transactions });
  } catch (error) {
    next(error);
  }
});

// Obtenir le résumé des rapports AMÉLIORÉ
router.get('/resume', async (req, res, next) => {
  try {
    const { startDate, endDate, categorie } = req.query;
    let baseQuery = 'WHERE 1=1';
    const params = [];

    if (startDate) {
      baseQuery += ' AND date_action >= ?';
      params.push(startDate);
    }
    if (endDate) {
      baseQuery += ' AND date_action <= ?';
      params.push(endDate + ' 23:59:59');
    }

    // Total des transactions dans l'historique
    let totalQuery = `SELECT COUNT(*) as total FROM historique ${baseQuery}`;
    if (categorie && categorie !== 'tous') {
      totalQuery += ' AND type_activite = ?';
      params.push(categorie);
    }
    const [totalResult] = await pool.query(totalQuery, params);

    // Total par catégorie
    let categoryQuery = `SELECT type_activite, COUNT(*) as count FROM historique ${baseQuery}`;
    const categoryParams = [...params];
    if (categorie && categorie !== 'tous') {
      categoryQuery += ' AND type_activite = ?';
      categoryParams.push(categorie);
    }
    categoryQuery += ' GROUP BY type_activite';
    const [parCategorie] = await pool.query(categoryQuery, categoryParams);

    // Total des commandes (dans l'historique)
    const [commandesResult] = await pool.query(
      `SELECT COUNT(*) as total FROM historique ${baseQuery} AND type_activite = 'commande'`,
      params.slice(0, params.length - (categorie && categorie !== 'tous' ? 1 : 0))
    );

    // Total des mouvements (dans l'historique)
    const [mouvementsResult] = await pool.query(
      `SELECT COUNT(*) as total FROM historique ${baseQuery} AND type_activite = 'mouvement'`,
      params.slice(0, params.length - (categorie && categorie !== 'tous' ? 1 : 0))
    );

    // Commandes livrées (depuis la table commandes)
    let commandesLivreesQuery = `
      SELECT COUNT(*) as nombre, SUM(quantite) as quantite_totale
      FROM commandes
      WHERE statut = 'Livrée'
    `;
    const commandesParams = [];
    
    if (startDate) {
      commandesLivreesQuery += ' AND date_commande >= ?';
      commandesParams.push(startDate);
    }
    if (endDate) {
      commandesLivreesQuery += ' AND date_commande <= ?';
      commandesParams.push(endDate + ' 23:59:59');
    }

    const [commandesLivreesResult] = await pool.query(commandesLivreesQuery, commandesParams);

    res.json({
      data: {
        total_transactions: totalResult[0].total || 0,
        nombre_commandes_livrees: commandesLivreesResult[0].nombre || 0,
        total_quantite_commandes_livrees: commandesLivreesResult[0].quantite_totale || 0,
        commandes: commandesResult[0].total || 0,
        mouvements: mouvementsResult[0].total || 0,
        par_categorie: parCategorie,
      }
    });
  } catch (error) {
    next(error);
  }
});

// Export PDF AMÉLIORÉ ET DÉTAILLÉ
router.get('/export', async (req, res, next) => {
  try {
    const { startDate, endDate, categorie } = req.query;
    
    // Récupérer les données pour le rapport
    let query = 'SELECT * FROM historique WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND date_action >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date_action <= ?';
      params.push(endDate + ' 23:59:59');
    }
    if (categorie && categorie !== 'tous') {
      query += ' AND type_activite = ?';
      params.push(categorie);
    }

    query += ' ORDER BY date_action DESC';

    const [transactions] = await pool.query(query, params);

    // Récupérer les statistiques complètes
    let baseQuery = 'WHERE 1=1';
    const resumeParams = [];

    if (startDate) {
      baseQuery += ' AND date_action >= ?';
      resumeParams.push(startDate);
    }
    if (endDate) {
      baseQuery += ' AND date_action <= ?';
      resumeParams.push(endDate + ' 23:59:59');
    }

    const [totalResult] = await pool.query(
      `SELECT COUNT(*) as total FROM historique ${baseQuery}`,
      resumeParams
    );

    const [parCategorie] = await pool.query(
      `SELECT type_activite, COUNT(*) as count FROM historique ${baseQuery} GROUP BY type_activite`,
      resumeParams
    );

    const [commandesResult] = await pool.query(
      `SELECT COUNT(*) as total FROM historique ${baseQuery} AND type_activite = 'commande'`,
      resumeParams
    );

    const [mouvementsResult] = await pool.query(
      `SELECT COUNT(*) as total FROM historique ${baseQuery} AND type_activite = 'mouvement'`,
      resumeParams
    );

    // Commandes livrées
    let commandesLivreesQuery = `
      SELECT COUNT(*) as nombre, SUM(quantite) as quantite_totale, 
             numero, article, institution, quantite, date_commande
      FROM commandes
      WHERE statut = 'Livrée'
    `;
    const commandesParams = [];
    
    if (startDate) {
      commandesLivreesQuery += ' AND date_commande >= ?';
      commandesParams.push(startDate);
    }
    if (endDate) {
      commandesLivreesQuery += ' AND date_commande <= ?';
      commandesParams.push(endDate + ' 23:59:59');
    }

    const [commandesLivrees] = await pool.query(commandesLivreesQuery, commandesParams);

    // Créer le PDF détaillé
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      bufferPages: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rapport-detaille-${startDate || 'debut'}-${endDate || 'fin'}.pdf`);

    doc.pipe(res);

    // PAGE DE COUVERTURE
    doc.fontSize(24).font('Helvetica-Bold').text('RAPPORT D\'ACTIVITÉS', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica').text('Système de Gestion des Stocks Militaires', { align: 'center' });
    doc.moveDown(3);
    
    // Informations de période
    doc.fontSize(14).font('Helvetica-Bold').text('Période d\'analyse', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');
    doc.text(`Date de début: ${startDate ? new Date(startDate).toLocaleDateString('fr-FR') : 'Non spécifiée'}`);
    doc.text(`Date de fin: ${endDate ? new Date(endDate).toLocaleDateString('fr-FR') : 'Non spécifiée'}`);
    if (categorie && categorie !== 'tous') {
      doc.text(`Catégorie filtrée: ${categorie}`);
    }
    doc.moveDown(2);

    // SECTION 1: RÉSUMÉ EXÉCUTIF
    doc.fontSize(16).font('Helvetica-Bold').text('1. RÉSUMÉ EXÉCUTIF', { underline: true });
    doc.moveDown();
    
    doc.fontSize(12).font('Helvetica');
    const resumeData = [
      { label: 'Total des transactions', value: totalResult[0].total || 0 },
      { label: 'Transactions de type commande', value: commandesResult[0].total || 0 },
      { label: 'Transactions de type mouvement', value: mouvementsResult[0].total || 0 },
      { label: 'Commandes livrées', value: commandesLivrees[0]?.nombre || 0 },
      { label: 'Quantité totale livrée', value: `${commandesLivrees[0]?.quantite_totale || 0} unités` }
    ];

    resumeData.forEach(item => {
      doc.text(`• ${item.label}: `, { continued: true, width: 300 });
      doc.font('Helvetica-Bold').text(item.value, { width: 200 });
      doc.font('Helvetica');
    });

    doc.moveDown(2);

    // SECTION 2: RÉPARTITION PAR CATÉGORIE
    doc.addPage();
    doc.fontSize(16).font('Helvetica-Bold').text('2. RÉPARTITION PAR CATÉGORIE', { underline: true });
    doc.moveDown();

    doc.fontSize(12).font('Helvetica');
    parCategorie.forEach(cat => {
      const pourcentage = ((cat.count / totalResult[0].total) * 100).toFixed(1);
      doc.text(`• ${cat.type_activite.charAt(0).toUpperCase() + cat.type_activite.slice(1)}: `, { continued: true });
      doc.font('Helvetica-Bold').text(`${cat.count} transactions (${pourcentage}%)`, { continued: false });
      doc.font('Helvetica');
    });

    doc.moveDown(2);

    // SECTION 3: DÉTAIL DES COMMANDES LIVRÉES
    if (commandesLivrees.length > 0 && commandesLivrees[0].numero) {
      doc.fontSize(16).font('Helvetica-Bold').text('3. DÉTAIL DES COMMANDES LIVRÉES', { underline: true });
      doc.moveDown();

      // En-têtes du tableau
      const tableTop = doc.y;
      const col1X = 50;
      const col2X = 130;
      const col3X = 250;
      const col4X = 380;
      const col5X = 480;

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Numéro', col1X, tableTop);
      doc.text('Article', col2X, tableTop);
      doc.text('Institution', col3X, tableTop);
      doc.text('Quantité', col4X, tableTop);
      doc.text('Date', col5X, tableTop);

      let y = tableTop + 20;
      doc.font('Helvetica').fontSize(9);

      commandesLivrees.forEach((cmd, index) => {
        if (!cmd.numero) return;
        
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc.text(cmd.numero || '-', col1X, y, { width: 70 });
        doc.text(cmd.article || '-', col2X, y, { width: 110 });
        doc.text(cmd.institution || '-', col3X, y, { width: 120 });
        doc.text(`${cmd.quantite || 0}`, col4X, y, { width: 90 });
        doc.text(new Date(cmd.date_commande).toLocaleDateString('fr-FR'), col5X, y, { width: 70 });

        y += 20;
      });

      doc.moveDown(2);
    }

    // SECTION 4: HISTORIQUE DES TRANSACTIONS
    doc.addPage();
    doc.fontSize(16).font('Helvetica-Bold').text('4. HISTORIQUE DÉTAILLÉ DES TRANSACTIONS', { underline: true });
    doc.moveDown();

    if (transactions.length === 0) {
      doc.fontSize(12).font('Helvetica-Oblique').text('Aucune transaction pour cette période.', { align: 'center' });
    } else {
      // Limiter à 100 transactions pour le PDF
      const maxTransactions = Math.min(transactions.length, 100);
      
      doc.fontSize(10).font('Helvetica');
      doc.text(`Affichage des ${maxTransactions} premières transactions sur ${transactions.length} au total.`);
      doc.moveDown();

      transactions.slice(0, maxTransactions).forEach((trans, index) => {
        if (doc.y > 700) {
          doc.addPage();
        }

        doc.fontSize(9).font('Helvetica-Bold');
        doc.text(`Transaction #${index + 1}`, { underline: true });
        doc.font('Helvetica').fontSize(8);
        
        doc.text(`Date: ${new Date(trans.date_action).toLocaleString('fr-FR')}`);
        doc.text(`Type: ${trans.type_activite || 'N/A'}`);
        doc.text(`Action: ${trans.action || 'N/A'}`);
        doc.text(`Utilisateur: ${trans.utilisateur_nom || 'Système'} (${trans.role || 'N/A'})`);
        if (trans.details) {
          doc.text(`Détails: ${trans.details.substring(0, 150)}${trans.details.length > 150 ? '...' : ''}`);
        }
        
        doc.moveDown(0.5);
      });

      if (transactions.length > maxTransactions) {
        doc.moveDown();
        doc.fontSize(10).font('Helvetica-Oblique').text(
          `... et ${transactions.length - maxTransactions} autres transactions non affichées.`,
          { align: 'center' }
        );
      }
    }

    // PIED DE PAGE SUR TOUTES LES PAGES
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      
      doc.fontSize(8).font('Helvetica');
      doc.text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} | Page ${i + 1} sur ${pages.count}`,
        50,
        doc.page.height - 50,
        { align: 'center', width: doc.page.width - 100 }
      );
    }

    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    next(error);
  }
});

// Obtenir les rapports par catégorie
router.get('/categorie/:type', async (req, res, next) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;
    
    let query = 'SELECT * FROM historique WHERE type_activite = ?';
    const params = [type];

    if (startDate) {
      query += ' AND date_action >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date_action <= ?';
      params.push(endDate + ' 23:59:59');
    }

    query += ' ORDER BY date_action DESC';

    const [data] = await pool.query(query, params);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
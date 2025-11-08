import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.use(authenticateToken);

const EXPORTS_DIR = path.join(__dirname, '..', 'exports');

if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

// ==================== UTILITAIRES ====================

const sanitizeData = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  return String(value).trim();
};

const logToHistory = async (pool, action, utilisateur_id, utilisateur_nom, role, details) => {
  try {
    await pool.query(
      `INSERT INTO historique (action, type_activite, table_concernee, record_id, utilisateur_id, utilisateur_nom, role, details)
       VALUES (?, 'rapport', 'rapports', NULL, ?, ?, ?, ?)`,
      [action, utilisateur_id, utilisateur_nom, role, details]
    );
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement dans l\'historique:', error);
  }
};

// ==================== ROUTE: RAPPORT STOCKS ====================

router.post('/stocks', async (req, res) => {
  try {
    const { filters } = req.body;
    const pool = (await import('../config/database.js')).default;

    console.log('[PDF STOCKS] Génération du rapport avec filtres:', filters);

    // Construire la requête avec filtres
    let query = 'SELECT * FROM articles WHERE 1=1';
    const params = [];

    if (filters?.categorie && filters.categorie !== 'Toutes') {
      query += ' AND categorie = ?';
      params.push(filters.categorie);
    }
    if (filters?.institution && filters.institution !== 'Toutes') {
      query += ' AND institution = ?';
      params.push(filters.institution);
    }
    if (filters?.statut && filters.statut !== 'Tous') {
      query += ' AND statut = ?';
      params.push(filters.statut);
    }
    if (filters?.type && filters.type !== 'Tous') {
      const typeValue = filters.type === 'Matières premières' ? 'matiere_premiere' : 'uniforme_fini';
      query += ' AND type = ?';
      params.push(typeValue);
    }
    if (filters?.search) {
      query += ' AND nom LIKE ?';
      params.push(`%${filters.search}%`);
    }

    query += ' ORDER BY categorie, nom';

    const [stocks] = await pool.query(query, params);

    if (!stocks || stocks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun stock trouvé avec ces filtres'
      });
    }

    console.log(`[PDF STOCKS] ${stocks.length} articles trouvés`);

    // Créer le PDF
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 40,
      bufferPages: true
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `rapport-stocks-${timestamp}.pdf`;
    const filepath = path.join(EXPORTS_DIR, filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // ===== PAGE DE COUVERTURE =====
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#0b3d0b')
      .text('SYSTÈME DE GESTION DES STOCKS MILITAIRES', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(24).fillColor('#0b3d0b').text('RAPPORT DES STOCKS', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#666').text(
      `Généré le ${new Date().toLocaleString('fr-FR', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`,
      { align: 'center' }
    );
    doc.moveDown(2);

    // Filtres appliqués
    if (filters && Object.keys(filters).length > 0) {
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#374151').text('FILTRES APPLIQUÉS', { underline: true });
      doc.moveDown(0.5);

      Object.entries(filters).forEach(([key, value]) => {
        const displayValue = sanitizeData(value);
        if (displayValue && displayValue !== '-' && displayValue !== 'Toutes' && displayValue !== 'Tous') {
          doc.fontSize(11).font('Helvetica').fillColor('#6b7280')
            .text(`• ${key}: ${displayValue}`, { indent: 20 });
        }
      });
      doc.moveDown(1.5);
    }

    doc.addPage();

    // ===== STATISTIQUES =====
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#0b3d0b').text('STATISTIQUES GÉNÉRALES', { underline: true });
    doc.moveDown(1);

    const totalArticles = stocks.length;
    const totalQuantite = stocks.reduce((sum, item) => sum + (parseFloat(item.quantite) || 0), 0);
    const stocksFaibles = stocks.filter(item => item.statut && item.statut.toLowerCase() === 'faible').length;
    const categories = [...new Set(stocks.map(item => item.categorie))].filter(c => c).length;
    const institutions = [...new Set(stocks.map(item => item.institution))].filter(i => i).length;

    const stats = [
      { label: 'Total Articles', value: totalArticles, color: '#0b3d0b' },
      { label: 'Quantité Totale', value: Math.floor(totalQuantite), color: '#155d15' },
      { label: 'Stocks Faibles', value: stocksFaibles, color: '#d97706' },
      { label: 'Catégories', value: categories, color: '#3b82f6' },
      { label: 'Institutions', value: institutions, color: '#8b5cf6' }
    ];

    drawStatsCards(doc, stats);
    doc.moveDown(2);

    // ===== TABLEAU DES STOCKS =====
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#0b3d0b').text('DONNÉES DÉTAILLÉES', { underline: true });
    doc.moveDown(1);

    const headers = ['Article', 'Catégorie', 'Institution', 'Quantité', 'Unité', 'Statut'];
    const columnWidths = [180, 120, 120, 80, 80, 100];

    // Validation: S'assurer que headers et columnWidths ont la même longueur
    if (headers.length !== columnWidths.length) {
      console.warn(`[PDF STOCKS] Mismatch: headers=${headers.length}, columnWidths=${columnWidths.length}`);
    }

    const rows = stocks.map(item => [
      sanitizeData(item.nom),
      sanitizeData(item.categorie),
      sanitizeData(item.institution),
      sanitizeData(Math.floor(item.quantite || 0)),
      sanitizeData(item.quantification),
      sanitizeData(item.statut)
    ]);

    // Validation: S'assurer que chaque ligne a le bon nombre de colonnes
    const validRows = rows.map(row => {
      if (row.length !== headers.length) {
        console.warn(`[PDF STOCKS] Row length mismatch: expected ${headers.length}, got ${row.length}`);
        while (row.length < headers.length) row.push('-');
        if (row.length > headers.length) row = row.slice(0, headers.length);
      }
      return row;
    });

    console.log(`[PDF STOCKS] Génération du tableau: ${headers.length} colonnes, ${validRows.length} lignes`);

    drawPDFTable(doc, headers, validRows, columnWidths);

    // ===== PIED DE PAGE =====
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(9).font('Helvetica').fillColor('#6b7280');
      doc.text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} | Page ${i + 1} sur ${pages.count}`,
        40,
        doc.page.height - 40,
        { align: 'center', width: doc.page.width - 80 }
      );
      doc.text(
        'Document confidentiel - Système de Gestion des Stocks - Forces Armées',
        40,
        doc.page.height - 25,
        { align: 'center', width: doc.page.width - 80 }
      );
    }

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // Historique
    await logToHistory(
      pool,
      'Génération rapport stocks',
      req.user.id,
      req.user.nom_complet,
      req.user.role,
      `Rapport stocks généré avec ${stocks.length} articles. Filtres: ${JSON.stringify(filters || {})}`
    );

    // Envoyer le fichier
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const fileContent = fs.readFileSync(filepath);
    res.send(fileContent);

    console.log(`[PDF STOCKS] Rapport généré avec succès: ${filename}`);

  } catch (error) {
    console.error('[PDF STOCKS] Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du rapport stocks',
      error: error.message
    });
  }
});

// ==================== ROUTE: RAPPORT MOUVEMENTS ====================

router.post('/mouvements', async (req, res) => {
  try {
    const { filters } = req.body;
    const pool = (await import('../config/database.js')).default;

    console.log('[PDF MOUVEMENTS] Génération du rapport avec filtres:', filters);

    let query = `
      SELECT
        m.*,
        a.nom as article_nom,
        a.quantification,
        u.nom_complet as utilisateur_nom
      FROM mouvements m
      LEFT JOIN articles a ON m.article_id = a.id
      LEFT JOIN users u ON m.utilisateur_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters?.type && filters.type !== 'Tous les types') {
      query += ' AND m.type = ?';
      params.push(filters.type);
    }
    if (filters?.start_date) {
      query += ' AND DATE(m.date) >= ?';
      params.push(filters.start_date);
    }
    if (filters?.end_date) {
      query += ' AND DATE(m.date) <= ?';
      params.push(filters.end_date);
    }

    query += ' ORDER BY m.date DESC';

    const [mouvements] = await pool.query(query, params);

    if (!mouvements || mouvements.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun mouvement trouvé avec ces filtres'
      });
    }

    console.log(`[PDF MOUVEMENTS] ${mouvements.length} mouvements trouvés`);

    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 40,
      bufferPages: true
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `rapport-mouvements-${timestamp}.pdf`;
    const filepath = path.join(EXPORTS_DIR, filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Page de couverture
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#0b3d0b')
      .text('SYSTÈME DE GESTION DES STOCKS MILITAIRES', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(24).fillColor('#0b3d0b').text('RAPPORT DES MOUVEMENTS', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#666').text(
      `Généré le ${new Date().toLocaleString('fr-FR', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`,
      { align: 'center' }
    );
    doc.moveDown(2);

    // Filtres
    if (filters && Object.keys(filters).length > 0) {
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#374151').text('FILTRES APPLIQUÉS', { underline: true });
      doc.moveDown(0.5);

      Object.entries(filters).forEach(([key, value]) => {
        const displayValue = sanitizeData(value);
        if (displayValue && displayValue !== '-' && displayValue !== 'Tous les types') {
          doc.fontSize(11).font('Helvetica').fillColor('#6b7280')
            .text(`• ${key}: ${displayValue}`, { indent: 20 });
        }
      });
      doc.moveDown(1.5);
    }

    doc.addPage();

    // Statistiques
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#0b3d0b').text('STATISTIQUES GÉNÉRALES', { underline: true });
    doc.moveDown(1);

    const totalMouvements = mouvements.length;
    const entreesExternes = mouvements.filter(m => m.type && m.type.includes('Entrée Externe')).length;
    const entreesInternes = mouvements.filter(m => m.type && m.type.includes('Entrée Interne')).length;
    const sortiesExternes = mouvements.filter(m => m.type && m.type.includes('Sortie Externe')).length;
    const sortiesInternes = mouvements.filter(m => m.type && m.type.includes('Sortie Interne')).length;
    const quantiteTotale = mouvements.reduce((sum, m) => sum + (parseFloat(m.quantite) || 0), 0);

    const stats = [
      { label: 'Total Mouvements', value: totalMouvements, color: '#0b3d0b' },
      { label: 'Entrées Externes', value: entreesExternes, color: '#10b981' },
      { label: 'Entrées Internes', value: entreesInternes, color: '#34d399' },
      { label: 'Sorties Externes', value: sortiesExternes, color: '#ef4444' },
      { label: 'Sorties Internes', value: sortiesInternes, color: '#f87171' },
      { label: 'Quantité Totale', value: Math.floor(quantiteTotale), color: '#3b82f6' }
    ];

    drawStatsCards(doc, stats);
    doc.moveDown(2);

    // Tableau
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#0b3d0b').text('DONNÉES DÉTAILLÉES', { underline: true });
    doc.moveDown(1);

    const headers = ['Date', 'Type', 'Article', 'Quantité', 'Source/Dest.', 'Référence'];
    const columnWidths = [100, 110, 150, 80, 130, 110];

    // Validation
    if (headers.length !== columnWidths.length) {
      console.warn(`[PDF MOUVEMENTS] Mismatch: headers=${headers.length}, columnWidths=${columnWidths.length}`);
    }

    const rows = mouvements.map(item => {
      const date = item.date ? new Date(item.date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) : '-';

      return [
        date,
        sanitizeData(item.type),
        sanitizeData((item.article_nom || item.notes || 'N/A').substring(0, 30)),
        sanitizeData(Math.floor(item.quantite || 0)),
        sanitizeData((item.source_destination || '-').substring(0, 25)),
        sanitizeData(item.reference)
      ];
    });

    // Validation des lignes
    const validRows = rows.map(row => {
      if (row.length !== headers.length) {
        console.warn(`[PDF MOUVEMENTS] Row length mismatch: expected ${headers.length}, got ${row.length}`);
        while (row.length < headers.length) row.push('-');
        if (row.length > headers.length) row = row.slice(0, headers.length);
      }
      return row;
    });

    console.log(`[PDF MOUVEMENTS] Génération du tableau: ${headers.length} colonnes, ${validRows.length} lignes`);

    drawPDFTable(doc, headers, validRows, columnWidths);

    // Pied de page
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(9).font('Helvetica').fillColor('#6b7280');
      doc.text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} | Page ${i + 1} sur ${pages.count}`,
        40,
        doc.page.height - 40,
        { align: 'center', width: doc.page.width - 80 }
      );
      doc.text(
        'Document confidentiel - Système de Gestion des Stocks - Forces Armées',
        40,
        doc.page.height - 25,
        { align: 'center', width: doc.page.width - 80 }
      );
    }

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    await logToHistory(
      pool,
      'Génération rapport mouvements',
      req.user.id,
      req.user.nom_complet,
      req.user.role,
      `Rapport mouvements généré avec ${mouvements.length} entrées. Filtres: ${JSON.stringify(filters || {})}`
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const fileContent = fs.readFileSync(filepath);
    res.send(fileContent);

    console.log(`[PDF MOUVEMENTS] Rapport généré avec succès: ${filename}`);

  } catch (error) {
    console.error('[PDF MOUVEMENTS] Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du rapport mouvements',
      error: error.message
    });
  }
});

// ==================== ROUTE: RAPPORT COMMANDES ====================

router.post('/commandes', async (req, res) => {
  try {
    const { filters } = req.body;
    const pool = (await import('../config/database.js')).default;

    console.log('[PDF COMMANDES] Génération du rapport avec filtres:', filters);

    let query = `
      SELECT c.*,
             cl.nom as client_nom,
             cl.telephone as client_telephone
      FROM commandes c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE 1=1
    `;
    const params = [];

    if (filters?.statut && filters.statut !== 'Tous') {
      query += ' AND c.statut = ?';
      params.push(filters.statut);
    }
    if (filters?.institution && filters.institution !== 'Toutes') {
      query += ' AND c.institution = ?';
      params.push(filters.institution);
    }
    if (filters?.priorite && filters.priorite !== 'Toutes') {
      query += ' AND c.priorite = ?';
      params.push(filters.priorite);
    }
    if (filters?.start_date) {
      query += ' AND DATE(c.date_commande) >= ?';
      params.push(filters.start_date);
    }
    if (filters?.end_date) {
      query += ' AND DATE(c.date_commande) <= ?';
      params.push(filters.end_date);
    }

    query += ' ORDER BY c.date_commande DESC';

    const [commandes] = await pool.query(query, params);

    if (!commandes || commandes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune commande trouvée avec ces filtres'
      });
    }

    console.log(`[PDF COMMANDES] ${commandes.length} commandes trouvées`);

    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 40,
      bufferPages: true
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `rapport-commandes-${timestamp}.pdf`;
    const filepath = path.join(EXPORTS_DIR, filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Page de couverture
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#0b3d0b')
      .text('SYSTÈME DE GESTION DES STOCKS MILITAIRES', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(24).fillColor('#0b3d0b').text('RAPPORT DES COMMANDES', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#666').text(
      `Généré le ${new Date().toLocaleString('fr-FR', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`,
      { align: 'center' }
    );
    doc.moveDown(2);

    // Filtres
    if (filters && Object.keys(filters).length > 0) {
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#374151').text('FILTRES APPLIQUÉS', { underline: true });
      doc.moveDown(0.5);

      Object.entries(filters).forEach(([key, value]) => {
        const displayValue = sanitizeData(value);
        if (displayValue && displayValue !== '-' && displayValue !== 'Toutes' && displayValue !== 'Tous') {
          doc.fontSize(11).font('Helvetica').fillColor('#6b7280')
            .text(`• ${key}: ${displayValue}`, { indent: 20 });
        }
      });
      doc.moveDown(1.5);
    }

    doc.addPage();

    // Statistiques
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#0b3d0b').text('STATISTIQUES GÉNÉRALES', { underline: true });
    doc.moveDown(1);

    const totalCommandes = commandes.length;
    const enAttente = commandes.filter(c => c.statut === 'En attente').length;
    const enProduction = commandes.filter(c => c.statut === 'En production').length;
    const terminees = commandes.filter(c => c.statut === 'Terminée').length;
    const livrees = commandes.filter(c => c.statut === 'Livrée').length;
    const annulees = commandes.filter(c => c.statut === 'Annulée').length;
    const quantiteTotal = commandes.reduce((sum, c) => sum + (parseInt(c.quantite) || 0), 0);

    const stats = [
      { label: 'Total Commandes', value: totalCommandes, color: '#0b3d0b' },
      { label: 'En Attente', value: enAttente, color: '#d97706' },
      { label: 'En Production', value: enProduction, color: '#3b82f6' },
      { label: 'Terminées', value: terminees, color: '#8b5cf6' },
      { label: 'Livrées', value: livrees, color: '#10b981' },
      { label: 'Annulées', value: annulees, color: '#ef4444' },
      { label: 'Quantité Totale', value: quantiteTotal, color: '#059669' }
    ];

    drawStatsCards(doc, stats);
    doc.moveDown(2);

    // Tableau
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#0b3d0b').text('DONNÉES DÉTAILLÉES', { underline: true });
    doc.moveDown(1);

    const headers = ['Numéro', 'Institution', 'Article', 'Quantité', 'Statut', 'Priorité', 'Date'];
    const columnWidths = [100, 120, 150, 80, 100, 90, 90];

    // Validation
    if (headers.length !== columnWidths.length) {
      console.warn(`[PDF COMMANDES] Mismatch: headers=${headers.length}, columnWidths=${columnWidths.length}`);
    }

    const rows = commandes.map(item => {
      const date = item.date_commande ? new Date(item.date_commande).toLocaleDateString('fr-FR') : '-';

      return [
        sanitizeData(item.numero),
        sanitizeData(item.institution),
        sanitizeData((item.article || '-').substring(0, 30)),
        sanitizeData(Math.floor(item.quantite || 0)),
        sanitizeData(item.statut),
        sanitizeData(item.priorite),
        date
      ];
    });

    // Validation des lignes
    const validRows = rows.map(row => {
      if (row.length !== headers.length) {
        console.warn(`[PDF COMMANDES] Row length mismatch: expected ${headers.length}, got ${row.length}`);
        while (row.length < headers.length) row.push('-');
        if (row.length > headers.length) row = row.slice(0, headers.length);
      }
      return row;
    });

    console.log(`[PDF COMMANDES] Génération du tableau: ${headers.length} colonnes, ${validRows.length} lignes`);

    drawPDFTable(doc, headers, validRows, columnWidths);

    // Pied de page
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(9).font('Helvetica').fillColor('#6b7280');
      doc.text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} | Page ${i + 1} sur ${pages.count}`,
        40,
        doc.page.height - 40,
        { align: 'center', width: doc.page.width - 80 }
      );
      doc.text(
        'Document confidentiel - Système de Gestion des Stocks - Forces Armées',
        40,
        doc.page.height - 25,
        { align: 'center', width: doc.page.width - 80 }
      );
    }

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    await logToHistory(
      pool,
      'Génération rapport commandes',
      req.user.id,
      req.user.nom_complet,
      req.user.role,
      `Rapport commandes généré avec ${commandes.length} entrées. Filtres: ${JSON.stringify(filters || {})}`
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const fileContent = fs.readFileSync(filepath);
    res.send(fileContent);

    console.log(`[PDF COMMANDES] Rapport généré avec succès: ${filename}`);

  } catch (error) {
    console.error('[PDF COMMANDES] Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du rapport commandes',
      error: error.message
    });
  }
});

// ==================== FONCTIONS UTILITAIRES PDF ====================

function drawStatsCards(doc, stats) {
  const cardWidth = 170;
  const cardHeight = 70;
  const cardsPerRow = 4;
  const margin = 15;
  const startY = doc.y;

  stats.forEach((stat, index) => {
    const row = Math.floor(index / cardsPerRow);
    const col = index % cardsPerRow;

    const x = 40 + col * (cardWidth + margin);
    const y = startY + row * (cardHeight + margin);

    if (y + cardHeight > doc.page.height - 80) {
      doc.addPage();
      return;
    }

    // Validation des valeurs
    const color = stat.color || '#0b3d0b';
    const label = stat.label || 'N/A';
    const value = (stat.value !== undefined && stat.value !== null) ? String(stat.value) : '0';

    doc.roundedRect(x, y, cardWidth, cardHeight, 8).fillAndStroke(color, '#000');

    doc.fillColor('white').fontSize(9).font('Helvetica')
      .text(label.toUpperCase(), x + 12, y + 15, { width: cardWidth - 24 });

    doc.fontSize(24).font('Helvetica-Bold')
      .text(value, x + 12, y + 35, { width: cardWidth - 24 });
  });

  const totalRows = Math.ceil(stats.length / cardsPerRow);
  doc.y = startY + (totalRows * (cardHeight + margin)) + 20;
}

function drawPDFTable(doc, headers, rows, columnWidths) {
  const startX = 40;
  const rowHeight = 25;
  const headerHeight = 30;
  let currentY = doc.y;

  // Validation des columnWidths
  const validColumnWidths = columnWidths.map((width, index) => {
    if (typeof width === 'number' && width > 0) {
      return width;
    }
    console.warn(`[PDF] columnWidth[${index}] invalide: ${width}, utilisation de 100`);
    return 100;
  });

  const drawTableHeader = (y) => {
    return drawRow(headers, y, true);
  };

  const drawRow = (rowData, y, isHeader = false) => {
    if (y + rowHeight > doc.page.height - 60) {
      doc.addPage();
      y = 40;
      y = drawTableHeader(y);
      return y;
    }

    let currentX = startX;

    rowData.forEach((cell, i) => {
      const cellWidth = validColumnWidths[i] || 100;

      const cellText = cell != null ? String(cell) : '-';
      const displayText = cellText.length > 30 ? cellText.substring(0, 27) + '...' : cellText;

      if (isHeader) {
        doc.rect(currentX, y, cellWidth, headerHeight).fillAndStroke('#0b3d0b', '#000');
        doc.fillColor('white').fontSize(9).font('Helvetica-Bold');
      } else {
        const fillColor = rows.indexOf(rowData) % 2 === 0 ? '#ffffff' : '#f9fafb';
        doc.rect(currentX, y, cellWidth, rowHeight).fillAndStroke(fillColor, '#e5e7eb');
        doc.fillColor('#374151').fontSize(8).font('Helvetica');
      }

      doc.text(
        displayText,
        currentX + 5,
        y + (isHeader ? 10 : 8),
        {
          width: cellWidth - 10,
          height: isHeader ? headerHeight - 20 : rowHeight - 16,
          ellipsis: true
        }
      );

      currentX += cellWidth;
    });

    return y + (isHeader ? headerHeight : rowHeight);
  };

  currentY = drawTableHeader(currentY);

  rows.forEach((row) => {
    currentY = drawRow(row, currentY, false);
  });

  doc.y = currentY + 10;
}

// ==================== ROUTES EXISTANTES ====================

router.post('/generate-rapport', async (req, res) => {
  // ... votre code existant pour generate-rapport ...
});

router.get('/download/:filename', async (req, res) => {
  // ... votre code existant pour download ...
});

router.get('/list', (req, res) => {
  try {
    const files = fs.readdirSync(EXPORTS_DIR);
    const fileDetails = files.map(filename => {
      const filepath = path.join(EXPORTS_DIR, filename);
      const stats = fs.statSync(filepath);
      return {
        filename,
        size: stats.size,
        createdAt: stats.birthtime,
        downloadUrl: `/api/pdf/download/${filename}`
      };
    });

    res.json({
      success: true,
      files: fileDetails
    });
  } catch (error) {
    console.error('[PDF] Erreur lors de la récupération des fichiers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des fichiers',
      error: error.message
    });
  }
});

export default router;
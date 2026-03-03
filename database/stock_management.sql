-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 08, 2025 at 05:07 AM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `stock_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
CREATE TABLE IF NOT EXISTS `articles` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `nom` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `categorie` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantite` decimal(10,2) NOT NULL DEFAULT '0.00',
  `quantification` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('Normal','Faible') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Normal',
  `type` enum('matiere_premiere','uniforme_fini') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'matiere_premiere',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_categorie` (`categorie`),
  KEY `idx_institution` (`institution`),
  KEY `idx_statut` (`statut`),
  KEY `idx_type` (`type`),
  KEY `idx_quantite` (`quantite`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `articles`
--

INSERT INTO `articles` (`id`, `nom`, `categorie`, `institution`, `quantite`, `quantification`, `statut`, `type`, `created_at`, `updated_at`) VALUES
('05cbf6ec-9aed-424c-98a9-ffdd2d7cc9e6', 'Tenues claires', 'Uniformes', 'Sapeurs-pompiers', 41.00, 'Unité', 'Normal', 'uniforme_fini', '2025-11-03 17:29:17', '2025-11-04 16:30:28'),
('2fa699e7-f04a-47a0-8f77-13fea09f981d', 'Gros grains', 'Autres Fournitures', NULL, 17.00, 'cartons', 'Normal', 'matiere_premiere', '2025-11-05 15:11:18', '2025-11-05 15:11:18'),
('4a8a2272-e1f9-47a3-873b-bc28ab750e3e', 'Fond de poches', 'Fils', 'MINDEF', 1.00, 'rouleaux', 'Faible', 'matiere_premiere', '2025-11-03 16:13:24', '2025-11-03 16:13:24'),
('876e26fd-ba52-11f0-a515-18dbf201ea17', 'Camouflés', 'Uniformes', 'pompiers', 12.00, 'Pièce', 'Normal', 'uniforme_fini', '2025-11-05 14:20:07', '2025-11-05 14:23:04'),
('c92aee5b-c63c-40b7-bd0d-bd82b4454f74', 'Fond de poches', 'Tissus', NULL, 8.00, 'rouleaux', 'Faible', 'matiere_premiere', '2025-11-03 17:23:39', '2025-11-03 17:52:17');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `nom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `quantification` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`),
  KEY `idx_nom` (`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `nom`, `description`, `quantification`, `created_at`, `updated_at`) VALUES
('cb374352-b08b-11f0-8e63-18dbf201ea17', 'Tissus', 'Matières textiles pour la confection', 'Mètres', '2025-10-24 03:44:50', '2025-10-24 05:37:02'),
('cb3752a4-b08b-11f0-8e63-18dbf201ea17', 'Fils', 'Fils à coudre de différentes couleurs et épaisseurs', 'Bobines', '2025-10-24 03:44:50', '2025-10-24 05:37:02'),
('cb375cb2-b08b-11f0-8e63-18dbf201ea17', 'Boutons', 'Boutons métalliques et plastiques', 'Pièces', '2025-10-24 03:44:50', '2025-10-24 05:37:02'),
('cb375ddc-b08b-11f0-8e63-18dbf201ea17', 'Fermetures', 'Fermetures éclair et autres systèmes de fermeture', 'Pièces', '2025-10-24 03:44:50', '2025-10-24 05:37:02'),
('cb375f3b-b08b-11f0-8e63-18dbf201ea17', 'Autres Fournitures', 'Autres fournitures diverses', 'Pièces', '2025-10-24 03:44:50', '2025-11-05 15:11:10'),
('cb375fec-b08b-11f0-8e63-18dbf201ea17', 'Uniformes', 'Uniformes terminés prêts à être distribués', 'Unités', '2025-10-24 03:44:50', '2025-10-24 05:37:02');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
CREATE TABLE IF NOT EXISTS `clients` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `nom` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `telephone` (`telephone`),
  KEY `idx_nom` (`nom`),
  KEY `idx_date_creation` (`date_creation`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `nom`, `telephone`, `date_creation`, `updated_at`) VALUES
('22a33403-ba63-11f0-a515-18dbf201ea17', 'Patrick Stéphane NTA NTA', '3724949494', '2025-11-05 16:18:59', '2025-11-05 16:18:59'),
('9a05d8a4-b583-11f0-80ce-18dbf201ea17', 'zenod', '+237690909094', '2025-10-30 11:28:47', '2025-10-30 11:28:47');

-- --------------------------------------------------------

--
-- Table structure for table `commandes`
--

DROP TABLE IF EXISTS `commandes`;
CREATE TABLE IF NOT EXISTS `commandes` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `numero` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `article` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantite` int NOT NULL,
  `statut` enum('En attente','En production','Livrée','Terminée','Annulée') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `priorite` enum('Basse','Normale','Haute','Urgente') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Normale',
  `date_commande` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_livraison_prevue` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `client_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tirer_du_stock` tinyint(1) DEFAULT '0',
  `uniforme_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `idx_numero` (`numero`),
  KEY `idx_institution` (`institution`),
  KEY `idx_statut` (`statut`),
  KEY `idx_priorite` (`priorite`),
  KEY `idx_date_commande` (`date_commande`),
  KEY `idx_client_id` (`client_id`),
  KEY `fk_commandes_uniforme` (`uniforme_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `commandes`
--

INSERT INTO `commandes` (`id`, `numero`, `institution`, `article`, `quantite`, `statut`, `priorite`, `date_commande`, `date_livraison_prevue`, `created_at`, `updated_at`, `client_id`, `tirer_du_stock`, `uniforme_id`) VALUES
('38ea55bb-b8de-11f0-a515-18dbf201ea17', 'CMD-2025-0001', 'pompiers', 'Camouflés', 21, 'Livrée', 'Haute', '2025-11-03 17:55:02', '2025-11-20', '2025-11-03 17:55:02', '2025-11-05 14:23:04', '9a05d8a4-b583-11f0-80ce-18dbf201ea17', 0, NULL),
('40266372-ba50-11f0-a515-18dbf201ea17', 'CMD-2025-0004', 'pompiers', 'Camouflés', 12, 'Terminée', 'Haute', '2025-11-05 14:03:48', '2025-11-06', '2025-11-05 14:03:48', '2025-11-05 14:20:07', '9a05d8a4-b583-11f0-80ce-18dbf201ea17', 0, NULL),
('68c5cab2-b99b-11f0-a515-18dbf201ea17', 'CMD-2025-0002', 'armée', 'Camouflés', 6, 'En production', 'Haute', '2025-11-04 16:29:17', '2025-11-09', '2025-11-04 16:29:17', '2025-11-08 02:53:25', '22a33403-ba63-11f0-a515-18dbf201ea17', 0, NULL),
('93111461-b99b-11f0-a515-18dbf201ea17', 'CMD-2025-0003', 'Sapeurs-pompiers', 'Tenues claires', 19, 'Livrée', 'Normale', '2025-11-04 16:30:28', '2025-11-05', '2025-11-04 16:30:28', '2025-11-04 16:30:28', '9a05d8a4-b583-11f0-80ce-18dbf201ea17', 1, '05cbf6ec-9aed-424c-98a9-ffdd2d7cc9e6');

-- --------------------------------------------------------

--
-- Table structure for table `fournisseurs`
--

DROP TABLE IF EXISTS `fournisseurs`;
CREATE TABLE IF NOT EXISTS `fournisseurs` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `nom` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nom` (`nom`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fournisseurs`
--

INSERT INTO `fournisseurs` (`id`, `nom`, `email`, `telephone`, `adresse`, `date_creation`, `updated_at`) VALUES
('36ffe66e-b57e-11f0-80ce-18dbf201ea17', 'zeno', 'zeno@gmail.com', '+237690909090', NULL, '2025-10-30 10:50:14', '2025-10-30 10:50:14'),
('96fba3c3-b8d9-11f0-a515-18dbf201ea17', 'Patrick Stéphane NTA NTA', NULL, '+237690941163', NULL, '2025-11-03 17:21:52', '2025-11-03 17:21:52'),
('ad76fe7a-b8d9-11f0-a515-18dbf201ea17', 'SSSS', NULL, '+23456565656', NULL, '2025-11-03 17:22:30', '2025-11-03 17:22:30');

-- --------------------------------------------------------

--
-- Table structure for table `historique`
--

DROP TABLE IF EXISTS `historique`;
CREATE TABLE IF NOT EXISTS `historique` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_activite` enum('connexion','commande','stock','mouvement','utilisateur','autre') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'autre',
  `table_concernee` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utilisateur_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `utilisateur_nom` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `montant` decimal(10,2) DEFAULT NULL,
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `date_action` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_utilisateur_id` (`utilisateur_id`),
  KEY `idx_table_concernee` (`table_concernee`),
  KEY `idx_type_activite` (`type_activite`),
  KEY `idx_date_action` (`date_action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `historique`
--

INSERT INTO `historique` (`id`, `action`, `type_activite`, `table_concernee`, `record_id`, `utilisateur_id`, `utilisateur_nom`, `role`, `montant`, `details`, `date_action`) VALUES
('011c8455-b587-11f0-80ce-18dbf201ea17', 'Commande terminée - Uniforme ajouté au stock', 'commande', 'commandes', 'fb96c629-b585-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0001\",\"article\":\"Camouflee\",\"quantite\":\"10.00\",\"institution\":\"Gendarmerie\",\"uniforme_id\":\"011aa7fb-b587-11f0-80ce-18dbf201ea17\"}', '2025-10-30 11:53:09'),
('011d00a8-b587-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', 'fb96c629-b585-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Terminée\"},\"ancien_statut\":\"Annulée\"}', '2025-10-30 11:53:09'),
('01cc7515-b57f-11f0-80ce-18dbf201ea17', 'Création', 'autre', 'fournisseurs', '0', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Création du fournisseur gang', '2025-10-30 10:55:54'),
('062268f6-b8d0-11f0-a515-18dbf201ea17', 'Mouvement de stock: Entrée Externe', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Entrée Externe (Réf: EE-2025-0001) de 1 rouleaux pour Fond de poches (Fils) - Source: zeno', '2025-11-03 16:13:24'),
('07d97a36-b606-11f0-a2a3-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '9e5e2d4c-b603-11f0-a2a3-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"institution\":\"forêt\",\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\",\"article\":\"Tenue cafard\",\"quantite\":11,\"priorite\":\"Basse\",\"date_livraison_prevue\":\"2025-11-05\",\"statut\":\"En attente\"},\"ancien_statut\":\"En attente\"}', '2025-10-31 03:02:26'),
('082ccc40-bc4e-11f0-91a8-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '68c5cab2-b99b-11f0-a515-18dbf201ea17', 'admin-002', 'Administrateur Division Est', 'Administrateur', NULL, '{\"modifications\":{\"priorite\":\"Haute\"},\"ancien_statut\":\"En production\"}', '2025-11-08 02:52:57'),
('084ba175-b586-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', 'fb96c629-b585-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"En production\"},\"ancien_statut\":\"En attente\"}', '2025-10-30 11:46:11'),
('086a8682-b598-11f0-80ce-18dbf201ea17', 'Suppression de commande', 'commande', 'commandes', 'e8312f28-b592-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"commande_supprimee\":{\"id\":\"e8312f28-b592-11f0-80ce-18dbf201ea17\",\"numero\":\"CMD-2025-0003\",\"institution\":\"sapeurs-pompiers\",\"article\":\"Tenues claires\",\"quantite\":\"1.00\",\"statut\":\"Terminée\",\"priorite\":\"Normale\",\"date_commande\":\"2025-10-30T13:18:21.000Z\",\"date_livraison_prevue\":\"2025-10-30T23:00:00.000Z\",\"created_at\":\"2025-10-30T13:18:21.000Z\",\"updated_at\":\"2025-10-30T13:50:27.000Z\",\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}}', '2025-10-30 13:55:02'),
('09415f44-bc4d-11f0-91a8-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::ffff:127.0.0.1', '2025-11-08 02:45:50'),
('0a5c3a00-b598-11f0-80ce-18dbf201ea17', 'Suppression de commande', 'commande', 'commandes', 'ffb25f13-b592-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"commande_supprimee\":{\"id\":\"ffb25f13-b592-11f0-80ce-18dbf201ea17\",\"numero\":\"CMD-2025-0004\",\"institution\":\"sahel\",\"article\":\"Trei gendarmerie\",\"quantite\":\"1.00\",\"statut\":\"Livrée\",\"priorite\":\"Normale\",\"date_commande\":\"2025-10-30T13:19:00.000Z\",\"date_livraison_prevue\":\"2025-10-30T23:00:00.000Z\",\"created_at\":\"2025-10-30T13:19:00.000Z\",\"updated_at\":\"2025-10-30T13:50:17.000Z\",\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}}', '2025-10-30 13:55:06'),
('0bc291a6-b7c7-11f0-bb55-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::1', '2025-11-02 08:36:37'),
('0c686efc-b598-11f0-80ce-18dbf201ea17', 'Suppression de commande', 'commande', 'commandes', '3334045e-b597-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"commande_supprimee\":{\"id\":\"3334045e-b597-11f0-80ce-18dbf201ea17\",\"numero\":\"CMD-TEST-001\",\"institution\":\"armée\",\"article\":\"Camouflés\",\"quantite\":\"2.00\",\"statut\":\"Terminée\",\"priorite\":\"Normale\",\"date_commande\":\"2025-10-30T13:49:05.000Z\",\"date_livraison_prevue\":null,\"created_at\":\"2025-10-30T13:49:05.000Z\",\"updated_at\":\"2025-10-30T13:50:10.000Z\",\"client_id\":\"test-client\"}}', '2025-10-30 13:55:09'),
('0d3f5119-ba65-11f0-a515-18dbf201ea17', 'Suppression de client: DDKDKKDD', '', 'clients', '366d0af8-ba63-11f0-a515-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Client supprimé - Nom: DDKDKKDD, Téléphone: 237010101', '2025-11-05 16:32:42'),
('0de1688f-b586-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', 'fb96c629-b585-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Livrée\"},\"ancien_statut\":\"En production\"}', '2025-10-30 11:46:21'),
('0e85b424-ba63-11f0-a515-18dbf201ea17', 'Suppression de client: rrrrrrr', '', 'clients', 'e71c1ea3-b8e3-11f0-a515-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Client supprimé - Nom: rrrrrrr, Téléphone: +23456565656', '2025-11-05 16:18:25'),
('1347e739-b593-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', 'ae514f32-b592-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Livrée\"},\"ancien_statut\":\"En attente\"}', '2025-10-30 13:19:33'),
('15b222d4-bc4d-11f0-91a8-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-002', 'Administrateur Division Est', NULL, NULL, 'Connexion depuis ::1', '2025-11-08 02:46:11'),
('175865f1-b7d6-11f0-bb55-18dbf201ea17', 'Mouvement de stock: Entrée Interne', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Entrée Interne (Réf: EI-2025-0004) - Commande CMD-2025-0004 terminée: 1 Trei gendarmerie pour armée', '2025-11-02 10:24:19'),
('185824b7-baec-11f0-bd24-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::1', '2025-11-06 08:39:23'),
('18a6cf81-bc4e-11f0-91a8-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '68c5cab2-b99b-11f0-a515-18dbf201ea17', 'admin-002', 'Administrateur Division Est', 'Administrateur', NULL, '{\"modifications\":{\"institution\":\"armée\",\"article\":\"Camouflés\",\"quantite\":6,\"priorite\":\"Haute\",\"date_livraison_prevue\":\"2025-11-09\",\"client_id\":\"22a33403-ba63-11f0-a515-18dbf201ea17\",\"tirer_du_stock\":false,\"statut\":\"En production\"},\"ancien_statut\":\"En production\"}', '2025-11-08 02:53:25'),
('1dcc60ff-b713-11f0-ba1b-18dbf201ea17', 'Commande terminée - Entrée Interne automatique', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0005\",\"article\":\"Tenue cafard\",\"quantite\":15,\"institution\":\"forêt\",\"uniforme_id\":\"1dc99c95-b713-11f0-ba1b-18dbf201ea17\"}', '2025-11-01 11:08:38'),
('1dcd42e7-b713-11f0-ba1b-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '9e5e2d4c-b603-11f0-a2a3-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Terminée\"},\"ancien_statut\":\"En attente\"}', '2025-11-01 11:08:38'),
('22a71ae9-ba63-11f0-a515-18dbf201ea17', 'Création de client: Patrick Stéphane NTA NTA', '', 'clients', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Client Patrick Stéphane NTA NTA créé - Téléphone: 3724949494', '2025-11-05 16:18:59'),
('23c5b281-ba77-11f0-8531-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::1', '2025-11-05 18:42:11'),
('2892f028-ba1c-11f0-a515-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-002', 'Administrateur Division Est', NULL, NULL, 'Connexion depuis ::1', '2025-11-05 07:50:55'),
('29e6fa25-ba5c-11f0-a515-18dbf201ea17', 'Génération de rapport stocks', '', 'rapports', NULL, 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Rapport stocks généré avec 3 éléments. Filtres: {\"type\":\"Matières premières\",\"catégorie\":\"Toutes\",\"recherche\":\"-\",\"nombre d\'articles\":\"3\"}', '2025-11-05 15:29:05'),
('29ee543f-ba5c-11f0-a515-18dbf201ea17', 'Téléchargement de rapport: rapport-stocks-2025-11-05T15-29-04-943Z.html', '', 'rapports', NULL, 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Téléchargement du fichier rapport-stocks-2025-11-05T15-29-04-943Z.html', '2025-11-05 15:29:05'),
('33408e0c-b594-11f0-80ce-18dbf201ea17', 'Commande terminée - Uniforme ajouté au stock', 'commande', 'commandes', 'ffb25f13-b592-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0004\",\"article\":\"Trei gendarmerie\",\"quantite\":\"1.00\",\"institution\":\"sahel\",\"uniforme_id\":\"333ed5a8-b594-11f0-80ce-18dbf201ea17\"}', '2025-10-30 13:27:36'),
('3340d35e-b594-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', 'ffb25f13-b592-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Terminée\"},\"ancien_statut\":\"Livrée\"}', '2025-10-30 13:27:36'),
('366eaf63-ba63-11f0-a515-18dbf201ea17', 'Création de client: DDKDKKDD', '', 'clients', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Client DDKDKKDD créé - Téléphone: 237010101', '2025-11-05 16:19:32'),
('3702475d-b57e-11f0-80ce-18dbf201ea17', 'Création', 'autre', 'fournisseurs', '0', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Création du fournisseur zeno', '2025-10-30 10:50:14'),
('38ebfa16-b8de-11f0-a515-18dbf201ea17', 'Création de commande', 'commande', 'commandes', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"numero\":\"CMD-2025-0001\",\"institution\":\"pompiers\",\"article\":\"Camouflés\",\"quantite\":21,\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}', '2025-11-03 17:55:02'),
('3ae5d998-b598-11f0-80ce-18dbf201ea17', 'Création de commande', 'commande', 'commandes', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"numero\":\"CMD-2025-0001\",\"institution\":\"forêt\",\"article\":\"Camouflés\",\"quantite\":1,\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}', '2025-10-30 13:56:27'),
('3c3f4d39-b597-11f0-80ce-18dbf201ea17', 'Livraison commande - Sortie Externe automatique', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0003\",\"article\":\"Tenues claires\",\"quantite\":\"1.00\",\"institution\":\"sapeurs-pompiers\",\"type_mouvement\":\"Sortie Externe\"}', '2025-10-30 13:49:20'),
('3c402c04-b597-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', 'e8312f28-b592-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Livrée\"},\"ancien_statut\":\"En attente\"}', '2025-10-30 13:49:20'),
('40293691-ba50-11f0-a515-18dbf201ea17', 'Création de commande', 'commande', 'commandes', '0', 'admin-002', 'Administrateur Division Est', 'Administrateur', 0.00, '{\"numero\":\"CMD-2025-0004\",\"institution\":\"pompiers\",\"article\":\"Camouflés\",\"quantite\":12,\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}', '2025-11-05 14:03:48'),
('4410f7d9-b8e5-11f0-a515-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::1', '2025-11-03 18:45:27'),
('4a4a4384-b7ca-11f0-bb55-18dbf201ea17', 'Mouvement de stock: Sortie Interne', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Sortie Interne (Réf: SI-2025-0001) de 1 Mètres pour Fond de poches - Destination: aaa', '2025-11-02 08:59:50'),
('4e88617c-b86b-11f0-bb55-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::1', '2025-11-03 04:12:26'),
('5040b68c-b586-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', 'fb96c629-b585-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Annulée\"},\"ancien_statut\":\"Livrée\"}', '2025-10-30 11:48:12'),
('53e79598-b597-11f0-80ce-18dbf201ea17', 'Suppression de commande', 'commande', 'commandes', 'ae514f32-b592-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"commande_supprimee\":{\"id\":\"ae514f32-b592-11f0-80ce-18dbf201ea17\",\"numero\":\"CMD-2025-0002\",\"institution\":\"armée\",\"article\":\"Camouflés\",\"quantite\":\"1.00\",\"statut\":\"Livrée\",\"priorite\":\"Normale\",\"date_commande\":\"2025-10-30T13:16:44.000Z\",\"date_livraison_prevue\":null,\"created_at\":\"2025-10-30T13:16:44.000Z\",\"updated_at\":\"2025-10-30T13:21:31.000Z\",\"client_id\":\"test\"}}', '2025-10-30 13:50:00'),
('56997cdd-b593-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', 'ae514f32-b592-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"En attente\"},\"ancien_statut\":\"Livrée\"}', '2025-10-30 13:21:26'),
('59ce81ca-b593-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', 'ae514f32-b592-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Livrée\"},\"ancien_statut\":\"En attente\"}', '2025-10-30 13:21:32'),
('59d7cdaf-b597-11f0-80ce-18dbf201ea17', 'Commande terminée - Uniforme ajouté au stock', 'commande', 'commandes', '3334045e-b597-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"commande_numero\":\"CMD-TEST-001\",\"article\":\"Camouflés\",\"quantite\":\"2.00\",\"institution\":\"armée\",\"uniforme_id\":\"59d6731a-b597-11f0-80ce-18dbf201ea17\"}', '2025-10-30 13:50:10'),
('59d81fc0-b597-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '3334045e-b597-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Terminée\"},\"ancien_statut\":\"Livrée\"}', '2025-10-30 13:50:10'),
('5e015311-b597-11f0-80ce-18dbf201ea17', 'Livraison commande - Sortie Externe automatique', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0004\",\"article\":\"Trei gendarmerie\",\"quantite\":\"1.00\",\"institution\":\"sahel\",\"type_mouvement\":\"Sortie Externe\"}', '2025-10-30 13:50:17'),
('5e029a27-b597-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', 'ffb25f13-b592-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Livrée\"},\"ancien_statut\":\"Terminée\"}', '2025-10-30 13:50:17'),
('5e256a83-ba27-11f0-a515-18dbf201ea17', 'Déconnexion', 'autre', 'sessions', NULL, 'admin-002', 'Administrateur Division Est', NULL, NULL, 'Déconnexion manuelle', '2025-11-05 09:11:09'),
('5fa4d748-b7c3-11f0-bb55-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::ffff:127.0.0.1', '2025-11-02 08:10:19'),
('5ff0c940-b7de-11f0-bb55-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::1', '2025-11-02 11:23:36'),
('618a0ab0-b598-11f0-80ce-18dbf201ea17', 'Commande terminée - Entrée Interne automatique', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0001\",\"article\":\"Camouflés\",\"quantite\":\"1.00\",\"institution\":\"forêt\",\"uniforme_id\":\"618940ad-b598-11f0-80ce-18dbf201ea17\"}', '2025-10-30 13:57:32'),
('618b279e-b598-11f0-80ce-18dbf201ea17', 'Commande terminée - Uniforme ajouté au stock', 'commande', 'commandes', '3ae572ff-b598-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0001\",\"article\":\"Camouflés\",\"quantite\":\"1.00\",\"institution\":\"forêt\",\"uniforme_id\":\"618940ad-b598-11f0-80ce-18dbf201ea17\"}', '2025-10-30 13:57:32'),
('618b5ef8-b598-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '3ae572ff-b598-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Terminée\"},\"ancien_statut\":\"En attente\"}', '2025-10-30 13:57:32'),
('63fc186e-b597-11f0-80ce-18dbf201ea17', 'Commande terminée - Uniforme ajouté au stock', 'commande', 'commandes', 'e8312f28-b592-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0003\",\"article\":\"Tenues claires\",\"quantite\":\"1.00\",\"institution\":\"sapeurs-pompiers\",\"uniforme_id\":\"63fb07a4-b597-11f0-80ce-18dbf201ea17\"}', '2025-10-30 13:50:27'),
('63fc8991-b597-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', 'e8312f28-b592-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Terminée\"},\"ancien_statut\":\"Livrée\"}', '2025-10-30 13:50:27'),
('68c6b2bc-b99b-11f0-a515-18dbf201ea17', 'Création de commande', 'commande', 'commandes', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"numero\":\"CMD-2025-0002\",\"institution\":\"armée\",\"article\":\"Camouflés\",\"quantite\":6,\"client_id\":\"e71c1ea3-b8e3-11f0-a515-18dbf201ea17\"}', '2025-11-04 16:29:17'),
('69febc3f-b597-11f0-80ce-18dbf201ea17', 'Livraison commande - Sortie Externe automatique', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0001\",\"article\":\"Camouflee\",\"quantite\":\"10.00\",\"institution\":\"Gendarmerie\",\"type_mouvement\":\"Sortie Externe\"}', '2025-10-30 13:50:37'),
('69ff51ca-b597-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', 'fb96c629-b585-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Livrée\"},\"ancien_statut\":\"Terminée\"}', '2025-10-30 13:50:37'),
('6b3d37d2-ba4d-11f0-a515-18dbf201ea17', 'Déconnexion', 'autre', 'sessions', NULL, 'admin-002', 'Administrateur Division Est', NULL, NULL, 'Déconnexion manuelle', '2025-11-05 13:43:32'),
('6d91dd4b-b598-11f0-80ce-18dbf201ea17', 'Suppression de mouvement', 'mouvement', 'mouvements', '618aefca-b598-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Suppression: Entrée Interne de 1.00 unités pour Camouflés', '2025-10-30 13:57:52'),
('70dd052a-b603-11f0-a2a3-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '98d04a09-b5ff-11f0-a2a3-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"institution\":\"armée\",\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\",\"article\":\"Trei gendarmerie\",\"quantite\":1,\"priorite\":\"Urgente\",\"date_livraison_prevue\":\"2025-11-08\",\"statut\":\"En attente\"},\"ancien_statut\":\"En attente\"}', '2025-10-31 02:43:54'),
('71773285-ba46-11f0-a515-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::1', '2025-11-05 12:53:36'),
('7703f494-ba64-11f0-a515-18dbf201ea17', 'Suppression de fournisseur: gang', '', 'fournisseurs', '01caf2fd-b57f-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Fournisseur supprimé - Nom: gang, Téléphone: +237690909094', '2025-11-05 16:28:30'),
('7a6e75ec-b597-11f0-80ce-18dbf201ea17', 'Suppression de commande', 'commande', 'commandes', 'fb96c629-b585-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"commande_supprimee\":{\"id\":\"fb96c629-b585-11f0-80ce-18dbf201ea17\",\"numero\":\"CMD-2025-0001\",\"institution\":\"Gendarmerie\",\"article\":\"Camouflee\",\"quantite\":\"10.00\",\"statut\":\"Livrée\",\"priorite\":\"Haute\",\"date_commande\":\"2025-10-30T11:45:50.000Z\",\"date_livraison_prevue\":\"2025-10-30T23:00:00.000Z\",\"created_at\":\"2025-10-30T11:45:50.000Z\",\"updated_at\":\"2025-10-30T13:50:37.000Z\",\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}}', '2025-10-30 13:51:04'),
('7d89e2c3-b598-11f0-80ce-18dbf201ea17', 'Livraison commande - Sortie Externe automatique', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0001\",\"article\":\"Camouflés\",\"quantite\":\"1.00\",\"institution\":\"forêt\"}', '2025-10-30 13:58:19'),
('7d8c3320-b598-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '3ae572ff-b598-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Livrée\"},\"ancien_statut\":\"Terminée\"}', '2025-10-30 13:58:19'),
('7e559958-b59a-11f0-80ce-18dbf201ea17', 'Suppression de mouvement', 'mouvement', 'mouvements', '91fd961b-b599-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Suppression: Entrée Interne de 2.00 unités pour Vareuse', '2025-10-30 14:12:39'),
('809da5b5-b59a-11f0-80ce-18dbf201ea17', 'Suppression de mouvement', 'mouvement', 'mouvements', 'd7f16702-b599-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Suppression: Entrée Interne de 50.00 unités pour Vareuse', '2025-10-30 14:12:43'),
('83a2b2d4-ba5c-11f0-a515-18dbf201ea17', 'Génération de rapport stocks', '', 'rapports', NULL, 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Rapport stocks généré avec 2 éléments. Filtres: {\"type\":\"Uniformes finis\",\"catégorie\":\"Toutes\",\"recherche\":\"-\",\"nombre d\'articles\":\"2\"}', '2025-11-05 15:31:35'),
('83a6586d-ba5c-11f0-a515-18dbf201ea17', 'Téléchargement de rapport: rapport-stocks-2025-11-05T15-31-35-648Z.html', '', 'rapports', NULL, 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Téléchargement du fichier rapport-stocks-2025-11-05T15-31-35-648Z.html', '2025-11-05 15:31:35'),
('873727d7-ba4d-11f0-a515-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-002', 'Administrateur Division Est', NULL, NULL, 'Connexion depuis ::ffff:127.0.0.1', '2025-11-05 13:44:19'),
('876f6ec2-ba52-11f0-a515-18dbf201ea17', 'Commande terminée - Entrée Interne automatique', 'mouvement', 'mouvements', '0', 'admin-002', 'Administrateur Division Est', 'Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0004\",\"article\":\"Camouflés\",\"quantite\":12,\"institution\":\"pompiers\",\"uniforme_id\":\"876e26fd-ba52-11f0-a515-18dbf201ea17\"}', '2025-11-05 14:20:07'),
('8770582f-ba52-11f0-a515-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '40266372-ba50-11f0-a515-18dbf201ea17', 'admin-002', 'Administrateur Division Est', 'Administrateur', NULL, '{\"modifications\":{\"statut\":\"Terminée\"},\"ancien_statut\":\"En attente\"}', '2025-11-05 14:20:07'),
('8963e093-b86b-11f0-bb55-18dbf201ea17', 'Suppression d\'article: Vareuse', '', 'articles', '91fd280e-b599-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Article supprimé - Nom: Vareuse, Catégorie: Uniformes, Institution: gendarmerie', '2025-11-03 04:14:05'),
('8bd83ea8-b599-11f0-80ce-18dbf201ea17', 'Création de commande', 'commande', 'commandes', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"numero\":\"CMD-2025-0002\",\"institution\":\"gendarmerie\",\"article\":\"Vareuse\",\"quantite\":2,\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}', '2025-10-30 14:05:52'),
('8cacdfc6-ba64-11f0-a515-18dbf201ea17', 'Création de fournisseur: Patrick Stéphan', '', 'fournisseurs', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Fournisseur Patrick Stéphan créé - Téléphone: 3724949494, Email: admin@mboaservices.com', '2025-11-05 16:29:06'),
('8d96c3a4-b86b-11f0-bb55-18dbf201ea17', 'Suppression d\'article: Fond de poches', '', 'articles', 'c0d9ea5a-6aac-4a4b-9769-ebeab65be88c', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Article supprimé - Nom: Fond de poches, Catégorie: Tissus, Institution: pompiers', '2025-11-03 04:14:12'),
('91fe7dcc-b599-11f0-80ce-18dbf201ea17', 'Commande terminée - Entrée Interne automatique', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0002\",\"article\":\"Vareuse\",\"quantite\":\"2.00\",\"institution\":\"gendarmerie\",\"uniforme_id\":\"91fd280e-b599-11f0-80ce-18dbf201ea17\"}', '2025-10-30 14:06:03'),
('9200334b-b599-11f0-80ce-18dbf201ea17', 'Commande terminée - Uniforme ajouté au stock', 'commande', 'commandes', '8bd728db-b599-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0002\",\"article\":\"Vareuse\",\"quantite\":\"2.00\",\"institution\":\"gendarmerie\",\"uniforme_id\":\"91fd280e-b599-11f0-80ce-18dbf201ea17\"}', '2025-10-30 14:06:03'),
('92020278-b599-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '8bd728db-b599-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Terminée\"},\"ancien_statut\":\"En attente\"}', '2025-10-30 14:06:03'),
('923607eb-b59a-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '8bd728db-b599-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"En attente\"},\"ancien_statut\":\"Terminée\"}', '2025-10-30 14:13:13'),
('93145a78-b99b-11f0-a515-18dbf201ea17', 'Création de commande (tirage du stock) - Livrée', 'commande', 'commandes', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"numero\":\"CMD-2025-0003\",\"institution\":\"Sapeurs-pompiers\",\"article\":\"Tenues claires\",\"quantite\":19,\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\",\"uniforme_id\":\"05cbf6ec-9aed-424c-98a9-ffdd2d7cc9e6\",\"tirer_du_stock\":true,\"statut\":\"Livrée\"}', '2025-11-04 16:30:28'),
('9315103d-b99b-11f0-a515-18dbf201ea17', 'Sortie externe automatique - Commande tirée du stock', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0003\",\"article\":\"Tenues claires\",\"quantite\":19,\"institution\":\"Sapeurs-pompiers\",\"uniforme_id\":\"05cbf6ec-9aed-424c-98a9-ffdd2d7cc9e6\"}', '2025-11-04 16:30:28'),
('94f0c9a3-b597-11f0-80ce-18dbf201ea17', 'Suppression de mouvement', 'mouvement', 'mouvements', '3c3d6275-b597-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Suppression: Sortie Externe de 1.00 unités pour null', '2025-10-30 13:51:49'),
('968e54cc-ba60-11f0-a515-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::1', '2025-11-05 16:00:45'),
('96edf58e-b597-11f0-80ce-18dbf201ea17', 'Suppression de mouvement', 'mouvement', 'mouvements', '59d722ae-b597-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Suppression: Entrée Interne de 2.00 unités pour Camouflés', '2025-10-30 13:51:52'),
('96fef1bc-b8d9-11f0-a515-18dbf201ea17', 'Création de fournisseur: Patrick Stéphane NTA NTA', '', 'fournisseurs', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Fournisseur Patrick Stéphane NTA NTA créé - Téléphone: +237690941163, Email: N/A', '2025-11-03 17:21:52'),
('98d323d0-b5ff-11f0-a2a3-18dbf201ea17', 'Création de commande', 'commande', 'commandes', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"numero\":\"CMD-2025-0004\",\"institution\":\"armée\",\"article\":\"Trei gendarmerie\",\"quantite\":1,\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}', '2025-10-31 02:16:23'),
('98fec0ab-b597-11f0-80ce-18dbf201ea17', 'Suppression de mouvement', 'mouvement', 'mouvements', '5e00fd3a-b597-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Suppression: Sortie Externe de 1.00 unités pour null', '2025-10-30 13:51:56'),
('9a08e1cf-b583-11f0-80ce-18dbf201ea17', 'Création', 'autre', 'clients', '0', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Création du client zenod', '2025-10-30 11:28:47'),
('9a54b567-ba64-11f0-a515-18dbf201ea17', 'Suppression de fournisseur: Patrick Stéphan', '', 'fournisseurs', '8caa2cd6-ba64-11f0-a515-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Fournisseur supprimé - Nom: Patrick Stéphan, Téléphone: 3724949494', '2025-11-05 16:29:29'),
('9b420e32-b597-11f0-80ce-18dbf201ea17', 'Suppression de mouvement', 'mouvement', 'mouvements', '63fbc49a-b597-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Suppression: Entrée Interne de 1.00 unités pour Tenues claires', '2025-10-30 13:51:59'),
('9ba12dcc-b998-11f0-a515-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::1', '2025-11-04 16:09:14'),
('9d13c766-b597-11f0-80ce-18dbf201ea17', 'Suppression de mouvement', 'mouvement', 'mouvements', '69fdb29b-b597-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Suppression: Sortie Externe de 10.00 unités pour null', '2025-10-30 13:52:02'),
('9e5ee3be-b603-11f0-a2a3-18dbf201ea17', 'Création de commande', 'commande', 'commandes', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"numero\":\"CMD-2025-0005\",\"institution\":\"forêt\",\"article\":\"Tenue cafard\",\"quantite\":1,\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}', '2025-10-31 02:45:10'),
('a0398b2a-b8da-11f0-a515-18dbf201ea17', 'Mouvement de stock: Entrée Interne', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Entrée Interne (Réf: EI-2025-0001) - Production anticipée: 60 Tenues claires pour Sapeurs-pompiers', '2025-11-03 17:29:17'),
('a2d98d13-b59a-11f0-80ce-18dbf201ea17', 'Commande terminée - Entrée Interne automatique', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0002\",\"article\":\"Vareuse\",\"quantite\":\"2.00\",\"institution\":\"gendarmerie\",\"uniforme_id\":\"91fd280e-b599-11f0-80ce-18dbf201ea17\"}', '2025-10-30 14:13:41'),
('a2db2d92-b59a-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '8bd728db-b599-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Terminée\"},\"ancien_statut\":\"En attente\"}', '2025-10-30 14:13:41'),
('a306be8d-baf5-11f0-bd24-18dbf201ea17', 'Génération rapport stocks', '', 'rapports', NULL, 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Rapport stocks généré avec 2 articles. Filtres: {\"type\":\"Uniformes finis\",\"categorie\":\"Toutes\",\"search\":\"\",\"statut\":\"Tous\",\"institution\":\"Toutes\"}', '2025-11-06 09:47:41'),
('a48f2452-baed-11f0-bd24-18dbf201ea17', 'Génération rapport stocks', '', 'rapports', NULL, 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Rapport stocks généré avec 3 articles. Filtres: {\"type\":\"Matières premières\",\"categorie\":\"Toutes\",\"search\":\"\",\"statut\":\"Tous\",\"institution\":\"Toutes\"}', '2025-11-06 08:50:27'),
('aa4f2717-b57c-11f0-80ce-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::1', '2025-10-30 10:39:08'),
('ad00d734-ba46-11f0-a515-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-002', 'Administrateur Division Est', NULL, NULL, 'Connexion depuis ::ffff:127.0.0.1', '2025-11-05 12:55:16'),
('ad78b2c0-b8d9-11f0-a515-18dbf201ea17', 'Création de fournisseur: SSSS', '', 'fournisseurs', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Fournisseur SSSS créé - Téléphone: +23456565656, Email: N/A', '2025-11-03 17:22:30'),
('ae52fd76-b592-11f0-80ce-18dbf201ea17', 'Création de commande', 'commande', 'commandes', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"numero\":\"CMD-2025-0002\",\"institution\":\"armée\",\"article\":\"Camouflés\",\"quantite\":1,\"client_id\":\"test\"}', '2025-10-30 13:16:44'),
('ae779fde-ba59-11f0-a515-18dbf201ea17', 'Mouvement de stock: Entrée Externe', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Entrée Externe (Réf: EE-2025-0003) de 17 cartons pour Gros grains (Autres Fournitures) - Source: Patrick Stéphane NTA NTA', '2025-11-05 15:11:19'),
('b14f0985-b7d1-11f0-bb55-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '98d04a09-b5ff-11f0-a2a3-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"En production\"},\"ancien_statut\":\"En attente\"}', '2025-11-02 09:52:49'),
('b5ae76b4-ba5b-11f0-a515-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::1', '2025-11-05 15:25:50'),
('b8cafbc0-b7c9-11f0-bb55-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::1', '2025-11-02 08:55:46'),
('b9229e29-baed-11f0-bd24-18dbf201ea17', 'Génération rapport mouvements', '', 'rapports', NULL, 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Rapport mouvements généré avec 8 entrées. Filtres: {\"type\":\"Tous les types\",\"nombre_mouvements\":\"8\",\"periode\":\"Toutes les dates\"}', '2025-11-06 08:51:02'),
('b9f53cfe-b601-11f0-a2a3-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::1', '2025-10-31 02:31:37'),
('bcde659c-ba60-11f0-a515-18dbf201ea17', 'Génération de rapport stocks', '', 'rapports', NULL, 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Rapport stocks généré avec 3 éléments. Filtres: {\"type\":\"Matières premières\",\"catégorie\":\"Toutes\",\"recherche\":\"-\",\"nombre d\'articles\":\"3\"}', '2025-11-05 16:01:49'),
('bd214223-ba60-11f0-a515-18dbf201ea17', 'Téléchargement de rapport: rapport-stocks-2025-11-05T16-01-49-290Z.html', '', 'rapports', NULL, 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Téléchargement du fichier rapport-stocks-2025-11-05T16-01-49-290Z.html', '2025-11-05 16:01:49'),
('c2a17bcb-bc5e-11f0-91a8-18dbf201ea17', 'Déconnexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Déconnexion manuelle', '2025-11-08 04:52:42'),
('c992cadb-b599-11f0-80ce-18dbf201ea17', 'Création de commande', 'commande', 'commandes', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"numero\":\"CMD-2025-0003\",\"institution\":\"gendarmerie\",\"article\":\"Vareuse\",\"quantite\":50,\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}', '2025-10-30 14:07:36'),
('cab975ce-bc52-11f0-91a8-18dbf201ea17', 'Génération rapport commandes', '', 'rapports', NULL, 'admin-002', 'Administrateur Division Est', 'Administrateur', NULL, 'Rapport commandes généré avec 3 entrées. Filtres: {\"statut\":\"Tous\",\"institution\":\"Toutes\",\"priorite\":\"Toutes\",\"nombre_commandes\":\"3\",\"start_date\":\"\",\"end_date\":\"2025-11-04\"}', '2025-11-08 03:27:02'),
('cbf2b727-baed-11f0-bd24-18dbf201ea17', 'Génération rapport commandes', '', 'rapports', NULL, 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Rapport commandes généré avec 4 entrées. Filtres: {\"statut\":\"Tous\",\"institution\":\"Toutes\",\"priorite\":\"Toutes\",\"nombre_commandes\":\"4\",\"start_date\":\"\",\"end_date\":\"\"}', '2025-11-06 08:51:34'),
('cfcf938c-ba68-11f0-a515-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::ffff:127.0.0.1', '2025-11-05 16:59:37'),
('d09bef1e-b86a-11f0-bb55-18dbf201ea17', 'Suppression de mouvement', 'mouvement', 'mouvements', '7d89a392-b598-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Suppression: Sortie Externe (Réf: CMD-2025-0001) de 1.00 unités pour null', '2025-11-03 04:08:55'),
('d14dbb84-b7c9-11f0-bb55-18dbf201ea17', 'Mouvement de stock: Entrée Externe', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Entrée Externe (Réf: EE-2025-0001) de 2 rouleaux pour Fond de poches (Tissus) - Source: gang', '2025-11-02 08:56:27'),
('d30b2003-b86a-11f0-bb55-18dbf201ea17', 'Suppression de mouvement', 'mouvement', 'mouvements', 'd7ef1b24-b599-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Suppression: Entrée Interne (Réf: CMD-2025-0003) de 50.00 unités pour Vareuse', '2025-11-03 04:08:59'),
('d5fd05fe-ba74-11f0-8531-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::1', '2025-11-05 18:25:41'),
('d67983e8-b8d9-11f0-a515-18dbf201ea17', 'Mouvement de stock: Entrée Externe', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Entrée Externe (Réf: EE-2025-0002) de 15 rouleaux pour Fond de poches (Tissus) - Source: SSSS', '2025-11-03 17:23:39'),
('d6b0c077-b8dd-11f0-a515-18dbf201ea17', 'Mouvement de stock: Sortie Interne', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Sortie Interne (Réf: SI-2025-0001) de 7 rouleaux pour Fond de poches - Destination: ddd', '2025-11-03 17:52:17'),
('d6e1bc6c-ba60-11f0-a515-18dbf201ea17', 'Génération de rapport mouvements', '', 'rapports', NULL, 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Rapport mouvements généré avec 8 éléments. Filtres: {\"type\":\"Tous les types\"}', '2025-11-05 16:02:33'),
('d6e58c05-ba60-11f0-a515-18dbf201ea17', 'Téléchargement de rapport: rapport-mouvements-2025-11-05T16-02-33-283Z.html', '', 'rapports', NULL, 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Téléchargement du fichier rapport-mouvements-2025-11-05T16-02-33-283Z.html', '2025-11-05 16:02:33'),
('d75d47ff-b86a-11f0-bb55-18dbf201ea17', 'Suppression de mouvement', 'mouvement', 'mouvements', 'a2d946ea-b59a-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Suppression: Entrée Interne (Réf: CMD-2025-0002) de 2.00 unités pour Vareuse', '2025-11-03 04:09:06'),
('d7eff339-b599-11f0-80ce-18dbf201ea17', 'Commande terminée - Entrée Interne automatique', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0003\",\"article\":\"Vareuse\",\"quantite\":\"50.00\",\"institution\":\"gendarmerie\",\"uniforme_id\":\"91fd280e-b599-11f0-80ce-18dbf201ea17\"}', '2025-10-30 14:08:00'),
('d7f19cef-b599-11f0-80ce-18dbf201ea17', 'Commande terminée - Uniforme ajouté au stock', 'commande', 'commandes', 'c992a7d9-b599-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0003\",\"article\":\"Vareuse\",\"quantite\":\"50.00\",\"institution\":\"gendarmerie\",\"uniforme_id\":\"91fd280e-b599-11f0-80ce-18dbf201ea17\"}', '2025-10-30 14:08:00'),
('d7f207b5-b599-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', 'c992a7d9-b599-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Terminée\"},\"ancien_statut\":\"En attente\"}', '2025-10-30 14:08:00'),
('d80ffb90-b593-11f0-80ce-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', 'ffb25f13-b592-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"Livrée\"},\"ancien_statut\":\"En attente\"}', '2025-10-30 13:25:03'),
('d8f88578-b607-11f0-a2a3-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '9e5e2d4c-b603-11f0-a2a3-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"institution\":\"forêt\",\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\",\"article\":\"Tenue cafard\",\"quantite\":15,\"priorite\":\"Basse\",\"date_livraison_prevue\":\"2025-11-08\",\"statut\":\"En attente\"},\"ancien_statut\":\"En attente\"}', '2025-10-31 03:15:26'),
('da0ab376-b86a-11f0-bb55-18dbf201ea17', 'Suppression de mouvement', 'mouvement', 'mouvements', '1dcc005e-b713-11f0-ba1b-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Suppression: Entrée Interne (Réf: CMD-2025-0005) de 15.00 unités pour Tenue cafard', '2025-11-03 04:09:11'),
('db831da2-b8d7-11f0-a515-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::1', '2025-11-03 17:09:28'),
('dbf16157-ba52-11f0-a515-18dbf201ea17', 'Commande terminée - Entrée Interne automatique', 'mouvement', 'mouvements', '0', 'admin-002', 'Administrateur Division Est', 'Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0001\",\"article\":\"Camouflés\",\"quantite\":21,\"institution\":\"pompiers\",\"uniforme_id\":\"876e26fd-ba52-11f0-a515-18dbf201ea17\"}', '2025-11-05 14:22:28'),
('dbf1c45b-ba52-11f0-a515-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '38ea55bb-b8de-11f0-a515-18dbf201ea17', 'admin-002', 'Administrateur Division Est', 'Administrateur', NULL, '{\"modifications\":{\"statut\":\"Terminée\"},\"ancien_statut\":\"En attente\"}', '2025-11-05 14:22:28'),
('dc930684-b86a-11f0-bb55-18dbf201ea17', 'Suppression de mouvement', 'mouvement', 'mouvements', 'd14d63db-b7c9-11f0-bb55-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Suppression: Entrée Externe (Réf: EE-2025-0001) de 2.00 unités pour Fond de poches', '2025-11-03 04:09:15'),
('df49cb5c-b86a-11f0-bb55-18dbf201ea17', 'Suppression de mouvement', 'mouvement', 'mouvements', '4a494ff0-b7ca-11f0-bb55-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Suppression: Sortie Interne (Réf: SI-2025-0001) de 1.00 unités pour Fond de poches', '2025-11-03 04:09:20'),
('e1954b17-b86a-11f0-bb55-18dbf201ea17', 'Suppression de mouvement', 'mouvement', 'mouvements', 'eb9c3114-b7d1-11f0-bb55-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Suppression: Sortie Externe (Réf: SE-2025-0002) de 50.00 unités pour Vareuse', '2025-11-03 04:09:23'),
('e480d6e4-b86a-11f0-bb55-18dbf201ea17', 'Suppression de mouvement', 'mouvement', 'mouvements', '1757893a-b7d6-11f0-bb55-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Suppression: Entrée Interne (Réf: EI-2025-0004) de 1.00 unités pour Trei gendarmerie', '2025-11-03 04:09:28'),
('e55eb561-ba60-11f0-a515-18dbf201ea17', 'Génération de rapport commandes', '', 'rapports', NULL, 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Rapport commandes généré avec 4 éléments. Filtres: {\"statut\":\"Tous\",\"institution\":\"Toutes\"}', '2025-11-05 16:02:57'),
('e5631da1-ba60-11f0-a515-18dbf201ea17', 'Téléchargement de rapport: rapport-commandes-2025-11-05T16-02-57-576Z.html', '', 'rapports', NULL, 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Téléchargement du fichier rapport-commandes-2025-11-05T16-02-57-576Z.html', '2025-11-05 16:02:57'),
('e71dd127-b8e3-11f0-a515-18dbf201ea17', 'Création de client: rrrrrrr', '', 'clients', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Client rrrrrrr créé - Téléphone: +23456565656', '2025-11-03 18:35:42'),
('e831f37a-b592-11f0-80ce-18dbf201ea17', 'Création de commande', 'commande', 'commandes', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"numero\":\"CMD-2025-0003\",\"institution\":\"sapeurs-pompiers\",\"article\":\"Tenues claires\",\"quantite\":1,\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}', '2025-10-30 13:18:21'),
('e90e130b-b9a6-11f0-a515-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '68c5cab2-b99b-11f0-a515-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"modifications\":{\"statut\":\"En production\"},\"ancien_statut\":\"En attente\"}', '2025-11-04 17:51:37'),
('eb9d9f92-b7d1-11f0-bb55-18dbf201ea17', 'Mouvement de stock: Sortie Externe', 'mouvement', 'mouvements', '0', 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Sortie Externe (Réf: SE-2025-0002) - Commande CMD-2025-0003 livrée: 50 Vareuse pour gendarmerie', '2025-11-02 09:54:27'),
('ef5370cf-b86a-11f0-bb55-18dbf201ea17', 'Suppression de commande', 'commande', 'commandes', '3ae572ff-b598-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"commande_supprimee\":{\"id\":\"3ae572ff-b598-11f0-80ce-18dbf201ea17\",\"numero\":\"CMD-2025-0001\",\"institution\":\"forêt\",\"article\":\"Camouflés\",\"quantite\":1,\"statut\":\"Livrée\",\"priorite\":\"Normale\",\"date_commande\":\"2025-10-30T13:56:27.000Z\",\"date_livraison_prevue\":\"2025-10-30T23:00:00.000Z\",\"created_at\":\"2025-10-30T13:56:27.000Z\",\"updated_at\":\"2025-10-30T13:58:19.000Z\",\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}}', '2025-11-03 04:09:46'),
('f1027188-ba52-11f0-a515-18dbf201ea17', 'Livraison commande - Sortie Externe automatique', 'mouvement', 'mouvements', '0', 'admin-002', 'Administrateur Division Est', 'Administrateur', 0.00, '{\"commande_numero\":\"CMD-2025-0001\",\"article\":\"Camouflés\",\"quantite\":21,\"institution\":\"pompiers\"}', '2025-11-05 14:23:04'),
('f10aa915-ba52-11f0-a515-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '38ea55bb-b8de-11f0-a515-18dbf201ea17', 'admin-002', 'Administrateur Division Est', 'Administrateur', NULL, '{\"modifications\":{\"statut\":\"Livrée\"},\"ancien_statut\":\"Terminée\"}', '2025-11-05 14:23:04'),
('f1d06ad0-b86a-11f0-bb55-18dbf201ea17', 'Suppression de commande', 'commande', 'commandes', '8bd728db-b599-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"commande_supprimee\":{\"id\":\"8bd728db-b599-11f0-80ce-18dbf201ea17\",\"numero\":\"CMD-2025-0002\",\"institution\":\"gendarmerie\",\"article\":\"Vareuse\",\"quantite\":2,\"statut\":\"Terminée\",\"priorite\":\"Normale\",\"date_commande\":\"2025-10-30T14:05:52.000Z\",\"date_livraison_prevue\":\"2025-10-30T23:00:00.000Z\",\"created_at\":\"2025-10-30T14:05:52.000Z\",\"updated_at\":\"2025-10-30T14:13:41.000Z\",\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}}', '2025-11-03 04:09:51'),
('f3d9fc6e-b86a-11f0-bb55-18dbf201ea17', 'Suppression de commande', 'commande', 'commandes', 'c992a7d9-b599-11f0-80ce-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"commande_supprimee\":{\"id\":\"c992a7d9-b599-11f0-80ce-18dbf201ea17\",\"numero\":\"CMD-2025-0003\",\"institution\":\"gendarmerie\",\"article\":\"Vareuse\",\"quantite\":50,\"statut\":\"Livrée\",\"priorite\":\"Normale\",\"date_commande\":\"2025-10-30T14:07:36.000Z\",\"date_livraison_prevue\":\"2025-10-30T23:00:00.000Z\",\"created_at\":\"2025-10-30T14:07:36.000Z\",\"updated_at\":\"2025-11-02T09:54:27.000Z\",\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}}', '2025-11-03 04:09:54'),
('f63617c4-b86a-11f0-bb55-18dbf201ea17', 'Suppression de commande', 'commande', 'commandes', '98d04a09-b5ff-11f0-a2a3-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"commande_supprimee\":{\"id\":\"98d04a09-b5ff-11f0-a2a3-18dbf201ea17\",\"numero\":\"CMD-2025-0004\",\"institution\":\"armée\",\"article\":\"Trei gendarmerie\",\"quantite\":1,\"statut\":\"Terminée\",\"priorite\":\"Urgente\",\"date_commande\":\"2025-10-31T02:16:23.000Z\",\"date_livraison_prevue\":\"2025-11-07T23:00:00.000Z\",\"created_at\":\"2025-10-31T02:16:23.000Z\",\"updated_at\":\"2025-11-02T10:24:19.000Z\",\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}}', '2025-11-03 04:09:58');
INSERT INTO `historique` (`id`, `action`, `type_activite`, `table_concernee`, `record_id`, `utilisateur_id`, `utilisateur_nom`, `role`, `montant`, `details`, `date_action`) VALUES
('f842b069-b7c9-11f0-bb55-18dbf201ea17', 'Modification d\'article: Fond de poches', '', 'articles', 'c0d9ea5a-6aac-4a4b-9769-ebeab65be88c', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Modifications: nom: Fond de poches → Fond de poches, categorie: Tissus → Tissus, institution: MINDEF → pompiers, quantite: 2.00 → 2.00, unite_mesure: rouleaux → Mètres, type: matiere_premiere → matiere_premiere', '2025-11-02 08:57:32'),
('f8595162-b86a-11f0-bb55-18dbf201ea17', 'Suppression de commande', 'commande', 'commandes', '9e5e2d4c-b603-11f0-a2a3-18dbf201ea17', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, '{\"commande_supprimee\":{\"id\":\"9e5e2d4c-b603-11f0-a2a3-18dbf201ea17\",\"numero\":\"CMD-2025-0005\",\"institution\":\"forêt\",\"article\":\"Tenue cafard\",\"quantite\":15,\"statut\":\"Terminée\",\"priorite\":\"Basse\",\"date_commande\":\"2025-10-31T02:45:10.000Z\",\"date_livraison_prevue\":\"2025-11-07T23:00:00.000Z\",\"created_at\":\"2025-10-31T02:45:10.000Z\",\"updated_at\":\"2025-11-01T11:08:38.000Z\",\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}}', '2025-11-03 04:10:02'),
('f8f696d7-b59b-11f0-80ce-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::1', '2025-10-30 14:23:14'),
('f93ce37c-bc55-11f0-91a8-18dbf201ea17', 'Génération rapport stocks', '', 'rapports', NULL, 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', NULL, 'Rapport stocks généré avec 3 articles. Filtres: {\"type\":\"Matières premières\",\"categorie\":\"Toutes\",\"search\":\"\",\"statut\":\"Tous\",\"institution\":\"Toutes\"}', '2025-11-08 03:49:48'),
('fb981d15-b585-11f0-80ce-18dbf201ea17', 'Création de commande', 'commande', 'commandes', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"numero\":\"CMD-2025-0001\",\"institution\":\"Gendarmerie\",\"article\":\"Camouflee\",\"quantite\":10,\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}', '2025-10-30 11:45:50'),
('fc7f35ea-bc4d-11f0-91a8-18dbf201ea17', 'Modification de commande', 'commande', 'commandes', '68c5cab2-b99b-11f0-a515-18dbf201ea17', 'admin-002', 'Administrateur Division Est', 'Administrateur', NULL, '{\"modifications\":{\"institution\":\"armée\",\"article\":\"Camouflés\",\"quantite\":6,\"priorite\":\"Normale\",\"date_livraison_prevue\":\"2025-11-06\",\"client_id\":\"22a33403-ba63-11f0-a515-18dbf201ea17\",\"tirer_du_stock\":false,\"statut\":\"En production\"},\"ancien_statut\":\"En production\"}', '2025-11-08 02:52:38'),
('ffb3c35e-b592-11f0-80ce-18dbf201ea17', 'Création de commande', 'commande', 'commandes', '0', 'admin-001', 'Super Administrateur Principal', 'Super Administrateur', 0.00, '{\"numero\":\"CMD-2025-0004\",\"institution\":\"sahel\",\"article\":\"Trei gendarmerie\",\"quantite\":1,\"client_id\":\"9a05d8a4-b583-11f0-80ce-18dbf201ea17\"}', '2025-10-30 13:19:00'),
('ffdb5ffd-b712-11f0-ba1b-18dbf201ea17', 'Connexion', 'autre', 'sessions', NULL, 'admin-001', 'Super Administrateur Principal', NULL, NULL, 'Connexion depuis ::1', '2025-11-01 11:07:47');

-- --------------------------------------------------------

--
-- Table structure for table `mouvements`
--

DROP TABLE IF EXISTS `mouvements`;
CREATE TABLE IF NOT EXISTS `mouvements` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `type` enum('Entrée Externe','Entrée Interne','Sortie Externe','Sortie Interne') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `article_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantite` decimal(10,2) NOT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `source_destination` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `utilisateur_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_article_id` (`article_id`),
  KEY `idx_utilisateur_id` (`utilisateur_id`),
  KEY `idx_type` (`type`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mouvements`
--

INSERT INTO `mouvements` (`id`, `type`, `article_id`, `quantite`, `date`, `source_destination`, `reference`, `notes`, `utilisateur_id`, `created_at`, `updated_at`) VALUES
('06216e87-b8d0-11f0-a515-18dbf201ea17', 'Entrée Externe', '4a8a2272-e1f9-47a3-873b-bc28ab750e3e', 1.00, '2025-11-03 16:13:24', 'zeno', 'EE-2025-0001', 'Fournisseur: zeno | Catégorie: Fils', 'admin-001', '2025-11-03 16:13:24', '2025-11-03 16:13:24'),
('876edcbf-ba52-11f0-a515-18dbf201ea17', 'Entrée Interne', '876e26fd-ba52-11f0-a515-18dbf201ea17', 12.00, '2025-11-05 14:20:07', 'Production terminée - pompiers', 'CMD-2025-0004', NULL, 'admin-002', '2025-11-05 14:20:07', '2025-11-05 14:20:07'),
('9311dd9b-b99b-11f0-a515-18dbf201ea17', 'Sortie Externe', '05cbf6ec-9aed-424c-98a9-ffdd2d7cc9e6', 19.00, '2025-11-04 16:30:28', 'Livraison commande tirée du stock - Sapeurs-pompiers', 'CMD-2025-0003', 'Article: Tenues claires - Institution: Sapeurs-pompiers - Tirage du stock', 'admin-001', '2025-11-04 16:30:28', '2025-11-04 16:30:28'),
('a0395ea1-b8da-11f0-a515-18dbf201ea17', 'Entrée Interne', '05cbf6ec-9aed-424c-98a9-ffdd2d7cc9e6', 60.00, '2025-11-03 17:29:17', 'Production anticipée - Sapeurs-pompiers', 'EI-2025-0001', 'Production hors commande - Priorité: Normale', 'admin-001', '2025-11-03 17:29:17', '2025-11-03 17:29:17'),
('ae70f4e3-ba59-11f0-a515-18dbf201ea17', 'Entrée Externe', '2fa699e7-f04a-47a0-8f77-13fea09f981d', 17.00, '2025-11-05 15:11:18', 'Patrick Stéphane NTA NTA', 'EE-2025-0003', 'Fournisseur: Patrick Stéphane NTA NTA | Catégorie: Autres Fournitures', 'admin-001', '2025-11-05 15:11:18', '2025-11-05 15:11:18'),
('d678af80-b8d9-11f0-a515-18dbf201ea17', 'Entrée Externe', 'c92aee5b-c63c-40b7-bd0d-bd82b4454f74', 15.00, '2025-11-03 17:23:39', 'SSSS', 'EE-2025-0002', 'Fournisseur: SSSS | Catégorie: Tissus', 'admin-001', '2025-11-03 17:23:39', '2025-11-03 17:23:39'),
('d6af9df5-b8dd-11f0-a515-18dbf201ea17', 'Sortie Interne', 'c92aee5b-c63c-40b7-bd0d-bd82b4454f74', 7.00, '2025-11-03 17:52:17', 'ddd', 'SI-2025-0001', 'Destination: ddd', 'admin-001', '2025-11-03 17:52:17', '2025-11-03 17:52:17'),
('f10247e2-ba52-11f0-a515-18dbf201ea17', 'Sortie Externe', NULL, 21.00, '2025-11-05 14:23:04', 'Livraison commande - pompiers', 'CMD-2025-0001', 'Article: Camouflés - Institution: pompiers', 'admin-002', '2025-11-05 14:23:04', '2025-11-05 14:23:04');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `utilisateur_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_token` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `derniere_activite` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `date_connexion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_deconnexion` timestamp NULL DEFAULT NULL,
  `statut` enum('active','expired','logout') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  KEY `idx_utilisateur_id` (`utilisateur_id`),
  KEY `idx_token` (`token`),
  KEY `idx_refresh_token` (`refresh_token`),
  KEY `idx_statut` (`statut`),
  KEY `idx_derniere_activite` (`derniere_activite`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `utilisateur_id`, `token`, `refresh_token`, `ip_address`, `user_agent`, `derniere_activite`, `date_connexion`, `date_deconnexion`, `statut`) VALUES
('093fd20c-bc4d-11f0-91a8-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjI1Njk5NTAsImV4cCI6MTc2MjY1NjM1MH0.WBKxxFZWoQWxjDBHrXFryfj4XZif4-Uoj9aHbXXeNyE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MjU2OTk1MCwiZXhwIjoxNzYzMTc0NzUwfQ.SCIdlxmeZGS02Y6sp9REISz9UaRakTshSEhVuJQH-ZE', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0', '2025-11-08 04:52:42', '2025-11-08 02:45:50', '2025-11-08 04:52:42', 'logout'),
('0bc0567b-b7c7-11f0-bb55-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjIwNzI1OTcsImV4cCI6MTc2MjE1ODk5N30.YFbNRo8WOpXaYfaGZaEA6D5FLprAcGRoo9hhUfyrH6M', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MjA3MjU5NywiZXhwIjoxNzYyNjc3Mzk3fQ.4RB5N4rXtCjnEyzHNbYrVqw5GPLEUfiVGQ-ZivTLnDU', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 10:29:35', '2025-11-02 08:36:37', NULL, 'expired'),
('15b0866f-bc4d-11f0-91a8-18dbf201ea17', 'admin-002', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMiIsImVtYWlsIjoiYWRtaW5AbWlsaXRhcnkuZ292Iiwicm9sZSI6IkFkbWluaXN0cmF0ZXVyIiwiaWF0IjoxNzYyNTY5OTcxLCJleHAiOjE3NjI2NTYzNzF9.7Grcv_Z05nBYMnhaQYtIaLGsDUCBmVxWH5n9jXdgg70', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMiIsImVtYWlsIjoiYWRtaW5AbWlsaXRhcnkuZ292IiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjI1Njk5NzEsImV4cCI6MTc2MzE3NDc3MX0.2MohR9JCryuBCtSUaKtVcnZCMRcy7_CaIx0O6p5h3Vo', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 04:29:28', '2025-11-08 02:46:11', NULL, 'active'),
('185586a7-baec-11f0-bd24-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjI0MTgzNjMsImV4cCI6MTc2MjUwNDc2M30.Yt3GC7UHwB9XQ49X-cvadZtExVADvJDxEcBUfQVugD8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MjQxODM2MywiZXhwIjoxNzYzMDIzMTYzfQ.ddGBtRqkDV6yy4N1imTK3qD0IYiGr2dSPOP3nn1Jy1M', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 04:28:31', '2025-11-06 08:39:23', NULL, 'expired'),
('23c46db2-ba77-11f0-8531-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjIzNjgxMzEsImV4cCI6MTc2MjQ1NDUzMX0.CxLYHrKmBvK7ZTEwWCCQ0ssTCQMBA_HWB1ruYtFpDb8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MjM2ODEzMSwiZXhwIjoxNzYyOTcyOTMxfQ.eg8Of07mKa168-1gwEEnG_AsGLkfar-dEajnf8H8SgM', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 02:44:58', '2025-11-05 18:42:11', '2025-11-08 02:44:58', 'expired'),
('288d6bff-ba1c-11f0-a515-18dbf201ea17', 'admin-002', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMiIsImVtYWlsIjoiYWRtaW5AbWlsaXRhcnkuZ292Iiwicm9sZSI6IkFkbWluaXN0cmF0ZXVyIiwiaWF0IjoxNzYyMzI5MDU1LCJleHAiOjE3NjI0MTU0NTV9.XQnubAU9gwvECepyjPbGDJaTgNV8hPXXOUQKtY0cGwk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMiIsImVtYWlsIjoiYWRtaW5AbWlsaXRhcnkuZ292IiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjIzMjkwNTUsImV4cCI6MTc2MjkzMzg1NX0.Fvl9NrajSrLIfZKgdoFaHXeXxM69LeRjgsIx6s_5K4c', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-05 09:11:09', '2025-11-05 07:50:55', '2025-11-05 09:11:09', 'logout'),
('440f43fe-b8e5-11f0-a515-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjIxOTU1MjcsImV4cCI6MTc2MjI4MTkyN30.RtZY98xq2bLJmk9LYDoKoOSd-9sxHntTtWZEsie4QGs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MjE5NTUyNywiZXhwIjoxNzYyODAwMzI3fQ.dF1Rf3W51IKGLtFmNwm1kTw6wPSoRVRisBUA85SY8EY', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-05 20:26:13', '2025-11-03 18:45:27', NULL, 'expired'),
('4e87791e-b86b-11f0-bb55-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjIxNDMxNDYsImV4cCI6MTc2MjIyOTU0Nn0.N2yGzpexkfghxzGY3Glp1ahcd3N1ctqyRTISFgncHfY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MjE0MzE0NiwiZXhwIjoxNzYyNzQ3OTQ2fQ.k0cjxKZ3mHes0KeV0In6tpFzSUar0KTMjXmybxX7tss', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 17:14:49', '2025-11-03 04:12:26', NULL, 'expired'),
('5fa2df2c-b7c3-11f0-bb55-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjIwNzEwMTksImV4cCI6MTc2MjE1NzQxOX0.A5eJsXrH1Qiysh_aG8NAb_xO8pccmGVqGy0XmT06-dk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MjA3MTAxOSwiZXhwIjoxNzYyNjc1ODE5fQ.DrNG2IvMKkQt7eDaR-W3bdy1JcX0bQW2Es7oFT0NxU8', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0', '2025-11-03 10:29:35', '2025-11-02 08:10:19', NULL, 'expired'),
('5fec3b01-b7de-11f0-bb55-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjIxNDMxMjEsImV4cCI6MTc2MjIyOTUyMX0.NQYKbNkpeAiEoBRcmSUB0A1Yex97HfBHMWhr-LH_Y0A', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MjE0MzEyMSwiZXhwIjoxNzYyNzQ3OTIxfQ.G75erP6-LYVT0t1pFhLrUIlZ7aEf6UmiXgIiXM9UvS4', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 04:53:28', '2025-11-02 11:23:36', NULL, 'expired'),
('717419b7-ba46-11f0-a515-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjIzNDcyMTYsImV4cCI6MTc2MjQzMzYxNn0.Pi6u6bPo0Mv92WQ5T1O7dSc6LcdKgyWKJRybOsmCxs0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MjM0NzIxNiwiZXhwIjoxNzYyOTUyMDE2fQ.gQr0PZBOjX9PWHDETKuRQMkb3D3Szj_4UJomIcroUk4', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 04:28:31', '2025-11-05 12:53:36', NULL, 'expired'),
('8734ffb3-ba4d-11f0-a515-18dbf201ea17', 'admin-002', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMiIsImVtYWlsIjoiYWRtaW5AbWlsaXRhcnkuZ292Iiwicm9sZSI6IkFkbWluaXN0cmF0ZXVyIiwiaWF0IjoxNzYyMzUwMjU5LCJleHAiOjE3NjI0MzY2NTl9.UljLt9Oeiln3DXv3nDMCHFTHadoDF0IqC9QAl7nY6qo', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMiIsImVtYWlsIjoiYWRtaW5AbWlsaXRhcnkuZ292IiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjIzNTAyNTksImV4cCI6MTc2Mjk1NTA1OX0.gsQVwzFwBCS31GIkmAQZ0mSP4eXWUHklI17LXziaQ88', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0', '2025-11-08 04:28:31', '2025-11-05 13:44:19', NULL, 'expired'),
('968a8d1f-ba60-11f0-a515-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjIzNjAxNzksImV4cCI6MTc2MjQ0NjU3OX0.JgXPCp6Vx7t89mKYX2TXYcWRNv_vSXSVve6jZ3KW5Gs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MjM2MDE3OSwiZXhwIjoxNzYyOTY0OTc5fQ.e7i5h5T2NZHEkEPcEPVryQ44yNjW4UL-fgPm5dbPbZo', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 04:28:31', '2025-11-05 16:00:45', NULL, 'expired'),
('9b9e77b1-b998-11f0-a515-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjIyNzI1NTQsImV4cCI6MTc2MjM1ODk1NH0.gkQMrrSt4zgVOMBOPvpji2Po3EtC20_ecD4zAhiBzPQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MjI3MjU1NCwiZXhwIjoxNzYyODc3MzU0fQ.u3lTJTdeKDHV6hQpMY6Ir_1YJadzW4_hFUNcbxHLb_8', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-06 09:57:20', '2025-11-04 16:09:14', NULL, 'expired'),
('aa4e05d8-b57c-11f0-80ce-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjE4MzQxNDksImV4cCI6MTc2MTkyMDU0OX0.uvVFrCEfD_vZ0qdhrPEUyBiyd5V9_1bbPs496EiVc88', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MTgzNDE0OSwiZXhwIjoxNzYyNDM4OTQ5fQ.nBa6FyHNhad20gQ4Wh_0_6BMQiI4AimahFdzvlI5lyM', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 12:22:41', '2025-10-30 10:39:08', NULL, 'expired'),
('acfef53e-ba46-11f0-a515-18dbf201ea17', 'admin-002', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMiIsImVtYWlsIjoiYWRtaW5AbWlsaXRhcnkuZ292Iiwicm9sZSI6IkFkbWluaXN0cmF0ZXVyIiwiaWF0IjoxNzYyMzQ3MzE2LCJleHAiOjE3NjI0MzM3MTZ9._r69exonzOnWtitXVh-Kg1rKelbL5mumi3yWjVnv-PE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMiIsImVtYWlsIjoiYWRtaW5AbWlsaXRhcnkuZ292IiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjIzNDczMTYsImV4cCI6MTc2Mjk1MjExNn0.N9cvdOB2BsLflttsnwEntVIEtiNtY1gztJuYxNjkVuM', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0', '2025-11-05 13:43:32', '2025-11-05 12:55:16', '2025-11-05 13:43:32', 'logout'),
('b5ad0a44-ba5b-11f0-a515-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjIzNTYzNTAsImV4cCI6MTc2MjQ0Mjc1MH0.BmeHKeDNo93be7jhk1dA0PEgWWRQLvJfWZcKCs0WAKg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MjM1NjM1MCwiZXhwIjoxNzYyOTYxMTUwfQ.C8bH0KvZzRFDLF_Pq83EghF2EBT2VN4qbygfhKCZORU', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 04:28:31', '2025-11-05 15:25:50', NULL, 'expired'),
('b8c5c5eb-b7c9-11f0-bb55-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjIwNzM3NDYsImV4cCI6MTc2MjE2MDE0Nn0.1ZmF5tbL1vnOY00aeYv77EXeDp2Pqk73jJxIDsQZask', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MjA3Mzc0NiwiZXhwIjoxNzYyNjc4NTQ2fQ.lmiwW6SiH_Wm_Cb-gC5rtrxQ6WBLVZHw4CW76ObG_9c', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 18:32:44', '2025-11-02 08:55:46', NULL, 'expired'),
('b9f2dd7d-b601-11f0-a2a3-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjE4Nzc4OTcsImV4cCI6MTc2MTk2NDI5N30.4G0GNY5Bf4UL9iO52-MDXXhYsQn690jnq9xbqkS2tMM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MTg3Nzg5NywiZXhwIjoxNzYyNDgyNjk3fQ.EmmwgMVWFSE8sYqe7JB3LRrVA1JA2Ohe7ZcNp2q8yOQ', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 12:22:41', '2025-10-31 02:31:37', NULL, 'expired'),
('cfce6766-ba68-11f0-a515-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjIzNjE5NzcsImV4cCI6MTc2MjQ0ODM3N30.VONjQGkXK6aRBJKjylfTdiivJwD3JUKczbiOilEJRXM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MjM2MTk3NywiZXhwIjoxNzYyOTY2Nzc3fQ.8Hpow6nqSf2illXhMDXdA5ZRW7ywiyCwn0fkJK0oJ1A', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0', '2025-11-08 02:44:58', '2025-11-05 16:59:37', '2025-11-08 02:44:58', 'expired'),
('d5f9ac31-ba74-11f0-8531-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjIzNjc4MzAsImV4cCI6MTc2MjQ1NDIzMH0.hND_-UaoZPnb8476yDTn-VRCdnIyNOhoHuu217ROGbs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MjM2NzgzMCwiZXhwIjoxNzYyOTcyNjMwfQ.G2-v9ruAp2cRgGT2dzWVjYoQPxwbR42-z4-3-qzklRE', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 04:28:31', '2025-11-05 18:25:41', NULL, 'expired'),
('db8096e7-b8d7-11f0-a515-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjIxODk3NjgsImV4cCI6MTc2MjI3NjE2OH0.bPcL3iAwZrzeqOYTMIIL-JhRjaZ4uw8nl7eTP8a0AhE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MjE4OTc2OCwiZXhwIjoxNzYyNzk0NTY4fQ.smj-srIaR_WLLR_DhClfAFhAePMsexkjLoys0oMDbks', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-04 19:14:49', '2025-11-03 17:09:28', NULL, 'expired'),
('f8f5be51-b59b-11f0-80ce-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjE4MzQxOTQsImV4cCI6MTc2MTkyMDU5NH0.btYBbgxvU2enCffjPkNz4a2O9IeCed_fBVC-4fXezXE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MTgzNDE5NCwiZXhwIjoxNzYyNDM4OTk0fQ.1zPkfgQWqUFXs2TBo5PIaG9IFPXHSe47clquqE_ueXQ', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 12:22:41', '2025-10-30 14:23:14', NULL, 'expired'),
('ffda1063-b712-11f0-ba1b-18dbf201ea17', 'admin-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRldXIiLCJpYXQiOjE3NjE5OTUyNjcsImV4cCI6MTc2MjA4MTY2N30.-lBeNUoXsI5dr0U9KYKv1tRtxi8Bl8klDMgMboziw4U', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoic3VwZXJhZG1pbkBtaWxpdGFyeS5nb3YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MTk5NTI2NywiZXhwIjoxNzYyNjAwMDY3fQ.-B77TmeByS4Nb_SPuF9NW9dAtmCsQ-Odg3Fc7WuqLsY', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 10:29:35', '2025-11-01 11:07:47', NULL, 'expired');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `nom_complet` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('Administrateur','Super Administrateur') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Administrateur',
  `telephone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `institution` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('Actif','D├®sactiv├®') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Actif',
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_statut` (`statut`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nom_complet`, `email`, `password`, `role`, `telephone`, `institution`, `statut`, `date_creation`, `updated_at`) VALUES
('admin-001', 'Super Administrateur Principal', 'superadmin@military.gov', '$2a$10$gLxyQOSoM/TF2oReiopE0.jeFdy1jb1oqHIeyMnhOvTwiksmbpP/q', 'Super Administrateur', '+243 000 000 001', 'Armée Nationale - Quartier Général', 'Actif', '2025-10-24 03:44:50', '2025-10-24 05:48:05'),
('admin-002', 'Administrateur Division Est', 'admin@military.gov', '$2a$10$1O9Fp9LGoW/7/ydDk5iX9.bFSZ7AaPtFtGnuSVEFfOGt/a3rLvWLi', 'Administrateur', '+243 000 000 002', 'Armée Nationale - Division Est', 'Actif', '2025-10-24 03:44:50', '2025-10-24 05:48:05'),
('debf02f2-bc57-11f0-91a8-18dbf201ea17', 'dhdhdhdhdhdh', 'ddddd@gmail.com', '$2a$10$7.f4esDBjPt2Yj7ikaWndOo7Kp0vJhrYOVHPsRDoDxdiRCOzsrPe.', 'Administrateur', '+2374747474747', 'FAB', 'Actif', '2025-11-08 04:03:23', '2025-11-08 04:30:25');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `articles`
--
ALTER TABLE `articles`
  ADD CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`categorie`) REFERENCES `categories` (`nom`) ON UPDATE CASCADE;

--
-- Constraints for table `commandes`
--
ALTER TABLE `commandes`
  ADD CONSTRAINT `fk_commandes_uniforme` FOREIGN KEY (`uniforme_id`) REFERENCES `articles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `historique`
--
ALTER TABLE `historique`
  ADD CONSTRAINT `historique_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mouvements`
--
ALTER TABLE `mouvements`
  ADD CONSTRAINT `mouvements_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `mouvements_ibfk_2` FOREIGN KEY (`utilisateur_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

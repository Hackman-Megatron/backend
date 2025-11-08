import jwt from 'jsonwebtoken';
import { sessionService } from '../services/sessionService.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const session = await sessionService.getActiveSession(token);
    if (!session) {
      return res.status(403).json({ message: 'Session expirée ou invalide' });
    }

    if (session.user_statut !== 'Actif') {
      await sessionService.endSession(token, 'logout');
      return res.status(403).json({ message: 'Utilisateur désactivé' });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      nom_complet: session.nom_complet
    };
    req.session = session;

    sessionService.updateActivity(token);

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      await sessionService.endSession(token, 'expired');
      return res.status(403).json({ message: 'Token expiré' });
    }
    return res.status(403).json({ message: 'Token invalide' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    next();
  };
};

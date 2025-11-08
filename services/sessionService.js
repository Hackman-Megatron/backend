import pool from '../config/database.js';

export const sessionService = {
  async createSession(userId, token, refreshToken, ipAddress, userAgent) {
    try {
      await pool.query(
        `INSERT INTO sessions (utilisateur_id, token, refresh_token, ip_address, user_agent, statut)
         VALUES (?, ?, ?, ?, ?, 'active')`,
        [userId, token, refreshToken, ipAddress, userAgent]
      );
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  async updateActivity(token) {
    try {
      await pool.query(
        `UPDATE sessions SET derniere_activite = CURRENT_TIMESTAMP
         WHERE token = ? AND statut = 'active'`,
        [token]
      );
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  },

  async endSession(token, reason = 'logout') {
    try {
      await pool.query(
        `UPDATE sessions SET statut = ?, date_deconnexion = CURRENT_TIMESTAMP
         WHERE (token = ? OR refresh_token = ?) AND statut = 'active'`,
        [reason, token, token]
      );
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  },

  async getActiveSession(token) {
    try {
      const [sessions] = await pool.query(
        `SELECT s.*, u.nom_complet, u.email, u.role, u.statut as user_statut
         FROM sessions s
         JOIN users u ON s.utilisateur_id = u.id
         WHERE s.token = ? AND s.statut = 'active'
         LIMIT 1`,
        [token]
      );
      return sessions[0] || null;
    } catch (error) {
      console.error('Error getting active session:', error);
      return null;
    }
  },

  async getSessionByRefreshToken(refreshToken) {
    try {
      const [sessions] = await pool.query(
        `SELECT s.*, u.nom_complet, u.email, u.role, u.statut as user_statut
         FROM sessions s
         JOIN users u ON s.utilisateur_id = u.id
         WHERE s.refresh_token = ? AND s.statut = 'active'
         LIMIT 1`,
        [refreshToken]
      );
      return sessions[0] || null;
    } catch (error) {
      console.error('Error getting session by refresh token:', error);
      return null;
    }
  },

  async updateTokens(oldRefreshToken, newToken, newRefreshToken) {
    try {
      await pool.query(
        `UPDATE sessions
         SET token = ?, refresh_token = ?, derniere_activite = CURRENT_TIMESTAMP
         WHERE refresh_token = ? AND statut = 'active'`,
        [newToken, newRefreshToken, oldRefreshToken]
      );
    } catch (error) {
      console.error('Error updating tokens:', error);
      throw error;
    }
  },

  async getUserSessions(userId) {
    try {
      const [sessions] = await pool.query(
        `SELECT * FROM sessions
         WHERE utilisateur_id = ?
         ORDER BY date_connexion DESC
         LIMIT 20`,
        [userId]
      );
      return sessions;
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  },

  async cleanExpiredSessions() {
    try {
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() - 24);

      await pool.query(
        `UPDATE sessions SET statut = 'expired'
         WHERE statut = 'active' AND derniere_activite < ?`,
        [expiryTime]
      );
    } catch (error) {
      console.error('Error cleaning expired sessions:', error);
    }
  },

  async endAllUserSessions(userId, exceptRefreshToken = null) {
    try {
      if (exceptRefreshToken) {
        await pool.query(
          `UPDATE sessions SET statut = 'logout', date_deconnexion = CURRENT_TIMESTAMP
           WHERE utilisateur_id = ? AND refresh_token != ? AND statut = 'active'`,
          [userId, exceptRefreshToken]
        );
      } else {
        await pool.query(
          `UPDATE sessions SET statut = 'logout', date_deconnexion = CURRENT_TIMESTAMP
           WHERE utilisateur_id = ? AND statut = 'active'`,
          [userId]
        );
      }
    } catch (error) {
      console.error('Error ending all user sessions:', error);
      throw error;
    }
  },

  async getActiveSessions() {
    try {
      const [sessions] = await pool.query(
        `SELECT s.*, u.nom_complet, u.email, u.role
         FROM sessions s
         JOIN users u ON s.utilisateur_id = u.id
         WHERE s.statut = 'active'
         ORDER BY s.derniere_activite DESC`
      );
      return sessions;
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }
};

setInterval(() => {
  sessionService.cleanExpiredSessions();
}, 3600000);

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Erreur de validation',
      errors: err.errors
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      message: 'Cette entrée existe déjà'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      message: 'Référence invalide'
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

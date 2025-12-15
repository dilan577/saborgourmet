const express = require('express');
const router = express.Router();

// INDEX PÚBLICO (SIEMPRE VISIBLE)
router.get('/', (req, res) => {
  res.render('index', {
    titulo: 'SaborGourmet'
  });
});

module.exports = router;

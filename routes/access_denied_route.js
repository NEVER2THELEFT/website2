const express = require('express');
const access_denied_router = express.Router();
const { renderWithLayout } = require('../controllers/guestbook_controllers.js');

// Access Denied page route
access_denied_router.get('/accessdenied', (req, res) => {
  renderWithLayout(res, 'access_denied', {
    title: 'Access Denied',
    message: 'You must be logged in to access the guestbook.',
    year: new Date().getFullYear()
  });
});

module.exports = access_denied_router;

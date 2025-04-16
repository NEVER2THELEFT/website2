const express = require('express');
const guestbook_router = express.Router();
const controller = require('../controllers/guestbook_controllers.js');
const { verify } = require('../auth/auth.js');
const { renderWithLayout } = require('../controllers/guestbook_controllers.js');

// Guestbook routes requiring authentication
guestbook_router.get('/', verify, controller.loggedIn_landing);
guestbook_router.get('/logout', controller.logout);

// Unauthorized access handler
guestbook_router.use((req, res, next) => {
    if (!req.user) {
        renderWithLayout(res, 'access_denied', {
            title: 'Access Denied',
            message: 'You need to log in to access the guestbook.',
            year: new Date().getFullYear()
        });
    } else {
        next();
    }
});

// 500 error handler
guestbook_router.use((err, req, res, next) => {
    console.error(err.stack);
    renderWithLayout(res, 'access_denied', {
      title: 'Server Error',
      message: 'Something went wrong on the server.',
      year: new Date().getFullYear()
    });
});

module.exports = guestbook_router;

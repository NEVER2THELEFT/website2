const express = require('express');
const logout_router = express.Router();
const controller = require('../controllers/guestbook_controllers.js');

logout_router.get('/', controller.logout);

module.exports = logout_router;
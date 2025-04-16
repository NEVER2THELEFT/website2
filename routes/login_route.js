const express = require('express');
const login_router = express.Router();
const controller = require('../controllers/guestbook_controllers.js');
const { login } = require('../auth/auth.js');

login_router.get('/', controller.show_login);
login_router.post('/', login, controller.handle_login);

module.exports = login_router;
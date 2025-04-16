const express = require('express');
const home_router = express.Router();
const controller = require('../controllers/guestbook_controllers.js');


home_router.get('/', controller.landing_page);
home_router.get('/register', controller.show_register_page);
home_router.post('/register', controller.post_new_user);

module.exports = home_router;
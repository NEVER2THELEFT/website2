const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const mustacheExpress = require('mustache-express');
const { renderWithLayout, renderErrorPage } = require('./controllers/guestbook_controllers');
const jwt = require('jsonwebtoken');
const auth = require('./auth/auth');  // Ensure the path matches where your auth.js is located
const controller = require('./controllers/guestbook_controllers');
const methodOverride = require ('method-override');
const userModel = require('./models/user_model');
const bcrypt = require('bcryptjs');

require('dotenv').config(); // loads info from .env file

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.json());

const public = path.join(__dirname, 'public');
app.use(express.static(public));

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Set up Mustache engine with partials
app.engine('mustache', mustacheExpress(path.join(__dirname, 'views/partials')));
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// decode JWT if present and set req.user
app.use((req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = { username: payload.username };
    } catch (err) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    userModel.lookup(username, (err, user) => {
      if (err || !user) {
        return res.redirect('/login'); // or render login with error
      }
  
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          const token = jwt.sign({ username: user.user }, process.env.ACCESS_TOKEN_SECRET);
          res.cookie('jwt', token, { httpOnly: true });
          res.redirect('/classes');
        } else {
          res.redirect('/login'); // or render login with error
        }
      });
    });
});

app.post('/admin/add', auth.verify, controller.add_new_class);
app.post('/admin/edit/:id', auth.verify, controller.edit_class);
app.post('/admin/delete/:id', auth.verify, controller.delete_class);
app.post('/admin/edit/:id', auth.verify, controller.edit_class);
app.put('/admin/edit/:id', auth.verify, controller.edit_class);   // Handle PUT request for editing class
app.delete('/admin/delete/:id', auth.verify, controller.delete_class);  // Handle DELETE request for deleting class

// routers
const home_router = require('./routes/home_route.js');
app.use('/', home_router);

const login_router = require('./routes/login_route.js');
app.use('/login', login_router);

const logout_router = require('./routes/logout_route.js');
app.use('/logout', logout_router);

const guestbook_router = require('./routes/guestbook_route.js');
app.use('/admin', guestbook_router);

const classes_router = require('./routes/classes_route.js');
app.use('/classes', classes_router);

const access_denied_router = require('./routes/access_denied_route.js');
app.use('/accessdenied', access_denied_router);

// Global error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  renderErrorPage(res, 500, {
    title: '500 - Server Error',
    message: 'An unexpected error occurred. Please try again later.'
  });
});

// 404 error handler (when no route matches)
app.use((req, res) => {
  renderErrorPage(res, 404, {
    title: 'Error',
    message: 'Please login or register an account to view the resource you were trying to access.<br><br>If this issue still persists contact support. (Support Email: totallyrealemail@email.com)'
  });
});

app.listen(process.env.PORT || 10000, () => {
  console.log('Server started. Ctrl^c to quit.');
});

const user_model = require('../models/user_model.js');
const fs = require("fs");
const path = require("path");
const mustache = require('mustache');
const classes_model = require('../models/classes_model.js');

const db = new classes_model("classes.db");
db.init();

// Function to render pages with layout
function renderWithLayout(res, viewName, viewData) {
  const layoutPath = path.join(__dirname, "../views/partials/layout.mustache");
  const layout = fs.readFileSync(layoutPath, "utf8");

  const contentPath = path.join(__dirname, "../views", viewName + ".mustache");
  const content = fs.readFileSync(contentPath, "utf8");

  const partials = {
    header: fs.readFileSync(path.join(__dirname, "../views/partials/header.mustache"), "utf8"),
    footer: fs.readFileSync(path.join(__dirname, "../views/partials/footer.mustache"), "utf8"),
  };

  const body = mustache.render(content, viewData);
  const fullPage = mustache.render(layout, { ...viewData, body }, partials);
  res.send(fullPage);
}

exports.renderWithLayout = renderWithLayout;

exports.show_login = function (req, res) {
  renderWithLayout(res, "user/login", {
    title: "Login",
    year: new Date().getFullYear(),
    message: req.query.message || null
  });
};

exports.handle_login = function (req, res) {
  res.redirect('/');
};

exports.landing_page = function (req, res) {
  renderWithLayout(res, "home", {
    title: "Home",
    year: new Date().getFullYear(),
    user: req.user || null,
    message: req.query.message || null
  });
};

exports.show_register_page = function (req, res) {
  if (req.session && req.session.user) {
      renderWithLayout(res, "user/register", {
          title: "Register",
          year: new Date().getFullYear()
      });
  } else {
      res.redirect('/login');
  }
};

exports.post_new_user = function (req, res) {
  const user = req.body.username;
  const password = req.body.pass;

  if (!user || !password) {
    return res.status(401).send("No user or password provided.");
  }

  user_model.lookup(user, function (err, u) {
    if (u) {
      return res.status(401).send("User exists: " + user);
    }
    user_model.create(user, password);
    console.log("Registered user", user);
    res.redirect("/login");
  });
};

exports.logout = function (req, res) {
  console.log("User logging out...");
  res.clearCookie("jwt");
  res.redirect('/login?message=You have been logged out');
};

exports.renderErrorPage = function(res, statusCode, viewData) {
  console.log("Rendering error page with status code", statusCode);
  res.status(statusCode);
  exports.renderWithLayout(res, 'access_denied', {
    title: viewData.title || 'Error',
    message: viewData.message || 'An unexpected error occurred.',
    year: new Date().getFullYear()
  });
};

exports.show_classes_page = function (req, res) {
  db.getAllClasses()
    .then(classes => {
      renderWithLayout(res, "classes", {
        title: "Classes",
        user: req.user || null,
        classes: classes,
        year: new Date().getFullYear()
      });
    })
    .catch(err => {
      console.error("Error loading classes:", err);
      res.status(500).send("Error loading classes.");
    });
};

exports.loggedIn_landing = function (req, res) {
  db.getAllClasses()
    .then((classes) => {
      renderWithLayout(res, "admin", {
        title: "Admin",
        user: req.user || "admin",
        year: new Date().getFullYear(),
        classes: classes
      });
    })
    .catch((err) => {
      console.error("Error loading classes for admin:", err);
      res.status(500).send("Error loading classes.");
    });
};

exports.add_new_class = async (req, res) => {
  const { title, description, image_url, duration, date_time, location, price } = req.body;

  // Prepend '/images/' instead of '../public/images/'
  const imageUrl = `/images/${image_url}`;

  try {
    // Call the database function to insert the class
    await db.addClass(title, description, imageUrl, duration, date_time, location, price);
    res.redirect('/admin');  // Redirect back to admin page
  } catch (err) {
    console.error('Error adding class:', err);
    res.status(500).render('error', { message: 'Error adding class' });
  }
};


exports.delete_class = function (req, res) {
  const classId = req.params.id;

  db.deleteClass(classId)
      .then((numRemoved) => {
          if (numRemoved > 0) {
              console.log(`Class with ID ${classId} deleted`);
              res.redirect('/admin');
          } else {
              console.log(`Class with ID ${classId} not found`);
              res.status(404).send('Class not found');
          }
      })
      .catch((err) => {
          console.error("Error deleting class:", err);
          res.status(500).send("Error deleting class.");
      });
};


exports.edit_class = function (req, res) {
  const classId = req.params.id;  // Get the class ID from the URL
  const { title, description, image_url, duration, date_time, location, price } = req.body;  // Get the updated details from the form

  const updatedDetails = {
    title,
    description,
    image_url,
    duration,
    date_time,
    location,
    price
  };

  db.editClass(classId, updatedDetails)
    .then((numUpdated) => {
      if (numUpdated > 0) {
        console.log(`Class with ID ${classId} updated`);
        res.redirect('/admin');  // Redirect after successful update
      } else {
        console.log(`Class with ID ${classId} not found or no changes made`);
        res.status(404).send('Class not found or no changes made');
      }
    })
    .catch((err) => {
      console.error("Error editing class:", err);
      res.status(500).send("Error editing class.");
    });
};


exports.enroll_in_class = async (req, res) => {
  const { classId, name, dob } = req.body;

  try {
    // Call the database function to add the participant
    await db.addParticipant(classId, name, dob);
    res.redirect('/classes');  // Redirect to the classes page after successful enrollment
  } catch (err) {
    console.error('Error enrolling in class:', err);
    res.status(500).render('error', { message: 'Error enrolling in class' });
  }
};

exports.adminPage = async (req, res) => {
  try {
    // Fetch all classes and users
    const classes = await classesModel.getAllClasses();  
    const users = await userModel.getAllUsers();         

    // Ensure classes and users are arrays
    if (!Array.isArray(classes)) {
      classes = [];
    }
    if (!Array.isArray(users)) {
      users = [];
    }

    // Render the admin page with the classes and users data
    res.render('admin', { classes, users });
  } catch (err) {
    console.error('Error loading admin page:', err);
    res.status(500).send('Error loading admin page');
  }
};


exports.add_user = function (req, res) {
  const { username, password } = req.body;

  if (!req.session.user) {
    return res.redirect('/login');
  }

  userModel.create(username, password);
  res.redirect('/guestbook'); // Refresh admin page after adding
};



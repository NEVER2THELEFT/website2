const express = require('express');
const router = express.Router();
const controller = require('../controllers/guestbook_controllers.js');
const auth = require('../auth/auth.js');
const userModel = require('../models/user_model.js');
const classesModel = require('../models/classes_model');

// Class routes
router.post('/add', auth.verify, controller.add_new_class);
router.post('/edit/:id', auth.verify, controller.edit_class);
router.post('/delete/:id', auth.verify, controller.delete_class);
router.post('/add-user', auth.verify, guestbookController.add_user);

// Admin routes
router.get('/', auth.verify, controller.adminPage);

// User routes
router.post('/delete-user/:username', auth.verify, (req, res) => {
    const { username } = req.params;
  
    // Delete the user from the database
    userModel.deleteUser(username, (err) => {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).send('Error deleting user');
      }
      res.redirect('/admin');  // Redirect back to admin page after deletion
    });
});

router.post('/add-organiser', auth.verify, (req, res) => {
  const { username } = req.body;

  // Create a new user with a default password
  userModel.create(username, 'defaultpassword');
  res.redirect('/admin');  // Redirect back to admin page after adding organiser
});

// Route to delete a participant
router.post('/delete-participant/:classId/:participantId', auth.verify, async (req, res) => {
  const { classId, participantId } = req.params;

  try {
    // Call the model method to remove the participant
    const result = await classesModel.removeParticipant(classId, participantId);

    if (result) {
      res.redirect('/admin'); // Redirect back to admin page after deletion
    } else {
      res.status(400).send('Error deleting participant');
    }
  } catch (err) {
    console.error('Error deleting participant:', err);
    res.status(500).send('Server Error');
  }
});

// Delete User Accounts
router.post('/delete-user/:username', auth.verify, (req, res) => {
    const { username } = req.params;

    // Call the deleteUser function with a callback
    userModel.deleteUser(username, (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).send('Server Error');
        }

        if (result === `No user found with username "${username}"`) {
            return res.status(404).send(result);  // Handle case where no user is found
        }

        console.log(result);  // Log success message
        res.redirect('/admin');  // Redirect back to the admin page after successful deletion
    });
});

module.exports = router;

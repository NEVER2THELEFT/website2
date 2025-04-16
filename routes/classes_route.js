const express = require('express');
const classes_router = express.Router();
const controller = require('../controllers/guestbook_controllers.js');

classes_router.post('/enroll', controller.enroll_in_class);
classes_router.get('/', controller.show_classes_page);
classes_router.get('/register', controller.show_register_page);
classes_router.post('/register', controller.post_new_user);

classes_router.get('/', (req, res) => {
    db.getAllClasses()
      .then(classes => {
        res.render('classes', { title: 'Class List', classes: classes });
      })
      .catch(err => {
        console.error('Error fetching classes:', err);
        res.status(500).send('Error loading classes.');
      });
});

classes_router.post('/enroll', async (req, res) => {
    const { classId, name, dob } = req.body;
  
    try {
      // Use the class model to add a participant to the class
      const updatedClass = await classesModel.addParticipant(classId, name, dob);
      
      // After enrollment, redirect the user to a confirmation page or back to the classes list
      res.redirect('/classes');
    } catch (error) {
      console.error('Error enrolling in class:', error);
      res.status(500).send('Error enrolling in class');
    }
  });


module.exports = classes_router;
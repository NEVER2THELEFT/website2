const nedb = require('gray-nedb');

class classesModel {
    constructor(dbFilePath) {
        if (dbFilePath) {
            this.db = new nedb({ filename: dbFilePath, autoload: true });
        } else {
            this.db = new nedb();
        }
    }

    async init() {
        try {
            const count = await this.countClasses();
            if (count === 0) {
                await this.addClass('Beginner Tap Dancing', 'Introduction to Tapping', '/test', '2 hours', '2025-04-20 10:00', 'Room 101', '100');
                console.log('Default class entry Math 101 inserted');
                await this.addClass('Break Dancing 101', 'Introduction to History', '//test2.jpg', '1.5 hours', '2025-04-21 14:00', 'Room 102', '80');
                console.log('Default class entry History 101 inserted');
            }
        } catch (err) {
            console.error('Error during DB initialization:', err);
        }
    }

    countClasses() {
        return new Promise((resolve, reject) => {
            this.db.count({}, (err, count) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(count);
                }
            });
        });
    }

    async getAllClasses() {
        try {
            const classes = await this.findClasses({});
            return classes;
        } catch (err) {
            console.error('Error fetching all classes:', err);
            throw err;
        }
    }

    findClasses(query) {
        return new Promise((resolve, reject) => {
            this.db.find(query, (err, classes) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(classes);
                }
            });
        });
    }

    async addClass(title, description, image_url, duration, date_time, location, price) {
        const newClass = {
            title,
            description,
            image_url,
            duration,
            date_time,
            location,
            price,
            created_at: new Date().toISOString().split('T')[0]
        };

        return new Promise((resolve, reject) => {
            this.db.insert(newClass, (err, doc) => {
                if (err) {
                    console.error('Error inserting class', err);
                    reject(err);
                } else {
                    resolve(doc);
                }
            });
        });
    }

    async deleteClass(classId) {
        return new Promise((resolve, reject) => {
            this.db.remove({ _id: classId }, {}, (err, numRemoved) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(numRemoved);
                }
            });
        });
    }

    async editClass(classId, updatedDetails) {
        return new Promise((resolve, reject) => {
            this.db.update({ _id: classId }, { $set: updatedDetails }, {}, (err, numUpdated) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(numUpdated);  // number of documents updated
                }
            });
        });
    }

    async removeParticipant(classId, participantId) {
        return new Promise((resolve, reject) => {
          // Update the class by pulling out the participant with the specified ID
          this.db.update(
            { _id: classId },
            { $pull: { participants: { _id: participantId } } }, // Remove participant by ID
            {},
            (err, numUpdated) => {
              if (err) {
                reject(err);
              } else {
                resolve(numUpdated > 0); // Return true if a participant was removed
              }
            }
          );
        });
    }
}

module.exports = classesModel;

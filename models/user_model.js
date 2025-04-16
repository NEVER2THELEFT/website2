const nedb = require('gray-nedb');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

class usermodel {
    constructor(dbFilePath) {
        if (dbFilePath) {
            this.db = new nedb({ filename: dbFilePath, autoload: true });
        } else {
            this.db = new nedb();
        }
    }

    deleteUser(username, cb) {
        this.db.remove({ user: username }, {}, (err, numRemoved) => {
            if (err) {
                return cb(err);  // Pass error to callback
            }
            if (numRemoved === 0) {
                return cb(null, `No user found with username "${username}"`);  // No user found
            }
            cb(null, `User "${username}" successfully deleted.`);  // Success
        });
    }

    getAllUsers(cb) {
        this.db.find({}, (err, users) => {
            if (err) {
                cb(err, null);
            } else {
                cb(null, users);
            }
        });
    }

    create(username, password) {
        bcrypt.hash(password, saltRounds).then((hash) => {
            const entry = {
                user: username,
                password: hash
            };
            this.db.insert(entry, (err) => {
                if (err) {
                    console.log("Error inserting user:", username, err);
                } else {
                    console.log("User inserted successfully:", username);
                }
            });
        });
    }
    

    lookup(user, cb) {
        this.db.find({ 'user': user }, (err, entries) => {
            if (err) {
                return cb(null, null);
            } else {
                if (entries.length === 0) {
                    return cb(null, null);
                }
                return cb(null, entries[0]);
            }
        });
    }
    deleteUser(username, cb) {
        this.db.remove({ user: username }, {}, (err, numRemoved) => {
          if (err) {
            return cb(err);
          }
          cb(null, numRemoved);
        });
      }
      
}

module.exports = new usermodel("users.db");

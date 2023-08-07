const Sequelize = require('sequelize');

// Your existing Sequelize setup
const sequelize = new Sequelize('xcrouvfb', 'xcrouvfb', 'jO16luogHtjJEf_etXmcCvtvID-3YcFA', {
  host: 'stampy.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

// Define the Student model
const Student = sequelize.define('Student', {
  studentNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressProvince: Sequelize.STRING,
  TA: Sequelize.BOOLEAN,
  status: Sequelize.STRING
});

// Define the Course model
const Course = sequelize.define('Course', {
  courseId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseCode: Sequelize.STRING,
  courseDescription: Sequelize.STRING
});

// Establish a "hasMany" relationship between Course and Student
Course.hasMany(Student, { foreignKey: 'course' });

// Synchronize the models with the database
sequelize.sync({ alter: true, logging: console.log })
  .then(() => console.log('Models synchronized successfully'))
  .catch(err => console.error('Error synchronizing models:', err));

// Export the models and functions
module.exports = {
  Student,
  Course,
  initialize: function () {
    return new Promise((resolve, reject) => {
      sequelize
        .sync()
        .then(() => {
          console.log('Models synchronized successfully');
          resolve();
        })
        .catch(err => {
          console.error('Error synchronizing models:', err);
          reject('Unable to sync the database');
        });
    });
  },
  getAllStudents: function () {
    return new Promise((resolve, reject) => {
      Student.findAll()
        .then(students => {
          if (students.length > 0) {
            resolve(students);
          } else {
            reject('No results returned');
          }
        })
        .catch(err => {
          reject('No results returned');
        });
    });
  },
  getStudentsByCourse: function (course) {
    return new Promise((resolve, reject) => {
      Student.findAll({ where: { course: course } })
        .then(students => {
          if (students.length > 0) {
            resolve(students);
          } else {
            reject('No results returned');
          }
        })
        .catch(err => {
          reject('No results returned');
        });
    });
  },
  getStudentByNum: function (num) {
    return new Promise((resolve, reject) => {
      Student.findOne({ where: { studentNum: num } })
        .then(student => {
          if (student) {
            resolve(student);
          } else {
            reject('No results returned');
          }
        })
        .catch(err => {
          reject('No results returned');
        });
    });
  },
  getCourses: function () {
    return new Promise((resolve, reject) => {
      Course.findAll()
        .then(courses => {
          if (courses.length > 0) {
            resolve(courses);
          } else {
            reject('No results returned');
          }
        })
        .catch(err => {
          reject('No results returned');
        });
    });
  },
  getCourseById: function (id) {
    return new Promise((resolve, reject) => {
      Course.findOne({ where: { courseId: id } })
        .then(course => {
          if (course) {
            resolve(course);
          } else {
            reject('No results returned');
          }
        })
        .catch(err => {
          reject('No results returned');
        });
    });
  },
  // ...
  addStudent: function (studentData) {
    // Ensure TA value is explicitly set to true/false
    studentData.TA = !!studentData.TA;

    // Replace empty values ("") with null
    for (const prop in studentData) {
      if (studentData[prop] === "") {
        studentData[prop] = null;
      }
    }

    return new Promise((resolve, reject) => {
      Student.create(studentData)
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject('Unable to create student: ' + err.message);
        });
    });
  },
  // ...
  updateStudent: function (studentData) {
    // Ensure TA value is explicitly set to true/false
    studentData.TA = !!studentData.TA;

    // Replace empty values ("") with null
    for (const prop in studentData) {
      if (studentData[prop] === "") {
        studentData[prop] = null;
      }
    }

    return new Promise((resolve, reject) => {
      Student.update(studentData, { where: { studentNum: studentData.studentNum } })
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject('Unable to update student: ' + err.message);
        });
    });
  },
  deleteStudentByNum: function (studentNum) {
    return new Promise((resolve, reject) => {
      Student.destroy({ where: { studentNum: studentNum } })
        .then((rowsDeleted) => {
          if (rowsDeleted > 0) {
            resolve();
          } else {
            reject('No student with the given student number found');
          }
        })
        .catch(err => {
          reject('Unable to delete student: ' + err.message);
        });
    });
  },
  addCourse: function (courseData) {
    // Replace empty values ("") with null
    for (const prop in courseData) {
      if (courseData[prop] === "") {
        courseData[prop] = null;
      }
    }

    return new Promise((resolve, reject) => {
      Course.create(courseData)
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject('Unable to create course: ' + err.message);
        });
    });
  },
  updateCourse: function (courseData) {
    // Replace empty values ("") with null
    for (const prop in courseData) {
      if (courseData[prop] === "") {
        courseData[prop] = null;
      }
    }

    return new Promise((resolve, reject) => {
      Course.update(courseData, { where: { courseId: courseData.courseId } })
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject('Unable to update course: ' + err.message);
        });
    });
  },
  deleteCourseById: function (id) {
    return new Promise((resolve, reject) => {
      Course.destroy({ where: { courseId: id } })
        .then((rowsDeleted) => {
          if (rowsDeleted > 0) {
            resolve();
          } else {
            reject('No course with the given ID found');
          }
        })
        .catch(err => {
          reject('Unable to delete course: ' + err.message);
        });
    });
  }
};

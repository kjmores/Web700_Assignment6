/*********************************************************************************
*  WEB700 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this
*  assignment has been copied manually or electronically from any other source (including web sites) or 
*  distributed to other students.
* 
*  Name: Kristienne Jewel Mores Student ID: 129417226 Date: August 7, 2023
*
*  Online (Cyclic) Link:_________________________
*
********************************************************************************/ 

const express = require("express");
const HTTP_PORT = process.env.PORT || 8080;
const app = express();
const path = require("path");
const collegeData = require("./modules/collegeData");
const exphbs = require("express-handlebars");
const handlebarsHelpers = require("handlebars-helpers")(); // Initialize handlebars-helpers


// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));


// Helper for generating navigation links with active class
const navLinkHelper = (url, options) => {
  return '<li' + ((url === app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
    '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
};

// Helper for evaluating conditions for equality
const equalHelper = (lvalue, rvalue, options) => {
  if (arguments.length < 3)
    throw new Error("Handlebars Helper equal needs 2 parameters");
  if (lvalue !== rvalue) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
};


app.engine(
  "hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      navLink: navLinkHelper,
      equal: equalHelper,
      ...handlebarsHelpers, // Include all helpers from handlebars-helpers
      
    }
  })
);

app.set("view engine", "hbs");

// Middleware to set active route
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split("/")[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  next();
});

// Rest of the routes
app.get("/students/add", (req, res) => {
  collegeData
    .getCourses()
    .then((courses) => {
      res.render("addStudent", { courses: courses });
    })
    .catch(() => {
      res.render("addStudent", { courses: [] });
    });
});

app.post("/students/add", (req, res) => {
  collegeData
    .addStudent(req.body)
    .then(() => {
      res.redirect("/students");
    })
    .catch((error) => {
      console.error(error);
      res.redirect("/students?error=" + error);
    });
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/htmlDemo", (req, res) => {
  res.render("htmlDemo");
});

app.get("/theme.css", (req, res) => {
  res.sendFile(path.join(__dirname, "css/theme.css"));
});

app.get("/courses", (req, res) => {
  collegeData
    .getCourses()
    .then((courses) => {
      if (courses.length === 0) {
        res.render("courses", { message: "No results" });
      } else {
        res.render("courses", { courses: courses });
      }
    })
    .catch((err) => {
      res.render("courses", { message: "No results" });
    });
});



app.get("/student/:num", (req, res) => {
  const paramNum = req.params.num;

  Promise.all([
    collegeData.getStudentByNum(paramNum),
    collegeData.getCourses() // Fetch the courses data as well
  ])
  .then(([student, courses]) => {
    if (!student) {
      res.render("students", { message: "Student not found" });
    } else {
      // Assuming student.courses is an array of course objects
      res.render("student", { viewData: { student: student, courses: courses } });
    }
  })
  .catch((err) => {
    res.render("students", { message: "Error occurred while fetching student" });
  });
});


app.post("/student/update", (req, res) => {
  const studentNum = parseInt(req.query.studentNum);
  const updatedStudent = req.body;
  updatedStudent.studentNum = studentNum;

  // Convert TA checkbox value to a boolean
  updatedStudent.TA = req.body.TA === 'on';

  collegeData
    .updateStudent(updatedStudent)
    .then(() => {
      console.log("Student updated successfully:", updatedStudent);
      res.redirect("/students");
    })
    .catch((error) => {
      console.error("Error updating student:", error);
      res.redirect(`/student/${studentNum}?error=${error}`);
    });
});

app.get("/students", (req, res) => {
  var courses = req.query.course;
  collegeData
    .getAllStudents()
    .then((students) => {
      if (students.length === 0) {
        res.render("students", { message: "No results" });
      } else {
        if (courses) {
          return collegeData.getStudentsByCourse(courses);
        } else {
          return students;
        }
      }
    })
    .then((studentByCourse) => {
      if (studentByCourse.length === 0) {
        res.render("students", { message: "No results" });
      } else {
        res.render("students", { students: studentByCourse });
      }
    })
    .catch((err) => {
      res.render("students", { message: "No results" });
    });
});

app.get("/course/:id", (req, res) => {
  const courseId = req.params.id;

  collegeData
    .getCourseById(courseId)
    .then((course) => {
      if (!course) {
        res.status(404).send("Course Not Found");
      } else {
        res.render("course", { course: course });
      }
    })
    .catch((err) => {
      res.render("courses", { message: "Course not found" });
    });
});

app.get("/courses/add", (req, res) => {
  res.render("addCourse");
});

app.post("/courses/add", (req, res) => {
  collegeData
    .addCourse(req.body)
    .then(() => {
      res.redirect("/courses");
    })
    .catch((error) => {
      console.error(error);
      res.redirect("/courses?error=" + error);
    });
});

app.post("/course/update", (req, res) => {
  const courseId = req.query.id;
  const updatedCourse = req.body;
  updatedCourse.id = courseId;

  collegeData
    .updateCourse(updatedCourse)
    .then(() => {
      console.log("Course updated successfully:", updatedCourse);
      res.redirect("/courses");
    })
    .catch((error) => {
      console.error("Error updating course:", error);
      res.redirect(`/course/${courseId}?error=${error}`);
    });
});

app.get("/course/delete/:id", (req, res) => {
  const courseId = req.params.id;

  collegeData
    .deleteCourseById(courseId)
    .then(() => {
      res.redirect("/courses");
    })
    .catch((error) => {
      res.status(500).send("Unable to Remove Course / Course not found");
    });
});

app.post("/student/delete/:studentNum", (req, res) => {
  const studentNum = parseInt(req.params.studentNum);

  collegeData
    .deleteStudentByNum(studentNum)
    .then(() => {
      res.redirect("/students");
    })
    .catch((error) => {
      res.status(500).send("Unable to Remove Student / Student not found");
    });
});

// Initialize the college data and start the server
collegeData
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("Server is listening on port " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.error("Error initializing data: " + err);
  });

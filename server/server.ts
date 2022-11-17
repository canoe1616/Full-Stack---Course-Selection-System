import express from "express";
import bodyParser from "body-parser";
import pino from "pino";
import expressPinoLogger from "express-pino-logger";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import data = require("../ui/src/data");
import { Course, addCourseInfo, getAllCourse, deleteCourse } from "./data/course";
import {getStudentCourses, deleteStudentCourse } from "./data/student"

// set up Mongo
const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);
export let db: Db;
export let student : Collection;
export let course : Collection;
const dbErrorMessage = {error: 'db error'}

// connect to Mongo
client.connect().then(() => {
  console.log("Connected successfully to MongoDB");
  db = client.db("course-registration");
  student = db.collection('student')
  course = db.collection('course')
  // start server
  app.listen(port, () => {
    console.log(`Course Registration server listening on port ${port}`);
  });
});

// set up Express
export const app = express();
const port = parseInt(process.env.PORT) || 8095;
app.use(bodyParser.json());

// set up Pino logging
const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});
app.use(expressPinoLogger({ logger }));

// set up session
app.use(
  session({
    secret: "world's best secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },

    // comment out the following to default to a memory-based store, which,
    // of course, will not persist across load balanced servers
    // or survive a restart of the server
    store: MongoStore.create({
      mongoUrl: "mongodb://127.0.0.1:27017",
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
  })
);

declare module "express-session" {
  export interface SessionData {
    userId?: string;
  }
}

// Note: the url need to start with /api/....., otherwise error will be thrown(Could not send the url)
app.post("/api/admin/addCourse", function (req, res) {
  const courseToAdd: Course = req.body;

  try {
    addCourseInfo(courseToAdd);
    res.status(200).json(courseToAdd);
  } catch (error) {
    res.status(500).json(dbErrorMessage);
  }
});

app.delete("/api/admin/deleteCourses", async (req, res) => {
  try {
    console.log(req.body.course_id)
    const toDeleteCourseList = req.body.course_id
    deleteCourse(toDeleteCourseList)
    // TODO: one more error checking
    res.status(200).json('success') // TODO: message meaningful
  } catch (error) {
    res.status(500).json(dbErrorMessage)
  }
})

app.get('/api/courses/:student_id', async (req, res) => {
  try {
    const studentId = req.params.student_id;
    const studentSelectedCourses = await getStudentCourses(studentId)
    res.status(200).json(studentSelectedCourses)
  } catch (error) {
    console.log(error)
    res.status(500).json(dbErrorMessage)
  }
})

app.delete('/api/student/deleteCourses/:student_id', async (req, res) => {
  try {
    const studentId = req.params.student_id
    const coursesToDelete = req.body.coursesToDelete
    const deletedCourses = await deleteStudentCourse(studentId, coursesToDelete)
    if (deletedCourses != coursesToDelete.length) {
      res.status(404).json({'error': 'course not selected in deleted list'})
    }
    res.status(200).json({'success': `delete course ${JSON.stringify(coursesToDelete)}`})
  } catch (error) {
    res.status(500).json(dbErrorMessage)
  }
})

app.get('/api/all_courses', async (req, res) => {
  try {
    const allCourses = await getAllCourse();
    res.status(200).json(allCourses);
  } catch(error) {
    res.status(500).json(dbErrorMessage);
  }
})

app.post('/api/student/addCourses/:student_id', async (req, res) => {
  const studentId = req.params.student_id;
  const newCourses: Course[] = req.body.newCourses; // TODO: discuss with front-ends
  const newCoursesId = newCourses.map(course => course.courseId)

  try {
    const courseExist = await db.collection('course').find({ courseId: {$in: newCoursesId}}).toArray()
    if (courseExist.length != newCoursesId.length) {
      res.status(404).json({'error': 'non-exist course in selected course'})
      return
    }

    const result = await db.collection('student').updateOne(
      {
        studentId: studentId
      },
      {
        $push: { courses: { $each : newCourses } } 
      }
    )
    res.status(200).json(result)
  } catch(error) {
    res.status(500).json(dbErrorMessage);
  }
})

// TODO: what need to be done if a course in a student is deleted
// TODO: check out where is session, and how to use seesion to optimize code
// TODO: coonect with auth mechanism
// TODO: finish CI/CD
// TODO: build front-end pages
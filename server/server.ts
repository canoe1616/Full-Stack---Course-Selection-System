import express from "express";
import bodyParser from "body-parser";
import pino from "pino";
import expressPinoLogger from "express-pino-logger";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import data = require("../ui/src/data");
import { Course, addCourseInfo, getAllCourse, deleteCourse, deleteCourseFromAllStudent } from "./data/course";
import {getStudentCourses, deleteStudentCourse, coursesInStudentClassList } from "./data/student"

// set up Mongo
const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);
export let db: Db;
export let coursedb : Collection;
const dbErrorMessage = {error: 'db error'}

// connect to Mongo
client.connect().then(() => {
  console.log("Connected successfully to MongoDB");
  db = client.db("course-registration");
  coursedb = db.collection('course')
  // start server
  app.listen(port, () => {
    console.log(`Course Registration server listening on port ${port}`);
  });
});

// set up Express
export const app = express();
const port = parseInt(process.env.PORT) || 8095;
app.use(bodyParser.json());

// TODO: uncomment this when push
// set up Pino logging
// const logger = pino({
//   transport: {
//     target: "pino-pretty",
//   },
// });
// app.use(expressPinoLogger({ logger }));

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


/**
 * @param: course to add (note could only add one course at a time)
 * @description: add a course to the database
 */
app.post("/api/admin/addCourse", async function (req, res) {
  const courseToAdd: Course = req.body;

  try {
    const ret = await addCourseInfo(courseToAdd);
    if (ret !== null) {
      res.status(500).json({'error': 'add duplicate course'})
      return
    }
    res.status(200).json(courseToAdd);
  } catch (error) {
    res.status(500).json(dbErrorMessage);
  }
});

/**
 * @param: couesse to delete string[]
 * @description: delete courses from student who take this course
 */
app.delete("/api/admin/deleteCourses", async (req, res) => {
  try {
    const toDeleteCourseList = req.body.coursesToDelete
    deleteCourse(toDeleteCourseList)
    deleteCourseFromAllStudent(toDeleteCourseList)
    res.status(200).json({'result': `deleted course ${toDeleteCourseList}`})
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

/**
 * @param: courses to delete - string[]
 * @description: delete courses specified in course list in student, Note: this is an atomic operation
 * @error_behavior
 * - delete couese not exist in student courses list
 */
app.delete('/api/student/deleteCourses/:student_id', async (req, res) => {
  try {
    const studentId = req.params.student_id
    const coursesToDelete = req.body.coursesToDelete
    const deletedCoursesLength = await deleteStudentCourse(studentId, coursesToDelete)
    if (deletedCoursesLength !== coursesToDelete.length) {
      res.status(404).json({'error': `deleted courses not selected by student ${studentId}`})
      return
    }

    res.status(200).json({'result': `delete course ${coursesToDelete}`})
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

/**
 * @param: new class id list to add - string[]
 * @description: add course to student course list. Note: this operation is atomic. Hence, when
 * it is fail, no class would be add into student class list
 * @error_behavior - 
 * - add course already in student course list
 * - add course not in admin course page (i.e. this course is not exist)
 */
app.post('/api/student/addCourses/:student_id', async (req, res) => {
  const studentId = req.params.student_id;
  const newCoursesId = req.body.newCourses

  try {
    const coursesToAdd = await db.collection('course').find({ courseId: {$in: newCoursesId}}).toArray()
    if (coursesToAdd.length != newCoursesId.length) {
      res.status(404).json({'error': 'non-exist course in selected course'})
      return
    }

    const duplicateCourseToAdd = await coursesInStudentClassList(studentId, newCoursesId)
    if (duplicateCourseToAdd) {
      res.status(404).json({'error': `courses ${duplicateCourseToAdd} already in student course list`})
      return
    }

    await db.collection('student').updateOne(
      {
        studentId: studentId
      },
      {
        $push: { courses: { $each : coursesToAdd } } 
      }
    )
    res.status(200).json({'result': `classes ${newCoursesId} added`})
  } catch(error) {
    res.status(500).json(dbErrorMessage);
  }
})

// TODO: what need to be done if a course in a student is deleted
// TODO: check out where is session, and how to use seesion to optimize code
// TODO: coonect with auth mechanism
// TODO: finish CI/CD
// TODO: build front-end pages
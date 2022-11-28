import express from "express";
import bodyParser from "body-parser";
import pino from "pino";
import expressPinoLogger from "express-pino-logger";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import testData from "./testData.json";
import { Course, addCourseInfo, getAllCourse, deleteCourse, deleteCourseFromAllStudent } from "./data/course";
import {getStudentCourses, deleteStudentCourse, coursesInStudentClassList } from "./data/student"

// set up Mongo
const url = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);

export let db: Db;
export let coursedb: Collection;
export let maxCredit: Collection;
const dbErrorMessage = { error: "db error" };

// set up Express
export const app = express();
const port = parseInt(process.env.PORT) || 8095;
app.use(bodyParser.json());

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
      mongoUrl: url,
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
  })
);

declare module "express-session" {
  export interface SessionData {
    userId?: string;
  }
}

// TODO: Get rid of test data
app.get("/api/user", (req, res) => {
  // res.json(req.user || {});
  res.json(testData.test_user);
});

/**
 * @param: course to add (note could only add one course at a time)
 * @atomicity - atomic
 * @description: add a course to the database
 */
app.post("/api/admin/addCourse", async function (req, res) {
  const courseToAdd: Course = req.body;

  try {
    const ret = await addCourseInfo(courseToAdd);
    if (ret !== null) {
      res.status(500).json({ error: "add duplicate course" });
      return;
    }
    res.status(200).json(courseToAdd);
  } catch (error) {
    res.status(500).json(dbErrorMessage);
  }
});



/**
 * @param: the maxcredit that either originally from the database which is 0 or editted by the admin
 * @atomicity - atomic
 * @description: get the updated/original maxCredit
 */

 app.get("/api/system_config", async function (req, res){
  const maxCreditValue = await maxCredit.findOne({})
  if (maxCreditValue === null) {
    res.status(200).json({max_credits: 0})
    return
  }

  res.status(200).json({max_credits: maxCreditValue.max_credits})
 })


/**
 * @param: the maxcredit that editted by the admin from the frontend and need to be updated in the MongoDB database
 * @atomicity - atomic
 * @description: updated the new maxCredit in the MongoDB database
 */

app.put('/api/system_config', async function(req, res){
  const maxCreditValue = await maxCredit.findOne({})
  console.log(maxCreditValue)
  if (maxCreditValue === null) {
    await maxCredit.insertOne(
      {
        max_credits: req.body.newMaxCredit
      }
    )
    res.status(200).json({ status: "ok" })
    return
  }


  await maxCredit.updateOne(
    {"max_credits" : req.body.maxCredit},
    {$set: { "max_credits" : req.body.newMaxCredit }}
  )
  res.status(200).json({ status: "ok" })
})


/**
 * @param: the maxcredit that either originally from the database which is 0 or editted by the admin
 * @atomicity - atomic
 * @description: get the updated/original maxCredit
 */

app.get("/api/system_config", async function (req, res) {
  const maxCreditValue = await maxCredit.findOne({});
  if (maxCreditValue === null) {
    res.status(200).json({ max_credits: 0 });
    return;
  }

  res.status(200).json({ max_credits: maxCreditValue.max_credits });
});

/**
 * @param: the maxcredit that editted by the admin from the frontend and need to be updated in the MongoDB database
 * @atomicity - atomic
 * @description: updated the new maxCredit in the MongoDB database
 */

app.put("/api/system_config", async function (req, res) {
  const maxCreditValue = await maxCredit.findOne({});
  console.log(maxCreditValue);
  if (maxCreditValue === null) {
    await maxCredit.insertOne({
      max_credits: req.body.newMaxCredit,
    });
    res.status(200).json({ status: "ok" });
    return;
  }

  await maxCredit.updateOne(
    { max_credits: req.body.maxCredit },
    { $set: { max_credits: req.body.newMaxCredit } }
  );
  res.status(200).json({ status: "ok" });
});

/**
 * @param: couesse to delete string[]
 * @description: delete courses from admin, it also delete class from student's class list
 * @atomicity - atomic
 */
app.delete("/api/admin/deleteCourses", async (req, res) => {
  try {
    const toDeleteCourseList = req.body.coursesToDelete;
    deleteCourse(toDeleteCourseList);
    deleteCourseFromAllStudent(toDeleteCourseList);
    res.status(200).json({ result: `deleted course ${toDeleteCourseList}` });
  } catch (error) {
    res.status(500).json(dbErrorMessage);
  }
});

app.get("/api/courses/:student_id", async (req, res) => {
  try {
    const studentId = req.params.student_id;
    const studentSelectedCourses = await getStudentCourses(studentId);
    res.status(200).json(studentSelectedCourses);
  } catch (error) {
    console.log(error);
    res.status(500).json(dbErrorMessage);
  }
});

/**
 * @param: courses to delete - string[]
 * @description: delete courses specified in course list in student
 * @atomicity - atomic
 * @error_behavior
 * - delete couese not exist in student courses list
 */
app.delete("/api/student/deleteCourses/:student_id", async (req, res) => {
  try {
    const studentId = req.params.student_id;
    const coursesToDelete = req.body.coursesToDelete;
    const deletedCoursesLength = await deleteStudentCourse(
      studentId,
      coursesToDelete
    );
    if (deletedCoursesLength !== coursesToDelete.length) {
      res
        .status(404)
        .json({
          error: `deleted courses not selected by student ${studentId}`,
        });
      return;
    }

    res.status(200).json({ result: `delete course ${coursesToDelete}` });
  } catch (error) {
    res.status(500).json(dbErrorMessage);
  }
});

app.get("/api/all_courses", async (req, res) => {
  try {
    const allCourses = await getAllCourse();
    res.status(200).json(allCourses);
  } catch (error) {
    res.status(500).json(dbErrorMessage);
  }
});

/**
 * @param: new class id list to add - string[]
 * @description: add course to student course list.
 * @atomicity - atomic
 * @error_behavior -
 * - add course already in student course list
 * - add course not in admin course page (i.e. this course is not exist)
 */
app.post("/api/student/addCourses/:student_id", async (req, res) => {
  const studentId = req.params.student_id;
  const newCoursesId = req.body.newCourses;

  try {
    const coursesToAdd = await db
      .collection("course")
      .find({ courseId: { $in: newCoursesId } })
      .toArray();
    if (coursesToAdd.length != newCoursesId.length) {
      res.status(404).json({ error: "non-exist course in selected course" });
      return;
    }

    const duplicateCourseToAdd = await coursesInStudentClassList(studentId, newCoursesId)
    if (duplicateCourseToAdd !== null && duplicateCourseToAdd.length !== 0) {
      res.status(404).json({'error': `courses ${duplicateCourseToAdd} already in student course list`})
      return
    }

    const studentExist = await db.collection('student').findOne(
      {
        studentId: studentId
      }
    );

    if (studentExist === null) {
      res.status(404).json({'error': `student ${studentId} not exist`})
      return
    }

    await db.collection('student').updateOne(
      {
        studentId: studentId,
      },
      {
        $push: { courses: { $each: coursesToAdd } },
      }
    )
    res.status(200).json({'result': `classes ${newCoursesId} added`})
  } catch(error) {
    console.log(error)
    res.status(500).json(dbErrorMessage);
  }
});

// TODO: what need to be done if a course in a student is deleted
// TODO: check out where is session, and how to use seesion to optimize code
// TODO: coonect with auth mechanism
// TODO: finish CI/CD
// TODO: build front-end pages


// connect to Mongo
client.connect().then(() => {
  console.log("Connected successfully to MongoDB");
  db = client.db("course-registration");
  maxCredit = db.collection('maxCredit')
  coursedb = db.collection('course')

  // start server
  app.listen(port, () => {
    console.log(`Course Registration server listening on port ${port}`);
  });
});

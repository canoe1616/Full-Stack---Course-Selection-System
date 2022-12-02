import { userInfo } from "os";
import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import pino from "pino";
import expressPinoLogger from "express-pino-logger";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import { Issuer, Strategy } from "openid-client";
import passport from "passport";
import { keycloak } from "./secrets";
import {
  Course,
  addCourseInfo,
  getAllCourse,
  deleteCourse,
  deleteCourseFromAllStudent,
} from "./data/course";
import {
  getStudentCourses,
  deleteStudentCourse,
  coursesInStudentClassList,
} from "./data/student";

if (process.env.PROXY_KEYCLOAK_TO_LOCALHOST) {
  // NOTE: this is a hack to allow Keycloak to run from the 
  // same development machine as the rest of the app. We have exposed
  // Keycloak to run off port 8081 of localhost, where localhost is the
  // localhost of the underlying laptop, but localhost inside of the
  // server's Docker container is just the container, not the laptop.
  // The following line creates a reverse proxy to the Keycloak Docker
  // container so that localhost:8081 can also be used to access Keycloak.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("http-proxy").createProxyServer({ target: "http://keycloak:8080" }).listen(8081)
}

// set up Mongo
const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017"
const client = new MongoClient(mongoUrl);

export let db: Db;
export let coursedb: Collection;
export let maxCredit: Collection;
export let adminDb: Collection;
export let studentDb: Collection;

const dbErrorMessage = { error: "db error" };

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
      mongoUrl: mongoUrl,
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user: any, done: any) => {
  logger.info("serializeUser " + JSON.stringify(user));
  done(null, user);
});
passport.deserializeUser((user: any, done: any) => {
  logger.info("deserializeUser " + JSON.stringify(user));
  done(null, user);
});

function checkAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    res.sendStatus(401);
    return;
  }
  next();
}

// api routes

/**
 * @param:
 * @atomicity - atomic
 */
app.get("/api/user", async (req, res) => {
  if (req.user) {
    const userId = (req.user as any).preferred_username;
    const admin = await adminDb.findOne({ userId: userId });
    if (admin) {
      res.json(req.user);
    } else {
      const entry = await studentDb.findOne({ studentId: userId });
      res.json(entry);
    }
  } else {
    res.json({});
  }
});

/**
 * @param: none
 * @atomicity - atomic
 * @description: log out of the current page for user
 */
app.post("/api/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

/**
 * @param: course to add (note could only add one course at a time)
 * @atomicity - atomic
 * @description: add a course to the database
 */
app.post("/api/admin/addCourse", checkAuthenticated, async function (req, res) {
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

app.get("/api/system_config", checkAuthenticated, async function (req, res) {
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

app.put("/api/system_config", checkAuthenticated, async function (req, res) {
  const maxCreditValue = await maxCredit.findOne({});
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
 * @param: the maxcredit that either originally from the database which is 0 or editted by the admin
 * @atomicity - atomic
 * @description: get the updated/original maxCredit
 */

app.get("/api/system_config", checkAuthenticated, async function (req, res) {
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

app.put("/api/system_config", checkAuthenticated, async function (req, res) {
  const maxCreditValue = await maxCredit.findOne({});
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
app.delete("/api/admin/deleteCourses", checkAuthenticated, async (req, res) => {
  try {
    const toDeleteCourseList = req.body.coursesToDelete;
    deleteCourse(toDeleteCourseList);
    deleteCourseFromAllStudent(toDeleteCourseList);
    res.status(200).json({ result: `deleted course ${toDeleteCourseList}` });
  } catch (error) {
    res.status(500).json(dbErrorMessage);
  }
});

app.get("/api/courses/:student_id", checkAuthenticated, async (req, res) => {
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
app.delete(
  "/api/student/deleteCourses/:student_id",
  checkAuthenticated,
  async (req, res) => {
    try {
      const studentId = req.params.student_id;
      const coursesToDelete = req.body.courseId;
      const deletedCoursesLength = await deleteStudentCourse(
        studentId,
        coursesToDelete
      );
      if (deletedCoursesLength !== coursesToDelete.length) {
        res.status(404).json({
          error: `deleted courses not selected by student ${studentId}`,
        });
        return;
      }

      res.status(200).json({ result: `delete course ${coursesToDelete}` });
    } catch (error) {
      res.status(500).json(dbErrorMessage);
    }
  }
);

app.get("/api/all_courses", checkAuthenticated, async (req, res) => {
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
  const newCoursesId = req.body.courseId;
  try {
    const coursesToAdd = await db
      .collection("course")
      .find({ courseId: { $in: newCoursesId } })
      .toArray();
    if (coursesToAdd.length != newCoursesId.length) {
      res.status(404).json({ error: "non-exist course in selected course" });
      return;
    }
    const duplicateCourseToAdd = await coursesInStudentClassList(
      studentId,
      newCoursesId
    );
    if (duplicateCourseToAdd !== null && duplicateCourseToAdd.length !== 0) {
      res.status(404).json({
        error: `courses ${duplicateCourseToAdd} already in student course list`,
      });
      return;
    }

    const studentExist = await db.collection("student").findOne({
      studentId: studentId,
    });

    if (studentExist === null) {
      res.status(404).json({ error: `student ${studentId} not exist` });
      return;
    }

    await db.collection("student").updateOne(
      {
        studentId: studentId,
      },
      {
        $push: { courses: { $each: coursesToAdd } },
      }
    );
    res.status(200).json({ result: `classes ${newCoursesId} added` });
  } catch (error) {
    console.log(error);
    res.status(500).json(dbErrorMessage);
  }
});

// connect to Mongo
client.connect().then(() => {
  console.log("Connected successfully to MongoDB");
  db = client.db("course-registration");
  maxCredit = db.collection("maxCredit");
  coursedb = db.collection("course");
  adminDb = db.collection("admin");
  studentDb = db.collection("student");

  Issuer.discover(
    "http://127.0.0.1:8081/auth/realms/CourseRegistration/.well-known/openid-configuration"
  ).then((issuer) => {
    const client = new issuer.Client(keycloak);

    passport.use(
      "oidc",
      new Strategy(
        {
          client,
          params: {
            // this forces a fresh login screen every time
            prompt: "login",
          },
        },
        async (tokenSet: any, userInfo: any, done: any) => {
          logger.info("oidc " + JSON.stringify(userInfo));
          const _id = userInfo.preferred_username;
          const user = await adminDb.findOne({ userId: _id });
          if (user != null) {
            userInfo.roles = ["admin"];
          } else {
            await studentDb.updateOne(
              { userId: _id },
              {
                $set: {
                  studentId: userInfo.preferred_username,
                  name: userInfo.name,
                  department: "ECE",
                  courses: [],
                },
              },
              { upsert: true }
            );
            userInfo.roles = ["student"];
          }
          return done(null, userInfo);
        }
      )
    );

    app.get(
      "/api/login",
      passport.authenticate("oidc", { failureRedirect: "/api/login" }),
      (req, res) => res.redirect("/")
    );

    app.get(
      "/api/login-callback",
      passport.authenticate("oidc", {
        successRedirect: "/",
        failureRedirect: "/api/login",
      })
    );

    // start server
    app.listen(port, () => {
      logger.info(`Smoothie server listening on port ${port}`);
    });
  });
});

// TODO: what need to be done if a course in a student is deleted
// TODO: check out where is session, and how to use seesion to optimize code
// TODO: coonect with auth mechanism
// TODO: finish CI/CD
// TODO: build front-end pages

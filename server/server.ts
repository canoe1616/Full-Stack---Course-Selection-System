import express from "express";
import bodyParser from "body-parser";
import pino from "pino";
import expressPinoLogger from "express-pino-logger";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import data = require("../ui/src/data");
import { Course, addCourseInfo } from "./data/course";

// set up Mongo
const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);
let db: Db;
let maxCredit :Collection;

// connect to Mongo
client.connect().then(() => {
  console.log("Connected successfully to MongoDB");
  db = client.db("course-registration");
  maxCredit = db.collection('maxCredit')
  // start server
  app.listen(port, () => {
    console.log(`Course Registration server listening on port ${port}`);
  });
});

// set up Express
const app = express();
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
    addCourseInfo(courseToAdd)
    return res.status(200).json(courseToAdd);
  } catch (error) {
    return res.status(500).json(error);
  }
});

app.get('/api/courses/:student_id', f => f)
app.delete('/api/student/deleteCourses/:student_id', f => f)
app.get('/api/all_courses', f => f)
app.post('/api/student/addCourses/:student_id', f => f)



// GET /api/system_config

 app.get("/api/system_config", async function (req, res){
  console.log("ready to send the maxcredit back to the front end")
  res.status(200).json((await (maxCredit).findOne()))
 })


// for hellp admin page


app.put('/api/system_config', function(req, res){
  // body: {max_credits: number}

})





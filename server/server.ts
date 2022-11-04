import express from "express";
import bodyParser from "body-parser";
import pino from "pino";
import expressPinoLogger from "express-pino-logger";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import data = require("../ui/src/data");

// set up Mongo
const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);
let db: Db;
let customers: Collection;
let orders: Collection;
let operators: Collection;

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

app.post('/admin/addCourse', function (req, res){
  //body
  const  courseId = req.body.courseId
  const name = req.body.name
  const instructor = req.body.instructor
  const startTime = req.body.startTime
  const endTime = req.body.endTime
  const status = req.body.status
  const weekdays = req.body.weekdays
  const capacity = req.body.number
  
  return res.status(200).json(data.addCourseInfo(courseId,name,instructor,startTime,endTime,status,weekdays,capacity))
})







// connect to Mongo
client.connect().then(() => {
  console.log("Connected successfully to MongoDB");
  db = client.db("course-registration");

  // start server
  app.listen(port, () => {
    console.log(`Smoothie server listening on port ${port}`);
  });
});

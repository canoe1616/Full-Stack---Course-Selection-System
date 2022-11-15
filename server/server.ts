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
  //body
  const courseId = req.body.courseId;
  const name = req.body.name;
  const instructor = req.body.instructor;
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const status = req.body.status;
  const weekdays = req.body.weekdays;
  const capacity = req.body.number;

  // Test if backend receive the data.
  console.log(req.body);

  try {
    // TODO: Implement logic to add to database

    // You just need to return status code. No actual data need to be returned.
    // On the front-end side, redirect to admin home after a successful course-add.
    return res.status(200);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// connect to Mongo
client.connect().then(() => {
  console.log("Connected successfully to MongoDB");
  db = client.db("course-registration");

  // start server
  app.listen(port, () => {
    console.log(`Course Registration server listening on port ${port}`);
  });
});

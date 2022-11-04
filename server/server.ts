import express from "express";
import bodyParser from "body-parser";
import pino from "pino";
import expressPinoLogger from "express-pino-logger";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Collection, Db, MongoClient, ObjectId } from "mongodb";

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

// // app routes
// app.get("/api/possible-ingredients", (req, res) => {
//   res.status(200).json(possibleIngredients);
// });

// app.get("/api/orders", async (req, res) => {
//   res
//     .status(200)
//     .json(await orders.find({ state: { $ne: "draft" } }).toArray());
// });

// app.get("/api/customer/:customerId", async (req, res) => {
//   const _id = req.params.customerId;
//   const customer = await customers.findOne({ _id });
//   if (customer == null) {
//     res.status(404).json({ _id });
//     return;
//   }
//   customer.orders = await orders
//     .find({ customerId: _id, state: { $ne: "draft" } })
//     .toArray();
//   res.status(200).json(customer);
// });

// connect to Mongo
client.connect().then(() => {
  console.log("Connected successfully to MongoDB");
  db = client.db("course-registration");

  // start server
  app.listen(port, () => {
    console.log(`Smoothie server listening on port ${port}`);
  });
});

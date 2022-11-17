import { MongoClient } from "mongodb";
import { SystemConfig } from "../data/systemConfig";

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

const maxCredit:SystemConfig = {
  max_credits : 0

};


 
async function main() {
  await client.connect();
  console.log("Connected successfully to MongoDB");

  const db = client.db("course-registration");
  // This part is for testing
  console.log(await db.collection('student').insertOne({name: 'Ian Liu', department: 'ECE'}));
  // This part is for maxCredit original setting
  console.log("inserting maxCredit", await db.collection("maxCredit").insertOne( maxCredit as any))
  process.exit(0);
}

main();

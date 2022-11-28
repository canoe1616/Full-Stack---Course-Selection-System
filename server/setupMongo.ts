import { MongoClient } from "mongodb";
import { SystemConfig } from "./data/systemConfig";

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

const maxCredit:SystemConfig = {
  max_credits : 0
};


 
async function main() {
  await client.connect();
  console.log("Connected successfully to MongoDB");

  const db = client.db("course-registration");
  console.log("inserting maxCredit", await db.collection("maxCredit").insertOne( maxCredit as any))
  console.log(await db.collection('student').insertOne({studentId: "cl583", name: 'Ian Liu', department: 'ECE', courses: []}));

  process.exit(0);
}

main();

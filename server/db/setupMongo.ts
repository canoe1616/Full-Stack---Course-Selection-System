import { MongoClient } from "mongodb";

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);


async function main() {
  await client.connect();
  console.log("Connected successfully to MongoDB");

  const db = client.db("course-registration");
  // This part is for testing
  console.log(await db.collection('student').insertOne({name: 'Ian Liu', department: 'ECE'}));
  process.exit(0);
}

main();

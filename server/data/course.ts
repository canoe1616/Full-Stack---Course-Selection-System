import { db } from "../server"
import { Student } from "./student"

export interface Course {
    courseId: string
    name: string
    instructor_name: string
    start_time: string
    end_time: string
    day: string
    location: string
    max_capacity: number
    curr_capacity: number
    credits: number
    status: "open" | "close"
    department: string
}


export async function addCourseInfo(course : Course) {
    await db.collection('course').insertOne(course);
}

export async function getAllCourse() {
    // console.log(await db.collection('course').find().toArray())
    return db.collection('course').find().toArray();
}

export function addCourseToStudent(course: Course, student : Student) {

}
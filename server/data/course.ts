import { course, db } from "../server"

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

export async function deleteCourse(toDeleteCourses: string []) {
    for (const [_, toDeleteCourseId] of toDeleteCourses.entries()) {
        console.log(`get` + toDeleteCourseId)
        await course.deleteOne({"courseId" : toDeleteCourseId})
    }
}
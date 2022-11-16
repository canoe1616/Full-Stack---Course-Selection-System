import { db, student } from "../server"
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

export function getStudentCourses(studentId: string)  {
    return student.find({studentId : studentId})
                    .project({courses: 1})
                    .toArray()
}

export async function deleteStudentCourse(studentId: string, coursesToDelete : string[]) {
    const matchedStudent = await student.findOne({studentId : studentId})
    const withinDeleteList = (course : Course, deleteList : string[]) => {
        const inList = deleteList.find((deleteCourse) => course.courseId === deleteCourse)
        return !!inList
    }

    const updatedCourse = (matchedStudent.courses as Course[]).filter((course) => (!withinDeleteList(course, coursesToDelete)) )
    const res = await student.updateOne(
        {
            studentId: studentId
        },
        {
            $set: {courses: updatedCourse}
        }
    )

    return updatedCourse.length
}
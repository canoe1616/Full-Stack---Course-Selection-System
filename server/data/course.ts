import { coursedb, db } from "../server"
import { deleteStudentCourse, Student } from "./student"

export interface Course {
  courseId: string;
  name: string;
  instructor_name: string;
  start_time: string;
  end_time: string;
  day: string;
  location: string;
  max_capacity: number;
  curr_capacity: number;
  credits: number;
  status: "open" | "close";
  department: string;
}


export async function addCourseInfo(course : Course) {
    const res = await coursedb.findOne({courseId: course.courseId})
    if (res === null) {
        await db.collection('course').insertOne(course);
    }
    return res
}

export async function getAllCourse() {
    return db.collection('course').find().toArray();
}

export async function deleteCourse(toDeleteCourses: string []) {
    for (const [_, toDeleteCourseId] of toDeleteCourses.entries()) {
        await coursedb.deleteOne({"courseId" : toDeleteCourseId})
    }
}

export async function deleteCourseFromAllStudent(toDelCourseId: string[]) {
    const students = await db.collection('student').find({}).toArray()

    for (const [_, student] of students.entries()) {
       deleteStudentCourse(student.studentId, toDelCourseId)
    }
}

import { Course } from './course'
import { User } from './user'
import { student } from '../server'

export interface Student extends User {
    studentId: string
    courses: Course[]
    department: string
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
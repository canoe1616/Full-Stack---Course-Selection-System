export interface Course {
    courseId: string
    name: string
    instructor: string
    startTime: string
    endTime: string
    status: string
    weekdays: string
    capacity: number

}


export function addCourseInfo(courseId: string, name: string,
    instructor: string, startTime: string, endTime: string,
    status: string, weekdays: string, capacity: number){
    let course : Course
    // course.courseId =courseId
    // coursename,instructor,startTime,endTime,status,weekdays,capacity
    course = {courseId, name,instructor,startTime, endTime, status, weekdays,capacity }
    return course
}
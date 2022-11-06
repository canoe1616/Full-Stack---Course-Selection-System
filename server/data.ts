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
    // course.courseId =courseId
    // coursename,instructor,startTime,endTime,status,weekdays,capacity
    const course: Course = {courseId, name,instructor,startTime, endTime, status, weekdays,capacity }
    return course
}
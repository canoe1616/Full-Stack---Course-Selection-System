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

export function addCourseInfo(course : Course){
    // TODO: handle DB logic
}
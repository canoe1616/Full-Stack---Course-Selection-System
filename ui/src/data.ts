export interface Course {
    courseId: string
    name: string
    instructor: string
    startTime: string
    endTime: string
    status: "open" | "closed"
    weekdays: string
    capacity: number

}

export async function addCourseInfo(courseId: string, name: string,
    instructor: string, startTime: string, endTime: string,
    status: string, weekdays: string, capacity: number): Promise<void> {
    const response = await fetch('/admin/addCourse', {
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            courseId, 
            name,
            instructor,
            startTime,
            endTime,
            status,
            weekdays,
            capacity
        }),
        method: "POST",

    });
    if (response.status === 200) {
        return Promise.resolve(response.json());
    }
    else {
        return Promise.reject();
    }



}
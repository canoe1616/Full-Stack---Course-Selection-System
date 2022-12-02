export interface Course {
  courseId: string;
  name: string;
  instructor: string;
  startTime: string;
  endTime: string;
  status: "open" | "closed";
  weekdays: string;
  capacity: number;
}

export async function addCourseInfo(
  courseId: string,
  name: string,
  instructor_name: string,
  start_time: string,
  end_time: string,
  status: string,
  day: string,
  max_capacity: number
): Promise<void> {
  const response = await fetch("/api/admin/addCourse", {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      courseId,
      name,
      instructor_name,
      start_time,
      end_time,
      status,
      day,
      max_capacity,
    }),
    method: "POST"
  });
  //
  if (response.status === 200) {
    return Promise.resolve();
  } else {
    return Promise.reject();
  }
}

# cs590-final-CourseRegistration



## API Definition 

View my courses list API

GET /api/courses/:student_id
DELETE /api/student/deleteCourses/:student_id/ body: req.body.coursesToDelete: string[] (i.e. list of courseId to delete)


View all courses

GET /api/all_courses
POST /api/student/addCourses/:student_id courses_id: list of Course (req.body.newCourses)


Admin

Hello Admin Page

GET /api/admin/:userid
GET /api/system_config (get it form db document system_config): for getting credit
PUT /api/system_config body: {max_credits: number}




Mangage Course Page

POST /api/admin/addCourse req.body: Course[]
PUT /api/admin/edit body: {courseId, name, instructor, startTime, endTIme, status, weekdays, capacity} (with some field to be optional)
DELETE /api/admin/deleteCourses req.body.coursesToDelete: string[] (i.e. list of courseId to delete)

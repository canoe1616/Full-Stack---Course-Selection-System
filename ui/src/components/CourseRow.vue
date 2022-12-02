<template>
  <b-card style="min-width: 89%">
    <b-card-header header-text-variant="white" header-bg-variant="dark">
      <h3>{{ course.name }}</h3>
      <div class="text-right">
        <b-button
          @click="
            buttonAction?.includes('register')
              ? registerCourse(course.courseId)
              : dropCourse(course.courseId)
          "
          :disabled="
            buttonAction?.includes('drop') || course?.status?.match('open')
              ? false
              : true
          "
          class="mb-2"
          :variant="buttonAction?.includes('register') ? 'success' : 'danger'"
          >{{ buttonAction }}</b-button
        >
      </div>
    </b-card-header>
    <b-button v-b-toggle.collapse-1-inner size="xl" :key="course.courseId"
      >Show more</b-button
    >
    <b-collapse id="collapse-1-inner" class="mt-2">
      <b-card-group>
        <b-card bg-variant="primary" text-variant="white" border-variant="dark"
          >Instructor: {{ course.instructor_name }}</b-card
        >
        <b-card bg-variant="primary" text-variant="white" border-variant="dark"
          >Days: {{ course.day }}</b-card
        >
        <b-card bg-variant="primary" text-variant="white" border-variant="dark"
          >Start time: {{ course.start_time }}</b-card
        >
        <b-card bg-variant="primary" text-variant="white" border-variant="dark"
          >End time: {{ course.end_time }}</b-card
        >
        <b-card bg-variant="primary" text-variant="white" border-variant="dark"
          >Capacity: {{ course.curr_capacity ? course.curr_capacity : 0 }}/{{
            course.max_capacity
          }}</b-card
        >
        <b-card bg-variant="primary" text-variant="white" border-variant="dark"
          >Status: {{ course.status }}</b-card
        >
      </b-card-group>
    </b-collapse>
  </b-card>
</template>

<script setup lang="ts">
import { Ref, inject } from "vue";
import { BButton, BTable, BCard, BCollapse, BAlert } from "bootstrap-vue";
import { Course } from "../../../server/data/course";
import { User } from "../../../server/data/user";

const user: Ref<User> = inject("user")!;

interface Props {
  course: Course;
  buttonAction: "register" | "drop";
}

const props = withDefaults(defineProps<Props>(), {
  course: (): Course => ({
    courseId: "",
    name: "",
    instructor_name: "",
    start_time: "",
    end_time: "",
    day: "",
    location: "",
    max_capacity: 0,
    curr_capacity: 0,
    credits: 0,
    status: "open",
    department: "",
  }),
  buttonAction: "drop",
});

async function registerCourse(courseId: string) {
  console.log(courseId);
  const response = await fetch(`/api/student/addCourses/${user.value.userId}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      courseId: [courseId],
    }),
  });

  if (response.status === 200) {
    emit("UpdateAllert", true);
  } else {
    emit("UpdateAllert", false);
  }
}

async function dropCourse(courseId: string) {
  const response = await fetch(
    `/api/student/deleteCourses/${user.value.userId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
      body: JSON.stringify({
        courseId: [courseId],
      }),
    }
  );
  if (response.status === 200) {
    emit("UpdateAllert", true);
  } else {
    emit("UpdateAllert", false);
  }
}

// events
const emit = defineEmits<{
  (e: "UpdateAllert", successAllert: boolean): void;
}>();
</script>

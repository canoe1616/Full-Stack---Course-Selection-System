<template>
  <div class="mx-3 my-3">
    <b-alert
      :show="showSuccessAllert"
      dismissible
      variant="success"
      @dismissed="showSuccessAllert = false"
    >
      <p>Successfully registered courses!</p>
    </b-alert>
    <b-alert
      :show="showFailureAllert"
      dismissible
      variant="danger"
      @dismissed="showFailureAllert = false"
    >
      <p>Failed to register courses!</p>
    </b-alert>

    <b-row
      v-for="course in allCourses"
      v-bind:key="course.courseId"
      :aria-rowspan="120"
    >
      <CourseRowVue
        :course="course"
        buttonAction="register"
        @UpdateAllert="setAlert"
      />
    </b-row>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, inject, onMounted, watch } from "vue";
import { BButton, BTable, BCard, BCollapse, BAlert } from "bootstrap-vue";
import { Course } from "../../../server/data/course";
import { User } from "../../../server/data/user";
import CourseRowVue from "@/components/CourseRow.vue";

const user: Ref<User> = inject("user")!;

const allCourses: Ref<Course[]> = ref([]);

const showSuccessAllert: Ref<boolean> = ref(false);

const showFailureAllert: Ref<boolean> = ref(false);

async function refresh() {
  if (user.value.userId) {
    allCourses.value = await (await fetch(`/api/all_courses/`)).json();
  }
}
watch(user, refresh, { immediate: true });
onMounted(refresh);

function setAlert(actionResult: boolean) {
  if (actionResult) {
    showSuccessAllert.value = true;
  } else {
    showFailureAllert.value = true;
  }
}
</script>

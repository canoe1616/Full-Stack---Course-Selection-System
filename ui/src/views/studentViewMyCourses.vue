<template>
  <div class="mx-3 my-3">
    <div>
      <b-alert
        :show="showSuccessAllert"
        dismissible
        variant="success"
        @dismissed="showSuccessAllert = false"
      >
        <p>Successfully droped courses!</p>
      </b-alert>

      <b-alert
        :show="showFailureAllert"
        dismissible
        variant="danger"
        @dismissed="showFailureAllert = false"
      >
        <p>Failed to drop courses!</p>
      </b-alert>

      <b-card no-body>
        <b-tabs card>
          <b-tab title="Courses" active>
            <b-card-text>
              <b-row
                v-for="course in myCourses"
                v-bind:key="course.courseId"
                :aria-rowspan="120"
              >
                <CourseRowVue
                  :course="course"
                  buttonAction="drop"
                  @UpdateAllert="setAlert"
                />
              </b-row>
            </b-card-text>
          </b-tab>
          <b-tab title="Calendar">
            <b-card-text>Tab contents 2</b-card-text>
          </b-tab>
        </b-tabs>
      </b-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, inject, onMounted, watch } from "vue";
import { BCard, BTab } from "bootstrap-vue";
import { Course } from "../../../server/data/course";
import { User } from "../../../server/data/user";
import CourseRowVue from "@/components/CourseRow.vue";

const user: Ref<User> = inject("user")!;

const myCourses: Ref<Course[]> = ref([]);

const showSuccessAllert: Ref<boolean> = ref(false);

const showFailureAllert: Ref<boolean> = ref(false);

async function refresh() {
  if (user.value.userId) {
    const response = await (
      await fetch(`/api/courses/${user.value.userId}`)
    ).json();
    myCourses.value = response[0].courses;
  }
}
watch(user, refresh, { immediate: true });
onMounted(refresh);

async function setAlert(actionResult: boolean) {
  if (actionResult) {
    await refresh();
    showSuccessAllert.value = true;
  } else {
    showFailureAllert.value = true;
  }
}
</script>

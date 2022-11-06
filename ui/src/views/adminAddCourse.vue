<template>
  <!-- <router-view /> -->
  <div class="mx-3 my-3">
    <b-container fluid class="my-4">
      <b-row>
        <b-col xs="12" sm="9">
          <b-form>
            <b-form-group label="courseId" label-for="courseId-input">
              <b-form-input id="ourseId-input" v-model="courseId" />
            </b-form-group>
            <b-form-group label="name:" label-for="name-input">
              <b-form-input id="name-input" v-model="name" />
            </b-form-group>
            <b-form-group label="instructor:" label-for="instructor-input">
              <b-form-input
                id="instructor-input"
                v-model="instructor"
                required
              />
            </b-form-group>
            <b-form-group label="startTime:" label-for="startTime-input">
              <b-form-input id="startTime-input" v-model="startTime" />
            </b-form-group>
            <b-form-group label="endTime:" label-for="endTime-input">
              <b-form-input id="endTime-input" v-model="endTime" />
            </b-form-group>
            <b-form-group label="status:" label-for="status-input">
              <b-form-input id="status-input" v-model="status" />
            </b-form-group>
            <b-form-group label="weekdays:" label-for="weekdays-input">
              <b-form-input id="weekdays-input" v-model="weekdays" />
            </b-form-group>
            <b-form-group label="capacity:" label-for="capacity-input">
              <b-form-input id="capacity-input" v-model="capacity" />
            </b-form-group>
          </b-form>

          <b-button @click="handleClickAddCourse"
            ><b-icon-plus-circle
          /></b-button>
        </b-col>
        <!-- <b-button 
            v-for="c, i in sampleCards"
            :key="i"
            class="mr-2 mb-2" 
            @click="loadCard(sampleCards[i])"
          >
            Sample Card {{ i + 1 }}
            <CardSummary :card="sampleCards[i]" />
          </b-button>
        </b-col>
        <b-col xs="12" sm="3">
          <b-button class="mr-2 mb-2" :disabled="!canUndo" @click="undo">Undo</b-button>
          <b-button class="mr-2 mb-2" :disabled="!canRedo" @click="redo">Redo</b-button>
          <div style="overflow-y: scroll; max-height: 50vh">
            <UndoRedoList :undo-redo-buffer="undoRedoBuffer" :undo-redo-index="undoRedoIndex" @change="undoRedo" />
          </div>
        </b-col> -->
      </b-row>
    </b-container>
  </div>
</template>

<script setup lang="ts">
// 通过fetch 和 get 传到后端去
import { ref } from "vue";
import { addCourseInfo } from "../data";
// import Course from './data'

const courseId = ref("");
const name = ref("");
const instructor = ref("");
const startTime = ref("");
const endTime = ref("");
const status = ref("");
const weekdays = ref("");
const capacity = ref(50);

async function handleClickAddCourse() {
  await addCourseInfo(
    courseId.value,
    name.value,
    instructor.value,
    startTime.value,
    endTime.value,
    status.value,
    weekdays.value,
    capacity.value
  ).then(   
    // TODO: redirect to admin page's view all courses(admin home page)
  );
}
</script>

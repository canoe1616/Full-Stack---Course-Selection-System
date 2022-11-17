<template>
    <!-- <router-view /> -->
    <div class="mx-3 my-3">
        <h2>Hello, Admin</h2>
        <span>Current Max Credit {{maxCredit}}</span>
        <b-button size = "sm" @click ="" class="mx-2 my-2" >edit maxCredit</b-button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { BContainer, BRow, BCol, BForm, BFormGroup, BFormInput, BButton, BIconPlusCircle } from "bootstrap-vue";
  import { onMounted, Ref, ref } from "vue";
  import { addCourseInfo } from "../data";
  import { SystemConfig } from "../../../server/data/systemConfig";
  // import Course from './data'
  
  const maxCredit : Ref< number | undefined> = ref();
  let system : SystemConfig

  async function refresh() {
    system = await (await fetch("/api/system_config")).json()
    console.log(system.max_credits)
    maxCredit.value = system.max_credits
}
  onMounted(refresh)



  </script>

  

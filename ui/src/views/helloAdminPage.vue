<template>
    <!-- <router-view /> -->
    <div class="mx-3 my-3">
        <h2>Hello, Admin</h2>
        <span>Current Max Credit {{maxCredit}}</span>
        <b-form-input id="numberOfMaxCredit-input" type="number" v-model.number="newMaxCredit" />
        <b-button size = "sm" @click ="editMaxCredit(maxCredit, newMaxCredit)" class="mx-2 my-2" >edit maxCredit</b-button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { BContainer, BRow, BCol, BForm, BFormGroup, BFormInput, BButton, BIconPlusCircle } from "bootstrap-vue";
  import { onMounted, Ref, ref } from "vue";
  import { addCourseInfo } from "../data";
  import { SystemConfig } from "../../../server/data/systemConfig";
  // import Course from './data'
  
  const maxCredit : Ref< number> = ref(0);
  let system : SystemConfig
  const newMaxCredit : Ref< number> = ref(0);

  async function refresh() {
    system = await (await fetch("/api/system_config")).json()
    maxCredit.value = system.max_credits
}
  onMounted(refresh)

  async function editMaxCredit(maxCredit: number, newMaxCredit:number){
    if(newMaxCredit){
        const response = await fetch(`/api/system_config`,{
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({maxCredit: maxCredit, newMaxCredit:newMaxCredit}),
		method: "PUT",
	})
    await refresh()
  }
  
}




  </script>

  

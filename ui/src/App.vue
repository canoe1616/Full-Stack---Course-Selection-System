<template>
  <div>
    <b-navbar
      toggleable="lg"
      type="dark"
      :variant="user?.role?.includes('student') ? 'info' : 'primary'"
    >
      <b-navbar-brand href="#">
        <span v-if="user?.name">Welcome, {{ user.name }}</span>
        <span v-else>Couse registration</span>
      </b-navbar-brand>
      <b-navbar-nav>
        <b-nav-item href="/view-all-courses">View all courses</b-nav-item>
        <b-nav-item href="/view-my-courses">My courses</b-nav-item>
        <b-nav-item v-if="user?.name == null" href="/api/login"
          >Login</b-nav-item
        >
        <b-nav-item v-if="user?.name" @click="logout">Logout</b-nav-item>
        <form method="POST" action="/api/logout" id="logoutForm" />
      </b-navbar-nav>
    </b-navbar>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, provide, Ref } from "vue";
import { User } from "../../server/data/user";
import { useRoute, useRouter } from "vue-router/composables"

const user = ref({} as any);
const router = useRouter();
provide("user", user);

onMounted(async () => {
  console.log("sosefhweofi");
  const response = (await (await fetch("/api/user")).json());
  console.log(response);
  if (response.roles[0] === 'admin') {
    router.push('/admin/first');
  }
  user.value = response;
});

function logout() {
  (window.document.getElementById("logoutForm") as HTMLFormElement).submit();
}
</script>

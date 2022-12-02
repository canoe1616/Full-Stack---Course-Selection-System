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
        <b-nav-item v-if="user?.role == 'student'" href="/view-all-courses">View all courses</b-nav-item>
        <b-nav-item v-if="user?.role == 'student'" href="/view-my-courses">My courses</b-nav-item>
        <b-nav-item v-if="user?.role == 'admin'" href="/admin/first">Edit crdit</b-nav-item>
        <b-nav-item v-if="user?.role == 'admin'" href="/admin/addcourse">Edit courses</b-nav-item>
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
  const response = (await (await fetch("/api/user")).json());
  if (response.role) {
    user.value = response;
  }
});

function logout() {
  (window.document.getElementById("logoutForm") as HTMLFormElement).submit();
}
</script>

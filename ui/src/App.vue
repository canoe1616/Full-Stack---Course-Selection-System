<template>
  <div>
    <b-navbar
      toggleable="lg"
      type="dark"
      :variant="user?.role?.includes('student') ? 'info' : 'primary'"
    >
      <b-navbar-brand href="#">
        <span v-if="user?.name">Welcome, {{ user.name }}</span>
        <span v-else>Smoothie Stand</span>
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

const user = ref({} as User)
provide("user", user);

onMounted(async () => {
  user.value = await (await fetch("/api/user")).json();
});

function logout() {
  (window.document.getElementById("logoutForm") as HTMLFormElement).submit();
}
</script>

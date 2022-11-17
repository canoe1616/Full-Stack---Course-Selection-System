import Vue from "vue";
import VueRouter from "vue-router";
import App from "@/App.vue";
import adminAddCourse from "./views/adminAddCourse.vue";
import helloAdminPage from "./views/helloAdminPage.vue";

import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/admin/addcourse",
      component: adminAddCourse,
    },
    //   {
    //     path: "/operator/:operatorId",
    //     component: OperatorScreen,
    //     props: ({ params: { operatorId }}) => ({ operatorId }),
    //   },
    //   {
    //     path: "/",
    //     component: StatusScreen,
    //   }
    {
      path: "/admin/first",
      component:helloAdminPage
    }

  ],
});

Vue.config.productionTip = false;
Vue.config.devtools = true;

/* eslint-disable no-new */
new Vue({
  router,
  el: "#app",
  render: (h) => h(App),
});

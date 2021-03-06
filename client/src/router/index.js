import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import vm from "../main";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.query.session_token) {
    localStorage.setItem("session_token", to.query.session_token);
    router.replace({ query: null });
  }

  const token = localStorage.getItem("session_token") || null;

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (token) {
      // REQ. TO API TO VERIFY TOKEN
      const response = await fetch("http://localhost:6000/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_token: token,
        }),
      }).then((res) => res.json());

      if (!response.success) {
        localStorage.removeItem("session_token");
        vm.$toast.error("Something went wrong. Please try again");
        next("/login");
        return;
      }
    } else {
      next("/login");
      return;
    }
  } else if (to.matched.some((record) => record.name === "Login")) {
    if (token) {
      const response = await fetch("http://localhost:6000/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_token: token,
        }),
      }).then((res) => res.json());

      if (response.success) {
        next("/");
        return;
      }
    }
  }
  next();
});

export default router;

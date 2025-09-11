<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'

const router = useRouter()
router.replace('/game')
</script>

<template>
  <div id="app" class="min-h-screen">
    <RouterView />
  </div>
</template>

<style scoped></style>

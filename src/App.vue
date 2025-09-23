<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import useWebsocket from '@/composables/useWebsocket'

const router = useRouter()
router.replace('/game')

useWebsocket()
</script>

<template>
  <div id="app" class="min-h-screen">
    <RouterView />
  </div>
</template>

<style scoped></style>

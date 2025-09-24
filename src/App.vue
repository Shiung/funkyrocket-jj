<script setup lang="ts">
import { RouterView } from 'vue-router'
import useInit from '@/composables/useInit'
import useWebsocket from '@/composables/useWebsocket'

useInit()
useWebsocket()
</script>

<template>
  <div id="app" class="min-h-screen">
    <RouterView />
  </div>
</template>

<style scoped></style>

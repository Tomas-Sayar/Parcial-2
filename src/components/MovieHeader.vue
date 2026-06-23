<script setup>
defineProps({
  activeView: {
    type: String,
    required: true,
  },
  certificationLabel: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <header class="hero container py-5">
    <div class="row align-items-end g-4">
      <div class="col-lg-8">
        <h1 class="display-4 fw-bold mb-3">Pandaflix</h1>
      </div>
    </div>
  </header>
</template>

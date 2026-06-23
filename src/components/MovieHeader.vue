<script setup>
defineProps({
  favoritesCount: {
    type: Number,
    default: 0,
  },
})

defineEmits(['open-favorites'])
</script>

<template>
  <header class="hero container py-5">
    <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
      <div>
        <h1 class="display-4 fw-bold mb-3">Pandaflix</h1>
        <p class="lead text-white-50 mb-0">Explora, guarda y revisa tus películas favoritas.</p>
      </div>

      <button type="button" class="btn btn-secondary" @click="$emit('open-favorites')">
        ❤️ Favoritas <span class="badge text-bg-dark ms-2">{{ favoritesCount }}</span>
      </button>
    </div>
  </header>
</template>

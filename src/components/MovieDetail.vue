<script setup>
defineProps({
  movie: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const imageBase = 'https://image.tmdb.org/t/p/w500'

const imageUrl = (path) => (path ? `${imageBase}${path}` : '')
const formatYear = (dateString) => (dateString ? new Date(dateString).getFullYear() : 'N/D')
const formatRuntime = (minutes) => {
  if (!minutes) return 'N/D'

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return `${hours}h ${mins.toString().padStart(2, '0')}m`
}
</script>

<template>
  <div class="sticky-lg-top detail-panel">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="h4 mb-0">Detalle de película</h2>
      <button
        v-if="movie || loading"
        type="button"
        class="btn btn-sm btn-outline-light detail-close"
        aria-label="Cerrar detalle"
        @click="emit('close')"
      >
        &times;
      </button>
    </div>

    <div v-if="loading" class="card border-0 shadow-sm detail-card">
      <div class="card-body text-center py-5">
        <div class="spinner-border text-warning" role="status"></div>
      </div>
    </div>

    <div v-else-if="movie" class="card border-0 shadow-sm overflow-hidden detail-card">
      <img
        v-if="movie.poster_path"
        :src="imageUrl(movie.poster_path)"
        :alt="movie.title"
        class="detail-poster"
      />
      <div class="card-body">
        <h3 class="h4">{{ movie.title }}</h3>
        <p class="text-secondary mb-3">{{ movie.tagline }}</p>

        <dl class="row small mb-0">
          <dt class="col-5">Año</dt>
          <dd class="col-7">{{ formatYear(movie.release_date) }}</dd>

          <dt class="col-5">Duración</dt>
          <dd class="col-7">{{ formatRuntime(movie.runtime) }}</dd>

          <dt class="col-5">Puntaje</dt>
          <dd class="col-7">⭐ {{ movie.vote_average?.toFixed(1) || 'N/D' }}</dd>

          <dt class="col-5">Géneros</dt>
          <dd class="col-7">
            {{ movie.genres?.map((genre) => genre.name).join(', ') || 'N/D' }}
          </dd>

          <dt class="col-5">Idioma original</dt>
          <dd class="col-7">{{ movie.original_language?.toUpperCase() || 'N/D' }}</dd>
        </dl>

        <hr />
        <p class="mb-0">{{ movie.overview || 'Sin descripción disponible.' }}</p>
      </div>
    </div>

    <div v-else class="card border-0 shadow-sm detail-card">
      <div class="card-body text-secondary">
        Selecciona una película de la lista para ver su detalle
      </div>
    </div>
  </div>
</template>

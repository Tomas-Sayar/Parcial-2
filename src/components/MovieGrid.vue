<script setup>
import MovieCard from './MovieCard.vue'

const props = defineProps({
  movies: {
    type: Array,
    default: () => [],
  },
  loadingPopular: {
    type: Boolean,
    default: false,
  },
  loadingSearch: {
    type: Boolean,
    default: false,
  },
  activeView: {
    type: String,
    default: 'popular',
  },
  genres: {
    type: Array,
    default: () => [],
  },
  favoriteIds: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select', 'toggle-favorite'])

const imageBase = 'https://image.tmdb.org/t/p/w500'
const imageUrl = (path) => (path ? `${imageBase}${path}` : '')
const formatYear = (dateString) => (dateString ? new Date(dateString).getFullYear() : 'N/D')
const genreLabel = (genreIds) => {
  if (!genreIds?.length) return 'Sin género'
  const firstGenre = props.genres.find((genre) => genreIds.includes(genre.id))
  return firstGenre?.name ?? 'Sin género'
}
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="h4 mb-0">
        Peliculas destacadas
      </h2>
    </div>

    <div v-if="loadingPopular && activeView === 'popular'" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    <div v-else-if="loadingSearch && activeView === 'search'" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    <div v-else class="movie-grid">
      <MovieCard
        v-for="movie in movies"
        :key="movie.id"
        :movie="movie"
        :is-favorite="favoriteIds.includes(movie.id)"
        :image-url="imageUrl"
        :format-year="formatYear"
        :genre-label="genreLabel"
        @select="emit('select', $event)"
        @toggle-favorite="emit('toggle-favorite', $event)"
      />
    </div>

    <div v-if="!movies.length && !loadingPopular && !loadingSearch" class="empty-state text-center py-5">
      No se encontraron peliculas
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MovieFilters from './components/MovieFilters.vue'
import MovieGrid from './components/MovieGrid.vue'
import MovieHeader from './components/MovieHeader.vue'
import MovieDetail from './components/MovieDetail.vue'
import { addFavorite, getFavorites, removeFavorite } from './services/favoritesDb'
import { getGenres, getMovieDetails, getPopularMovies, searchTmdbMovies } from './services/tmdbApi'

const SEARCH_DELAY = 450

const genres = ref([])
const popularMovies = ref([])
const searchResults = ref([])
const selectedMovie = ref(null)
const loadingPopular = ref(false)
const loadingSearch = ref(false)
const loadingDetails = ref(false)
const errorMessage = ref('')
const searchTerm = ref('')
const selectedGenre = ref('')
const selectedCertification = ref('')
const searchTimeout = ref(null)
const activeView = ref('popular')
const detailSection = ref(null)
const favorites = ref([])
const favoritesModalOpen = ref(false)

const certificationOptions = [
  { value: '', label: 'Todas las edades' },
  { value: 'G', label: 'G' },
  { value: 'PG', label: 'PG' },
  { value: 'PG-13', label: 'PG-13' },
  { value: 'R', label: 'R' },
  { value: 'NC-17', label: 'NC-17' },
]

const certificationLabel = computed(() => {
  const found = certificationOptions.find((option) => option.value === selectedCertification.value)
  return found?.label ?? 'Todas las edades'
})

const movieList = computed(() => {
  const baseList = activeView.value === 'search' ? searchResults.value : popularMovies.value

  return baseList.filter((movie) => {
    return !selectedGenre.value || movie.genre_ids?.includes(Number(selectedGenre.value))
  })
})

const favoriteIds = computed(() => favorites.value.map((movie) => movie.id))

const favoriteMovies = computed(() =>
  [...favorites.value].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
)

async function loadGenres() {
  genres.value = await getGenres()
}

async function loadPopularMovies() {
  loadingPopular.value = true
  errorMessage.value = ''

  try {
    popularMovies.value = await getPopularMovies({
      genreId: selectedGenre.value,
      certification: selectedCertification.value,
    })
  } catch {
    errorMessage.value = 'No pudimos cargar las películas populares.'
  } finally {
    loadingPopular.value = false
  }
}

async function runSearch(query) {
  if (!query.trim()) {
    searchResults.value = []
    activeView.value = 'popular'
    return
  }

  loadingSearch.value = true
  errorMessage.value = ''
  activeView.value = 'search'

  try {
    searchResults.value = await searchTmdbMovies(query)
  } catch {
    errorMessage.value = 'No pudimos realizar la búsqueda.'
  } finally {
    loadingSearch.value = false
  }
}

async function selectMovie(movie) {
  loadingDetails.value = true
  errorMessage.value = ''

  try {
    selectedMovie.value = await getMovieDetails(movie.id)
    await nextTick()

    if (window.matchMedia('(max-width: 991.98px)').matches) {
      detailSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  } catch {
    errorMessage.value = 'No pudimos cargar los detalles de la película.'
  } finally {
    loadingDetails.value = false
  }
}

async function loadFavorites() {
  favorites.value = await getFavorites()
}

async function toggleFavorite(movie) {
  try {
    const exists = favoriteIds.value.includes(movie.id)

    if (exists) {
      await removeFavorite(movie.id)
    } else {
      await addFavorite(movie)
    }

    await loadFavorites()
  } catch (error) {
    console.error('Favorites update failed:', error)
    errorMessage.value = 'No pudimos actualizar las películas favoritas.'
  }
}

function openFavoritesModal() {
  favoritesModalOpen.value = true
}

function closeFavoritesModal() {
  favoritesModalOpen.value = false
}

function closeMovieDetail() {
  selectedMovie.value = null
}

watch(searchTerm, (value, _, onCleanup) => {
  clearTimeout(searchTimeout.value)

  if (!value.trim()) {
    searchResults.value = []
    activeView.value = 'popular'
    return
  }

  searchTimeout.value = setTimeout(() => {
    runSearch(value)
  }, SEARCH_DELAY)

  onCleanup(() => {
    clearTimeout(searchTimeout.value)
  })
})

watch([selectedGenre, selectedCertification], loadPopularMovies)

onMounted(async () => {
  try {
    await loadGenres()
    await loadPopularMovies()
    await loadFavorites()
  } catch {
    errorMessage.value = 'No pudimos inicializar la aplicación.'
  }
})

onBeforeUnmount(() => {
  clearTimeout(searchTimeout.value)
})
</script>

<template>
  <div class="app-shell">
    <MovieHeader :favorites-count="favorites.length" @open-favorites="openFavoritesModal" />

    <main class="container pb-5">
      <MovieFilters
        v-model:search-term="searchTerm"
        v-model:selected-genre="selectedGenre"
        v-model:selected-certification="selectedCertification"
        :genres="genres"
        :certification-options="certificationOptions"
      />

      <div v-if="errorMessage" class="alert alert-danger shadow-sm">{{ errorMessage }}</div>

      <section class="row g-4">
        <div ref="detailSection" class="col-lg-5 order-1 order-lg-2">
          <MovieDetail :movie="selectedMovie" :loading="loadingDetails" @close="closeMovieDetail" />
        </div>

        <div class="col-lg-7 order-2 order-lg-1">
          <MovieGrid
            :movies="movieList"
            :loading-popular="loadingPopular"
            :loading-search="loadingSearch"
            :active-view="activeView"
            :genres="genres"
            :favorite-ids="favoriteIds"
            @select="selectMovie"
            @toggle-favorite="toggleFavorite"
          />
        </div>
      </section>
    </main>

    <div v-if="favoritesModalOpen" class="favorites-modal-backdrop" @click.self="closeFavoritesModal">
      <div class="favorites-modal card border-0 shadow-lg">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h5 mb-0">Películas favoritas</h2>
            <small class="text-secondary">{{ favorites.length }} guardadas</small>
          </div>
          <button type="button" class="btn btn-sm btn-outline-secondary" @click="closeFavoritesModal">
            Cerrar
          </button>
        </div>

        <div class="card-body">
          <div v-if="!favorites.length" class="text-secondary py-4 text-center">
            Todavía no guardaste ninguna película favorita.
          </div>

          <div v-else class="favorites-list">
            <article v-for="movie in favoriteMovies" :key="movie.id" class="favorite-item">
              <img
                v-if="movie.poster_path"
                :src="`https://image.tmdb.org/t/p/w154${movie.poster_path}`"
                :alt="movie.title"
                class="favorite-thumb"
              />
              <div v-else class="favorite-thumb favorite-thumb--empty">Sin póster</div>

              <div class="flex-grow-1">
                <div class="d-flex justify-content-between gap-2">
                  <div>
                    <h3 class="h6 mb-1">{{ movie.title }}</h3>
                    <p class="small text-secondary mb-1">{{ movie.release_date?.slice(0, 4) || 'N/D' }}</p>
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-danger" @click="toggleFavorite(movie)">
                    Eliminar
                  </button>
                </div>
                <p class="small mb-0 text-secondary text-truncate-3">
                  {{ movie.overview || 'Sin descripción' }}
                </p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.app-shell {
  min-height: 100vh;
  position: relative;
  background:
    linear-gradient(rgba(3, 7, 18, 0.68), rgba(3, 7, 18, 0.82)),
    url('/img/background.png') center center / cover no-repeat fixed;
  color: #f8fafc;
}

.app-shell::before {
  content: '';
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.18);
  pointer-events: none;
  z-index: 0;
}

.hero,
main {
  position: relative;
  z-index: 1;
}

.stats-card,
.controls,
.movie-card,
.empty-state {
  background: rgba(255, 255, 255, 0.96);
  color: #111827;
}

[data-bs-theme='dark'] .stats-card,
[data-bs-theme='dark'] .controls,
[data-bs-theme='dark'] .movie-card,
[data-bs-theme='dark'] .empty-state {
  background: rgba(33, 37, 41, 0.96);
  color: var(--bs-body-color);
}

.detail-card {
  background: rgba(15, 23, 42, 0.96);
  color: #f8fafc;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1rem;
}

.movie-card {
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  overflow: hidden;
}

.movie-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.12) !important;
}

.movie-poster,
.detail-poster {
  width: 100%;
  object-fit: cover;
}

.movie-poster {
  height: 320px;
}

.detail-poster {
  max-height: 500px;
  object-position: top;
}

.poster-placeholder {
  height: 320px;
  background: linear-gradient(135deg, #1f2937, #374151);
  color: #e5e7eb;
}

.text-truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.detail-panel {
  top: 1rem;
}

.detail-close {
  width: 2rem;
  height: 2rem;
  padding: 0;
  line-height: 1;
  border-radius: 999px;
}

.favorites-launcher {
  box-shadow: 0 1rem 2rem rgba(245, 158, 11, 0.24);
}

.favorite-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2;
  border-radius: 999px;
  box-shadow: none;
  background: transparent;
  border: 0;
  color: #dc2626;
  font-size: 1.1rem;
  line-height: 1;
  padding: 0.25rem 0.35rem;
  transition: transform 0.15s ease, color 0.15s ease;
}

.favorite-btn:hover {
  transform: scale(1.08);
}

.favorite-btn--active {
  color: #dc2626;
}

.favorite-btn--idle {
  color: #dc2626;
  opacity: 0.78;
}

.movie-card {
  position: relative;
}

.favorites-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1050;
  background: rgba(2, 6, 23, 0.72);
  display: grid;
  place-items: center;
  padding: 1rem;
}

.favorites-modal {
  width: min(720px, 100%);
  max-height: min(80vh, 900px);
  overflow: hidden;
}

.favorites-list {
  display: grid;
  gap: 1rem;
  max-height: calc(80vh - 140px);
  overflow: auto;
  padding-right: 0.25rem;
}

.favorite-item {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
  padding: 0.75rem;
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.04);
}

[data-bs-theme='dark'] .favorite-item {
  background: rgba(255, 255, 255, 0.04);
}

.favorite-thumb {
  width: 72px;
  height: 108px;
  object-fit: cover;
  border-radius: 0.75rem;
  flex: 0 0 auto;
  background: #111827;
  color: #e5e7eb;
}

.favorite-item > div {
  min-width: 0;
}

.favorite-item h3,
.favorite-item p {
  word-break: break-word;
}

.favorite-thumb--empty {
  display: grid;
  place-items: center;
  font-size: 0.75rem;
  text-align: center;
  padding: 0.5rem;
}

@media (max-width: 991.98px) {
  .detail-panel {
    top: 0;
  }

  .favorite-item {
    grid-template-columns: 1fr;
  }

  .favorite-thumb {
    width: 100%;
    height: 180px;
  }
}
</style>

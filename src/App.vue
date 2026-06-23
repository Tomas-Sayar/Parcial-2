<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import MovieFilters from './components/MovieFilters.vue'
import MovieGrid from './components/MovieGrid.vue'
import MovieHeader from './components/MovieHeader.vue'
import MovieDetail from './components/MovieDetail.vue'

const API_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhZjdmYzI4MDRmOWU3Njg3OGI2M2Y4N2Q2YjQ5ZjEyYSIsIm5iZiI6MTc4MTU3NzA2MC45NDcsInN1YiI6IjZhMzBiNTY0ZTMyNWYwMWZhZjc0M2QyNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.F5xFJZS9azIlZeGD0EbeAcpB6RHP3yH7R87xfVpWJLM'
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
const debouncedTerm = ref('')
const selectedGenre = ref('')
const selectedCertification = ref('')
const searchTimeout = ref(null)
const activeView = ref('popular')
const detailSection = ref(null)

const certificationOptions = [
  { value: '', label: 'Todas las edades' },
  { value: 'G', label: 'G' },
  { value: 'PG', label: 'PG' },
  { value: 'PG-13', label: 'PG-13' },
  { value: 'R', label: 'R' },
  { value: 'NC-17', label: 'NC-17' },
]

const authHeaders = {
  accept: 'application/json',
  Authorization: `Bearer ${API_TOKEN}`,
}

const certificationLabel = computed(() => {
  const found = certificationOptions.find((option) => option.value === selectedCertification.value)
  return found?.label ?? 'Todas las edades'
})

const movieList = computed(() => (activeView.value === 'search' ? searchResults.value : popularMovies.value))

async function fetchJson(url) {
  const response = await fetch(url, { headers: authHeaders })
  if (!response.ok) throw new Error(`Error HTTP ${response.status}`)
  return response.json()
}

async function loadGenres() {
  const data = await fetchJson('https://api.themoviedb.org/3/genre/movie/list?language=es-ES')
  genres.value = data.genres ?? []
}

async function loadPopularMovies() {
  loadingPopular.value = true
  errorMessage.value = ''

  try {
    const params = new URLSearchParams({
      language: 'es-ES',
      sort_by: 'popularity.desc',
      page: '1',
    })

    if (selectedGenre.value) {
      params.set('with_genres', String(selectedGenre.value))
    }

    if (selectedCertification.value) {
      params.set('certification_country', 'US')
      params.set('with_certification', selectedCertification.value)
    }

    const data = await fetchJson(`https://api.themoviedb.org/3/discover/movie?${params.toString()}`)
    popularMovies.value = data.results ?? []
  } catch {
    errorMessage.value = 'No pudimos cargar las películas populares.'
  } finally {
    loadingPopular.value = false
  }
}

async function searchMovies(query) {
  if (!query.trim()) {
    searchResults.value = []
    activeView.value = 'popular'
    return
  }

  loadingSearch.value = true
  errorMessage.value = ''
  activeView.value = 'search'

  try {
    const data = await fetchJson(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=es-ES&page=1&include_adult=false`
    )
    searchResults.value = data.results ?? []
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
    const data = await fetchJson(
      `https://api.themoviedb.org/3/movie/${movie.id}?language=es-ES&append_to_response=videos,credits,release_dates`
    )
    selectedMovie.value = data
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

function closeMovieDetail() {
  selectedMovie.value = null
}

watch(searchTerm, (value) => {
  clearTimeout(searchTimeout.value)
  debouncedTerm.value = value
  searchTimeout.value = setTimeout(() => searchMovies(debouncedTerm.value), SEARCH_DELAY)
})

watch([selectedGenre, selectedCertification], loadPopularMovies)

onMounted(async () => {
  try {
    await loadGenres()
    await loadPopularMovies()
  } catch {
    errorMessage.value = 'No pudimos inicializar la aplicación.'
  }
})
</script>

<template>
  <div class="app-shell">
    <MovieHeader :active-view="activeView" :certification-label="certificationLabel" />

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
            @select="selectMovie"
          />
        </div>
      </section>
    </main>
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

@media (max-width: 991.98px) {
  .detail-panel {
    top: 0;
  }
}
</style>

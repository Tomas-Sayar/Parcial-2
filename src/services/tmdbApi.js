const API_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhZjdmYzI4MDRmOWU3Njg3OGI2M2Y4N2Q2YjQ5ZjEyYSIsInN1YiI6IjZhMzBiNTY0ZTMyNWYwMWZhZjc0M2QyNyIsIm5iZiI6MTc4MTU3NzA2MC45NDcsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.F5xFJZS9azIlZeGD0EbeAcpB6RHP3yH7R87xfVpWJLM'

const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

const authHeaders = {
  accept: 'application/json',
  Authorization: `Bearer ${API_TOKEN}`,
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: authHeaders })

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}`)
  }

  return response.json()
}

export async function getGenres() {
  const data = await fetchJson(`${BASE_URL}/genre/movie/list?language=es-ES`)
  return data.genres ?? []
}

export async function getPopularMovies({ genreId, certification }) {
  const params = new URLSearchParams({
    language: 'es-ES',
    sort_by: 'popularity.desc',
    page: '1',
  })

  if (genreId) {
    params.set('with_genres', String(genreId))
  }

  if (certification) {
    params.set('certification_country', 'US')
    params.set('with_certification', certification)
  }

  const data = await fetchJson(`${BASE_URL}/discover/movie?${params.toString()}`)
  return data.results ?? []
}

export async function searchTmdbMovies(query) {
  const data = await fetchJson(
    `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=es-ES&page=1&include_adult=false`
  )
  return data.results ?? []
}

export async function getMovieDetails(movieId) {
  return fetchJson(
    `${BASE_URL}/movie/${movieId}?language=es-ES&append_to_response=videos,credits,release_dates`
  )
}

export function getImageUrl(path, size = 'w500') {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : ''
}

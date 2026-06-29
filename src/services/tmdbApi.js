const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'



async function pedirDatosATMDB(url) {
  const separador = url.includes('?') ? '&' : '?'
  const urlConKey = url + separador + 'api_key=' + API_KEY
  
  const respuesta = await fetch(urlConKey)

  if (respuesta.ok === false) {
    throw new Error('Error en la petición: ' + respuesta.status)
  }
  
  return await respuesta.json()
}


// OBTENER GÉNEROS DE PELÍCULAS
export async function getGenres() {
  const datos = await pedirDatosATMDB(BASE_URL + '/genre/movie/list?language=es-ES')
  
  if (datos.genres) {
    return datos.genres
  } else {
    return []
  }
}


// OBTNER PELÍCULAS POPULARES
export async function getPopularMovies(parametros) {

  const tieneFiltros = parametros.genreId || parametros.certification

  if (tieneFiltros) {
    let parametrosURL = 'language=es-ES&sort_by=popularity.desc&page=1&vote_count.gte=200'

    if (parametros.genreId) {
      parametrosURL = parametrosURL + '&with_genres=' + parametros.genreId
    }

    if (parametros.certification) {
      parametrosURL = parametrosURL + '&certification_country=US&with_certification=' + parametros.certification
    }

    const datos = await pedirDatosATMDB(BASE_URL + '/discover/movie?' + parametrosURL)

    if (datos.results) {
      return datos.results
    } else {
      return []
    }
  }

  // Sin filtros
  const url = BASE_URL + '/movie/popular?language=es-ES&page=1'
  const datos = await pedirDatosATMDB(url)

  if (datos.results) {
    return datos.results
  } else {
    return []
  }
}


// BUSCAR PELÍCULAS POR NOMBRE
export async function searchTmdbMovies(query) {

  const queryCodificada = encodeURIComponent(query)
  
  const url = BASE_URL + '/search/movie?query=' + queryCodificada + '&language=es-ES&page=1&include_adult=false'
  const datos = await pedirDatosATMDB(url)
  
  if (datos.results) {
    return datos.results
  } else {
    return []
  }
}


// OBTENER DETALLES DE UNA PELÍCULA ESPECÍFICA
export async function getMovieDetails(movieId) {
  const url = BASE_URL + '/movie/' + movieId + '?language=es-ES&append_to_response=videos,credits,release_dates'
  return await pedirDatosATMDB(url)
}


// OBTENER URL DE IMAGEN
export function getImageUrl(path, size) {
  if (!path) {
    return ''
  }
  if (!size) {
    size = 'w500'
  }
  
  return IMAGE_BASE_URL + '/' + size + path
}
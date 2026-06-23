const DB_NAME = 'pandaflix-db'
const DB_VERSION = 2
const STORE_NAME = 'favorites'

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME)
      }

      db.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function normalizeMovie(movie) {
  const plainMovie = JSON.parse(JSON.stringify(movie))

  return {
    id: plainMovie.id,
    title: plainMovie.title ?? '',
    overview: plainMovie.overview ?? '',
    poster_path: plainMovie.poster_path ?? null,
    release_date: plainMovie.release_date ?? '',
    vote_average: plainMovie.vote_average ?? null,
    popularity: plainMovie.popularity ?? 0,
    genre_ids: Array.isArray(plainMovie.genre_ids) ? plainMovie.genre_ids : [],
  }
}

function runTransaction(mode, handler) {
  return openDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode)
        const store = transaction.objectStore(STORE_NAME)

        const finalize = (value) => {
          db.close()
          resolve(value)
        }

        const fail = (error) => {
          db.close()
          reject(error)
        }

        transaction.onerror = () => fail(transaction.error)
        transaction.onabort = () => fail(transaction.error)

        handler(store, finalize, fail)
      })
  )
}

export async function getFavorites() {
  return runTransaction('readonly', (store, resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result ?? [])
    request.onerror = () => reject(request.error)
  })
}

export async function addFavorite(movie) {
  const favorite = normalizeMovie(movie)

  return runTransaction('readwrite', (store, resolve, reject) => {
    const request = store.put(favorite)
    request.onsuccess = () => resolve(favorite)
    request.onerror = () => reject(request.error)
  })
}

export async function removeFavorite(movieId) {
  return runTransaction('readwrite', (store, resolve, reject) => {
    const request = store.delete(movieId)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

# Parcial 2

Aplicacion web hecha con Vue 3 y Vite para explorar peliculas usando la API de The Movie Database (TMDb).

## Caracteristicas

- Listado de peliculas populares.
- Busqueda por nombre.
- Filtros por genero y certificacion.
- Vista de detalle de una pelicula.
- Gestion de favoritas guardadas en `IndexedDB`.
- Interfaz responsive con Bootstrap.

## Tecnologias

- Vue 3
- Vite
- Bootstrap 5
- IndexedDB para persistencia local
- TMDb API para datos de peliculas

## Requisitos

- Node.js `20.19.0` o superior compatible con el rango definido en `package.json`
- `pnpm`

## Instalacion

```sh
pnpm install
```

## Ejecucion en desarrollo

La aplicacion se inicia en `http://localhost:3000`.

```sh
pnpm dev
```

## Build de produccion

```sh
pnpm build
```

## Vista previa del build

```sh
pnpm preview
```

## Estructura general

- `src/App.vue`: componente principal y logica de consumo de API, filtros y favoritos.
- `src/components/`: componentes visuales de la app.
- `src/services/favoritesDb.js`: capa de persistencia con `IndexedDB`.
- `public/`: recursos estaticos.

## Nota sobre la API

La app consume TMDb mediante una API key embebida en el codigo fuente (`src/services/tmdbApi.js`). Si en algun momento cambias la API o decides mover esa configuracion a variables de entorno, tendras que actualizar ese archivo.

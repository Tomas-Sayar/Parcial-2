<script setup>
defineProps({
  searchTerm: {
    type: String,
    default: '',
  },
  selectedGenre: {
    type: [String, Number],
    default: '',
  },
  selectedCertification: {
    type: String,
    default: '',
  },
  genres: {
    type: Array,
    default: () => [],
  },
  certificationOptions: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['update:searchTerm', 'update:selectedGenre', 'update:selectedCertification'])
</script>

<template>
  <section class="controls card border-0 shadow-sm mb-4">
    <div class="card-body">
      <div class="row g-3">
        <div class="col-lg-5">
          <label class="form-label fw-semibold">Buscar por título</label>
          <input
            :value="searchTerm"
            type="text"
            class="form-control form-control-lg"
            placeholder="Ej: Inception, Avatar, Interstellar..."
            @input="$emit('update:searchTerm', $event.target.value)"
          />
        </div>
        <div class="col-md-4 col-lg-3">
          <label class="form-label fw-semibold">Género</label>
          <select
            :value="selectedGenre"
            class="form-select form-select-lg"
            @change="$emit('update:selectedGenre', $event.target.value)"
          >
            <option value="">Todos</option>
            <option v-for="genre in genres" :key="genre.id" :value="genre.id">
              {{ genre.name }}
            </option>
          </select>
        </div>
        <div class="col-md-3 col-lg-2">
          <label class="form-label fw-semibold">Clasificación</label>
          <select
            :value="selectedCertification"
            class="form-select form-select-lg"
            @change="$emit('update:selectedCertification', $event.target.value)"
          >
            <option v-for="option in certificationOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </section>
</template>

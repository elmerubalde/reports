<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth' 
import kpi_membership from '~/components/charts/kpi_membership.vue'
const auth = useAuth()
</script>

<template>
  <div class="min-h-screen p-6">
    <!-- Header -->
    <div class="mt-8 mb-8">
      <h2 class="text-2xl font-bold text-slate-900">KPI</h2> 
    </div>
    <kpi_membership></kpi_membership> 
  </div>
</template>

<script lang="ts">
  export default { 
    name: 'dashboard',
    components : { kpi_membership },
    setup() {
       
    }, 
}
</script>

<style scoped>
.grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

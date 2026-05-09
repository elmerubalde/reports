<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import ecobarchart  from './ecobarchart.vue'
import membernetworkdistribution from './membernetworkdistribution.vue'
import memberattendance from './memberattendance.vue'
import lgmemberattendance from './lgmemberattendance.vue'
import perlgmemberattendance from './perlgmemberattendance.vue'
const auth = useAuth()
</script>

<template>
  <div class="min-h-screen p-6">
    <!-- Header -->
    <div class="mt-8 mb-8">
      <h2 class="text-2xl font-bold text-slate-900">Dashboard</h2> 
    </div>
 
    <!-- 3-Column Chart Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"> 
      <!-- Line Chart: CAT1/CAT2 Over Time -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <membernetworkdistribution></membernetworkdistribution>
      </div>

      <!-- Bar Chart: CAT1 CAT2 Attendance  -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <memberattendance></memberattendance>
      </div>

      <!-- Bar Chart: LG Member Attendance  -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <lgmemberattendance></lgmemberattendance>
      </div> 
    </div> 
    <div class="gridgap-6 mb-8">
       <perlgmemberattendance style="min-height: 400px"/>
    </div> 
  </div>
</template>

<script lang="ts">
  export default { 
    name: 'dashboard',
    components : { perlgmemberattendance, membernetworkdistribution, memberattendance },
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

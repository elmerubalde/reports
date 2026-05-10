<template>
  <h2 class="text-lg font-semibold text-slate-900 mb-4">CAT1/CAT2 Network Distribution</h2>
  <div class="grid grid-cols-2 mb-8">
      <div class="relative h-64">
        <Doughnut :data="data" :options="options" />
      </div> 
    <!-- Data Table -->
      <div class="pt-8 text-sm text-slate-900">
        <table v-if="!loading">
          <tbody>
            <tr>
              <td class="pl-0 text-sm text-slate-900"
                v-for="column in ['Network', 'CAT 1', 'CAT 2', ]"
                :key="column"
               > 
               {{ column }} 
              </td>
            </tr>
            <tr
              v-for="(item, index) in data.datasets[0].data"
              :key="index"
              class="hover:bg-gray-800 transition-colors"
            >
              <td class="px-3 py-2 text-sm text-slate-900">
                <span class="dot" :style="{ 'background-color': data.datasets[0].backgroundColor[index] }"></span>
                {{ data.labels[index] }}
              </td>
              <td class="px-3 py-2 text-sm text-slate-900 text-right">
                {{ data.datasets[0].data[index] }}
              </td>
              <td class="px-3 py-2 text-sm text-slate-900 text-right">
                {{ data.datasets[1].data[index] }}
              </td>
            </tr>
            <tr>
              <td class="pl-0 text-sm text-slate-900" 
               >Total
              </td>
              <td class="pl-0 text-sm text-slate-900" 
               >{{ data.datasets[0].data.reduce((sum, d) => sum + d, 0) }}
              </td>
              <td class="pl-0 text-sm text-slate-900" 
               >{{ data.datasets[1].data.reduce((sum, d) => sum + d, 0) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div> 
  </div>
</template>
<style scoped>
  .dot {
    height: 15px;
    width: 15px;
    background-color: #ec2323;
    border-radius: 50%;
    display: inline-block;
  }
</style>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement, 
  CategoryScale,
  LinearScale,
  ChartData,
  Colors
} from 'chart.js'
import { Doughnut } from 'vue-chartjs' 
import { useAuth } from '~/composables/useAuth'; 
 
const auth = useAuth();

ChartJS.register(Colors, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale)

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    colors: {
      forceOverride: false
    }
  }
}

const data = ref({
  labels: [],
  datasets: [
    {
      backgroundColor: [],
      data: []
    },
    {
      backgroundColor: [],
      data: []
    }
  ]
});
 
const loading = ref(true);
const errorMessage = ref('');

const fetchMembership = async (endDate: date) => { 
  loading.value = true;
  errorMessage.value = '';

  try {
    const dtEnd = endDate.toISOString().substring(0, 10)
    data.value = await auth.apiFetch(`/api/report/membershipvsnetwork/${dtEnd}`) 
    loading.value = false;
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Unable to load membership.';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (auth.isLoggedIn.value) {
    let now = new Date();
    await fetchMembership(now); 
  }
})
 
</script>

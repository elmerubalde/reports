<template>
  <h2 class="text-lg font-semibold text-slate-900 mb-4">CAT1/CAT2/Attendance YTD</h2>
    <div class="grid grid-cols-2 mb-8">
      <div class="relative h-64">
        <Bar :data="data" :options="options" />
      </div> 
     <div class="pt-8 text-sm text-slate-900">
        <table v-if="!loading">
          <tbody>
            <tr 
              class="hover:bg-gray-800 transition-colors"
            >
              <td class="px-3 py-2 text-sm text-slate-900">
                <span class="dot" :style="{ 'background-color': data.datasets[0].backgroundColor }"></span>
                 CAT 1 
              </td>
             <td class="px-3 py-2 text-sm text-slate-900"> 
                {{ data.datasets[0].data[0] }}
              </td> 
            </tr>
            <tr 
              class="hover:bg-gray-800 transition-colors"
            >
              <td class="px-3 py-2 text-sm text-slate-900">
                <span class="dot" :style="{ 'background-color': data.datasets[1].backgroundColor }"></span>
                 CAT 2
              </td>
             <td class="px-3 py-2 text-sm text-slate-900"> 
                {{ data.datasets[1].data[0] }}
              </td> 
            </tr>
            <tr 
              class="hover:bg-gray-800 transition-colors"
            >
              <td class="px-3 py-2 text-sm text-slate-900">
                <span class="dot" :style="{ 'background-color': data.datasets[2].backgroundColor }"></span>
                 Attendance
              </td>
             <td class="px-3 py-2 text-sm text-slate-900"> 
                {{ data.datasets[2].data[0] }}
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
  BarElement,
  CategoryScale,
  LinearScale,
  Colors,
  ChartData
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import * as chartConfig from '../composables/chartConfig.ts'
import { useAuth } from '~/composables/useAuth'; 
const auth = useAuth();

ChartJS.register(Colors, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

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
const data = ref( { labels: [], datasets: [
                { label: 'CAT 1', backgroundColor: '#3B82F6', data: [] }, 
                { label: 'CAT 2', backgroundColor: '#5310b9', data: [] },
                { label: 'Avg Attendance YTD', backgroundColor: '#89b910', data: [] }
              ] }); 

const loadingMembership = ref(false);
const errorMessage = ref('');

const fetchMembership = async (endDate: date) => { 
  loadingMembership.value = true;
  errorMessage.value = '';

  try {
    const dtEnd = endDate.toISOString().substring(0, 10)
    const dtStart = endDate.getUTCFullYear() + '-01-01' ;  
    data.value = await auth.apiFetch(`/api/report/membershipvsattendance/${dtStart}/${dtEnd}`) 
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Unable to load membership.';
  } finally {
    loadingMembership.value = false;
  }
};

onMounted(async () => {
  if (auth.isLoggedIn.value) {
    let now = new Date();
    await fetchMembership(now); 
  }
})
 
</script>

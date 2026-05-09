<template>
  <h2 class="text-lg font-semibold text-slate-900 mb-4">LG Member/Attendance YTD</h2> 
  <div class="relative h-64">
     <Bar :data="data" :options="options" /> 
  </div>
</template>

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
      labels: {
        color: '#e0e0e0'
      }
    },
    title: {
      color: '#e0e0e0'
    },
    tooltip: {
      backgroundColor: '#1e1e1e',
      titleColor: '#ffffff',
      bodyColor: '#e0e0e0',
      borderColor: '#444444',
      borderWidth: 1
    }
  },
  scales: {
    x: {
      ticks: {
        color: '#e0e0e0'
      },
      grid: {
        color: '#333333'
      }
    },
    y: {
      ticks: {
        color: '#e0e0e0'
      },
      grid: {
        color: '#333333'
      }
    }
  }
}
const data = ref<ChartData<'bar'>>({
  datasets: []
})

const loadingMembership = ref(false);
const errorMessage = ref('');

const fetchMembership = async (endDate: date) => { 
  loadingMembership.value = true;
  errorMessage.value = '';

  try {
    const dtEnd = endDate.toISOString().substring(0, 10)
    const dtStart = endDate.getUTCFullYear() + '-01-01' ;  
    data.value = await auth.apiFetch(`/api/report/perlgmembershipvsattendance/${dtStart}/${dtEnd}`) 
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

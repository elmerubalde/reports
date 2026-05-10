<template>
 <div class="min-h-screen p-6">
    <!-- 3-Column Chart Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"> 
      <!-- Line Chart: CAT1 KPI -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h2 class="text-lg font-semibold text-slate-900 mb-4">Membership CAT1</h2>
        <p><span class="dot" :style="{ 'background-color': data_cat1.datasets[0].backgroundColor }">
            </span>Target {{ yearKpi }} : {{ yearKpiTarget }}</p>
        <p><span class="dot" :style="{ 'background-color': data_cat1.datasets[1].backgroundColor }">
            </span>Accomplished {{ yearKpi }} : {{ yearKpiAccomplished }}</p>
        <p>Target Vs Actual : {{ pctTargetVsActual }} % </p>
        <p>Actual Vs Prev Year : {{ pctActualVsPrevious}} % </p>                   
        <div class="relative h-64">
              <Bar :data="data_cat1" :options="options" />
        </div>
      </div>

      <!-- Bar Chart: CAT2 KPI  -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h2 class="text-lg font-semibold text-slate-900 mb-4">Membership CAT2</h2>
        <p><span class="dot" :style="{ 'background-color': data_cat2.datasets[0].backgroundColor }">
            </span>Target {{ yearKpi }} : {{ yearKpiTarget }}</p>
        <p><span class="dot" :style="{ 'background-color': data_cat2.datasets[1].backgroundColor }">
            </span>Accomplished {{ yearKpi }} : {{ yearKpiAccomplished }}</p>
        <p>Target Vs Actual : {{ pctTargetVsActual }} % </p>
        <p>Actual Vs Prev Year : {{ pctActualVsPrevious}} % </p>                   
        <div class="relative h-64">
              <Bar :data="data_cat2" :options="options" />
        </div>
      </div>

      <!-- Bar Chart: Attendance KPI -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h2 class="text-lg font-semibold text-slate-900 mb-4">Attendance</h2>
        <p><span class="dot" :style="{ 'background-color': data_att.datasets[0].backgroundColor }">
            </span>Target {{ yearKpi }} : {{ yearKpiTarget }}</p>
        <p><span class="dot" :style="{ 'background-color': data_att.datasets[1].backgroundColor }">
            </span>Accomplished {{ yearKpi }} : {{ yearKpiAccomplished }}</p>
        <p>Target Vs Actual : {{ pctTargetVsActual }} % </p>
        <p>Actual Vs Prev Year : {{ pctActualVsPrevious}} % </p>                   
        <div class="relative h-64">
              <Bar :data="data_att" :options="options" />
        </div>
      </div>       
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
import { ref, onMounted, computed } from 'vue'
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
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar } from 'vue-chartjs'
import * as chartConfig from '../composables/chartConfig.ts'
import { useAuth } from '~/composables/useAuth'; 
const auth = useAuth();

ChartJS.register(Colors, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ChartDataLabels)

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    colors: {
      forceOverride: false
    },
    datalabels: {
      color: "#00aaaa",
      anchor: "end",
      align: "top",
      offset: -6,
      font: {
        weight: "regular"
      },
      formatter: (value) => value // Show raw value
    }
  }
}
const data_cat1 = ref<ChartData<'bar'>>( 
          { labels: [2021, 2022, 2023, 2024 , 2025, 2026], 
              datasets: [
                { label: 'Target', backgroundColor: '#3B82F6', data: [12, 20 , 34 , 44 , 180, 200] }, 
                { label: 'Accomplished', backgroundColor: '#5310b9', data: [12, 20 , 34 , 44 , 180, 200] } 
              ] 
          }
        );

const data_cat2 = ref<ChartData<'bar'>>( 
          { labels: [2021, 2022, 2023, 2024 , 2025, 2026], 
              datasets: [
                { label: 'Target', backgroundColor: '#3B82F6', data: [12, 20 , 34 , 44 , 180, 200] }, 
                { label: 'Accomplished', backgroundColor: '#5310b9', data: [12, 20 , 34 , 44 , 180, 200] } 
              ] 
          }
        );

const data_att = ref<ChartData<'bar'>>( 
          { labels: [2021, 2022, 2023, 2024 , 2025, 2026], 
              datasets: [
                { label: 'Target', backgroundColor: '#3B82F6', data: [12, 20 , 34 , 44 , 180, 200] }, 
                { label: 'Accomplished', backgroundColor: '#5310b9', data: [12, 20 , 34 , 44 , 180, 200] } 
              ] 
          }
        );

const yearKpi = computed(() => data_cat1.value.labels[5]  );
const yearKpiTarget = computed(() => data_cat1.value.datasets[0].data[5]  );
const yearKpiAccomplished = computed(() => data_cat1.value.datasets[1].data[5]  );
const prevYearKpiAccomplished = computed(() => data_cat1.value.datasets[1].data[4]  );
const pctTargetVsActual = computed(() =>  Math.floor((yearKpiTarget.value / yearKpiAccomplished.value) * 100)  );
const pctActualVsPrevious = computed(() =>  Math.floor(((yearKpiAccomplished.value - prevYearKpiAccomplished.value) / prevYearKpiAccomplished.value) * 100)  );
         
 
const loadingMembership = ref(false);
const errorMessage = ref('');

const fetchMembership = async (endDate: date) => { 
  loadingMembership.value = true;
  errorMessage.value = '';

  try {
    const dtEnd = endDate.toISOString().substring(0, 10)
    const dtStart = endDate.getUTCFullYear() + '-01-01' ;  
   // data.value = await auth.apiFetch(`/api/report/kpi_membership_cat1/${dtStart}/${dtEnd}`) 
    const data = await auth.apiMultiFetch([
      `/api/report/membershipvsattendance/${dtStart}/${dtEnd}`,
      `/api/report/membershipvsattendance/2024-01-01/2025-01-01`, 
      `/api/report/membershipvsattendance/2023-01-01/2024-01-01`
    ]);

    console.log(data);
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

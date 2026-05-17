<template>
 <div class="min-h-screen p-6">
    <!-- 3-Column Chart Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"> 
      <kpi_chart
          :title="'Membership CAT 1'" 
          :srcData="data_cat1"
          :loading="loadingMembership"
          >
      </kpi_chart> 
      <kpi_chart
          :title="'Membership CAT 2'" 
          :srcData="data_cat2"
          :loading="loadingMembership"
          >
      </kpi_chart>
      <kpi_chart
          :title="'Attendance'" 
          :srcData="data_att"
          :loading="loadingMembership"
          >
      </kpi_chart> 
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
import kpi_chart from './kpi_chart'
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
          { labels: [], 
              datasets: [
                { label: 'Target', backgroundColor: '#3B82F6', data: [] }, 
                { label: 'Accomplished', backgroundColor: '#5310b9', data: [] } 
              ] 
          }
        );

const data_cat2 = ref<ChartData<'bar'>>( 
          { labels: [], 
              datasets: [
                { label: 'Target', backgroundColor: '#3B82F6', data: [] }, 
                { label: 'Accomplished', backgroundColor: '#5310b9', data: [] } 
              ] 
          }
        );

const data_att = ref<ChartData<'bar'>>( 
          { labels: [], 
              datasets: [
                { label: 'Target', backgroundColor: '#3B82F6', data: [] }, 
                { label: 'Accomplished', backgroundColor: '#5310b9', data: [] } 
              ] 
          }
        );
  
const loadingMembership = ref(false);
const errorMessage = ref('');

const fetchMembership = async (endDate: date) => { 
  loadingMembership.value = true;
  errorMessage.value = '';
 
  try {
    const totalYears = 4;
    const reqArray = [];
    const result = {};
    let endYear = endDate.getUTCFullYear();
    let beginYear = endYear - totalYears;

    for(let i = 0; i <= totalYears ; i++) {
       
       let url = '';
       
       if(i == totalYears) { 
          url = `/api/report/membershipvsattendance/${beginYear}-01-01/${endDate.toISOString().substring(0, 10)}`;
      } else {
          url = `/api/report/membershipvsattendance/${beginYear}-01-01/${beginYear + 1}-01-01`;
       }

       const resp = await auth.apiFetch(url);
       data_cat1.value.labels.push(beginYear); 
       data_cat1.value.datasets[0].data.push(resp.datasets[0].data[0])
       data_cat1.value.datasets[1].data.push(resp.datasets[0].data[0]) 
       data_cat2.value.labels.push(beginYear); 
       data_cat2.value.datasets[0].data.push(resp.datasets[1].data[0])
       data_cat2.value.datasets[1].data.push(resp.datasets[1].data[0])
       data_att.value.labels.push(beginYear); 
       data_att.value.datasets[0].data.push(resp.datasets[2].data[0])
       data_att.value.datasets[1].data.push(resp.datasets[2].data[0])  

       beginYear++;
    } 
 
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

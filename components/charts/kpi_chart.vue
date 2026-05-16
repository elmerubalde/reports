<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <h2 class="text-lg font-semibold text-slate-900 mb-4">{{ title }}</h2>
    <p class="text-sm text-slate-900" >
      <span class="dot" :style="{ 'background-color': bgColour1 }" />Target {{ yearKpi }} : {{ yearKpiTarget }} </p> 
    <p class="text-sm text-slate-900" >
      <span class="dot" :style="{ 'background-color': bgColour2 }" />Accomplished {{ yearKpi }} : {{ yearKpiAccomplished }}</p>               
    <p class="text-sm text-slate-900" >
      <span class="dot" :style="{ 'background-color': '#ee9c10' }" />Target vs Actual {{ yearKpi }} : {{ pctTargetVsActual }} %</p>               
    <p class="text-sm text-slate-900" >
      <span class="dot" :style="{ 'background-color': '#5eee10'  }" />Actual vs Prev Actual {{ yearKpi }} : {{ pctActualVsPrevious }}% </p>               
    
    <div class="relative h-64" v-if="data.datasets">
        <Bar :data="data" :options="options" />
    </div>
    
    <!-- Collapsible right side panel -->
    <div>
    <!-- Panel toggle button -->
      <button
        @click="togglePanel"
        class="flex items-center justify-between w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
      > 
        <svg
          class="w-5 h-5 transition-transform duration-200"
          :class="{ 'rotate-180': !isPanelOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    <aside v-if="isPanelOpen"
      class="rounded-2xl border border-slate-200 bg-slate-50 p-5 w-full lg:w-50 shrink-0 transition-all duration-300 ease-in-out"
      :class="{ 'opacity-0 max-h-0 overflow-hidden': !isPanelOpen, 'opacity-100 max-h-[2000px]': isPanelOpen }"
    > 
      <!-- Panel content -->
      <div class="mt-1 space-y-1">
        <form @submit.prevent="setTargets" class="space-y-1">
          <div class="grid gap-2 sm:grid-cols-2">
            <label class="block text-sm text-slate-700">
              <span class="mb-2 block font-medium">Start Year</span>
              <input
                v-model="startYear"
                type="text"
                placeholder="Start Year"
                class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label class="block text-sm text-slate-700">
              <span class="mb-2 block font-medium">Pct Inc YoY</span>
              <input
                v-model="pctIncrease"
                type="text"
                placeholder="Pct Inc YoY"
                class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>
        </form>
      </div>
    </aside>
  </div> 
</template>
<style scoped>
  .dot {
    height: 10px;
    width: 10px;
    background-color: #ec2323;
    border-radius: 50%;
    display: inline-block;
  }
</style>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
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
import cloneDeep from "lodash/cloneDeep";
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

interface ISeries {
  label: String;
  backgroundColor: String;
  data: number[];   
}

interface IData {
  labels: number[];
  datasets: ISeries[]; 
}

const props =  defineProps({
  title: String,
  srcData: Object as IData
})

const data = ref<IData>({});

// Collapsible panel state
const isPanelOpen = ref(true)
const togglePanel = () => {
  isPanelOpen.value = !isPanelOpen.value
}

const bgColour1 = ref('#222');
const bgColour2 = ref('#222'); 

const internalData = ref({});
const pctIncrease = ref(15);
const startYear = ref(2020);
const yearKpi = ref('');
const yearKpiTarget = ref('');
const yearKpiAccomplished = ref('');
const prevYearKpiAccomplished = ref('');
const pctTargetVsActual = ref('');
const pctActualVsPrevious = ref('');
const loadingMembership = ref(false);
const errorMessage = ref('');

const calculateTarget = async () => {
  data.value = cloneDeep(props.srcData); 
  let series = data.value.datasets[0]; 
  let rate = 1.0 + pctIncrease.value / 100;
  for (let i = 1; i < series.data.length ; i++) {
    series.data[i] = Math.floor( series.data[i - 1] * rate );
  }
}; 
 
const calculate = async (newData: IData) => {
  console.log(newData); 
  bgColour1.value = newData.datasets[0].backgroundColor ;
  bgColour2.value = newData.datasets[1].backgroundColor ;
  yearKpi.value = newData.labels.length > 0 ? newData.labels.at(-1) : '' ;
  yearKpiTarget.value = newData.datasets[0].data.length > 0 ? newData.datasets[0].data.at(-1) : 0 ;
  yearKpiAccomplished.value = newData.datasets[1].data.length > 0 ? newData.datasets[1].data.at(-1) : 0 ;
  prevYearKpiAccomplished.value = newData.datasets[1].data.length > 0 ? newData.datasets[1].data.at(-2) : 0 ;
  pctTargetVsActual.value = Math.floor(((yearKpiAccomplished.value - yearKpiTarget.value) / yearKpiTarget.value ) * 100) ;
  pctActualVsPrevious.value = Math.floor(((yearKpiAccomplished.value - prevYearKpiAccomplished.value) / prevYearKpiAccomplished.value) * 100);
  
  await calculateTarget();
};

watch(props.srcData, async (newData, oldData) => {
  if(props.srcData.labels.length > 1) { 
    data.value = cloneDeep(props.srcData); 
    await calculate(data.value); 
  }
});

watch(pctIncrease, async (newValue, oldValue) => {
   await calculateTarget();
});

watch(startYear, async (newValue, oldValue) => {
   await calculateTarget();
});

onMounted(async () => {
   data.value = cloneDeep(props.srcData); 
})
 
</script>

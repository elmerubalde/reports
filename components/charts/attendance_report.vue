<template>
  <div class="spinner" v-if="loading"></div>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <h2 class="text-lg font-semibold text-slate-900 mb-4">{{ title }}</h2>

    <div class="flex gap-6 text-sm text-slate-700 mb-4">
      <span><strong>Latest Week:</strong> {{ latestDate }}</span>
      <span><strong>Total:</strong> {{ latestTotal }}</span>
    </div>

    <div class="relative h-72" v-if="chartData.datasets && chartData.datasets.length > 0">
      <Bar :data="chartData" :options="options" />
    </div>

    <!-- Collapsible panel toggle -->
    <button
      @click="togglePanel"
      class="flex items-center justify-between w-full px-4 py-2 mt-4 text-left text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
    >
      <span class="text-sm font-medium">Categories</span>
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

    <aside
      v-if="isPanelOpen"
      class="rounded-2xl border border-slate-200 bg-slate-50 p-4 mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2"
    >
      <div
        v-for="ds in chartData.datasets"
        :key="ds.label"
        class="flex items-center gap-2 text-sm text-slate-700"
      >
        <span class="inline-block w-3 h-3 rounded-full" :style="{ backgroundColor: ds.backgroundColor }" />
        {{ ds.label }}
      </div>
    </aside>
  </div>
</template>

<style scoped>
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  position: absolute;
  left: 50%;
  margin-top: -20px;
  margin-left: -20px;
}

@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  Colors
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar } from 'vue-chartjs'

ChartJS.register(Colors, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ChartDataLabels)

const CATEGORY_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
]

const EXCLUDED_KEYS = new Set(['YearWk', 'DateAt', 'Total'])

const props = defineProps({
  title: String,
  srcData: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const isPanelOpen = ref(false)
const togglePanel = () => { isPanelOpen.value = !isPanelOpen.value }

const chartData = computed(() => {
  const raw = props.srcData as any[]
  if (!raw || raw.length === 0) return { labels: [], datasets: [] }

  const sorted = [...raw].sort((a, b) => String(a.DateAt).localeCompare(String(b.DateAt)))
  const labels = sorted.map(item => item.DateAt)
  const categoryKeys = Object.keys(sorted[0]).filter(k => !EXCLUDED_KEYS.has(k))

  const datasets = categoryKeys.map((key, i) => ({
    label: key,
    backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    data: sorted.map(item => Number(item[key]) || 0)
  }))

  return { labels, datasets }
})

const latestDate = computed(() => {
  const raw = props.srcData as any[]
  if (!raw || raw.length === 0) return '—'
  return [...raw].sort((a, b) => String(b.DateAt).localeCompare(String(a.DateAt)))[0].DateAt
})

const latestTotal = computed(() => {
  const raw = props.srcData as any[]
  if (!raw || raw.length === 0) return 0
  const latest = [...raw].sort((a, b) => String(b.DateAt).localeCompare(String(a.DateAt)))[0]
  return latest.Total ?? 0
})

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { stacked: true },
    y: { stacked: true, beginAtZero: true }
  },
  plugins: {
    legend: { display: false },
    datalabels: { display: false }
  }
}
</script>

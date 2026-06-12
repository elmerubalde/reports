<template>
  <div class="min-h-screen p-6">
    <!-- 3-Column Chart Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <attendance_report
          :title="'Prayer Meeting Monthly Average Attendance'"
          :srcData="data_prayer"
          :loading="loading"
          >
      </attendance_report>
    </div>

    <!-- Sample Dataset Pivot Table -->
    <div class="mt-6 p-4 border rounded bg-gray-50">
      <h3 class="text-sm font-semibold text-slate-800 mb-2">Sample Pivot Table</h3>
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-2 text-left">Category</th>
            <th v-for="date in dates" :key="date" class="border p-2 text-left">{{ date }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category" class="border-b">
            <td class="border p-2 text-left">{{ category }}</td>
            <td v-for="date in dates" :key="date + '-' + category" class="border p-2 text-left">
              {{ getPivotValue(category, date) }}
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
import { ref, onMounted, computed, reactive } from 'vue'
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
import attendance_report from '../components/charts/attendance_report.vue'
import { Bar } from 'vue-chartjs'
import * as chartConfig from '../composables/chartConfig'
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

const loading = ref(false);
const errorMessage = ref('');
const data_prayer = ref<Array<any>>([]);
const sampleDataset = reactive([
  {
    YearWk: 202501,
    DateAt: "2025-01-10",
    "Senior Men": "0",
    "Adult Men": "8",
    "Yan Men": "1",
    "CYN Male": "7",
    "Children Male": "4",
    "Senior Women": "2",
    "Adult Women": "10",
    "Yan Women": "1",
    "CYN Female": "6",
    "Children Female": "7",
    Total: 46
  },
  {
    YearWk: 202502,
    DateAt: "2025-01-17",
    "Senior Men": "0",
    "Adult Men": "8",
    "Yan Men": "1",
    "CYN Male": "7",
    "Children Male": "4",
    "Senior Women": "2",
    "Adult Women": "10",
    "Yan Women": "1",
    "CYN Female": "6",
    "Children Female": "7",
    Total: 46
  }
]);
const fetchData = async (endDate: Date) => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const totalYears = 1;
    const endYear = endDate.getUTCFullYear();
    const beginYear = endYear - totalYears;
    const url = `/api/report/ecoprayerattendancebydate/weekly/${beginYear}-01-01/${endDate.toISOString().substring(0, 10)}/12`;
    data_prayer.value  = await auth.apiFetch(url);
    console.log(data_prayer.value);
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Unable to load data.';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  //if (auth.isLoggedIn.value) {
    let now = new Date();
    await fetchData(now);
  //
});

/**
 * Derive rows for the table based on the `Senior Men` and `Senior Women` fields.
 * Each record from `sampleDataset` yields two rows:
 *   - One for Senior Men
 *   - One for Senior Women
 *
 * The resulting rows contain all original fields plus a new `category`
 * identifier so the UI can display them appropriately.
 */
interface DerivedRow {
  category: 'Senior Men' | 'Senior Women'
  YearWk: number
  DateAt: string
  [key: string]: any // allow other fields to be accessed dynamically
}
// Compute unique dates from the dataset
const dates = computed(() => {
  const set = new Set<string>();
  sampleDataset.forEach(item => {
    set.add(item.DateAt);
  });
  // Sort chronologically (ISO strings sort naturally)
  return Array.from(set).sort();
});

// Compute all categories (keys) excluding metadata fields
const categories = computed(() => {
  if (data_prayer.value.length === 0) return [];
  const first = data_prayer.value[0] as Record<string, any>;
  // Exclude YearWk and DateAt
  return Object.keys(first).filter(k => k !== 'YearWk' && k !== 'DateAt');
});

/**
 * Helper to retrieve a value for a given category and date.
 * Returns the value as a string (or 0 if not found).
 */
function getPivotValue(category: string, date: string): string {
  const record = data_prayer.value?.find(item => item.DateAt === date);
  if (!record) return '0';
  const val = record[category];
  // If the value is undefined, default to 0
  return val !== undefined ? String(val) : '0';
}

// The previously calculated derivedRows are no longer needed
// (kept for reference only)

</script>
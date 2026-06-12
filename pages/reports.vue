<template>
  <div class="min-h-screen p-6">
    <!-- Filters -->
    <div class="flex flex-wrap items-end gap-4 mb-6 mt-8">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-600">Fiscal Year</label>
        <input
          type="number"
          v-model.number="endYear"
          min="2000"
          max="2100"
          class="border border-gray-300 rounded px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-600">Church</label>
        <select
          v-model.number="selectedChurchGroupId"
          class="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option v-for="cg in CHURCHGROUPS" :key="cg.id" :value="cg.id">{{ cg.name }}</option>
        </select>
      </div>
      <button
        @click="fetchData"
        :disabled="loading"
        class="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Load
      </button>
      <span v-if="errorMessage" class="text-xs text-red-500">{{ errorMessage }}</span>
    </div>

    <!-- Stacked Column Chart Grid -->
    <div class="grid grid-cols-1 gap-6 mb-8">
      <attendance_report
          :title="'Prayer Meeting Weekly Attendance'"
          :srcData="data_prayer"
          :loading="loading"
      />
    </div>

    <!--Dataset Pivot Table -->
    <div class="mt-6 p-4 border rounded bg-gray-50">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-slate-800">Prayer Meeting Weekly Attendance</h3>
        <button
          @click="copyTableToClipboard"
          :title="copied ? 'Copied!' : 'Copy to clipboard'"
          class="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-gray-200 rounded transition-colors"
        >
          <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
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

      <!-- Monthly Pivot Table -->
      <div class="mt-6 p-4 border rounded bg-gray-50">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-slate-800">Prayer Meeting Monthly Attendance (Average)</h3>
        </div>
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="border p-2 text-left">Category</th>
              <th v-for="month in monthHeaders" :key="month" class="border p-2 text-left">{{ month }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categories" :key="category" class="border-b">
              <td class="border p-2 text-left">{{ category }}</td>
              <td v-for="month in monthHeaders" :key="month + '-' + category" class="border p-2 text-left">
                {{ getMonthlyAvg(category, month) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import attendance_report from '../components/charts/attendance_report.vue'
import { useAuth } from '../composables/useAuth';
import { CHURCHGROUPS } from '../composables/constants';

const auth = useAuth();

const now = new Date();
const endYear = ref(now.getFullYear());
const selectedChurchGroupId = ref(0);

const loading = ref(false);
const errorMessage = ref('');

const data_prayer = ref<Array<any>>([]);

const fetchData = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const beginYear = endYear.value - 1
    const url = `/api/report/ecoprayerattendancebydate/weekly/${beginYear}-09-01/${endYear.value}-09-01/${selectedChurchGroupId.value}`;
    data_prayer.value = await auth.apiFetch(url);
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Unable to load data.';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (auth.isLoggedIn.value) {
    await fetchData();
  }
});

const dates = computed(() => {
  const set = new Set<string>();
  data_prayer.value.forEach(item => set.add(item.DateAt));
  return Array.from(set).sort();
});

const categories = computed(() => {
  return ['Senior Men',
    'Senior Women',
    'Adult Men',
    'Adult Women',
    'Yan Men',
    'Yan Women',
    'CYN Male',
    'CYN Female',
    'Children Male',
    'Children Female',
    'Total'];
});

/**
 * Monthly averages derived from weekly data_prayer.
 * Returns an array where each element represents a month (e.g., "2025-01")
 * and contains the average value for every category.
 */
const monthlyAvg = computed(() => {
  const groups: Record<string, { count: number; sums: Record<string, number> }> = {};
  data_prayer.value.forEach(item => {
    const d = new Date(item.DateAt);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[monthKey]) {
      groups[monthKey] = { count: 0, sums: {} };
    }
    groups[monthKey].count++;
    categories.value.forEach(cat => {
      const val = Number(item[cat] ?? 0);
      groups[monthKey].sums[cat] = (groups[monthKey].sums[cat] ?? 0) + val;
    });
  });
  // Transform into an ordered array with averages
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => {
      const avg: Record<string, number> = {};
      categories.value.forEach(cat => {
        avg[cat] = data.count ? data.sums[cat] /  ( 4 < data.count ? data.count : 4) : 0;
      });
      return { month, ...avg };
    });
});

// Helper for month headers
const monthHeaders = computed(() => monthlyAvg.value.map(m => m.month));

function getPivotValue(category: string, date: string): string {
  const record = data_prayer.value?.find(item => item.DateAt === date);
  if (!record) return '0';
  const val = record[category];
  return val !== undefined ? String(val) : '0';
}

/**
 * Retrieve the average value for a given category and month.
 */
function getMonthlyAvg(category: string, month: string): string {
  const rec = monthlyAvg.value.find(m => m.month === month);
  if (!rec) return '0';
  const val = rec[category];
  return val !== undefined ? val.toFixed(2) : '0';
}

const copied = ref(false);

function copyTableToClipboard() {
  const header = ['Category', ...dates.value].join('\t');
  const rows = categories.value.map(cat =>
    [cat, ...dates.value.map(d => getPivotValue(cat, d))].join('\t')
  );
  navigator.clipboard.writeText([header, ...rows].join('\n'));
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}
</script>

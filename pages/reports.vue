<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 p-6">
    <!-- Filters -->
    <div class="flex flex-wrap items-end gap-4 mb-6 mt-8 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-200/60 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-none">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-600 dark:text-slate-300">Begin Date</label>
        <input
          type="date"
          v-model="beginDate"
          class="border border-slate-300 bg-white text-slate-900 rounded px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-600 dark:text-slate-300">End Date</label>
        <input
          type="date"
          v-model="endDate"
          class="border border-slate-300 bg-white text-slate-900 rounded px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-600 dark:text-slate-300">Church</label>
        <select
          v-model.number="selectedChurchGroupId"
          class="border border-slate-300 bg-white text-slate-900 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          <option v-for="cg in CHURCHGROUPS" :key="cg.id" :value="cg.id">{{ cg.name }}</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-600 dark:text-slate-300">Event Type</label>
        <select
          v-model="selectedEventType"
          class="border border-slate-300 bg-white text-slate-900 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          <option v-for="type in eventTypes" :key="type.id" :value="type">{{ type.name }}</option>
        </select>
      </div>
      <button
        @click="fetchData"
        :disabled="loading"
        class="px-4 py-1.5 text-sm bg-slate-900 text-white rounded hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-300 disabled:opacity-50"
      >
        Load
      </button>
      <span v-if="errorMessage" class="text-xs text-red-500">{{ errorMessage }}</span>
    </div>

    <!-- Stacked Column Chart Grid -->
    <div class="grid grid-cols-1 gap-6 mb-8">
      <attendance_report
          :title="selectedEventType.name + ' Weekly Attendance'"
          :srcData="data_prayer"
          :loading="loading"
      />
    </div>

    <!--Dataset Pivot Table -->
    <div class="mt-6 p-4 border border-slate-200 rounded-3xl bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ selectedEventType.name }} Weekly Attendance By Network</h3>
        <button
          @click="copyTableToClipboard"
          :title="copied ? 'Copied!' : 'Copy to clipboard'"
          class="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
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
      <div class="overflow-x-auto">
        <table class="min-w-max border-collapse text-xs text-slate-700 dark:text-slate-200">
          <thead>
            <tr class="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <th class="sticky left-0 top-0 z-20 border border-slate-200 bg-white/95 p-1 text-left dark:border-slate-700 dark:bg-slate-900/95">Network</th>
              <th v-for="date in dates" :key="date" class="sticky top-0 z-10 border border-slate-200 p-1 text-left bg-slate-100 dark:border-slate-700 dark:bg-slate-800">{{ date }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categories" :key="category" class="border-b">
              <td class="sticky left-0 z-10 border border-slate-200 bg-white/95 p-1 text-left dark:border-slate-700 dark:bg-slate-900/95">{{ category }}</td>
              <td v-for="date in dates" :key="date + '-' + category" class="border border-slate-200 p-1 text-left dark:border-slate-700">{{ getPivotValue(category, date) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Church Weekly Attendance Table -->
    <div class="mt-6 p-4 border border-slate-200 rounded-3xl bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ selectedEventType.name }} Weekly Attendance by Church</h3>
        <button
          @click="copyChurchTableToClipboard"
          :title="copiedChurch ? 'Copied!' : 'Copy to clipboard'"
          class="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
        >
          <svg v-if="!copiedChurch" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {{ copiedChurch ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-max border-collapse text-xs text-slate-700 dark:text-slate-200">
          <thead>
            <tr class="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <th class="sticky left-0 top-0 z-20 border border-slate-200 bg-white/95 p-1 text-left dark:border-slate-700 dark:bg-slate-900/95">Church</th>
              <th v-for="date in churchDates" :key="date" class="sticky top-0 z-10 border border-slate-200 p-1 text-left bg-slate-100 dark:border-slate-700 dark:bg-slate-800">{{ date }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!churchNames.length">
              <td class="border p-1 text-left" :colspan="churchDates.length + 1">No church attendance data available.</td>
            </tr>
            <tr v-for="church in churchNames" :key="church" class="border-b">
              <td class="sticky left-0 z-10 border border-slate-200 bg-white/95 p-1 text-left dark:border-slate-700 dark:bg-slate-900/95">{{ church }}</td>
              <td v-for="date in churchDates" :key="date + '-' + church" class="border border-slate-200 p-1 text-left dark:border-slate-700">{{ getChurchTotal(church, date) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Church Monthly Attendance Table -->
    <div class="mt-6 p-4 border border-slate-200 rounded-3xl bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ selectedEventType.name }} Monthly Attendance By Church (Average) </h3>
        <button
          @click="copyChurchMonthlyTableToClipboard"
          :title="copiedChurchMonthly ? 'Copied!' : 'Copy to clipboard'"
          class="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
        >
          <svg v-if="!copiedChurchMonthly" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {{ copiedChurchMonthly ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-max border-collapse text-xs text-slate-700 dark:text-slate-200">
          <thead>
            <tr class="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <th class="sticky left-0 top-0 z-20 border border-slate-200 bg-white/95 p-1 text-left dark:border-slate-700 dark:bg-slate-900/95">Church</th>
              <th v-for="month in churchMonthHeaders" :key="month" class="sticky top-0 z-10 border border-slate-200 p-1 text-left bg-slate-100 dark:border-slate-700 dark:bg-slate-800">{{ month }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!churchNames.length">
              <td class="border p-1 text-left" :colspan="churchMonthHeaders.length + 1">No church attendance data available.</td>
            </tr>
            <tr v-for="church in churchNames" :key="church" class="border-b">
              <td class="sticky left-0 z-10 border border-slate-200 bg-white/95 p-1 text-left dark:border-slate-700 dark:bg-slate-900/95">{{ church }}</td>
              <td v-for="month in churchMonthHeaders" :key="month + '-' + church" class="border border-slate-200 p-1 text-left dark:border-slate-700">{{ getChurchMonthTotal(church, month) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

      <!-- Monthly Pivot Table -->
      <div class="mt-6 p-4 border border-slate-200 rounded-3xl bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ selectedEventType.name }} Monthly Attendance (Average)</h3>
          <button
            @click="copyMonthlyTableToClipboard"
            :title="copiedMonthly ? 'Copied!' : 'Copy to clipboard'"
            class="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
          >
            <svg v-if="!copiedMonthly" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {{ copiedMonthly ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-max border-collapse text-xs text-slate-700 dark:text-slate-200">
            <thead>
              <tr class="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <th class="sticky left-0 top-0 z-20 border border-slate-200 bg-white/95 p-1 text-left dark:border-slate-700 dark:bg-slate-900/95">Network</th>
                <th v-for="month in monthHeaders" :key="month" class="sticky top-0 z-10 border border-slate-200 p-1 text-left bg-slate-100 dark:border-slate-700 dark:bg-slate-800">{{ month }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in categories" :key="category" class="border-b">
                <td class="sticky left-0 z-10 border border-slate-200 bg-white/95 p-1 text-left dark:border-slate-700 dark:bg-slate-900/95">{{ category }}</td>
                <td v-for="month in monthHeaders" :key="month + '-' + category" class="border border-slate-200 p-1 text-left dark:border-slate-700">{{ getMonthlyAvg(category, month) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
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
const formatDate = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const beginDate = ref(formatDate(new Date(now.getFullYear() - 1, 8, 1)));
const endDate = ref(formatDate(now));
const selectedChurchGroupId = ref(0);
const eventTypes = [
  { id:'pm' , name:'Prayer Meeting'}, 
  { id:'whs' , name:'WHS'}, 
  { id:'prm' , name:'PRM' }, 
  { id:'lg' , name:'LG' }];

const selectedEventType = ref(eventTypes[0]);

const loading = ref(false);
const errorMessage = ref('');

const data_prayer = ref<Array<any>>([]);
const data_prayer_bychurch = ref<Array<any>>([]);

const fetchData = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    await fetchByNetworkData()
    await fetchByChurchData()
  } finally {
    loading.value = false;
  }
}

const fetchByNetworkData = async () => {
  try {
    const url = `/api/report/eco/${selectedEventType.value.id}/network/weekly/${beginDate.value}/${endDate.value}/${selectedChurchGroupId.value}`;
    data_prayer.value = await auth.apiFetch(url);
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Unable to load data.';
  }
};

const fetchByChurchData = async () => {
  try {
    const url = `/api/report/eco/${selectedEventType.value.id}/church/weekly/${beginDate.value}/${endDate.value}/${selectedChurchGroupId.value}`;
    data_prayer_bychurch.value = await auth.apiFetch(url);
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Unable to load data.';
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

const churchDates = computed(() => {
  const set = new Set<string>();
  data_prayer_bychurch.value.forEach(item => set.add(item.DateAt));
  return Array.from(set).sort();
});

const churchNames = computed(() => {
  const set = new Set<string>();
  data_prayer_bychurch.value.forEach(item => set.add(item.churchName));
  return Array.from(set);
});

const churchMonthHeaders = computed(() => {
  const set = new Set<string>();
  data_prayer_bychurch.value.forEach(item => {
    const d = new Date(item.DateAt);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    set.add(monthKey);
  });
  return Array.from(set).sort();
});

function getChurchTotal(churchName: string, date: string): string {
  const record = data_prayer_bychurch.value?.find(item => item.churchName === churchName && item.DateAt === date);
  if (!record) return '';
  const total = record.Total ?? 0;
  return total !== 0 ? String(total) : '';
}

function getChurchMonthTotal(churchName: string, month: string): string {
  const records = data_prayer_bychurch.value.filter(item => {
    const d = new Date(item.DateAt);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return item.churchName === churchName && monthKey === month;
  });
  if (records.length === 0) return '';
  const sum = records.reduce((total, record) => total + Number(record.Total ?? 0), 0);
  const avg = sum / records.length;
  return avg !== 0 ? avg.toFixed(2) : '';
}

type MonthlyAverageRecord = {
  month: string;
} & Record<string, number>;

/**
 * Monthly averages derived from weekly data_prayer.
 * Returns an array where each element represents a month (e.g., "2025-01")
 * and contains the average value for every category.
 */
const monthlyAvg = computed<MonthlyAverageRecord[]>(() => {
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
      const avg: MonthlyAverageRecord = { month } as MonthlyAverageRecord;
      categories.value.forEach(cat => {
        avg[cat] = data.count ? data.sums[cat] /  ( 4 < data.count ? data.count : 4) : 0;
      });
      return avg;
    });
});

// Helper for month headers
const monthHeaders = computed(() => monthlyAvg.value.map(m => m.month));

function getPivotValue(category: string, date: string): string {
  const record = data_prayer.value?.find(item => item.DateAt === date);
  if (!record) return '';
  const val = record[category];
  return val !== undefined && val !== 0 ? String(val) : '';
}

/**
 * Retrieve the average value for a given category and month.
 */
function getMonthlyAvg(category: string, month: string): string {
  const rec = monthlyAvg.value.find(m => m.month === month);
  if (!rec) return '';
  const val = (rec as Record<string, unknown>)[category] as number | undefined;
  return val !== undefined && val !== 0 ? val.toFixed(2) : '';
}

const copied = ref(false);
const copiedChurch = ref(false);
const copiedChurchMonthly = ref(false);
const copiedMonthly = ref(false);

function copyTableToClipboard() {
  const header = ['Network', ...dates.value].join('\t');
  const rows = categories.value.map(cat =>
    [cat, ...dates.value.map(d => getPivotValue(cat, d))].join('\t')
  );
  navigator.clipboard.writeText([header, ...rows].join('\n'));
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}

function copyChurchTableToClipboard() {
  const header = ['Church', ...churchDates.value].join('\t');
  const rows = churchNames.value.map(church =>
    [church, ...churchDates.value.map(date => getChurchTotal(church, date))].join('\t')
  );
  navigator.clipboard.writeText([header, ...rows].join('\n'));
  copiedChurch.value = true;
  setTimeout(() => { copiedChurch.value = false; }, 2000);
}

function copyChurchMonthlyTableToClipboard() {
  const header = ['Church', ...churchMonthHeaders.value].join('\t');
  const rows = churchNames.value.map(church =>
    [church, ...churchMonthHeaders.value.map(month => getChurchMonthTotal(church, month))].join('\t')
  );
  navigator.clipboard.writeText([header, ...rows].join('\n'));
  copiedChurchMonthly.value = true;
  setTimeout(() => { copiedChurchMonthly.value = false; }, 2000);
}

function copyMonthlyTableToClipboard() {
  const header = ['Network', ...monthHeaders.value].join('\t');
  const rows = categories.value.map(cat =>
    [cat, ...monthHeaders.value.map(m => getMonthlyAvg(cat, m))].join('\t')
  );
  navigator.clipboard.writeText([header, ...rows].join('\n'));
  copiedMonthly.value = true;
  setTimeout(() => { copiedMonthly.value = false; }, 2000);
}
</script>

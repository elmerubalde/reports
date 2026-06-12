<template>
  <div class="min-h-screen p-6">
    <!-- 3-Column Chart Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <attendance_report
          :title="'Prayer Meeting Weekly Attendance'"
          :srcData="data_prayer"
          :loading="loading"
      />
    </div>

    <!--Dataset Pivot Table -->
    <div class="mt-6 p-4 border rounded bg-gray-50">
      <h3 class="text-sm font-semibold text-slate-800 mb-2">Prayer Weekly</h3>
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

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import attendance_report from '../components/charts/attendance_report.vue'
import { useAuth } from '~/composables/useAuth';

const auth = useAuth();

const loading = ref(false);
const errorMessage = ref('');
const data_prayer = ref<Array<any>>([]);

const fetchData = async (endDate: Date) => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const endYear = endDate.getUTCFullYear();
    const beginYear = endYear - 1;
    const url = `/api/report/ecoprayerattendancebydate/weekly/${beginYear}-01-01/${endDate.toISOString().substring(0, 10)}/12`;
    data_prayer.value = await auth.apiFetch(url);
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Unable to load data.';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (auth.isLoggedIn.value) {
    await fetchData(new Date());
  }
});

const dates = computed(() => {
  const set = new Set<string>();
  data_prayer.value.forEach(item => set.add(item.DateAt));
  return Array.from(set).sort();
});

const categories = computed(() => {
  if (data_prayer.value.length === 0) return [];
  const first = data_prayer.value[0] as Record<string, any>;
  return Object.keys(first).filter(k => k !== 'YearWk' && k !== 'DateAt');
});

function getPivotValue(category: string, date: string): string {
  const record = data_prayer.value?.find(item => item.DateAt === date);
  if (!record) return '0';
  const val = record[category];
  return val !== undefined ? String(val) : '0';
}
</script>

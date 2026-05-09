<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth';
import ecobarchart  from './ecobarchart.vue'; 
import membernetworkdistribution from './membernetworkdistribution.vue';
import memberattendance from './memberattendance.vue';

const auth = useAuth();

// ============================
// TYPESCRIPT INTERFACES
// ============================

interface EventRegistration {
  id: number
  date: string
  region: string
  registrations: number
  attendance: number
  ageGroup:  'CYN' | 'YAN' | 'ADULT' | 'SENIOR'
}

interface RegistrationTrend {
  month: string
  registrations: number
}

interface Membership {
  month: string
  cat1: number
  cat2: number
}

interface AgeGroupTrend {
  ageGroup: string
  count: number
  percentage: number
  index: number
}

 

// ============================
// MOCK DATA
// ============================

const registrationTrendData: RegistrationTrend[] = [
  { month: 'Jan', registrations: 120 },
  { month: 'Feb', registrations: 145 },
  { month: 'Mar', registrations: 178 },
  { month: 'Apr', registrations: 210 },
  { month: 'May', registrations: 185 },
  { month: 'Jun', registrations: 245 },
  { month: 'Jul', registrations: 280 },
  { month: 'Aug', registrations: 256 },
  { month: 'Sep', registrations: 290 },
  { month: 'Oct', registrations: 320 },
  { month: 'Nov', registrations: 295 },
  { month: 'Dec', registrations: 350 }
]
const regionAttendanceData: RegionAttendance[] = [
  { region: 'West', attendance: 320, fill: '#2563EB' },
  { region: 'East', attendance: 280, fill: '#10B981' },
  { region: 'North', attendance: 195, fill: '#F59E0B' },
  { region: 'South', attendance: 245, fill: '#8B5CF6' },
  { region: 'Central', attendance: 160, fill: '#EC4899' }
]

const colors: string[] = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#48d1ec',
  '#3B62A0',
  '#107921',
  '#a52E0B',
  '#3B3Ca6',
  '#1C1859',
  '#28f1ec', 
]


const rawDataTableData: EventRegistration[] = [
  { id: 1, date: '2026-01-15', region: 'West', registrations: 45, attendance: 38, ageGroup: 'YAN' },
  { id: 2, date: '2026-01-18', region: 'East', registrations: 38, attendance: 35, ageGroup: 'ADULT' },
  { id: 3, date: '2026-01-22', region: 'North', registrations: 28, attendance: 24, ageGroup: 'CYN' },
  { id: 4, date: '2026-01-25', region: 'South', registrations: 52, attendance: 48, ageGroup: 'ADULT' },
  { id: 5, date: '2026-01-28', region: 'Central', registrations: 19, attendance: 16, ageGroup: 'SENIOR' },
  { id: 6, date: '2026-02-05', region: 'West', registrations: 48, attendance: 44, ageGroup: 'YAN' },
  { id: 7, date: '2026-02-12', region: 'East', registrations: 42, attendance: 40, ageGroup: 'ADULT' },
  { id: 8, date: '2026-02-20', region: 'North', registrations: 33, attendance: 29, ageGroup: 'CYN' },
  { id: 9, date: '2026-02-25', region: 'South', registrations: 58, attendance: 53, ageGroup: 'ADULT' },
  { id: 10, date: '2026-02-28', region: 'Central', registrations: 21, attendance: 18, ageGroup: 'SENIOR' }
]

// ============================
// SORTING LOGIC
// ============================

const sortKey = ref<keyof EventRegistration>('date')
const sortDirection = ref<'asc' | 'desc'>('desc')

const sortedTableData = computed(() => {
  return [...rawDataTableData].sort((a, b) => {
    const aVal = a[sortKey.value]
    const bVal = b[sortKey.value]

    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
})

const setSort = (key: keyof EventRegistration) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'desc'
  }
}

const getSortIcon = (key: keyof EventRegistration) => {
  if (sortKey.value !== key) return '↕'
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

const membershipData = ref ([]);   
const ageGroupData:AgeGroupTrend[] = ref ([]);  
const membership = ref({});
const loadingMembership  = ref(false);
const errorMessage = ref({});

const fetchMembership = async (endDate: date, churchGroupId: number) => { 
  loadingMembership.value = true;
  errorMessage.value = '';

  try {
    const dt = endDate.toISOString().substring(0, 10)
    ageGroupData.value = await auth.apiFetch(`/api/report/membership/${dt}/${churchGroupId}`) 
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Unable to load membership.';
  } finally {
    loadingMembership.value = false;
  }
};

const fetchMonthlyMembership = async (startDate: Date, churchGroupId: number) => { 
  loadingMembership.value = true;
  errorMessage.value = '';

  let result = [];
  const endDate = new Date(); 
  const endMM = endDate.getMonth();
  const endYYYY = endDate.getFullYear();  
  
  try {
    let mm = startDate.getMonth();
    let yyyy = startDate.getFullYear(); 
    for( ; mm <= endMM; mm++ ) { 
      console.log(endMM, mm); 
      const fromDate = new Date(yyyy, mm - 1, 1); 
      membershipData.value.push({ dt: fromDate , data: [] })
    }
    for(let i = 0; i < membershipData.value.length; i++ ) { 
      const dt = membershipData.value[i].dt.toISOString().substring(0, 10)
      const data = await auth.apiFetch(`/api/report/membership/${dt}/${churchGroupId}`) 
      data['month'] = dt;
      membershipData.value[i] = data; 
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
    await fetchMembership(now, 12);
    await fetchMonthlyMembership(new Date(now.getFullYear(), 1, 1), 12)
  }
});
</script>

// Helper function to generate donut chart segment paths
function getDonutSegmentPath(index: number, percentage: number): string {
  const radius = 70
  const innerRadius = 30
  const anglePerPercentage = (Math.PI * 2) / 100

  // Calculate cumulative percentage of previous segments
  const cumulativePercentages = [0, 15, 42, 88] // CYN, YAN, ADULT, SENIOR
  const startAngle = cumulativePercentages[index] * anglePerPercentage - Math.PI / 2
  const endAngle = (cumulativePercentages[index] + percentage) * anglePerPercentage - Math.PI / 2

  const x1 = radius * Math.cos(startAngle)
  const y1 = radius * Math.sin(startAngle)
  const x2 = radius * Math.cos(endAngle)
  const y2 = radius * Math.sin(endAngle)

  const x3 = innerRadius * Math.cos(endAngle)
  const y3 = innerRadius * Math.sin(endAngle)
  const x4 = innerRadius * Math.cos(startAngle)
  const y4 = innerRadius * Math.sin(startAngle)

  return `
    M ${x1} ${y1}
    A ${radius} ${radius} 0 ${percentage > 50 ? 1 : 0} 1 ${x2} ${y2}
    L ${x3} ${y3}
    A ${innerRadius} ${innerRadius} 0 ${percentage > 50 ? 1 : 0} 0 ${x4} ${y4}
    Z
  `.replace(/\s+/g, ' ').trim()
}

<template>
  <div class="min-h-screen p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900">ECO Dashboard</h1>
      <p class="text-slate-600 mt-2">Overview of event registrations, attendance, and demographics</p>
    </div>

   
    <!-- 3-Column Chart Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

      <!-- Line Chart: CAT1/CAT2 Over Time -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <membernetworkdistribution></membernetworkdistribution>
      </div>

      <!-- Bar Chart: Attendance  -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <memberattendance></memberattendance>
      </div>

      <!-- Donut Chart: Age Group Distribution -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <h2 class="text-lg font-semibold text-slate-900 mb-4">Age Group Distribution</h2>
        <div class="flex items-center justify-center h-64">
          <svg viewBox="0 0 180 180" class="w-48 h-48">
            <!-- Donut Chart -->
            <g transform="translate(90, 90)">
              

              <!-- Segments -->
              <g v-for="(segment) in ageGroupData" :key="segment.ageGroup">
                <path
                  :d="getDonutSegmentPath(segment.index, segment.percentage)"
                  :fill="colors[segment.index]"
                  class="hover:opacity-80 transition-opacity cursor-pointer"
                />
              </g> 
              <!-- Center Circle -->
              <circle
                cx="0"
                cy="0"
                r="40"
                fill="white"
                
              />

              <!-- Center Text -->
              <text
                x="0"
                y="-5"
                text-anchor="middle"
                class="text-lg font-bold fill-gray-900"
              >
                {{ ageGroupData.reduce((sum, d) => sum + d.count, 0) }}
              </text>
              <text
                x="0"
                y="15"
                text-anchor="middle"
                class="text-xs fill-gray-500"
              >
                Total
              </text>
            </g>
          </svg>
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap gap-3 justify-center mt-4">
          <div
            v-for="(segment) in ageGroupData" :key="segment.ageGroup"
            class="flex items-center gap-2"
          >
            <div
              class="w-3 h-3 rounded-full"
              :style="{ backgroundColor: colors[segment.index] }"
            ></div>
            <span class="text-xs text-slate-900">
              {{ segment.ageGroup }}: {{ segment.count }}  {{ Math.floor(segment.percentage * 100) }}%
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
        <ecobarchart style="min-height: 400px"/> 
    </div> 
    
  </div>
</template>

<script lang="ts">

const cumulativePercentages = [0, 0]; 
// Helper function to generate donut chart segment paths
function getDonutSegmentPath(index: number, percentage: number): string {
  const radius = 70
  const innerRadius = 30
  const anglePerPercentage = (Math.PI * 2) 
  // Calculate cumulative percentage of previous segments 
  const startAngle = cumulativePercentages[index] * anglePerPercentage
  const endAngle =  (cumulativePercentages[index] + percentage) * anglePerPercentage
  cumulativePercentages.push(cumulativePercentages[index] + percentage);
  
  const x1 = radius * Math.cos(startAngle)
  const y1 = radius * Math.sin(startAngle)
  const x2 = radius * Math.cos(endAngle)
  const y2 = radius * Math.sin(endAngle)

  const x3 = innerRadius * Math.cos(endAngle)
  const y3 = innerRadius * Math.sin(endAngle)
  const x4 = innerRadius * Math.cos(startAngle)
  const y4 = innerRadius * Math.sin(startAngle)

  return `
    M ${x1} ${y1}
    A ${radius} ${radius} 0 ${percentage > 50 ? 1 : 0} 1 ${x2} ${y2}
    L ${x3} ${y3}
    A ${innerRadius} ${innerRadius} 0 ${percentage > 50 ? 1 : 0} 0 ${x4} ${y4}
    Z
  `.replace(/\s+/g, ' ').trim()
}
 

export default { 
  name: 'dashboard',
  components : { ecobarchart, membernetworkdistribution, memberattendance },
  setup() {
    return {
      getDonutSegmentPath
    }
  }, 
}
</script>

<style scoped>
.grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

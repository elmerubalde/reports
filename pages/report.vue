<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-2">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 class="text-3xl text-gray-900 dark:text-white mb-8">
          Attendance Report by Church
        </h2>

        <!-- Filters -->
        <div class="mb-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year
              </label>
              <select
                v-model="selectedYear"
                @change="onYearChange"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Years</option>
                <option v-for="year in availableYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Month
              </label>
              <select
                v-model="selectedMonth"
                @change="fetchMonthlyData"
                :disabled="!selectedYear"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              >
                <option value="">All Months</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Type
              </label>
              <select
                v-model="selectedEventType"
                @change="onEventTypeChange"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Event Types</option>
                <option value="WHS">WHS</option>
                <option value="WIN GATHERING">WIN GATHERING</option>
                <option value="SUMMIT">SUMMIT</option>
                <option value="MEETING">MEETING</option>
                <option value="TRAINING">TRAINING</option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                @click="resetFilters"
                class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="monthlyData.length > 0" class="space-y-8">
          <!-- Monthly Bar Chart -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {{ monthlyChartTitle }}
            </h2>
            <Bar :data="monthlyChartData" :options="monthlyChartOptions" />
          </div>

          <!-- Monthly Data Table -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Monthly Attendance Data
            </h2>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead class="bg-gray-100 dark:bg-gray-600">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Church
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Year
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Month
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Attendance Count
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                  <tr v-for="item in monthlyData" :key="`${item.churchGroupId}-${item.year}-${item.month}`">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {{ item.churchGroupName || getChurchGroupName(item.churchGroupId) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {{ item.year }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {{ getMonthName(item.month) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {{ item.count }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Overall Data Section -->
        <div v-if="!loading && reportData.length > 0" class="mt-12 space-y-8">
          <hr class="border-gray-300 dark:border-gray-600">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Overall Attendance Summary</h2>

          <!-- Bar Chart -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Total Attendance Counts by Church
            </h2>
            <Bar :data="chartData" :options="chartOptions" />
          </div>

          <!-- Pie Chart -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Total Attendance Distribution
            </h2>
            <Pie :data="pieChartData" :options="pieChartOptions" />
          </div>

          <!-- Data Table -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Total Attendance Data
            </h2>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead class="bg-gray-100 dark:bg-gray-600">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Church
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Attendance Count
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                  <tr v-for="item in reportData" :key="item.churchGroupId">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {{ item.churchGroupName || getChurchGroupName(item.churchGroupId) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {{ item.count }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-else-if="!loading" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400 text-lg">
            No attendance data available.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { Bar, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const auth = useAuth();
const loading = ref(true)
const reportData = ref([])
const monthlyData = ref([])
const churchGroups = ref([])
const selectedYear = ref('')
const selectedMonth = ref('')
const selectedEventType = ref('')
const availableYears = ref([])

const chartData = ref({})
const pieChartData = ref({})
const monthlyChartData = ref({})
const monthlyChartTitle = ref('Monthly Attendance Data')

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Total Attendance by Church'
    }
  }
}

const pieChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'right',
    }
  }
}

const monthlyChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Monthly Attendance Data'
    }
  },
  scales: {
    x: {
      stacked: false
    },
    y: {
      stacked: false,
      beginAtZero: true
    }
  }
}

const fetchReportData = async () => {
  try {
    const params = new URLSearchParams()
    if (selectedEventType.value) params.append('eventType', selectedEventType.value)

    const response = await auth.apiFetch(`/api/wsattendance/report/by-churchgroup${params.toString() ? '?' + params.toString() : ''}`)
    reportData.value = response
    prepareChartData()
  } catch (error) {
    console.error('Error fetching report data:', error)
  }
}

const fetchMonthlyData = async () => {
  try {
    const params = new URLSearchParams()
    if (selectedYear.value) params.append('year', selectedYear.value)
    if (selectedMonth.value) params.append('month', selectedMonth.value)
    if (selectedEventType.value) params.append('eventType', selectedEventType.value)

    const response = await auth.apiFetch(`/api/wsattendance/report/monthly-by-churchgroup?${params}`)
    monthlyData.value = response
    prepareMonthlyChartData()
  } catch (error) {
    console.error('Error fetching monthly data:', error)
  }
}

const fetchChurchGroups = async () => {
  try {
    const response = await auth.apiFetch('/api/churchgroups/all')
    churchGroups.value = response
  } catch (error) {
    console.error('Error fetching church groups:', error)
  }
}

const fetchAvailableYears = async () => {
  try {
    // Get all monthly data to determine available years
    const response = await auth.apiFetch('/api/wsattendance/report/monthly-by-churchgroup')
    const years = [...new Set(response.map(item => item.year))].sort((a, b) => b - a)
    availableYears.value = years
  } catch (error) {
    console.error('Error fetching available years:', error)
  }
}

const getChurchGroupName = (id) => {
  if (!id && id !== 0) return `Group ${id}`
  const group = churchGroups.value.find(g => g.id === id || g.churchGroupId === id)
  return group ? group.name : `Group ${id}`
}

const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1] || month
}

const prepareChartData = () => {
  const labels = reportData.value.map(item => item.churchGroupName || getChurchGroupName(item.churchGroupId))
  const data = reportData.value.map(item => item.count)

  chartData.value = {
    labels,
    datasets: [
      {
        label: 'Total Attendance Count',
        data,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }
    ]
  }

  pieChartData.value = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 205, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(199, 199, 199, 0.5)',
          'rgba(83, 102, 255, 0.5)',
          'rgba(255, 99, 255, 0.5)',
          'rgba(99, 255, 132, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(255, 99, 255, 1)',
          'rgba(99, 255, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  }
}

const prepareMonthlyChartData = () => {
  if (monthlyData.value.length === 0) return

  let labels = []
  let data = []
  let chartTitle = 'Monthly Attendance'

  if (selectedYear.value && selectedMonth.value) {
    // Specific month selected - show attendance by church group for that month
    chartTitle = `${getMonthName(selectedMonth.value)} ${selectedYear.value} Attendance by Church Group`
    labels = monthlyData.value.map(item => item.churchGroupName || getChurchGroupName(item.churchGroupId))
    data = monthlyData.value.map(item => item.count)
  } else if (selectedYear.value) {
    // Year selected - show monthly breakdown for each church group
    chartTitle = `${selectedYear.value} Monthly Attendance by Church`
    const groupedByGroup = {}

    monthlyData.value.forEach(item => {
      const groupName = item.churchGroupName || getChurchGroupName(item.churchGroupId)
      if (!groupedByGroup[groupName]) {
        groupedByGroup[groupName] = {}
      }
      groupedByGroup[groupName][item.month] = item.count
    })

    // Create datasets for each church group
    const datasets = []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    labels = months

    Object.keys(groupedByGroup).forEach((groupName, index) => {
      const groupData = months.map((_, monthIndex) => {
        return groupedByGroup[groupName][monthIndex + 1] || 0
      })

      datasets.push({
        label: groupName,
        data: groupData,
        backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
        borderColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
        borderWidth: 1
      })
    })

    monthlyChartTitle.value = chartTitle
    monthlyChartData.value = {
      labels,
      datasets
    }
    return
  } else {
    // No filters - show total attendance by church group
    chartTitle = 'Total Monthly Attendance by Church'
    const groupedData = {}
    monthlyData.value.forEach(item => {
      const groupName = item.churchGroupName || getChurchGroupName(item.churchGroupId)
      if (!groupedData[groupName]) {
        groupedData[groupName] = 0
      }
      groupedData[groupName] += item.count
    })

    labels = Object.keys(groupedData)
    data = Object.values(groupedData)
  }

  monthlyChartTitle.value = chartTitle
  monthlyChartData.value = {
    labels,
    datasets: [
      {
        label: chartTitle,
        data,
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1
      }
    ]
  }
}

const resetFilters = () => {
  selectedYear.value = ''
  selectedMonth.value = ''
  selectedEventType.value = ''
  fetchMonthlyData()
}

const onYearChange = () => {
  // Reset month when year changes
  selectedMonth.value = ''
  fetchMonthlyData()
}

const onEventTypeChange = () => {
  fetchReportData()
  fetchMonthlyData()
}

onMounted(async () => {
  await Promise.all([fetchReportData(), fetchChurchGroups(), fetchAvailableYears()])
  prepareChartData()
  await fetchMonthlyData()
  loading.value = false
})
</script>
<template>
  <main class="mx-auto max-w-7xl px-4 py-1 sm:px-6">
    <section class="mt-8 mb-6 rounded-3xl bg-white p-4 shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">Church Event Calendar</h2>
        </div> 
      </div>

      <div class="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm uppercase tracking-[0.24em] text-slate-500">Month</p>
            <h2 class="text-2xl font-semibold text-slate-900">{{ monthLabel }}</h2>
          </div>
                  <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            @click="openCreateModal"
            class="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            Create Event
          </button>
          <button
            type="button"
            @click="prevMonth"
            class="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            Previous
          </button>
          <button
            type="button"
            @click="nextMonth"
            class="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            Next
          </button>
        </div>
          <div class="text-sm text-slate-500">
            {{ events.length }} event<span v-if="events.length !== 1">s</span> in this view
          </div>
        </div>

        <div class="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 sm:text-sm">
          <span v-for="day in weekdays" :key="day">{{ day }}</span>
        </div>

        <div class="mt-3 grid grid-cols-7 gap-1">
          <button
            v-for="cell in calendarCells"
            :key="cell.key"
            @click="selectDay(cell.date)"
            class="h-24 rounded-3xl border p-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500"
            :class="{
              'border-slate-200 bg-white': cell.currentMonth,
              'border-transparent bg-slate-100 text-slate-400': !cell.currentMonth,
              'ring-2 ring-sky-500': cell.isSelected,
              'bg-sky-50': cell.hasEvents && cell.currentMonth
            }"
          >
            <div class="flex items-center justify-between gap-1">
              <span :class="{'text-slate-900 font-semibold': cell.currentMonth, 'text-slate-400': !cell.currentMonth}">{{ cell.number }}</span>
              <span v-if="cell.isToday" class="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white">Today</span>
            </div>
            <div class="mt-2 space-y-1">
              <span
                v-for="event in cell.events.slice(0, 1)"
                :key="event.id"
                class="block overflow-hidden rounded-2xl bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-white"
              >
                {{ event.name }}
              </span>
              <span v-if="cell.events.length > 1" class="block text-[10px] text-slate-500">
                +{{ cell.events.length - 1 }} more
              </span>
            </div>
          </button>
        </div>
      </div>
    </section>

    <section class="space-y-6">
      <article class="rounded-3xl bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">Events on {{ selectedDayLabel }}</h2>
            <p class="mt-1 text-sm text-slate-500">Click any date above to view events for that day below.</p>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{{ selectedEvents.length }}</span>
        </div>

        <div class="mt-6 space-y-4">
          <div v-if="loading" class="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">Loading calendar...</div>
          <div v-else-if="error" class="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{{ error }}</div>
          <div v-else-if="!auth.isLoggedIn">
            <p class="text-slate-600">Please <NuxtLink to="/login" class="font-semibold text-sky-600 hover:underline">sign in</NuxtLink> to view calendar events.</p>
          </div>
          <div v-else-if="!selectedEvents.length" class="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">No events scheduled for this date.</div>

          <div v-for="event in selectedEvents" :key="event.id" class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 class="text-lg font-semibold text-slate-900">{{ event.name || 'Untitled event' }}</h3>
                <p class="text-sm text-slate-500">{{ event.eventType || 'General event' }} • {{ event.churchName || 'Church event' }}</p>
              </div>
              <div class="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                {{ event.startAt || 'TBD' }}
              </div>
            </div>
            <p class="mt-4 text-sm leading-6 text-slate-700">{{ event.description || event.announcement || 'No description provided.' }}</p>
            <!--div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div class="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                <span class="font-semibold text-slate-900">Location:</span> {{ event.churchlocationId || 'Standard venue' }}
              </div>
              <div class="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                <span class="font-semibold text-slate-900">Scope:</span> {{ event.eventScope || 'N/A' }}</div>
            </div-->
          </div>
        </div>
      </article>

      <aside class="rounded-3xl bg-white p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-slate-900">Quick month view</h2>
        <p class="mt-2 text-sm text-slate-500">Use the calendar grid to jump between dates and preview active events.</p>
        <div class="mt-6 space-y-4">
          <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-sm text-slate-500">Selected Date</p>
            <p class="mt-2 text-lg font-semibold text-slate-900">{{ selectedDayLabel }}</p>
          </div>
          <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-sm text-slate-500">Total events this month</p>
            <p class="mt-2 text-3xl font-semibold text-slate-900">{{ events.length }}</p>
          </div>
          <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-sm text-slate-500">Today</p>
            <p class="mt-2 text-lg font-semibold text-slate-900">{{ todayLabel }}</p>
          </div>
        </div>
      </aside>
    </section>

    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
      <div class="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-2xl font-semibold text-slate-900">Register a Church Event</h2>
            <p class="mt-2 text-sm text-slate-500">Submit event details and publish it to the calendar.</p>
          </div>
          <button type="button" @click="closeCreateModal" class="rounded-full bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200">×</button>
        </div>

        <div class="mt-6 space-y-4">
          <div v-if="createError" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{{ createError }}</div>
          <div v-if="createSuccess" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{{ createSuccess }}</div>

          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block text-sm text-slate-700">
              <span class="mb-2 block font-medium">Event Name</span>
              <input v-model="eventForm.name" type="text" class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </label> 
            <label class="block text-sm text-slate-700">
              <span class="mb-2 block font-medium">Event Date</span>
              <input v-model="eventForm.eventDate" type="date" class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </label>
            <label class="block text-sm text-slate-700">
              <span class="mb-2 block font-medium">Start Time</span>
              <input v-model="eventForm.startAt" type="text" placeholder="e.g. 09:00 AM" class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </label>
            <label class="block text-sm text-slate-700">
              <span class="mb-2 block font-medium">Duration</span>
              <input v-model="eventForm.duration" type="text" placeholder="e.g. 90 mins" class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </label>
            <!--label class="block text-sm text-slate-700">
              <span class="mb-2 block font-medium">Church Group ID</span>
              <input v-model.number="eventForm.churchGroupId" type="number" class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </label-->
          </div>

          <label class="block text-sm text-slate-700">
            <span class="mb-2 block font-medium">Description</span>
            <textarea v-model="eventForm.description" rows="4" class="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"></textarea>
          </label>

          <div class="flex flex-wrap items-center gap-3">
            <button type="button" @click="submitEvent" class="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-700">Submit event</button>
            <button type="button" @click="closeCreateModal" class="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useAuth } from '~/composables/useAuth';

const auth = useAuth();
const loading = ref(false);
const error = ref('');
const events = ref<any[]>([]);
const selectedDate = ref(new Date());
const showCreateModal = ref(false);
const createError = ref('');
const createSuccess = ref('');

const today = new Date();
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDate = (value: Date | string) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseEventDay = (event: any) => {
  if (!event || !event.eventDate) {
    return '';
  }

  const date = event.eventDate instanceof Date ? event.eventDate : new Date(event.eventDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const monthLabel = computed(() => {
  return selectedDate.value.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric'
  });
});

const todayLabel = computed(() => {
  return today.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
});

const eventScopes = ['ECO', 'LOCAL', 'GLOBAL'];
const locations = [
  { id: 0, name: 'Main Sanctuary' },
  { id: 1, name: 'Community Hall' },
  { id: 2, name: 'Outdoor Grounds' },
];

const eventForm = ref({
  name: '',
  eventType: '',
  eventDate: formatDate(selectedDate.value),
  startAt: '',
  duration: '',
  eventScope: 'LOCAL',
  description: '',
  churchGroupId: auth.churchGroupId.value,
  tribeId: auth.tribeId.value,
  churchlocationId: 0,
  announcement: '',
  message: '',
  locked: false,
  hasRegistration: false
});

const selectedDayLabel = computed(() => {
  return selectedDate.value.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
});

const startOfMonth = computed(() => new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth(), 1));
const endOfMonth = computed(() => new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth() + 1, 0));

const fetchEvents = async () => {
  if (!auth.isLoggedIn.value) {
    events.value = [];
    return;
  }

  loading.value = true;
  error.value = '';
  try {
    const start = formatDate(startOfMonth.value);
    const end = formatDate(endOfMonth.value);
    events.value = await auth.apiFetch(`/api/churchevents/range/${start}/${end}/${auth.churchGroupId.value}${ auth.tribeId.value ? '/' + auth.tribeId.value : '' }`);
  } catch (err) {
    if (err?.data?.message) {
      error.value = `Error: ${err.data.message}`
    }
  } finally {
    loading.value = false;
  }
};

const calendarCells = computed(() => {
  const firstDay = new Date(startOfMonth.value);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = endOfMonth.value.getDate();
  const cells: Array<{ key: string; date: Date; number: number; currentMonth: boolean; events: any[]; isToday: boolean; isSelected: boolean; hasEvents: boolean }> = [];

  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstWeekday);

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const iso = formatDate(date);
    const cellEvents = events.value.filter((event) => parseEventDay(event) === iso);
    const currentMonth = date.getMonth() === selectedDate.value.getMonth();
    const isToday = iso === formatDate(today);
    const isSelected = iso === formatDate(selectedDate.value);

    cells.push({
      key: `${iso}-${i}`,
      date,
      number: date.getDate(),
      currentMonth,
      events: cellEvents,
      isToday,
      isSelected,
      hasEvents: cellEvents.length > 0
    });
  }

  return cells;
});

const selectedEvents = computed(() => {
  const selectedIso = formatDate(selectedDate.value);
  return events.value.filter((event) => parseEventDay(event) === selectedIso);
});

const selectDay = (date: Date) => {
  selectedDate.value = new Date(date);
  eventForm.value.eventDate = formatDate(date);
};

const openCreateModal = () => {
  createError.value = '';
  createSuccess.value = '';
  eventForm.value = {
    name: '',
    eventType: '',
    eventDate: formatDate(selectedDate.value),
    startAt: '',
    duration: '',
    eventScope: 'LOCAL',
    description: '', 
    churchGroupId: auth.churchGroupId.value,
    tribeId: auth.tribeId.value,
    announcement: '',
    message: '',
    locked: false,
    hasRegistration: true
  };
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
};

const submitEvent = async () => {
  createError.value = '';
  createSuccess.value = '';
  if (!eventForm.value.name || !eventForm.value.eventDate) {
    createError.value = 'Please provide at least an event name and date.';
    return;
  }

  try {
    await auth.apiFetch('/api/churchevents', {
      method: 'POST',
      body: {
        ...eventForm.value,
        updatedBy: auth.auth.value?.id || 0,
        deleted: false,
      },
    });

    createSuccess.value = 'Event registered successfully.';
    showCreateModal.value = false;
    await fetchEvents();
    closeCreateModal();
  } catch (err) {
    createError.value = err instanceof Error ? err.message : 'Unable to register event.';
  }
};

const prevMonth = () => {
  selectedDate.value = new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth() - 1, 1);
};

const nextMonth = () => {
  selectedDate.value = new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth() + 1, 1);
};

onMounted(async () => {
  if (auth.isLoggedIn.value) {
    await fetchEvents();
  } else {
    return navigateTo('/login')
  }
}); 

watch([selectedDate, auth.isLoggedIn], async () => {
  if (auth.isLoggedIn.value) {
    await fetchEvents();
  }
});
</script>

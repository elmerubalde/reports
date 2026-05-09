<template>
  <main class="mx-auto max-w-5xl px-4 py-2 sm:px-6">
    <section class="rounded-3xl bg-white p-6 shadow-sm">
      <div class="grid gap-6">
        <div class="grid gap-4 sm:grid-cols-[1.5fr_0.8fr] items-end">
          <label class="block text-sm text-slate-700">
            <span class="mb-2 block font-medium">Church event</span>
            <select
              v-model.number="selectedEventId"
              class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option disabled value="0">Select an event</option>
              <option v-for="event in events" :key="event.id" :value="event.id">
                {{ formatEventOption(event) }}
              </option>
            </select>
          </label>

          <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p class="font-medium text-slate-900">Attendee count</p>
            <p class="mt-2 text-3xl font-semibold text-slate-900">{{ attendeeRows.length }}</p>
          </div>
        </div>

        <div>
          <div v-if="loading" class="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">Loading registrations and people...</div>
          <div v-else-if="!selectedEventId" class="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Select an event to view and mark attendance.</div>
          <div v-else-if="!isLoggedIn" class="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">Sign in first to load attendance data.</div>
          <div v-else-if="!attendeeRows.length" class="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">There are no registered attendees for this event yet.</div>

          <div v-else class="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
            <table class="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
              <thead class="bg-slate-100 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th class="px-4 py-3">First name</th>
                  <th class="px-4 py-3">Last name</th>
                  <th class="px-4 py-3">Attended</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 bg-white">
                <tr v-for="row in attendeeRows" :key="row.registration.id" class="hover:bg-slate-50">
                  <td class="px-4 py-4">{{ row.firstName }}</td>
                  <td class="px-4 py-4">{{ row.lastName }}</td>
                  <td class="px-4 py-4">
                    <label class="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        :checked="row.attended"
                        @change="toggleAttendance(row, $event.target.checked)"
                        class="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span>{{ row.attended ? 'Yes' : 'No' }}</span>
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-5 space-y-3">
            <div v-if="successMessage" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{{ successMessage }}</div>
            <div v-if="errorMessage" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{{ errorMessage }}</div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useAuth } from '~/composables/useAuth';

const auth = useAuth();
const events = ref<any[]>([]);
const registrations = ref<any[]>([]);
const people = ref<any[]>([]);
const selectedEventId = ref<number>(0);
const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const isLoggedIn = computed(() => auth.isLoggedIn.value);
const attendeeRows = computed(() =>
  registrations.value.map(registration => {
    const person = people.value.find(p => p.id === registration.personId) || {};
    return {
      registration,
      person,
      firstName: person.firstName || 'Unknown',
      lastName: person.lastName || 'Unknown',
      attended: registration.statusId === 2
    };
  })
);

const formatEventDate = (event: any) => {
  if (!event?.eventDate) {
    return 'No date';
  }
  const date = new Date(event.eventDate);
  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
};

const formatEventOption = (event: any) => {
  return `${formatEventDate(event)} — ${event.name || 'Unnamed event'}`;
};

const fetchEvents = async () => {
  try {
    events.value = await auth.apiFetch('/api/registration/events');
    if (!selectedEventId.value && events.value.length) {
      selectedEventId.value = events.value[0].id;
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Unable to load events.';
  }
};

const fetchPeople = async () => {
  try {
    people.value = await auth.apiFetch('/api/people/all');
  } catch (err) {
    if (err instanceof Error) {
      errorMessage.value = err.message;
    } else {
      errorMessage.value = 'Unable to load people.';
    }
  }
};

const fetchRegistrations = async (eventId: number) => {
  if (!eventId) {
    registrations.value = [];
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    registrations.value = await auth.apiFetch(`/api/registration?eventId=${eventId}`);
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Unable to load registrations.';
  } finally {
    loading.value = false;
  }
};

const loadPage = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    await fetchEvents();
    if (isLoggedIn.value) {
      await fetchPeople();
    }
  } finally {
    loading.value = false;
  }
};

const toggleAttendance = async (row: any, attended: boolean) => {
  successMessage.value = '';
  errorMessage.value = '';

  if (!row.registration?.id) {
    return;
  }

  const nextStatus = attended ? 2 : 1;
  try {
    await auth.apiFetch(`/api/registration/${row.registration.id}`, {
      method: 'PUT',
      body: { statusId: nextStatus }
    });
    row.registration.statusId = nextStatus;
    successMessage.value = 'Attendance updated successfully.';
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Unable to update attendance.';
  }
};

watch(selectedEventId, async (newEventId) => {
  if (!newEventId) {
    registrations.value = [];
    return;
  }

  await fetchRegistrations(newEventId);
});

onMounted(async () => {
  await loadPage();
});
</script>

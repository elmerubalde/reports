<template>
  <main class="mx-auto max-w-4xl px-4 py-2 sm:px-6">
    <section class="rounded-3xl bg-white p-6 shadow-sm">
      <div class="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">Register for an event</h2>
          <p class="mt-2 text-sm text-slate-500">Enter the attendee's name, church, and choose the event they will attend.</p>

          <form @submit.prevent="submitRegistration" class="mt-6 space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="block text-sm text-slate-700">
                <span class="mb-2 block font-medium">First name</span>
                <input
                  v-model="firstName"
                  type="text"
                  placeholder="First name"
                  class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </label>
              <label class="block text-sm text-slate-700">
                <span class="mb-2 block font-medium">Last name</span>
                <input
                  v-model="lastName"
                  type="text"
                  placeholder="Last name"
                  class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </label>
            </div>

            <label class="block text-sm text-slate-700">
              <span class="mb-2 block font-medium">Church name</span>
              <input
                v-model="churchName"
                type="text"
                placeholder="Church name"
                class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>

            <label class="block text-sm text-slate-700">
              <span class="mb-2 block font-medium">Event</span>
              <select
                v-model.number="selectedEventId"
                class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option disabled value="0">Select an event</option>
                <option
                  v-for="event in events"
                  :key="event.id"
                  :value="event.id"
                >
                  {{ formatEventOption(event) }}
                </option>
              </select>
            </label>

            <div class="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                class="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                :disabled="submitting"
              >
                {{ submitting ? 'Registering...' : 'Register attendee' }}
              </button>
              <button
                type="button"
                @click="resetForm"
                class="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                Reset
              </button>
            </div>
            <!--div v-if="!isLoggedIn" class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              You must be signed in to submit a registration.
            </div-->
          </form>

          <div class="mt-5 space-y-3">
            <div v-if="successMessage" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {{ successMessage }}
            </div>
            <div v-if="errorMessage" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {{ errorMessage }}
            </div>
          </div>
        </div>

        <aside class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 class="text-lg font-semibold text-slate-900">Upcoming events</h3>
          <p class="mt-2 text-sm text-slate-500">Choose from the available church events below.</p>

          <div class="mt-5 space-y-3">
            <div v-if="loadingEvents" class="rounded-2xl bg-white p-4 text-sm text-slate-600">Loading events...</div>
            <div v-else-if="!events.length" class="rounded-2xl bg-white p-4 text-sm text-slate-600">No church events available yet.</div>
            <div v-else class="space-y-3">
              <div
                v-for="event in events.slice(0, 6)"
                :key="event.id"
                class="rounded-2xl bg-white p-4 shadow-sm"
              >
                <p class="text-sm font-semibold text-slate-900">{{ event.name || 'Unnamed event' }}</p>
                <p class="text-sm text-slate-500">{{ formatEventDate(event) }}</p>
              </div>
            </div>
          </div>

          <div class="mt-8 rounded-3xl bg-white p-5 shadow-sm">
            <h3 class="text-lg font-semibold text-slate-900">Registered attendees</h3>
            <p class="mt-2 text-sm text-slate-500">See who is signed up for the selected event.</p>

            <div class="mt-4 space-y-3">
              <div v-if="loadingRegistrations" class="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Loading registrants...</div>
              <div v-else-if="!selectedEventId" class="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Select an event to see registrants.</div>
              <div v-else-if="!registrations.length" class="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No registrations for this event yet.</div>
              <div v-else class="space-y-2">
                <div class="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700" v-for="registration in registrations" :key="registration.id">
                  <p class="font-semibold text-slate-900">{{ registration.notes || 'Unnamed attendee' }}</p>
                  <p class="text-xs text-slate-500">Registration ID: {{ registration.id }}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '~/composables/useAuth';

const route = useRoute();

const auth = useAuth();
const events = ref<any[]>([]);
const registrations = ref<any[]>([]);
const loadingEvents = ref(false);
const loadingRegistrations = ref(false);
const submitting = ref(false);
const firstName = ref('');
const lastName = ref('');
const churchName = ref('');
const selectedEventId = ref<number>(0);
const successMessage = ref('');
const errorMessage = ref('');

const selectedEvent = computed(() => events.value.find(event => event.id === selectedEventId.value));
 
const formatEventDate = (event: any) => {
  if (!event || !event.eventDate) {
    return 'No date';
  }

  const date = new Date(event.eventDate);
  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const formatEventOption = (event: any) => {
  return `${formatEventDate(event)} — ${event.name || 'Unnamed event'}`;
};

const fetchRegistrations = async (eventId: number) => {
  registrations.value = [];
  loadingRegistrations.value = true;
  errorMessage.value = '';

  try {
    registrations.value = await auth.apiFetch(`/api/registration?eventId=${eventId}`);
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Unable to load registrations.';
  } finally {
    loadingRegistrations.value = false;
  }
};

const fetchEvents = async () => {
  loadingEvents.value = true;
  errorMessage.value = ''; 
  const eventType = route.query.eventType;

  try {
    events.value = await auth.apiFetch('/api/registration/events');
    if (events.value.length && !selectedEventId.value) {
      selectedEventId.value = events.value[0].id;
      await fetchRegistrations(selectedEventId.value);
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Unable to load events.';
  } finally {
    loadingEvents.value = false;
  }
};

const resetForm = () => {
  firstName.value = '';
  lastName.value = '';
  churchName.value = '';
  successMessage.value = '';
  errorMessage.value = '';
  if (events.value.length) {
    selectedEventId.value = events.value[0].id;
  }
};

const submitRegistration = async () => {
  successMessage.value = '';
  errorMessage.value = '';

  if (!isLoggedIn.value) {
    errorMessage.value = 'Please sign in before registering attendees.';
    return;
  }

  if (!firstName.value.trim() || !lastName.value.trim() || !churchName.value.trim()) {
    errorMessage.value = 'Please enter first name, last name, and church name.';
    return;
  }

  if (!selectedEventId.value) {
    errorMessage.value = 'Please select a church event.';
    return;
  }

  submitting.value = true;

  try {
    const payload = {
      eventId: selectedEventId.value,
      personId: auth.auth.value?.personId || 0,
      notes: `${firstName.value.trim()} ${lastName.value.trim()} — ${churchName.value.trim()}`,
      statusId: 1,
      paidAmount: 0,
      updatedBy: auth.auth.value?.id || 0,
      deleted: false
    };

    await auth.apiFetch('/api/registration', {
      method: 'POST',
      body: payload
    });

    successMessage.value = 'Attendee registered successfully.';
    resetForm();
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Registration failed.';
  } finally {
    submitting.value = false;
  }
};

watch(selectedEventId, async (newEventId) => {
  if (newEventId) {
    await fetchRegistrations(newEventId);
  }
});

onMounted(() => {
  fetchEvents();
});
</script>

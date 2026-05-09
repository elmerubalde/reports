<template>
  <main class="mx-auto max-w-6xl px-4 sm:px-6">
    <section class="mb-1 flex flex-col rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-semibold text-slate-900">People Directory</h2>
      </div>
    </section> 
    <section class="rounded-3xl bg-white px-6 shadow-sm">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            @click="openAddModal"
            class="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700"
          >
            Add Person
          </button>
          <input
            v-model="searchTerm"
            @keyup.enter="searchPeople"
            type="search"
            placeholder="Search by first or last name"
            class="w-full min-w-[220px] rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 sm:w-auto"
          />
          <button
            @click="searchPeople"
            class="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700"
          >
            Search
          </button>
          <button
            type="button"
            @click="clearSearch"
            class="rounded-2xl bg-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-300"
          >
            Clear
          </button>
          <button
            @click="loadPeople"
            class="rounded-2xl bg-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-300"
          >
            Refresh
          </button>
          <span v-if="loading" class="text-sm text-slate-500">Loading...</span>
        </div>
        <div v-if="totalCount > 0" class="text-sm text-slate-500">
          Showing {{ startRecord }} - {{ endRecord }} of {{ totalCount }}
        </div>
      </div>


      <div class="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table v-if="people.length" class="min-w-[820px] w-full divide-y divide-slate-200 text-xs sm:text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th class="whitespace-nowrap px-3 py-2 text-left font-semibold text-slate-700">ID</th>
              <th class="whitespace-nowrap px-3 py-2 text-left font-semibold text-slate-700">Last Name</th>
              <th class="whitespace-nowrap px-3 py-2 text-left font-semibold text-slate-700">First Name</th>
              <th class="whitespace-nowrap px-3 py-2 text-left font-semibold text-slate-700">Church Group</th>
              <th class="whitespace-nowrap px-3 py-2 text-left font-semibold text-slate-700">Email</th>
              <th class="whitespace-nowrap px-3 py-2 text-left font-semibold text-slate-700">Phone</th>
              <th class="whitespace-nowrap px-3 py-2 text-left font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
        <tbody class="divide-y divide-slate-200 bg-white">
          <tr v-for="person in people" :key="person.id" class="hover:bg-slate-50 even:bg-slate-50">
            <td class="whitespace-nowrap px-3 py-2 text-slate-700">{{ person.id }}</td>
            <td class="whitespace-nowrap px-3 py-2 text-slate-700">{{ person.lastName }}</td>
            <td class="whitespace-nowrap px-3 py-2 text-slate-700">{{ person.firstName }}</td>
            <td class="whitespace-nowrap px-3 py-2 text-slate-700">{{ person.churchGroupName || person.churchGroup?.name || person.churchGroupId || '—' }}</td>
            <td class="whitespace-nowrap px-3 py-2 text-slate-700">{{ person.emailAddress || '—' }}</td>
            <td class="whitespace-nowrap px-3 py-2 text-slate-700">{{ person.mobilePhone || person.homePhone || '—' }}</td>
            <td class="whitespace-nowrap px-3 py-2">
              <button
                type="button"
                @click="openEditModal(person)"
                class="rounded-2xl bg-slate-800 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-900"
              >
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>

      <div v-if="editModalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" @click.self="closeEditModal">
        <div class="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
          <h2 class="text-xl font-semibold text-slate-900">Edit person</h2>
          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <label class="block text-sm text-slate-700">
              <span class="mb-2 block font-medium">First Name</span>
              <input v-model="modalForm.firstName" type="text" required class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100" />
            </label>
            <label class="block text-sm text-slate-700">
              <span class="mb-2 block font-medium">Last Name</span>
              <input v-model="modalForm.lastName" type="text" required class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100" />
            </label>
            <label class="block text-sm text-slate-700 sm:col-span-2">
              <span class="mb-2 block font-medium">Email</span>
              <input v-model="modalForm.emailAddress" type="email" class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100" />
            </label>
            <label class="block text-sm text-slate-700">
              <span class="mb-2 block font-medium">Home Phone</span>
              <input v-model="modalForm.homePhone" type="tel" class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100" />
            </label>
            <label class="block text-sm text-slate-700">
              <span class="mb-2 block font-medium">Mobile Phone</span>
              <input v-model="modalForm.mobilePhone" type="tel" class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100" />
            </label>
          </div>
          <div class="mt-6 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              @click="saveEditPerson"
              class="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700"
            >
              Update person
            </button>
            <button
              type="button"
              @click="closeEditModal"
              class="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="deletePerson(selectedPerson)"
              class="rounded-2xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div v-if="addModalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" @click.self="closeAddModal">
        <div class="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-xl font-semibold text-slate-900">Add person</h2>
            <button
              type="button"
              @click="closeAddModal"
              class="rounded-2xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300"
            >
              Close
            </button>
          </div>
          <form @submit.prevent="saveNewPerson" class="mt-6 grid gap-4 sm:grid-cols-2">
            <label class="block text-sm text-slate-700">
              <span class="mb-2 block font-medium">First Name</span>
              <input
                v-model="form.firstName"
                type="text"
                required
                class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </label>

            <label class="block text-sm text-slate-700">
              <span class="mb-2 block font-medium">Last Name</span>
              <input
                v-model="form.lastName"
                type="text"
                required
                class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </label>

            <label class="block text-sm text-slate-700 sm:col-span-2">
              <span class="mb-2 block font-medium">Email</span>
              <input
                v-model="form.emailAddress"
                type="email"
                class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </label>

            <label class="block text-sm text-slate-700">
              <span class="mb-2 block font-medium">Home Phone</span>
              <input
                v-model="form.homePhone"
                type="tel"
                class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </label>

            <label class="block text-sm text-slate-700">
              <span class="mb-2 block font-medium">Mobile Phone</span>
              <input
                v-model="form.mobilePhone"
                type="tel"
                class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </label>

            <div class="sm:col-span-2 mt-4 flex flex-wrap items-center justify-end gap-3">
              <button
                type="submit"
                class="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700"
              >
                Add person
              </button>
              <button
                type="button"
                @click="resetForm"
                class="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-300"
              >
                Clear fields
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap items-center gap-2" v-if="totalPages > 1">
        <button
          @click="changePage(page - 1)"
          :disabled="page <= 1"
          class="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          v-for="pageNumber in pageNumbers"
          :key="pageNumber"
          @click="changePage(pageNumber)"
          :class="[
            'rounded-2xl border px-4 py-2 text-sm transition',
            pageNumber === page ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          ]"
          type="button"
        >
          {{ pageNumber }}
        </button>
        <button
          @click="changePage(page + 1)"
          :disabled="page >= totalPages"
          class="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <p v-if="error" class="mt-6 text-sm font-medium text-red-600">{{ error }}</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "~/composables/useAuth";

const auth = useAuth();
const router = useRouter();
const people = ref<any[]>([]);
const error = ref("");
const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
const searchTerm = ref("");
const selectedPerson = ref<any>(null);
const editModalVisible = ref(false);
const addModalVisible = ref(false);
const form = reactive({
  firstName: "",
  lastName: "",
  emailAddress: "",
  homePhone: "",
  mobilePhone: ""
});
const modalForm = reactive({
  id: 0,
  firstName: "",
  lastName: "",
  emailAddress: "",
  homePhone: "",
  mobilePhone: ""
});

const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)));
const startRecord = computed(() => ((page.value - 1) * pageSize.value) + 1);
const endRecord = computed(() => Math.min(page.value * pageSize.value, totalCount.value));
const pageNumbers = computed(() => {
  const pages = [];
  const maxButtons = 5;
  const from = Math.max(1, page.value - Math.floor(maxButtons / 2));
  const to = Math.min(totalPages.value, from + maxButtons - 1);
  for (let i = from; i <= to; i++) {
    pages.push(i);
  }
  return pages;
});

const loadPeople = async (pageNumber = page.value) => {
  error.value = "";
  loading.value = true;
  page.value = pageNumber;
  const search = searchTerm.value.trim();
  const path = search
    ? `/api/people/all/${page.value}/${pageSize.value}/1/${encodeURIComponent(search)}`
    : `/api/people/all/${page.value}/${pageSize.value}/1`;

  try {
    const result = await auth.apiFetch<any[]>(path);
    if (Array.isArray(result)) {
      people.value = Array.isArray(result[0]) ? result[0] : [];
      totalCount.value = result[1]?.count ?? 0;
    } else {
      people.value = Array.isArray(result) ? result : [];
      totalCount.value = people.value.length;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not load people.";
    people.value = [];
    totalCount.value = 0;
  } finally {
    loading.value = false;
  }
};

const searchPeople = async () => {
  page.value = 1;
  await loadPeople(1);
};

const clearSearch = async () => {
  searchTerm.value = "";
  page.value = 1;
  await loadPeople(1);
};

const openEditModal = (person: any) => {
  selectedPerson.value = person;
  modalForm.id = person.id;
  modalForm.firstName = person.firstName || "";
  modalForm.lastName = person.lastName || "";
  modalForm.emailAddress = person.emailAddress || "";
  modalForm.homePhone = person.homePhone || "";
  modalForm.mobilePhone = person.mobilePhone || "";
  editModalVisible.value = true;
};

const closeEditModal = () => {
  selectedPerson.value = null;
  editModalVisible.value = false;
  modalForm.id = 0;
  modalForm.firstName = "";
  modalForm.lastName = "";
  modalForm.emailAddress = "";
  modalForm.homePhone = "";
  modalForm.mobilePhone = "";
};

const openAddModal = () => {
  resetForm();
  addModalVisible.value = true;
};

const closeAddModal = () => {
  resetForm();
  addModalVisible.value = false;
};

const resetForm = () => {
  form.firstName = "";
  form.lastName = "";
  form.emailAddress = "";
  form.homePhone = "";
  form.mobilePhone = "";
};

const buildPersonPayload = (data: any) => ({
  id: data.id,
  firstName: data.firstName,
  lastName: data.lastName,
  emailAddress: data.emailAddress,
  homePhone: data.homePhone,
  mobilePhone: data.mobilePhone,
  churchGroupId: auth.auth.value?.churchGroupId ?? 0,
  updatedBy: auth.auth.value?.id ?? 0,
  updatedAt: new Date().toISOString()
});

const saveNewPerson = async () => {
  error.value = "";
  const payload = buildPersonPayload({ ...form, id: 0 });

  try {
    await auth.apiFetch(`/api/people/`, {
      method: "POST",
      body: payload
    });
    resetForm();
    await loadPeople(page.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not save person.";
  }
};

const saveEditPerson = async () => {
  if (!selectedPerson.value || !modalForm.id) {
    return;
  }

  error.value = "";
  const payload = buildPersonPayload(modalForm);

  try {
    await auth.apiFetch(`/api/people/${modalForm.id}`, {
      method: "PUT",
      body: payload
    });
    closeEditModal();
    await loadPeople(page.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not update person.";
  }
};

const deletePerson = async (person: any) => {
  const id = person?.id ?? form.id;
  if (!id) {
    return;
  }

  if (!confirm(`Delete person ${person?.firstName || form.firstName} ${person?.lastName || form.lastName}?`)) {
    return;
  }

  try {
    await auth.apiFetch(`/api/people/${id}`, {
      method: "PUT",
      body: {
        id,
        deleted: true,
        updatedBy: auth.auth.value?.id ?? 0,
        updatedAt: new Date().toISOString()
      }
    });
    if (selectedPerson.value?.id === id) {
      resetForm();
    }
    await loadPeople(page.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not delete person.";
  }
};

const changePage = async (pageNumber: number) => {
  if (pageNumber < 1 || pageNumber > totalPages.value || pageNumber === page.value) {
    return;
  }
  await loadPeople(pageNumber);
};

const signOut = async () => {
  auth.signOut();
  await router.push("/login");
};

onMounted(async () => {
  if (!auth.isLoggedIn.value) {
    await router.push("/login");
    return;
  }
  await loadPeople();
});
</script>


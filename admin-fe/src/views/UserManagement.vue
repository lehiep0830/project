<template>
  <admin-layout>
    <div class="grid grid-cols-24 gap-4 md:gap-6" @keyup.enter="searchGlobal" tabindex="0">
      
      <div class="col-span-full ">
        <div v-if="switchPage === 'create'">
          <Button
              class="mb-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg"
              @click="switchPage = 'main'"
              size="sm"
            >
              Back
          </Button>
          <div class="relative m-[100px] mt-[50px]">
            <form-layout 
              title="User Management Settings"
              :data="{
                'formStore': formFieldsStore,
                'disable': []
              }"
              v-on:update:items="(value) => {
                saveObj = formFieldsStore.formConverttoPayload(value, true);
              }"
            >
              <template #UserInfo >
                <div classStyle="flex flex-col p-[100px] gap-y-[20px]"></div>
              </template>
            </form-layout>
            <Button
              class="absolute w-[100px] bottom-[-100px] right-0 mb-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg"
              size="md"
              @click="createNewUser"
            >
              Save
            </Button>
          </div>
        </div>
        <div v-else class="mb-12">
          <div class="flex gap-4 justify-between">
            <form-layout 
              :data="{
                'formStore': filterFieldStore,
                'disable': []
              }"
              v-on:update:items="(value) => {
                actionFilter(value)
              }"
            >
              <template #UserInfos >
                <div classStyle="flex justify-between"></div>
              </template>
            </form-layout>
            <ToggleSwitch 
              :data="{
                label: 'Search Global',
                disable: false,
                key: 'fetchSearch',
                value: fetchSearch,
              }"
              v-model="fetchSearch"
            />
            <Button
              class="mb-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg"
              @click="switchPage = 'create'"
              size="sm"
            >
              Create New User
            </Button>
          </div>
          <div class="relative mt-4 min-h-[65vh] focus-visible:border-none focus:outline-none">
            <basic-table-one :data="users" :store="tableRef" 
              v-on:update:row-clicked="TableRowClick"/>
          </div>
          <div class="absolute bottom-4 right-5">
            <pagination
              v-model="pageParams.pageIndex"
              :page-count="pageParams.pageCount"
              :click-handler="(page: number) => {
                pageParams.pageIndex = page
              }"
              :margin-pages="2"
              :page-range="5"
              :container-class="'ui pagination menu'"
              :page-link-class="'bg-gray-500 p-2 border border-gray-300 dark:border-gray-700 rounded-lg'"
              :prev-link-class="'bg-gray-500 p-2 border border-gray-300 dark:border-gray-700 rounded-lg'"
              :next-link-class="'bg-gray-500 p-2 border border-gray-300 dark:border-gray-700 rounded-lg'"
              :break-view-link-class="'break-view-link'"
              :no-li-surround="true"
              :break-view="true"
              prev-class="bg-gray-500 p-2 border border-gray-300 dark:border-gray-700 rounded-lg"
              page-class="bg-gray-500"
              next-class="bg-gray-500 p-2 border border-gray-300 dark:border-gray-700 rounded-lg"
            >
              <template #breakViewContent>
                <svg width="16" height="4" viewBox="0 0 16 4">
                  <circle fill="#999999" cx="2" cy="2" r="2" />
                  <circle fill="#999999" cx="8" cy="2" r="2" />
                  <circle fill="#999999" cx="14" cy="2" r="2" />
                </svg>
              </template>
            </pagination> 
          </div>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import AdminLayout from '../components/layout/AdminLayout.vue'
import BasicTableOne from '@/components/tables/basic-tables/BasicTableOne.vue';
import Pagination from '@/components/tables/basic-tables/Pagination.vue';
import { ref, watch, watchEffect } from 'vue';
import { useUserStore } from '@/store/user.store';
import { TableState, TableStore } from '@/store/table.store';
import { useTableStore } from '@/store/table.store';
import Button from '@/components/ui/Button.vue';
import { useFormStore } from '@/store/form.store';
import FormLayout from '@/components/forms/FormLayout.vue';
import { FormState } from '@/interface/form.interface';
import ToggleSwitch from '@/components/forms/FormElements/ToggleSwitch.vue';

const tableStore = useTableStore()
const userStore = useUserStore()
const tableSt = tableStore.store();
const tableRef = ref<TableStore>(tableSt);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
const filterFieldStore = ref<any>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formFieldsStore = ref<any>()

const saveObj = ref<Record<string, unknown>>({})
const searchObj = ref<Record<string, unknown>>({})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const users = ref<any[]>()
const fetchSearch = ref(false);
const switchPage = ref<'main' | 'create'>('main');
const pageParams = ref<{ pageIndex: number; pageSize: number; pageCount: number }>({
  pageIndex: 1,
  pageSize: 10,
  pageCount: 0
});

const initUserProfileData = () => {
  const formStore = useFormStore()
  const nameFieldStore = tableRef.value.forkFieldStore('username')
  const emailFieldStore = tableRef.value.forkFieldStore('email')
  const statusFieldStore = tableRef.value.forkFieldStore('isActive')
  const passwordFieldStore = tableRef.value.createFieldStore('password')

  nameFieldStore.setLabel('Username')
  emailFieldStore.setLabel('Email')
  statusFieldStore.setLabel('Status')
  statusFieldStore.setKey('status')
  passwordFieldStore.setLabel('Password')

  nameFieldStore.setType('text')
  emailFieldStore.setType('text')
  statusFieldStore.setType('dropdown')
  passwordFieldStore.setType('password')
  
  const formProfileStore: FormState = {
    group: {
      'UserInfo': [
        {
          fields: {
            username: { store: nameFieldStore },
            email: { store: emailFieldStore },
            status: { store: statusFieldStore },
            password: { store: passwordFieldStore }
          }
        }
      ],
    }
  }
  const form = formStore.getStore(formProfileStore)

  form.setFormValue('username', '');
  form.setFormValue('email', '');
  form.setFormValue('status', ['active', 'inactive'] );
  form.setFormValue('password', '' );
  form.setMinSpaceLabelAll('min-w-[100px]');  
  formFieldsStore.value = form;
  };

const initFormFilter = () => {
  const formStore = useFormStore()
  const nameFieldStore = tableRef.value.forkFieldStore('username')
  const statusFieldStore = tableRef.value.forkFieldStore('isActive')
  const groupFieldStore = tableRef.value.forkFieldStore('group')

  nameFieldStore.setType('text')
  statusFieldStore.setType('dropdown')
  groupFieldStore.setType('select')
  const ViewFieldStore = tableRef.value.getViewFieldStore('View By')
  
  const formProfileStore: FormState = {
    group: {
      'UserInfos': [
        {
          fields: {
            username: { store: nameFieldStore },
            status: { store: statusFieldStore },
            group: { store: groupFieldStore },
            view : { store: ViewFieldStore }
          }
        }
      ]
    }
  }
  const form = formStore.getStore(formProfileStore)
  form.setFormValue('isActive', ['active', 'inactive'] );
  form.setFormValue('group', ['Admin Group', 'User Group', 'Developer Group', 'Guest'] );
  form.setFormValue('username', '');
  form.setType('view', 'select');

  filterFieldStore.value = form;
}

const changeTableLabel = () => {
  tableRef.value.setLabel('username', 'Name')
  tableRef.value.setLabel('email', 'Email')
  tableRef.value.setLabel('isActive', 'Status')
  tableRef.value.setLabel('group', 'Group')
  tableRef.value.setLabel('createdAt', 'Created At')
  tableRef.value.setLabel('updatedAt', 'Updated At')
  tableRef.value.setLabel('isLoggedIn', 'Logged')
}

const filterUser = (isActive: string[], group: string[], name: string) => {
  return [...userStore.listUser]?.filter((user) => {
    const nameMatch = name ? user.username.toLowerCase().includes(name.toLowerCase()) : true;
    const statusMatch = isActive ? isActive.includes(user.isActive) : true;
    const groupMatch = group && group.length > 0 ? group.includes(user.group as string) : true;
    return nameMatch && statusMatch && groupMatch;
  }) ;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const actionFilter = async (item: Record<string, any>[]) => {
  const itemObj = filterFieldStore.value.formConverttoPayload(item, fetchSearch.value);
  searchObj.value = itemObj;
  console.log('Action Filter with items:', itemObj);
  if(fetchSearch.value) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredUsers: Record<string, any>[] = filterUser(
      itemObj['isActive'],
      itemObj['group'],
      itemObj['username']
    );
  console.log("Filtered Users:", filteredUsers);
  const viewBy: string[] = itemObj['view'] || [];
  users.value = filteredUsers.map((user) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {};
    if(!viewBy || viewBy.length === 0) return user;
    viewBy.forEach((field) => {
      result[field] = user[field];
    });
    return result;
  });
};

const searchGlobal = async () => {
  if(!fetchSearch.value) return;
  await userStore.search_user( searchObj.value );
  // actionFilter(filterFieldStore.value.getItems());
};

const createNewUser = async () => {
  await userStore.register( saveObj.value );
  await userStore.get_user();
  switchPage.value = 'main';
};

const TableRowClick = (row: Record<string, unknown>) => {
  console.log('Row clicked:', row);
  formFieldsStore.value.setDefaultValue('username', row['username'] );
  formFieldsStore.value.setDefaultValue('email', row['email'] );
  formFieldsStore.value.setDefaultValue('status', row['isActive'] );
  formFieldsStore.value.setDefaultValue('password', row['password'] );
  switchPage.value = 'create';
};

watch(() => userStore.listUser, (newVal) => {
  const n_users = [...newVal]
  if (users.value === undefined) {
    users.value = [...n_users];
    console.log('Fetched users:', n_users);
    tableRef.value.convertPayloadToState(n_users[0]) as TableState
    pageParams.value.pageCount = Math.ceil(n_users.length / pageParams.value.pageSize);
    changeTableLabel()
    initUserProfileData()
    initFormFilter()
  } else if (users.value !== undefined) {
    users.value = [...n_users];
  }
});

watch(async () => users.value, async (newVal) => {
  const data = await newVal
  if (!data || data.length === 0) return;
  tableRef.value = tableStore.store();
  tableRef.value.convertPayloadToState(data[0]) as TableState
  pageParams.value.pageCount = Math.ceil((data).length / pageParams.value.pageSize);
  changeTableLabel()
}, { immediate: true });

watchEffect(async () => {
  await userStore.get_user()
});

</script>

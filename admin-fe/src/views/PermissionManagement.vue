<template>
  <admin-layout>
    <div class="grid grid-cols-24 gap-4 md:gap-6" @keyup.enter="searchGlobal" tabindex="0">
      <div class="col-span-full">
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
              title="Permission Management Settings"
              :data="{ formStore: formFieldsStore, disable: [] }"
              v-on:update:items="updateCreatePermissionData"
            >
              <template #PermissionInfo>
                <div classStyle="flex flex-col gap-y-[20px]"></div>
              </template>
            </form-layout>
            <BasicTableOne
              class="mt-10"
              :data="permissionBasicData"
              :store="permissionStoreRef[permissionCurrent]"
              v-on:update:row-clicked="updatePermissionData"
            />
            <Button
              class="absolute w-[100px] bottom-[-100px] right-0 mb-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg"
              size="md"
              @click="createNewPermission"
            >
              Save
            </Button>
          </div>
        </div>
        <div v-else class="mb-12">
          <div class="flex gap-4 justify-between">
            <form-layout
              :data="{ formStore: filterFieldStore, disable: [] }"
              v-on:update:items="(value) => { actionFilter(value) }"
            >
              <template #PermissionInfos>
                <div classStyle="flex justify-between items-center"></div>
              </template>
            </form-layout>
            <ToggleSwitch
              :data="{ label: 'Search Global', disable: false, key: 'fetchSearch', value: fetchSearch }"
              v-model="fetchSearch"
            />
            <Button
              class="border border-gray-800 mb-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg"
              @click="switchPage = 'create'"
              size="sm"
            >
              Create New Permission
            </Button>
          </div>
          <div class="relative mt-4 min-h-[65vh] focus-visible:border-none focus:outline-none">
            <basic-table-one :data="Permissions" :store="tableRef" v-on:update:row-clicked="TableRowClick" />
          </div>
          <div class="absolute bottom-4 right-5">
            <pagination
              v-model="pageParams.pageIndex"
              :page-count="pageParams.pageCount"
              :click-handler="(page) => { pageParams.pageIndex = page }"
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
import BasicTableOne from '@/components/tables/basic-tables/BasicTableOne.vue'
import Pagination from '@/components/tables/basic-tables/Pagination.vue'
import { ref, watch, watchEffect } from 'vue'
import { usePermissionStore } from '@/store/permission.store'
import { TableState, TableStore } from '@/store/table.store'
import { useTableStore } from '@/store/table.store'
import Button from '@/components/ui/Button.vue'
import { useFormStore } from '@/store/form.store'
import FormLayout from '@/components/forms/FormLayout.vue'
import { FormState } from '@/interface/form.interface'
import ToggleSwitch from '@/components/forms/FormElements/ToggleSwitch.vue'
import { useFunctionStore } from '@/store/function.store'

const tableStore = useTableStore()
const PermissionStore = usePermissionStore()
const tableSt = tableStore.store()
const tableRef = ref<TableStore>(tableSt)
const listPermissionBasic = ref<Record<string, unknown>[]>([])
const functionStore = useFunctionStore()
const permissionStoreRef = ref<Record<string, TableStore>>({})
const permissionCurrent = ref<string>('')
const permissionBasicData = ref<Record<string, unknown>[]>([])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const filterFieldStore = ref<any>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formFieldsStore = ref<any>()

const saveObj = ref<Record<string, unknown>>({})
const searchObj = ref<Record<string, unknown>>({})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Permissions = ref<any[]>()
const fetchSearch = ref(false)
const switchPage = ref<'main' | 'create'>('main')
const pageParams = ref<{ pageIndex: number; pageSize: number; pageCount: number }>({
  pageIndex: 1,
  pageSize: 10,
  pageCount: 0,
})

const initPermissionProfileData = async () => {
  const formStore = useFormStore()
  const nameFieldStore = tableRef.value.forkFieldStore('name')
  const functionFieldStore = tableRef.value.forkFieldStore('function')
  const statusFieldStore = tableRef.value.forkFieldStore('status')

  functionFieldStore.setLabel('Bảng')
  nameFieldStore.setLabel('Tên')
  statusFieldStore.setLabel('Trạng thái')

  nameFieldStore.setType('text')
  functionFieldStore.setType('dropdown')
  statusFieldStore.setType('text')

  const formProfileStore: FormState = {
    group: {
      PermissionInfo: [
        {
          fields: {
            name: { store: nameFieldStore },
            function: { store: functionFieldStore },
            status: { store: statusFieldStore },
          },
        },
      ],
    },
  }
  const form = formStore.getStore(formProfileStore)

  form.setFormValue('name', '')
  form.setFormValue('status', '')
  form.setMinSpaceLabelAll('min-w-[100px]')
  formFieldsStore.value = form
  listPermissionBasic.value = [
    { Permission: 'GET' },
    { Permission: 'CREATE' },
    { Permission: 'UPDATE' },
    { Permission: 'DELETE' },
    { Permission: 'SEARCH' },
  ]

  form.setAction('function', async (args?: unknown) => {
    await initTablePermission(args as string)
  })

  const functionList = Array.from((await functionStore.get_function()) || []).map(
    (func: Record<string, unknown>) => func.name as string,
  )

  form.setFormValue('function', functionList)
  await initTablePermission(functionList[0])
  form.setAction('table_permission', async (args?: unknown) => {
    await initTablePermission(args as string)
  })
}

const initTablePermission = async (table?: string) => {
  await PermissionStore.get_permission_with_table(table as string)
  if (!Object.keys(permissionStoreRef.value).includes(table)) {
    permissionStoreRef.value[table as string] = tableStore.store()
  }
  const ListPermissionCRUD = PermissionStore.PermissionForTable
  const NonePermissionCRUD = [
    { Permission: 'No Permission' },
  ]
  permissionBasicData.value =
    ListPermissionCRUD[table as string]?.size > 0
      ? Array.from(ListPermissionCRUD[table as string]).map((item) => {
          return { Permission: item.name }
        })
      : NonePermissionCRUD
  permissionStoreRef.value[table as string].convertPayloadToState(
    permissionBasicData.value[0],
  ) as TableState
  permissionCurrent.value = table
}

const initFormFilter = () => {
  const formStore = useFormStore()

  const ViewFieldStore = tableRef.value.getViewFieldStore('View By')

  const nameFieldStore = tableRef.value.forkFieldStore('name')
  const functionFieldStore = tableRef.value.forkFieldStore('function')
  const statusFieldStore = tableRef.value.forkFieldStore('status')

  functionFieldStore.setLabel('Bảng: ')
  nameFieldStore.setLabel('Tên: ')
  statusFieldStore.setLabel('Trạng thái: ')

  nameFieldStore.setLabel('Permission Name')

  nameFieldStore.setType('text')
  functionFieldStore.setType('text')
  statusFieldStore.setType('text')

  const formProfileStore: FormState = {
    group: {
      PermissionInfos: [
        {
          fields: {
            name: { store: nameFieldStore },
            function: { store: functionFieldStore },
            status: { store: statusFieldStore },
            view: { store: ViewFieldStore },
          },
        },
      ],
    },
  }
  const form = formStore.getStore(formProfileStore)

  form.setFormValue('name', '')
  form.setFormValue('function', '')
  form.setFormValue('status', '')
  form.setType('view', 'select')

  filterFieldStore.value = form
}

const changeTableLabel = () => {
  tableRef.value.setLabel('name', 'Permission Name')
}

const filterPermission = (name: string) => {
  return [...PermissionStore.listPermission]?.filter((Permission) => {
    const nameMatch = name
      ? (Permission.name as string).toLowerCase().includes(name.toLowerCase())
      : true
    return nameMatch
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const actionFilter = async (item: Record<string, any>[]) => {
  const itemObj = filterFieldStore.value.formConverttoPayload(item, fetchSearch.value)
  searchObj.value = itemObj
  console.log('Action Filter with items:', itemObj)
  if (fetchSearch.value) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredPermissions: Record<string, any>[] = filterPermission(itemObj['name'])
  const viewBy: string[] = itemObj['view'] || []
  Permissions.value = filteredPermissions.map((Permission) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {}
    if (!viewBy || viewBy.length === 0) return Permission
    viewBy.forEach((field) => {
      result[field] = Permission[field]
    })
    return result
  })
}

const searchGlobal = async () => {
  if (!fetchSearch.value) return
  await PermissionStore.search_permission(searchObj.value)
  // actionFilter(filterFieldStore.value.getItems());
}

const createNewPermission = async () => {
  const permissions = Object.keys(
    permissionStoreRef.value
  ).map((key) => {
    const currentSet = permissionStoreRef.value[key].state.fields['Permission'].valueChange as Set<string>;
    return {
      table : key,
      permission_name : Array.from(currentSet || [])};
  });
  saveObj.value = {...saveObj.value, permissions: permissions};
  await PermissionStore.createPermission(saveObj.value)
  await PermissionStore.read_permission()
  switchPage.value = 'main'
}

const updatePermissionData = (
  row: Record<string, unknown>,
) => {
  if(!permissionStoreRef.value[permissionCurrent.value]) return;
  // Initialize the Set if it's null
  if(permissionStoreRef.value[permissionCurrent.value].state.fields['Permission'].valueChange === null){
    permissionStoreRef.value[permissionCurrent.value].state.fields['Permission'].valueChange = new Set();
  } 
  const currentSet = permissionStoreRef.value[permissionCurrent.value].state.fields['Permission'].valueChange as Set<string>;
  if(currentSet.has(row['Permission'] as string)){
    currentSet.delete(row['Permission'] as string);
  } else {
    currentSet.add(row['Permission'] as string);
  }
  permissionStoreRef.value[permissionCurrent.value].state.fields['Permission'].valueChange = currentSet;
  return;
}

const updateCreatePermissionData = (value) => {
  saveObj.value = formFieldsStore.value.formConverttoPayload(value, true)
  permissionStoreRef.value = Object.keys(permissionStoreRef.value).reduce((acc, key) => {
    if (!(saveObj.value['table_permission'] as string[]).includes(key)) return acc
    acc[key] = permissionStoreRef.value[key]
    return acc
  }, {} as Record<string, TableStore>  )
}

const TableRowClick = async (row: Record<string, unknown>) => {
  formFieldsStore.value.setDefaultValue('name', row['name'] );
  formFieldsStore.value.setDefaultValue('status', row['status'] );
  formFieldsStore.value.setDefaultValue('function', row['function'] );
  const permissionValue : string[] = await PermissionStore.get_scope_for_permission(row['name'] as string)
  const scope_permission = await PermissionStore.get_scope_permission()
  permissionBasicData.value = scope_permission.map(item => {
    return {
      Permission : item,
      selected : permissionValue ? permissionValue.includes(item) : false
    }
  })
  switchPage.value = 'create';
};

watch(
  () => PermissionStore.listPermission,
  async (newVal) => {
    const n_permissions = [...newVal]
    if (Permissions.value === undefined) {
      Permissions.value = [...n_permissions]
      tableRef.value.convertPayloadToState(n_permissions[0]) as TableState
      pageParams.value.pageCount = Math.ceil(n_permissions.length / pageParams.value.pageSize)
      changeTableLabel()
      await initPermissionProfileData()
      initFormFilter()
    } else if (Permissions.value !== undefined) {
      Permissions.value = [...n_permissions]
    }
  },
)

watch(
  async () => Permissions.value,
  async (newVal) => {
    const data = await newVal
    if (!data || data.length === 0) return
    tableRef.value = tableStore.store()
    tableRef.value.convertPayloadToState(data[0]) as TableState
    pageParams.value.pageCount = Math.ceil(data.length / pageParams.value.pageSize)
    changeTableLabel()
  },
  { immediate: true },
)

watchEffect(async () => {
  await PermissionStore.read_permission()
})
</script>

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
          <div class="relative grid grid-cols-2 m-[100px] mt-[50px]">
            <div class="grid grid-cols-1">
              <form-layout
                title="Group Permission Layout"
                :data="{
                  formStore: formFieldsStore,
                  disable: [],
                }"
                v-on:update:items="updateCreateGroupData"
              >
                <template #GroupInfo>
                  <div classStyle="flex flex-col gap-y-[20px]"></div>
                </template>
              </form-layout>
            </div>
            <div class="grid grid-cols-1" v-if="permissionStoreRef">
              <BasicTableOne
                :data="permissionData"
                :store="permissionStoreRef[permissionCurrent]"
                v-on:update:row-clicked="updatePermissionData"
              />
            </div>
            <Button
              class="absolute w-[100px] bottom-[-100px] right-0 mb-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg"
              size="md"
              @click="createNewGroup"
            >
              Save
            </Button>
          </div>
        </div>
        <div v-else class="mb-12">
          <div class="flex gap-4 justify-between">
            <form-layout
              :data="{
                formStore: filterFieldStore,
                disable: [],
              }"
              v-on:update:items="
                (value) => {
                  actionFilter(value)
                }
              "
            >
              <template #groupInfo>
                <div classStyle="flex justify-between items-center"></div>
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
              Create New Group
            </Button>
          </div>
          <div class="relative mt-4 min-h-[65vh] focus-visible:border-none focus:outline-none">
            <basic-table-one :data="groups" :store="tableRef" v-on:update:row-clicked="TableRowClick" />
          </div>
          <div class="absolute bottom-4 right-5">
            <pagination
              v-model="pageParams.pageIndex"
              :page-count="pageParams.pageCount"
              :click-handler="
                (page: number) => {
                  pageParams.pageIndex = page
                }
              "
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
import { useGroupStore } from '@/store/group.store'
import { TableState, TableStore } from '@/store/table.store'
import { useTableStore } from '@/store/table.store'
import Button from '@/components/ui/Button.vue'
import { useFormStore } from '@/store/form.store'
import FormLayout from '@/components/forms/FormLayout.vue'
import { FormState } from '@/interface/form.interface'
import ToggleSwitch from '@/components/forms/FormElements/ToggleSwitch.vue'
import { FieldStore } from '@/store/field'
import { useFunctionStore } from '@/store/function.store'
import { usePermissionStore } from '@/store/permission.store'

const functionStore = useFunctionStore()
const tableStore = useTableStore()
const GroupStore = useGroupStore()
const tableSt = tableStore.store()
const tableRef = ref<TableStore>(tableSt)
const permissionStoreRef = ref<Record<string, TableStore>>({})
const permissionData = ref<Record<string, unknown>[]>()
const permissionStore = usePermissionStore()
const permissionCurrent = ref<string>('')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const filterFieldStore = ref<any>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formFieldsStore = ref<any>()

const saveObj = ref<Record<string, unknown>>({})
const searchObj = ref<Record<string, unknown>>({})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const groups = ref<any[]>()
const fetchSearch = ref(false)
const switchPage = ref<'main' | 'create'>('main')
const pageParams = ref<{ pageIndex: number; pageSize: number; pageCount: number }>({
  pageIndex: 1,
  pageSize: 10,
  pageCount: 0,
})

const initGroupProfileData = async () => {
  const formStore = useFormStore()
  const nameFieldStore = tableRef.value.forkFieldStore('name')
  const typeFieldStore = tableRef.value.forkFieldStore('type')
  const subFieldStore = tableRef.value.forkFieldStore('parent_code')
  const tableFieldStore = tableRef.value.createFieldStore('table_permission')

  typeFieldStore.setLabel('Phân loai nhóm')
  nameFieldStore.setLabel('Tên nhóm')
  subFieldStore.setLabel('Thuộc nhóm')
  tableFieldStore.setLabel('Thuộc bảng')

  nameFieldStore.setLabel('Group Name')

  nameFieldStore.setType('text')
  typeFieldStore.setType('dropdown')
  subFieldStore.setType('dropdown')
  tableFieldStore.setType('select')

  const formProfileStore: FormState = {
    group: {
      GroupInfo: [
        {
          fields: {
            name: { store: nameFieldStore },
            type: { store: typeFieldStore },
            parent_code: { store: subFieldStore },
            table_permission: { store: tableFieldStore },
          },
        },
      ],
    },
  }
  const form = formStore.getStore(formProfileStore)

  form.setFormValue('name', '')
  form.setFormValue('type', ['Nhóm quả trị', 'Nhóm quản trị thứ cấp'])
  form.setFormValue('parent_code', ['Nhóm quản trị hệ thống', 'Nhóm quản trị nội dung'])

  form.setConditionShow('parent_code', {
    withField: ['type'],
    operator: async (context: { store: FieldStore[] }) => {
      const typeStore = context.store.find((item) => item.state.key === 'type')
      if (!typeStore) return false
      if (typeStore.state.valueChange === 'Nhóm quản trị thứ cấp') {
        const groups_admin = await GroupStore.get_admin_group()
        const group_name_admin = groups_admin.map(
          (group: Record<string, unknown>) => group.name as string,
        )
        form.setFormValue('parent_code', group_name_admin)
        return true
      }
      return false
    },
  })

  const functionList = Array.from((await functionStore.get_function()) || []).map(
    (func: Record<string, unknown>) => func.name as string,
  )
  form.setFormValue('table_permission', functionList)
  await initTablePermission(functionList[0])
  form.setAction('table_permission', async (args?: unknown) => {
    await initTablePermission(args as string)
  })
  form.setMinSpaceLabelAll('min-w-[100px]')
  formFieldsStore.value = form
}

const initTablePermission = async (table?: string) => {
  await permissionStore.get_permission_with_table(table as string)
  if (!Object.keys(permissionStoreRef.value).includes(table)) {
    permissionStoreRef.value[table as string] = tableStore.store()
  }
  const ListPermissionCRUD = permissionStore.PermissionForTable
  const NonePermissionCRUD = [
    {
      Permission: 'No Permission',
    },
  ]
  permissionData.value =
    ListPermissionCRUD[table as string]?.size > 0
      ? Array.from(ListPermissionCRUD[table as string]).map((item) => {
          return { Permission: item.name }
        })
      : NonePermissionCRUD
  permissionStoreRef.value[table as string].convertPayloadToState(
    permissionData.value[0],
  ) as TableState
  permissionCurrent.value = table
}

const initFormFilter = () => {
  const formStore = useFormStore()
  const nameFieldStore = tableRef.value.forkFieldStore('name')

  nameFieldStore.setType('text')
  const ViewFieldStore = tableRef.value.getViewFieldStore('View By')

  const formProfileStore: FormState = {
    group: {
      groupInfo: [
        {
          fields: {
            name: { store: nameFieldStore },
            view: { store: ViewFieldStore },
          },
        },
      ],
    },
  }

  const form = formStore.getStore(formProfileStore)
  form.setFormValue('name', '')
  form.setType('view', 'select')
  filterFieldStore.value = form
}

const changeTableLabel = () => {
  tableRef.value.setLabel('name', 'Group Name')
}

const filterGroup = (name: string) => {
  return [...GroupStore.listGroup]?.filter((group) => {
    const nameMatch = name ? group.name.toLowerCase().includes(name.toLowerCase()) : true
    return nameMatch
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const actionFilter = async (item: Record<string, any>[]) => {
  const itemObj = filterFieldStore.value.formConverttoPayload(item, fetchSearch.value)
  searchObj.value = itemObj
  if (fetchSearch.value) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredgroups: Record<string, any>[] = filterGroup(itemObj['name'])
  const viewBy: string[] = itemObj['view'] || []
  groups.value = filteredgroups.map((group) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {}
    if (!viewBy || viewBy.length === 0) return group
    viewBy.forEach((field) => {
      result[field] = group[field]
    })
    return result
  })
}

const searchGlobal = async () => {
  if (!fetchSearch.value) return
  await GroupStore.search_group(searchObj.value)
  // actionFilter(filterFieldStore.value.getItems());
}

const createNewGroup = async () => {
  const permissions = Object.keys(
    permissionStoreRef.value
  ).map((key) => {
    const currentSet = permissionStoreRef.value[key].state.fields['Permission'].valueChange as Set<string>;
    return {
      table : key,
      permission_name : Array.from(currentSet || [])};
  });
  saveObj.value = {...saveObj.value, permissions: permissions};
  await GroupStore.createGroup(saveObj.value)
  await GroupStore.get_group()
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

const updateCreateGroupData = (value) => {
  saveObj.value = formFieldsStore.value.formConverttoPayload(value, true)
  permissionStoreRef.value = Object.keys(permissionStoreRef.value).reduce((acc, key) => {
    if (!(saveObj.value['table_permission'] as string[]).includes(key)) return acc
    acc[key] = permissionStoreRef.value[key]
    return acc
  }, {} as Record<string, TableStore>  )
}

const TableRowClick = async (row: Record<string, unknown>) => {
  formFieldsStore.value.setDefaultValue('name', row['name'] as string)
  formFieldsStore.value.setDefaultValue('type', row['type'] );
  formFieldsStore.value.setDefaultValue('parent_code', row['parent_code'] );
  const found_group = await GroupStore.find_group_by_id(row['id'] as string)
  debugger
  const functions = new Set(found_group['permissions'].map(
    (perm: Record<string, unknown>) => perm['function']
  ))
  formFieldsStore.value.setDefaultValue('table_permission', functions)

  const scope_permission : string[] = await permissionStore.get_permission_with_table(functions[0] as string)
  let permissionValue = await permissionStore.get_permission_by_group_name(found_group['name'] as string)
  permissionValue = permissionValue.map(
    (perm: Record<string, unknown>) => perm.name as string
  )
  permissionData.value = scope_permission.map(item => {
    return {
      Permission : item.name,
      selected : permissionValue ? permissionValue.includes(item.name) : false
    }
  })
  switchPage.value = 'create';
};

watch(
  () => GroupStore.listGroup,
  async (newVal) => {
    let n_groups = [...newVal]
    n_groups = n_groups.map((group) => {
      const permissions = group.permissions.map(
        (perm) => perm.name,
      )
      group.permissions = permissions;
      return group
    })
    if (groups.value === undefined) {
      groups.value = [...n_groups]
      tableRef.value.convertPayloadToState(n_groups[0]) as TableState
      pageParams.value.pageCount = Math.ceil(n_groups.length / pageParams.value.pageSize)
      changeTableLabel()
      await initGroupProfileData()
      initFormFilter()
    } else if (groups.value !== undefined) {
      groups.value = [...n_groups]
    }
  },
)

watch(
  async () => groups.value,
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
  await GroupStore.get_group()
})
</script>

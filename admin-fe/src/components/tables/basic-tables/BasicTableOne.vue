<template>
  <div
    class="overflow-hidden  dark:border-gray-800 dark:bg-white/[0.03]" 
  >
    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="w-full">
        <thead >
          <tr>
            <th class="w-[150px] py-3 border border-gray-400 font-bold bg-orange-200">
              <input type="checkbox" class="custom-orange-checkbox"/>
            </th>
            <th
              v-for="field in shownFields"
              :key="field.key"
              class="px-5 py-3 text-left text-gray-500 text-theme-lg dark:text-gray-400 cursor-pointer border border-gray-400 font-bold bg-orange-200"
              :style="headerStyle"
            >
              <div class="w-[100%] flex items-space-between justify-between" >
                <div>{{ field.label }}</div>
                <div v-if="field.sortDesc" @click="handleChangeSort(field.key)">▼</div>
                <div v-else @click="handleChangeSort(field.key)">▲</div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <template v-if="finalData.length > 0">
            <tr
              v-for="(row, rowIndex) in finalData"
              :key="rowIndex"
            >
              <td class="w-[150px] border border-gray-400 border-r-0 border-t-0"
                :style="cellStyle"
              >
                <div class="flex justify-center items-center">
                  <input
                    type="checkbox"
                    class="custom-orange-checkbox"
                    :checked="row.selected === true"
                    @click="emitRowValue(row)"
                  />
                </div>
              </td>
              <td
                v-for="field in shownFields"
                :key="field.key"
                class="px-5 py-3 text-left font-medium text-gray-500 text-theme-lg dark:text-gray-400 border border-gray-400 "
                :style="cellStyle"
                @click="emitFieldValue(field.key, row[field.key])"
              >

                <a href="#" v-if="field.key==='id'" class="hover:underline hover:text-blue-600" @click="emitRowValue(row)">
                  {{ row[field.key] }}
                </a>
                <span v-else>
                  {{ row[field.key] }}
                </span>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td :colspan="shownFields.length + 1" class="text-center py-4 text-gray-400">
                No data available
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import { TableStore } from '@/store/table.store'

const props = defineProps<{
  data: Record<string, unknown>[],
  store: TableStore,
  fieldState?: Record<string, unknown>,
  views?: string[], // Thêm props views
  headerStyle?: string | Record<string, string>,
  cellStyle?: string | Record<string, string>
}>()

interface Emit {
  'update:field-clicked',
  'update:row-clicked'
}

const emit = defineEmits<Emit>()

const fields = computed(() => props.store.state.fields)

// Lọc fields theo views nếu có
const shownFields = computed(() => {
  if (!props.views || props.views.length === 0) {
    // Convert fields.value (object) to array
    return Object.keys(fields.value).map(key => ({
      key,
      ...fields.value[key]
    }))
  }
  // Filter and map to array
  return props.views
    .filter(key => fields.value[key])
    .map(key => ({
      key,
      ...fields.value[key]
    }))
})

const sortKey = ref<string>(Object.keys(shownFields.value)[0] || '')

const handleChangeSort = (key: string) => {
    sortKey.value = key
    shownFields.value[key].sortDesc = !shownFields.value[key].sortDesc
}

const sortedData = computed(() => {
  if (!props.data || Object.keys(shownFields.value).length === 0) return []
  const sortKeyValue = sortKey.value || Object.keys(shownFields.value)[0]
  const sortDesc = shownFields.value[sortKeyValue]?.sortDesc
  return [...props.data].sort((a, b) => {
    const aVal = a[sortKeyValue]
    const bVal = b[sortKeyValue]
    const aDate = new Date(aVal as string)
    const bDate = new Date(bVal as string)
    if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
      return sortDesc ? bDate.getTime() - aDate.getTime() : aDate.getTime() - bDate.getTime()
    }
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDesc
        ? bVal.localeCompare(aVal)
        : aVal.localeCompare(bVal)
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDesc ? bVal - aVal : aVal - bVal
    }
    return 0
  })
})

const finalData = computed(() => {
  let filteredData = [...sortedData.value]
  for (const key in shownFields.value) {
    const field = shownFields.value[key]
    if (field.searchable) {
      filteredData = field.searchAction(filteredData)
    }
  }
  return filteredData
})

const emitFieldValue = (key: string, value: unknown) => {
  emit(
    "update:field-clicked", { key: key, value: value }
  )
}

const emitRowValue = (row: Record<string, unknown>) => {
  // Đảo trạng thái selected cho row này
  if (props.store && props.store.state) {
    // Nếu row đã được chọn thì bỏ chọn, chưa chọn thì chọn
    row.selected = !row.selected
  }
  emit(
    "update:row-clicked", row
  )
}

const { headerStyle = '', cellStyle = '' } = toRefs(props)
</script>
<style scoped>
.custom-orange-checkbox {
  accent-color: #1877ad; /* Tailwind bg-orange-400 */
}
</style>
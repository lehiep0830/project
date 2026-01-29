<template>
  <div class="flex justify-center items-center">
    <!-- Multiple Select Input -->
    <div :class="`mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mr-2 mt-1 w-auto whitespace-nowrap ${( props.data.useMinSpace && minspaceClass ) || 'mr-1'}`">{{ props.data.label }}</div>
    <MultipleSelect
      :data="{ value: props.data.value, key: props.data.key, action: props.data.action, defaultValue: props.data.defaultValue }"
      @update:modelValue="onMultiSelectChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MultipleSelect from './MultipleSelect.vue'

interface Option {
  key: string | number
  value: string
  [key: string]: unknown
}

const props = defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: {   defaultValue?: string[], label: string, disable: boolean | string[], key: string, value: any[] | Option[], useMinSpace?: boolean, action: (args?: unknown) => void | Promise<void> },
  minspace?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown[], key: string): void
}>()

function onMultiSelectChange(val: unknown[], key: string) {
  emit('update:modelValue', val, key)
}

const minspaceClass = computed(() => props.minspace || 'min-w-[70px]')
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-center items-center mt-[2px]">
      <div :class="`mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mr-2 mt-1 ${(props.data.useMinSpace && minspaceClass) || 'mr-4'}`">{{ props.data.label }}</div>
      <input
        :type="props.data.type || 'text'"
        v-model="modelValueProxy"
        :placeholder="data.label"
        :disabled="data.disable"
        class="dark:bg-dark-900 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-gray-800/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  data: { label: string, defaultValue: string, disable: boolean, key: string, value: string, useMinSpace?: boolean , type?: string },
  minspace?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown, key: string): void
}>()

const minspaceClass = computed(() => props.minspace || 'min-w-[70px]')

const modelValueProxy = computed({
  get: () => props.data.defaultValue || props.data.value,
  set: val => emit('update:modelValue', val, props.data.key),
})
</script>

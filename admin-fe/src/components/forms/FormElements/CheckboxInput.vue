<template>
  <div class="space-y-6">
    <div>
      <div class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{{ props.data.label }}</div>
      <div class="grid grid-flow-col auto-cols-max gap-8">
        <div v-for="(item, idx) in props.data.value" :key="idx">
          <label
            :for="'checkbox-' + idx"
            class="flex items-center text-sm font-medium text-gray-700 cursor-pointer select-none dark:text-gray-400"
          >
            <div class="relative">
              <input
                type="checkbox"
                :id="'checkbox-' + idx"
                v-model="modelValueProxy"
                :value="item"
                class="hover:shadow-theme-lg focus:ring-gray-500 focus:shadow-gray-600 outline-gray-400"
                :disabled="Array.isArray(props.data.disable) ? props.data.disable.includes(item) : props.data.disable"
              />
              <div
                :class="modelValueProxy.includes(item)
                  ? 'border-brand-500 bg-brand-500'
                  : 'bg-transparent border-gray-300 dark:border-gray-700'"
                class="mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] hover:border-brand-500 dark:hover:border-brand-500"
              >
                <span :class="modelValueProxy.includes(item) ? '' : 'opacity-0'">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                      stroke="white"
                      stroke-width="1.94437"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>
            {{ item }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  data: { label: string, disable: boolean | string[], key: string, value: string[] }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown[], key: string): void
}>()

const modelValueProxy = computed({
  get: () => props.data.value,
  set: val => emit('update:modelValue', val, props.data.key),
})
</script>

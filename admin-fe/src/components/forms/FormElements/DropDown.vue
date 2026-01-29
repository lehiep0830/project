<template>
  <div class="relative" ref="multiSelectRef">
    <div class="flex justify-center items-center">
      <label :class="`mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mr-2 mt-1 w-auto ${( props.data.useMinSpace && minspaceClass ) || 'mr-4'}`">{{ props.data.label ?? 'Select items...' }}</label>
      <div
        @click="toggleDropdown"
        :class="`${containerStyle ?? 'dark:bg-dark-900 h-11 flex items-center w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800 hover:shadow-theme-lg  placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-gray-800/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'} w-full`"
      >
        <span :class="`${containerStyle ?? 'text-gray-400'} `"> {{ selectedItems ?? 'Select items...' }} </span>
        <svg
          class="ml-auto"
          :class="{ 'transform rotate-180': isOpen }"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isOpen"
          class="absolute top-[44px] z-10 w-full mt-1 bg-white rounded-lg shadow-sm dark:bg-gray-900"
        >
          <ul
            class="overflow-y-auto divide-y divide-gray-200 custom-scrollbar max-h-60 dark:divide-gray-800"
            role="listbox"
            aria-multiselectable="true"
          >
            <li
              v-for="(item, idx) in props.data.value"
              :key="idx"
              @click="toggleItem(item)"
              class="relative flex items-center w-full px-3 py-2 border-transparent cursor-pointer first:rounded-t-lg last:rounded-b-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="{ 'bg-gray-50 dark:bg-white/[0.03]': isSelected(item) }"
              role="option"
            >
              <span class="grow">{{ item }}</span>
              <svg
                v-if="isSelected(item)"
                class="w-5 h-5 text-gray-400 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </li>
          </ul>
        </div>
      </transition>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

interface Option {
  key: string | number
  label: string
  value: string[] | number[] 
  selected: string | number
  defaultValue?: string | number
  useMinSpace?: boolean
  action?: (args?: unknown) => void | Promise<void>
  [key: string]: unknown
}

const props = defineProps<{
    data: Option,
    containerStyle?: string
    minspace?: string
}>()

const minspaceClass = computed(() => props.minspace || 'min-w-[70px]')

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedItems = ref<any>(props.data.defaultValue || 'Select items...')
const multiSelectRef = ref(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const toggleItem = (item) => {
  selectedItems.value = item
  emit('update:modelValue', selectedItems.value, props.data.key)
  if (props.data.action) {
    props.data.action(item.value)
  }
}

const isSelected = (item) => {
  return selectedItems.value === item
}

const handleClickOutside = (event) => {
  if (multiSelectRef.value && !multiSelectRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

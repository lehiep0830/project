<template>
    <label class="flex items-center justify-center cursor-pointer pb-4.5">
        <span
            :class="`select-none text-sm font-medium text-heading ${props.data.useMinSpace ? minspaceClass : 'mr-4'}`">
            {{ props.data.label }}
        </span>
        <input type="checkbox" class="sr-only peer" v-model="modelValueProxy" :checked="props.data.value"
            :disabled="props.data.disable">
        <div
            class="relative mx-3 w-9 h-5 bg-gray-300 dark:bg-gray-700 border border-gray-400 dark:border-gray-600 rounded-full transition-colors duration-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-200 dark:peer-focus:ring-orange-600 peer peer-checked:bg-orange-300  peer-checked:border-orange-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:duration-300 peer-checked:after:translate-x-4">
        </div>

    </label>

</template>
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    data: { label: string, disable: boolean, key: string, value: boolean, useMinSpace?: boolean },
    minspace?: string,
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean, key: string): void
}>()

const minspaceClass = computed(() => props.minspace || 'min-w-[70px]')

const modelValueProxy = computed({
    get: () => props.data.value,
    set: val => emit('update:modelValue', val, props.data.key),
})
</script>
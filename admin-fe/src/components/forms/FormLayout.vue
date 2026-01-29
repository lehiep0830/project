<template>
  <div
    class="grid grid-flow-row auto-rows-max gap-8"
    v-if="props.data !== undefined && props.data.formStore !== undefined"
  >
    <template v-for="groupKey in Object.keys(props.data.formStore.render.group)" :key="groupKey">
      <template v-for="(item, idx) in props.data.formStore.render.group[groupKey]" :key="idx">
        <component
          :is="$slots[groupKey]?.()[0]"
          v-if="['div', 'template'].includes($slots[groupKey]?.()[0]?.type.toString())"
        >
          <div :class="$slots[groupKey]?.()[0]?.props?.classStyle || ''">
            <div v-for="(field, idxField) in item.fields" :key="idxField">
              <component
                :class="`mr-5 ${props.componentStyle || ''}`"
                :is="getComponent(field.store.state.type)"
                :data="{
                  value: field.store.state.formValue as any,
                  label: field.store.state.label,
                  key: field.store.state.key,
                  disable: props.data.disable.includes(field.store.state.key),
                  useMinSpace: field.store.state.useMinSpace,
                  type: field.store.state.type,
                  action: field.store.state.action,
                  defaultValue: field.store.state.defaultValue
                }"
                :minspace="field.store.state.minSpaceLabel"
                @update:modelValue="onUpdate"
                v-if="
                  Object.keys(shouldShowField).length > 0 && shouldShowField[field.store.state.key]
                "
              />
            </div>
          </div>
        </component>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
// Import các component form element
import DefaultInputs from './FormElements/DefaultInputs.vue'
import CheckboxInput from './FormElements/CheckboxInput.vue'
import SelectInput from './FormElements/SelectInput.vue'
import FileInput from './FormElements/FileInput.vue'
import { DataProfileLayout } from '@/interface/user.interface'
import DropDown from './FormElements/DropDown.vue'
import { ref, watch } from 'vue'
import { FormLayoutInterface } from '@/interface/form.interface'
import { FieldStore } from '@/store/field'

interface Props {
  data: DataProfileLayout
  componentStyle?: string
}

const props = defineProps<Props>()
const storeShareData = ref<Record<string, FormLayoutInterface>>({})
const shouldShowField = ref<Record<string, boolean>>({})

const conditionshow = async (field: FormLayoutInterface) => {
  if (!field.conditionShow?.operator) return true
  const result: boolean = await field.conditionShow.operator({
    store: Object.values(storeShareData.value)
      .filter((item) => field.conditionShow.withField.includes(item.store.state.key))
      .map((item) => item.store as FieldStore), // Cast to FieldStore[]
  })
  shouldShowField.value[field.store.state.key] = result
  return result
}

watch(
  () => props.data,
  async (newVal) => {
    if (newVal === undefined || newVal.formStore === undefined) return
    storeShareData.value = { ...newVal.formStore.state.fields } as Record<
      string,
      FormLayoutInterface
    >
    // Khởi tạo shouldShowField
    Object.keys(storeShareData.value).forEach(async (fieldKey) => {
      shouldShowField.value[fieldKey] = await conditionshow(storeShareData.value[fieldKey])
    })
  },
  { immediate: true, deep: true },
)

function getComponent(type: string) {
  switch (type) {
    case 'text':
      return DefaultInputs
    case 'password':
      return DefaultInputs
    case 'checkbox':
      return CheckboxInput
    case 'select':
      return SelectInput
    case 'file':
      return FileInput
    case 'dropdown':
      return DropDown
    default:
      return DefaultInputs
  }
}

const emit = defineEmits<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e: 'update:items', item: any): void
}>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onUpdate(value: any, key: string) {
  console.log('onUpdate called with key:', key, 'and value:', value)
  if (!storeShareData.value[key]) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storeShareData.value[key].store.state.valueChange = value
  if (['text', 'password'].includes(storeShareData.value[key].store.state.type)) {
    storeShareData.value[key].store.state.formValue = value as string
  }
  const result = (
    Object.keys(storeShareData.value) as Array<keyof typeof storeShareData.value>
  ).map((fieldKey) => {
    return {
      key: fieldKey,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: storeShareData.value[fieldKey].store.state.valueChange as any,
    }
  })
  emit('update:items', result)
}
</script>

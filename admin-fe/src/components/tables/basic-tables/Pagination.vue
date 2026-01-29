<template>
  <ul :class="containerClass" v-if="!noLiSurround">
    <li v-if="firstLastButton" :class="[pageClass, firstPageSelected ? disabledClass : '']">
      <a @click="selectFirstPage" @keyup.enter="selectFirstPage" :class="pageLinkClass" :tabindex="firstPageSelected ? -1 : 0" v-html="firstButtonText"></a>
    </li>

    <li v-if="!(firstPageSelected && hidePrevNext)" :class="[prevClass, firstPageSelected ? disabledClass : '']">
      <a @click="prevPage" @keyup.enter="prevPage" :class="prevLinkClass" :tabindex="firstPageSelected ? -1 : 0" v-html="prevText"></a>
    </li>

    <li v-for="page in pages" :key="page.index" :class="[pageClass, page.selected ? activeClass : '', page.disabled ? disabledClass : '', page.breakView ? breakViewClass: '']">
      <a v-if="page.breakView" :class="[pageLinkClass, breakViewLinkClass]" tabindex="0"><slot name="breakViewContent">{{ breakViewText }}</slot></a>
      <a v-else-if="page.disabled" :class="pageLinkClass" tabindex="0">{{ page.content }}</a>
      <a v-else @click="handlePageSelected(page.index + 1)" @keyup.enter="handlePageSelected(page.index + 1)" :class="pageLinkClass" tabindex="0">{{ page.content }}</a>
    </li>

    <li v-if="!(lastPageSelected && hidePrevNext)" :class="[nextClass, lastPageSelected ? disabledClass : '']">
      <a @click="nextPage" @keyup.enter="nextPage" :class="nextLinkClass" :tabindex="lastPageSelected ? -1 : 0" v-html="nextText"></a>
    </li>

    <li v-if="firstLastButton" :class="[pageClass, lastPageSelected ? disabledClass : '']">
      <a @click="selectLastPage" @keyup.enter="selectLastPage" :class="pageLinkClass" :tabindex="lastPageSelected ? -1 : 0" v-html="lastButtonText"></a>
    </li>
  </ul>

  <div :class="containerClass" v-else>
    <div class="inline-block mr-2">
        <div class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mr-2 mt-1 min-w-[70px] border border-3 shadow-xl border-gray-400 rounded-2xl flex text-center justify-center" @click="openShow=!openShow">{{ currentSize }}</div>
        <div class="absolute left-[12px] bottom-[40px]">
            <ul class="flex-col space-y-2 bg-gray-200 rounded-lg" v-if="openShow">
                <li  v-for="size in props.pageSize" :key="size" @click="$emit('update:pageSize', size); openShow=false" @mouseenter="currentSize=size" :class="['cursor-pointer px-3 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 hover:bg-gray-300 hover:dark:bg-gray-600 hover:font-semibold']">
                    {{ size }}
                </li>
            </ul>
        </div>
    </div>

    <a v-if="firstLastButton" @click="selectFirstPage" @keyup.enter="selectFirstPage" :class="[pageLinkClass, firstPageSelected ? disabledClass : '']" tabindex="0" v-html="firstButtonText"></a>
    <a v-if="!(firstPageSelected && hidePrevNext)" @click="prevPage" @keyup.enter="prevPage" :class="[prevLinkClass, firstPageSelected ? disabledClass : '']" tabindex="0" v-html="prevText"></a>
    <template v-for="page in pages" :key="page.index">
      <a v-if="page.breakView" :class="[pageLinkClass, breakViewLinkClass, page.disabled ? disabledClass : '']" tabindex="0"><slot name="breakViewContent">{{ breakViewText }}</slot></a>
      <a v-else-if="page.disabled" :class="[pageLinkClass, page.selected ? activeClass : '', disabledClass]" tabindex="0">{{ page.content }}</a>
      <a v-else @click="handlePageSelected(page.index + 1)" @keyup.enter="handlePageSelected(page.index + 1)" :class="[pageLinkClass, page.selected ? activeClass : '']" tabindex="0">{{ page.content }}</a>
    </template>
    <a v-if="!(lastPageSelected && hidePrevNext)" @click="nextPage" @keyup.enter="nextPage" :class="[nextLinkClass, lastPageSelected ? disabledClass : '']" tabindex="0" v-html="nextText"></a>
    <a v-if="firstLastButton" @click="selectLastPage" @keyup.enter="selectLastPage" :class="[pageLinkClass, lastPageSelected ? disabledClass : '']" tabindex="0" v-html="lastButtonText"></a>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

defineOptions({ name: 'BasicPagination' })

interface Page {
  index?: number
  content?: number | string
  selected?: boolean
  disabled?: boolean
  breakView?: boolean
}

const props = defineProps({
    pageSize: {
        type: Array as () => number[],
        default: () => [5, 10, 15, 20]
    },
    value: Number,
    pageCount: { type: Number, required: true },
    forcePage: Number,
    clickHandler: { type: Function, default: () => {} },
    pageRange: { type: Number, default: 3 },
    marginPages: { type: Number, default: 1 },
    prevText: { type: String, default: 'Prev' },
    nextText: { type: String, default: 'Next' },
    breakViewText: { type: String, default: '…' },
    containerClass: String,
    pageClass: String,
    pageLinkClass: String,
    prevClass: String,
    prevLinkClass: String,
    nextClass: String,
    nextLinkClass: String,
    breakViewClass: String,
    breakViewLinkClass: String,
    activeClass: { type: String, default: 'active' },
    disabledClass: { type: String, default: 'disabled' },
    noLiSurround: { type: Boolean, default: false },
    firstLastButton: { type: Boolean, default: false },
    firstButtonText: { type: String, default: 'First' },
    lastButtonText: { type: String, default: 'Last' },
    hidePrevNext: { type: Boolean, default: false }
})

const currentSize = ref<number>(props.pageSize[0])

const emit = defineEmits(['update:pageSize', 'input'])

const innerValue = ref(1)

const openShow = ref(false)

const selected = computed({
  get: () => props.value ?? innerValue.value,
  set: (val: number) => {
    innerValue.value = val
  }
})

watch(() => props.forcePage, (newVal) => {
  if (newVal !== undefined && newVal !== selected.value) {
    selected.value = newVal
  }
})

const pages = computed<Page[]>(() => {
  const items: Page[] = []
  if (props.pageCount <= props.pageRange) {
    for (let index = 0; index < props.pageCount; index++) {
      items.push({
        index,
        content: index + 1,
        selected: index === (selected.value - 1)
      })
    }
  } else {
    const halfPageRange = Math.floor(props.pageRange / 2)

    const setPageItem = (index: number) => {
      items.push({
        index,
        content: index + 1,
        selected: index === (selected.value - 1)
      })
    }

    const setBreakView = (index: number) => {
      items.push({
        index,
        disabled: true,
        breakView: true
      })
    }

    // margin pages
    for (let i = 0; i < props.marginPages; i++) {
      setPageItem(i)
    }

    let selectedRangeLow = 0
    if (selected.value - halfPageRange > 0) {
      selectedRangeLow = selected.value - 1 - halfPageRange
    }

    let selectedRangeHigh = selectedRangeLow + props.pageRange - 1
    if (selectedRangeHigh >= props.pageCount) {
      selectedRangeHigh = props.pageCount - 1
      selectedRangeLow = selectedRangeHigh - props.pageRange + 1
    }

    for (let i = selectedRangeLow; i <= selectedRangeHigh && i <= props.pageCount - 1; i++) {
      setPageItem(i)
    }

    if (selectedRangeLow > props.marginPages) {
      setBreakView(selectedRangeLow - 1)
    }

    if (selectedRangeHigh + 1 < props.pageCount - props.marginPages) {
      setBreakView(selectedRangeHigh + 1)
    }

    for (let i = props.pageCount - 1; i >= props.pageCount - props.marginPages; i--) {
      setPageItem(i)
    }
  }
  return items
})

function handlePageSelected(sel: number) {
  if (selected.value === sel) return
  innerValue.value = sel
  emit('input', sel)
  props.clickHandler(sel)
}

function prevPage() {
  if (selected.value <= 1) return
  handlePageSelected(selected.value - 1)
}

function nextPage() {
  if (selected.value >= props.pageCount) return
  handlePageSelected(selected.value + 1)
}

const firstPageSelected = computed(() => selected.value === 1)
const lastPageSelected = computed(() => selected.value === props.pageCount || props.pageCount === 0)

function selectFirstPage() {
  if (selected.value <= 1) return
  handlePageSelected(1)
}

function selectLastPage() {
  if (selected.value >= props.pageCount) return
  handlePageSelected(props.pageCount)
}
</script>

<style scoped>
a {
  cursor: pointer;
}
</style>

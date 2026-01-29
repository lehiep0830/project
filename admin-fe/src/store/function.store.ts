import { acceptHMRUpdate, defineStore } from 'pinia'
import { apiClient, callApi } from '@/common/http';
import { ref } from 'vue';

export const useFunctionStore = defineStore('function', () => {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listFunction = ref<Set<any>>( new Set() );

    const get_function = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response  = (await callApi( apiClient.ADMIN, { url: '/functions/', method: 'GET' }) ) as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        listFunction.value = new Set(response)
        return response
    }

    return {
        get_function,
        listFunction,
    }
})


if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useFunctionStore, import.meta.hot))
}
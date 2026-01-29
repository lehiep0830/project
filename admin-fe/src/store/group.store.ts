import { acceptHMRUpdate, defineStore } from 'pinia'
import { apiClient, callApi } from '@/common/http';
import { ref } from 'vue';

export const useGroupStore = defineStore('group', () => {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listGroup = ref<Set<any>>( new Set() );

    const get_group = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response  = (await callApi( apiClient.ADMIN, { url: '/groups/', method: 'GET' }) ) as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        listGroup.value = new Set(response)
        return response
    }

    // Đăng ký tài khoản mới
    const createGroup = async (payload: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await callApi(apiClient.ADMIN, {
            url: '/groups',
            method: 'POST',
            payload,
        });
        return response;
    };

    const search_group = async ( payload: Record<string, unknown> ) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response  = (await callApi( apiClient.ADMIN, { url: '/groups/search', method: 'PATCH', payload }) ) as any;
        listGroup.value = new Set();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response?.forEach( ( group: any ) => { 
            listGroup.value.add( group );
        })
        return response
    }

    const get_admin_group = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response  = (await callApi( apiClient.ADMIN, { url: '/groups/admin', method: 'GET' }) ) as any;
        return response
    }

    return {
        get_group,
        listGroup,
        createGroup,
        search_group,
        get_admin_group
    }
})


if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useGroupStore, import.meta.hot))
}
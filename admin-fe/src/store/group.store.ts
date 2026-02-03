import { acceptHMRUpdate, defineStore } from 'pinia'
import { apiClient, callApi } from '@/common/http';
import { ref } from 'vue';
import { generateId } from '@/common/utils';

export const useGroupStore = defineStore('group', () => {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listGroup = ref<Set<any>>( new Set() );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    const get_group = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any[]  = (await callApi( apiClient.ADMIN, { url: '/groups/', method: 'GET' }) ) as any[];
        const results = response.map( (item: Record<string, unknown>) => {
            return {
                ...item,
                id: generateId('group')
            }
        } );
        
        listGroup.value = new Set(results)
        return results
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

    const find_group_by_id = async ( group_id: string ) => {
        let found_group = null;
        listGroup.value.forEach( ( group ) => { 
            if ( group.id === group_id ) {
                found_group = group;
            }
        });
        return found_group;
    }

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
        get_admin_group,
        find_group_by_id
    }
})


if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useGroupStore, import.meta.hot))
}
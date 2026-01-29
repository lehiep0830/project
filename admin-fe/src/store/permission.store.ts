import { acceptHMRUpdate, defineStore } from 'pinia'
import { apiClient, callApi } from '@/common/http';
import { ref } from 'vue';

export const usePermissionStore = defineStore('permission', () => {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const PermissionForTable = ref<Record<string, Set<any>>>({});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listPermission = ref<Set<any>>( new Set() );

    const get_permission_with_table = async (table_name: string) => {
        const params = {
            function: table_name
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response  = (await callApi( apiClient.ADMIN, { url: '/permissions', method: 'GET', params: params }) ) as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        PermissionForTable.value[table_name] = new Set(response);
        return response
    }

    const read_permission = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response  = (await callApi( apiClient.ADMIN, { url: '/permissions', method: 'GET'}) ) as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        listPermission.value = new Set(response);
        return response
    }

    // Đăng ký tài khoản mới
    const createPermission = async (payload: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await callApi(apiClient.AUTH, {
            url: '/permissions/',
            method: 'POST',
            payload,
        });
        return response;
    };

    

    const search_permission = async ( payload: Record<string, unknown> ) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response  = (await callApi( apiClient.ADMIN, { url: '/permissions', method: 'GET', params: payload }) ) as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        listPermission.value = new Set(response);
        return response
    }

    return {
        get_permission_with_table,
        listPermission,
        PermissionForTable,
        createPermission,
        search_permission,
        read_permission
    }
})


if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(usePermissionStore, import.meta.hot))
}
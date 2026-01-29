import { acceptHMRUpdate, defineStore } from 'pinia'
import { apiClient, callApi } from '@/common/http';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listUser = ref<Set<any>>( new Set() );

    const get_user = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response  = (await callApi( apiClient.ADMIN, { url: '/accounts/', method: 'GET' }) ) as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        listUser.value = new Set(response)
        return response
    }

    // Đăng ký tài khoản mới
    const register = async (payload: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await callApi(apiClient.AUTH, {
            url: '/signup',
            method: 'POST',
            payload,
        });
        return response;
    };

    const signin = async (payload: { email: string; password: string }) => {
        console.log('Signin payload:', payload);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await callApi(apiClient.AUTH, {
            url: '/signin',
            method: 'POST',
            payload,
        });
        console.log(response)
        localStorage.setItem('token', response.authorizedAccount.token);
        return response;
    };

    const search_user = async ( payload: Record<string, unknown> ) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response  = (await callApi( apiClient.ADMIN, { url: '/accounts/search', method: 'PATCH', payload }) ) as any;
        listUser.value = new Set();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response?.forEach( ( user: any ) => { 
            listUser.value.add( user );
        }
        )
        return response
    }

    return {
        get_user,
        listUser,
        register,
        signin,
        search_user
    }
})


if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
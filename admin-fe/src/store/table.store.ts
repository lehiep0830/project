/* eslint-disable @typescript-eslint/no-explicit-any */
import { acceptHMRUpdate, defineStore } from 'pinia'
import { FieldStore, type FieldState } from './field'


export interface TableState {
    fields: {
        [key: string]: FieldState
    }
}

export class TableStore {
        state : TableState
        fields: Record<string, FieldStore> 

        constructor(states: TableState = { fields: {} }, fields: Record<string, FieldStore> = {}) {
            this.state = states
            this.fields = fields
        }

        convertPayloadToState = (payload: Record<string, any>) => {
            this.state.fields = {}
            this.fields = {}
            for ( const fieldKey in payload ) {
                const field = {
                    sortDesc: true,
                    label: fieldKey,
                    key: fieldKey,
                    value: payload[fieldKey],
                    viewColumns: true,
                    searchable: true,
                    valueChange: null,
                    searchValue: '',
                    selected: false,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    searchAction: (data: any[]) => { 
                        data.filter( item => {
                            return item[fieldKey]?.toString().toLowerCase().includes( this.state.fields[fieldKey].searchValue?.toLowerCase() || '' )
                        } )
                        return data 
                    },
                    view: {
                        selection: false,
                        actions: null
                    }
                }
                this.state.fields[fieldKey] = new FieldStore( field ).state
                this.fields = { ...this.fields, [fieldKey]: new FieldStore( field )}
            }
            
            return this.state
        }

        setSearchValue = ( fieldKey: string, searchValue: string ): void => {
            if (this.state.fields[fieldKey] ) {
                this.state.fields[fieldKey].searchValue = searchValue
            }
        }

        forkFieldStore = ( fieldKey: string ): FieldStore | null => {
            if ( this.fields[fieldKey] ) {
                const field = {...this.state.fields[fieldKey]}

                return new FieldStore( field )
            }
            return null
        }

        getViewFieldStore = (title: string) => {
            const viewField = Object.keys(this.state.fields)
            const viewStore = new FieldStore({
                    sortDesc: true,
                    label: title,
                    key: 'view',
                    value: viewField,
                    formValue: viewField,
                    viewColumns: false,
                    searchable: false,
                    type: 'multi_select',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    searchAction: undefined,
                    view: {
                        selection: false,
                        actions: null
                    }
                } )
            return viewStore
        }

        createFieldStore = ( fieldKey: string): FieldStore => {
            const newFieldState: FieldState = { 
                sortDesc: true,
                label: fieldKey,
                key: fieldKey,
                value: null,
                viewColumns: true,
                searchable: true,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                searchAction: ( data: any[] ) => data,
                view: {
                    selection: false,
                    actions: null
                }
            }
            this.state.fields[fieldKey] = newFieldState
            this.fields[fieldKey] = new FieldStore( newFieldState )
            return this.fields[fieldKey]
        }

        setLabel = ( fieldKey: string, label: string ): void => {
            if (this.state.fields[fieldKey] ) {
                this.state.fields[fieldKey].label = label
            }
        }

    }

export const useTableStore = defineStore('Table', () => {
    const store = (states: TableState = { fields: {} }, fields: Record<string, FieldStore> = {}) => new TableStore(states, fields)     
    return {
        store
    }
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useTableStore, import.meta.hot))
}

export interface FieldState {
    sortDesc: boolean
    label: string
    key: string
    value: unknown
    viewColumns: boolean
    searchable: boolean
    searchValue?: string
    type?: string
    formValue?: unknown
    minSpaceLabel?: string
    useMinSpace?: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValue?: any | any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    valueChange?: any
    selected?: boolean
    action?: (args?: unknown) => void | Promise<void>    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    searchAction?: ( data: any[] ) => any[]
    view: {
        selection: boolean
        actions?: (( args: unknown ) => unknown)[] | null
    }
}

export class FieldStore {
    state: FieldState

    constructor( fieldState: FieldState ) {
        this.state = fieldState
    }

    setLabel = ( label: string ): void => {
        this.state.label = label
    }

    setKey = ( key: string ): void => {
        this.state.key = key
    }

    setViewColumns = ( viewColumns: boolean ): void => {
        this.state.viewColumns = viewColumns
    }
    
    setSearchable = ( searchable: boolean ): void => {
        this.state.searchable = searchable
    }
    setType = ( type: string ): void => {
        this.state.type = type
    }

}
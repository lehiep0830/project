/* eslint-disable @typescript-eslint/no-explicit-any */
import { acceptHMRUpdate, defineStore } from 'pinia'
import type { Option } from '@/interface/table.interface';
import type { FormState, GroupFormLayout } from '@/interface/form.interface';
import { camelToSnake } from '@/common/utils';
import type { FieldStore } from './field';


export class FormStore {
    state: GroupFormLayout
    render: FormState

    constructor(fieldStore: FormState = { group: {} } ) {
        this.state = { fields: {} }
        Object.keys(fieldStore.group).forEach( groupKey => {
            const group = fieldStore.group[groupKey];
            group.forEach( group => {
                for ( const fieldKey in group.fields ) {
                    this.state.fields[fieldKey] =  group.fields[fieldKey]
                }
            } )
        } )
        this.render = fieldStore
    }

    setType = ( fieldKey: string, type: string ): void => {
        if (this.state.fields[fieldKey] ) {
            this.state.fields[fieldKey].store.state.type = type
        }
    }

    setConditionShow = async ( fieldKey: string, conditionShow: { withField: string[]; operator: (context: {store: FieldStore[]}) => Promise<boolean> } ) => {
        if (this.state.fields[fieldKey] ) {
            this.state.fields[fieldKey].conditionShow = await conditionShow
        }
    }

    setFormValue = ( fieldKey: string, formValue: unknown ): void => {
        if (this.state.fields[fieldKey] ) {
            this.state.fields[fieldKey].store.state.formValue = formValue
        }
    }

    setDefaultValue = ( fieldKey: string, defaultValue: unknown ): void => {
        if (this.state.fields[fieldKey] ) {
            this.state.fields[fieldKey].store.state.defaultValue = defaultValue
        }
    }

    getFormOption = (fieldName: string): Option => {
        return {
            key: this.state.fields[fieldName].store.state.key,
            label: this.state.fields[fieldName].store.state.label,
            value: this.state.fields[fieldName].store.state.formValue,
            type: this.state.fields[fieldName].store.state.type
        }
    };

    setAction = ( fieldKey: string, action: (( args?: unknown ) => Promise<void>)): void => {
        if (this.state.fields[fieldKey] ) {
            this.state.fields[fieldKey].store.state.action = action
        }
    }

    setMinSpaceLabelAll = ( minSpaceLabel: string ): void => {
        for ( const fieldKey in this.state.fields ) {
            this.state.fields[fieldKey].store.state.useMinSpace = true
            this.state.fields[fieldKey].store.state.minSpaceLabel = minSpaceLabel
        }
    }

    formConverttoPayload = (item: {key: string; value: unknown}[], conditionConvertCamelToSnake: boolean): Record<string, unknown> => {
        return item.reduce((acc, curr) => {
            if(conditionConvertCamelToSnake) acc[camelToSnake(curr.key)] = curr.value;
            else acc[curr.key] = curr.value;
            return acc;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }, {} as Record<string, any>);
    }
}

export const useFormStore = defineStore('Form', () => {
    const getStore = ( fields: FormState ): FormStore => {
        return new FormStore( fields )
    }

    return {
        getStore
    }
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useFormStore, import.meta.hot))
}
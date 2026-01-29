import type { FieldStore } from "@/store/field"

export interface FormLayoutInterface {
    store: FieldStore,
    conditionShow?: {
        withField: string[],
        operator: (context: {store: FieldStore[]}) => Promise<boolean>
    }
    [key: string]: unknown
}

export interface GroupFormLayout {
    fields: {
        [key: string]: FormLayoutInterface
    }
}

export interface FormState {
    group: {
         [key: string]: GroupFormLayout[]
    }
}

export enum FormFieldType {
    TEXT = 'text',
    NUMBER = 'number',
    SELECT = 'select',
    MULTI_SELECT = 'multi_select',
    DATE = 'date',
    CHECKBOX = 'checkbox',
    RADIO = 'radio',
    TEXTAREA = 'textarea'
}
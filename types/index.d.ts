
import Vue from 'vue'
import { ElInput } from 'element-ui/types/input'
// for future
// export interface InstallationOptions {}
// export function install (vue: typeof Vue, options: InstallationOptions): void

// now
export function install(vue: typeof Vue): void

export type ValueType = string | number | string[] | number[]

export type DataType = 'default' | 'custom'

export interface IOptionAttrs {
  value: string // option value 对应字段
  label: string // option label 对应字段
}

export interface IOption {
  hidden?: boolean // 是否隐藏选项
  disabled?: boolean // 是否禁用选项
  [key: string]: any
}

export interface IPage {
  name?: string
  pageNo?: number
  pageSize?: number
  defaultName?: string
}

export type params<P> = IPage | P

export interface INetWork<P> {
  method: Function
  params?: params<P>
}

export interface IChangeProp {
  value: ValueType
  options: IOption[]
}

export interface IPSelect<P> extends ElInput {
  optionAttrs: IOptionAttrs
  dataType: DataType
  netWork: INetWork<P>
  options: IOption[]
  width: string | number
  lazy: boolean
  pageSize: number
  load: boolean
}

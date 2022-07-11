import { omit } from 'lodash'
import { CreateElement, VNode } from 'vue'
import { Component, Emit, Model, Prop, Vue, Watch } from 'vue-property-decorator'
import { ValueType, IOptionAttrs, IOption, params, INetWork, IChangeProp } from '../../../types'

import './directives/load-more'

interface IParams {
  [key: string]: unknown
}

@Component({ name: 'PSelect' })
export default class PSelect extends Vue {
  // v-model 双向绑定
  @Model('model-change', { type: [String, Number, Array], required: true })
  private readonly value!: ValueType

  // 更新 v-model
  @Emit('model-change')
  private modelChange(value: ValueType): ValueType {
    return value
  }

  // option 配置
  @Prop({ type: Object, default: () => ({ value: 'value', label: 'label', disabled: false }) }) private readonly optionAttrs!: IOptionAttrs

  // 下拉框数据类型   default - 默认(options)  custom - 自定义接口
  @Prop({ type: String, default: 'default' }) private readonly dataType!: 'default' | 'custom'

  // dataType 为 custom 时，接口请求配置
  @Prop({ type: Object, default: () => ({}) }) private readonly netWork!: INetWork<IParams>

  // 下拉数据选项，默认使用options字段中的数据作为下拉选项数据源
  @Prop({ type: Array, default: () => [] }) private readonly options!: IOption[]

  // 选择框宽度
  @Prop({ type: [String, Number], default: '150px' }) private readonly width!: string | number

  // 是否懒加载
  @Prop({ type: Boolean, default: false }) private readonly lazy!: boolean

  // 懒加载单页数据条数
  @Prop({ type: Number, default: 10 }) private readonly pageSize!: number

  // 是否开始加载
  @Prop({ type: Boolean, default: true }) private readonly load!: boolean

  private model: ValueType = ''

  private apiOptions: IOption[] = []

  @Watch('value', { immediate: true })
  private echo(newVal: ValueType) {
    this.model = newVal
  }

  @Watch('netWork', { immediate: true, deep: true })
  private async netWorkChange() {
    this.apiOptions = []
    this.pageNo = 1
    this.getOption()
  }

  private pageNo = 1

  private name = ''

  // 是否使用默认name查询
  private userDefault = true

  private async getOption() {
    if (!this.load) {
      this.apiOptions = []
      return
    }
    try {
      if (this.dataType === 'custom') {
        const params: params<IParams> = this.netWork.params as params<IParams>
        if (this.lazy) {
          params.name = this.name
          params.pageNo = this.pageNo
          params.pageSize = this.pageSize
          if (Object.prototype.hasOwnProperty.call(this.netWork.params, 'defaultName') && this.userDefault) {
            params.name = (this.netWork.params as params<IParams>).defaultName
          }
        }
        const res = await this.netWork.method(params)

        if (res.code === 200) {
          if (this.netWork.params && Object.prototype.hasOwnProperty.call(this.netWork.params, 'defaultName') && this.userDefault) {
            this.apiOptions = []
          }
          this.apiOptions = this.apiOptions.concat(res.data)
          this.updataOption(this.apiOptions)
        } else {
          this.$message.error(res.msg)
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  @Emit('updata-option')
  private updataOption(options: IOption[]): IOption[] {
    return options
  }

  private loadMore() {
    if (!this.lazy) return
    this.pageNo += 1
    this.getOption()
  }

  get getOptions(): IOption[] {
    return this.dataType === 'custom' ? this.apiOptions : this.options
  }

  // 重写 el-select change 事件，更新 v-model 绑定值
  @Emit('change')
  private selectChange(value: ValueType): IChangeProp {
    this.modelChange(value)
    return {
      value: value,
      options: this.getOptions
    }
  }

  // 动态设置 select 宽度
  get selectStyle() {
    return {
      width: typeof this.width === 'string' ? this.width : `${this.width}px`
    }
  }

  // 输入查询条件
  private filterMethod(name: string) {
    // 输入查询条件后不再使用默认查询条件
    this.userDefault = false
    this.name = name
    this.apiOptions = []
    this.pageNo = 1
    this.getOption()
  }

  render(h: CreateElement): VNode {
    const props = omit(this.$attrs, ['optionAttrs', 'dataType', 'options', 'kind', 'lazy', 'pageSize', 'filter-method'])
    const selectListeners = omit(this.$listeners, ['model-change', 'change'])
    const renderOption = (options: IOption[]) => options.filter((i: IOption) => !i.hidden).map((i: IOption) => {
      return (
        <el-option
          key={i[this.optionAttrs.value]}
          value={i[this.optionAttrs.value]}
          label={i[this.optionAttrs.label]}
          disabled={i.disabled}
        ></el-option>
      )
    })

    return (
      <el-select
        v-model={this.model}
        v-load-more={this.loadMore}
        {...{ props: props, on: selectListeners }}
        filter-method={this.lazy ? this.filterMethod : null}
        on-change={this.selectChange}
        style={this.selectStyle}
      >
        {renderOption(this.getOptions)}
      </el-select>
    )
  }
}

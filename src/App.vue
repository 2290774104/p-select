<template>
  <div>
    <p-el-select
      v-model="model"
      :optionAttrs="{value: 'code', label: 'label'}"
      :options="options"
      placeholder="请选择"
      clearable
      width="200px"
    />
    <p-el-select
      v-model="model2"
      :optionAttrs="{value: 'code', label: 'label'}"
      dataType="custom"
      :netWork="netWork"
      placeholder="请选择"
      clearable
      filterable
      lazy
      width="200px"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { INetWork } from '../types'

interface IParams {
  name: string
  pageNo: number
  pageSize: number
}

@Component
export default class App extends Vue {
  private model = ''

  private options = [
    { code: '1', label: '选项1' },
    { code: '2', label: '选项2' },
    { code: '3', label: '选项3' },
    { code: '4', label: '选项4' },
  ]

  private model2 = ''

  private netWork: INetWork<IParams> = {
    method: (params: IParams) => {
      const options = []
      for (let i = 0; i < params.pageSize; i++) {
        options.push({
          code: `${(params.pageNo - 1) * 10 + i + 1}`,
          label: `选项${(params.pageNo - 1) * 10 + i + 1}`,
        })
      }
      return {
        code: 200,
        data: options.filter(i => i.label.includes(params.name)),
      }
    },
    params: {},
  }
}
</script>

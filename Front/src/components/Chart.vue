<template>
  <div>
    <fusioncharts
    :type="type"
    :width="width"
    :height="height"
    :dataFormat="dataFormat"
    :dataSource="dataSource"
    >
    </fusioncharts>
  </div>
</template>

<script>
export default {
  name: 'Chart',
  props: {
    data: {
      type: Object,
      required: false,
      default: null
    }
  },
  data () {
    return {
      type: "column3d",
      width: "100%",
      height: "100%",
      dataFormat: "json",
      dataSource: {
        chart: {
          caption: "Opportunity Zone Benefit",
          decimals: "1",
          numberPrefix: "$",
          theme: "fusion"
        },
        data: [
          // {
          //   label: "State Tax",
          //   value: 0
          // },
          {
            label: "Federal Tax",
            value: 0
          },
          {
            label: "Ending Value Without OZ after tax",
            value: 0
          },
          {
            label: "Ending Value With OZ after tax",
            value: 0
          }
        ]
      }
    }
  },
  watch: {
    data: function () {
      this.dataSource.data[1].value = this.data.first
      this.dataSource.data[2].value = this.data.second
      // this.dataSource.data[0].value = ((this.data.second - this.data.first) / 3).toFixed(2)
      this.dataSource.data[0].value = ((this.data.second - this.data.first) / 3).toFixed(2) * 2
    }
  }
};
</script>
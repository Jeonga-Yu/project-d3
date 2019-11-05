<template>
  <div id="app">
    <scurve v-if="construction" :chartData="construction" :w="1000" :h="500"/>
  </div>
</template>
<script>
import scurve from '@/components/scurve'
import axios from '@/plugins/axios'
import source from './source/chart.json'
export default {
  data () {
    return {
      construction: null
    }
  },
  name: 'app',
  components: {
    scurve
  },
  async created () {
    this.construction = source
    // const construction = await axios.get('/d3/construction')
    // this.construction = construction.data
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

<template>
  <div>
    <div class="legend-wrap" :style="{width: w+'px', height:'30px'}">
      <div v-for="(d, i) in legend" :key="i" class="legend-item">
        <div class="legend-wrap" @click="active(d)">
          <div class="legend-icon" :style="{background: colors[i]}"></div>
          <div>{{d}}</div>
        </div>
      </div>
    </div>
    <div id="chart"></div>
  </div>
</template>
<script>
import * as d3 from 'd3'
import _ from 'lodash'
import source from '../../source/chart.json'
import moment from 'moment'
export default {
  props: ['chartData', 'w', 'h'],
  data () {
    return {
      legend: [],
      disabled: [],
      dates: null,
      colors:['#C62828','#1565C0','#00695C','#EF6C00','#424242','#880E4F','#283593','#00838F','#558B2F','#F9A825','#4E342E','#6A1B9A','#0277BD','#2E7D32','#81D4FA','#F48FB1'],
      worktypedata: null,
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 25
      }
    }
  },
  created() {
    this.init()
  },
  mounted() {
    this.drawChart(this.chartData)
  },
  methods: {
    init() {
      const date = _.chain(this.chartData).map('CDATE').value()
      this.dates = date

      const worktypedata = _.groupBy(source, 'WORK_TYPE')
      this.worktypedata = worktypedata
      const worktype = _.keys(worktypedata)
      // const legend = worktype.concat(_.keys(_.omit(source[0], ['WORK_TYPE', 'CDATE'])))
      const legend = worktype
      this.legend = legend

      const src = _.groupBy(source, 'CDATE')

      // const setSrc = _.chain(worktypedata)
      // .map((d, k) => {
      //   console.log(d)
      //   // console.log(k)
      //   return {
      //     CATEGORY: k,
      //     VALUES : [
      //       { KEY: 'PI010', VALUE: _.filter(d, v=> {return v.WORK_TYPE === 'PI010'}) }
      //       // { KEY: 'PI020_L4_WEEK', VALUE: d['PI020_L4_WEEK'] },
      //       // { KEY: 'PI020_ACTUAL_WEEK', VALUE: d['PI020_ACTUAL_WEEK'] },
      //       // { KEY: 'PI020_CBSR4_PROG', VALUE: d['PI020_CBSR4_PROG'] },
      //       // { KEY: 'PI020_L4_PROG', VALUE: d['PI020_L4_PROG'] },
      //       // { KEY: 'PI020_ACTUAL_PROG', VALUE: d['PI020_ACTUAL_PROG'] },
      //     ]
      //   }
      // })
      // .value()

      // console.log(setSrc)

    },
    active(item) {
      console.log(item)
      let arr = this.disabled
      const idx = arr.indexOf(item)
      const chartData = this.chartData
      let filterList = chartData

      if (idx !== -1) { arr.splice(idx, 1) }
      else { arr.push(item) }

      arr.forEach((a, k) => {
        const filter = _.filter(filterList, d => {
          return d.WORK_TYPE !== a
        })
        filterList = filter
      })


      this.drawChart(filterList)

    },
    drawChart(data) {

      console.log(data)

      d3.select('#chart').select('svg').remove()
      

      const svg = d3.select('#chart')
        .append('svg')
        .attr('width', this.w + this.margin.left + this.margin.right)
        .attr('height', this.h + this.margin.top + this.margin.bottom)
        .append('g')
        .attr('transform', 'translate('+this.margin.left+','+this.margin.top+')')

      const xscale = d3.scaleTime()
        .domain(d3.extent(this.dates, function(d) { return new Date(d) }))
        .range([0, this.w])

      // const yscale = d3.scaleLinear()
      //   .domain([0, 100])
      //   .range([this.h, 0])

      const yscale = d3.scaleLinear()
        .rangeRound([this.h, 0])
        .domain([0, 100])

      const div = d3.select('body').append('div')
        .attr('class', 'tooltip')
      
      div.append('text')
        .attr('class', 'tooltip-date')

      div.append('text')
        .attr('class', 'tooltip-actualprog')

      svg.append('g')
        .attr('transform', 'translate(0,'+this.h+')')
        .style('color', 'ccc')
        .style('font-color', 'black')
        .call(d3.axisBottom(xscale))

      // svg.append('g')
      //   .attr('transform', 'translate(0,0)')
      //   .call(d3.axisLeft(yscale))

      svg.append('g')
        .attr('class', 'grid')
        .style('color', 'ccc')
        .call(make_y_gridlines()
        .tickSize(-this.w)
        )

      function make_y_gridlines() {		
        return d3.axisLeft(yscale)
          // .ticks(7)
      }


      const line = d3.line()
        .x(function(d, i) { return xscale(new Date(d.CDATE)) })
        .y(function(d) { return yscale(d.ACTUAL_PROG * 100) })
        // .curve(d3.curveMonotoneX)

      
      // const line2 = d3.line()
      //   .x(function(d, i) { return xscale(new Date(d.CDATE)) })
      //   .y(function(d) { return yscale(d.L4_PROG * 100) })
      //   // .curve(d3.curveMonotoneX)

      
      const _this = this


      svg.append('path')
        // .datum(this.worktypedata.PI020)
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', function(d, k) { return _this.colors[k] })
        .attr('d', line)
        .on('mouseover', function(){ div.style('display', null) })
        .on('mouseout', function(){ div.style('display', 'none') })
        .on('mousemove', mousemove)
      
      const bisectDate = d3.bisector(function(d) { return d.CDATE; }).left
      
      function mousemove() {
        const x0 = xscale.invert(d3.mouse(this)[0])
        const i = bisectDate(data, x0, 1)
        const d0 = data[i - 1]
        const d1 = data[i]
        const d = x0 - d0.date > d1.date - x0 ? d1 : d0
        console.log(x0)
        div.attr("transform", "translate(" + xscale(new Date(d.CDATE)) + "," + yscale(d.ACTUAL_PROG) + ")")
        // div.select(".tooltip-date").text(new Date(d.CDATE))
        div.select(".tooltip-actualprog").text(d.ACTUAL_PROG)
      }


      // svg.append('path')
      //   .datum(this.chartData)
      //   .attr('fill', 'none')
      //   .attr('stroke', function(d, k) { return _this.colors[2] })
      //   .attr('d', line2)

      // svg.transition()
      //   .delay(750)
      //   .duration(1000)
      //   .ease('linear')
      //   .each('end', function() {

      //   })

      // const textLabels = svg.selectAll('text')
      //   .data(this.chartData)
      //   .enter()
      //   .append('text')
      //   .text(function(d) { return (d.L4_PROG * 100).toFixed(2) })
      //   .attr('x', function(d) { return xscale(new Date(d.CDATE)) })
      //   .attr('y', function(d) { return yscale(d.L4_PROG * 100) })
      //   .style('font-size', '.6em')

      // // const textLabels = d3.selectAll('text').nodes()
      // // console.log(textLabels)
      // function relax() {
      //   textLabels.each(d => {
      //     console.log(d)
      //     console.log(this)
      //     const a = this
      //     // console.log(d)
      //     // console.log(a)
      //     const da = d3.select(a)
      //     // console.log(da.node())
          
      //     const y1 = da.attr('y')
      //     textLabels.each(v=> {
      //       const b = this
      //       if(a === b) return
      //       const db = d3.select(b)
      //       // if(da.attr('text-'))
      //       const y2 = db.attr('y')
      //       const delta = y1 - y2

      //       da.attr('y', y1 + delta)
      //       db.attr('y', y2 + delta)
      //     })
      //   })
      // }

      // relax()


      // const line2 = d3.line()
      //     .x(function(d, i) { return xscale(new Date(d.CDATE)) })
      //     .y(function(d) { return yscale(d.PI060_ACTUAL_PROG * 100) })
      //     .curve(d3.curveMonotoneX)

      //   svg.append('path')
      //     .datum(this.chartData)
      //     .attr('fill', 'none')
      //     .attr('stroke', this.colors[2])
      //     .attr('d', line2)


      // const line3 = d3.line()
      //   .x(function(d, i) { return xscale(new Date(d.CDATE)) })
      //   .y(function(d) { return yscale(d.PI090_ACTUAL_PROG * 100) })
      //   .curve(d3.curveMonotoneX)

      // svg.append('path')
      //   .datum(this.chartData)
      //   .attr('fill', 'none')
      //   .attr('stroke', this.colors[3])
      //   .attr('d', line3)

      //   const worktype = this.worktypedata

      //   // _.forEach(worktype, (d, type) => {
      //   //   console.log(type)
      //   //   console.log(d)
      //   // })

      // const x1 = d3.scaleBand()
      //   .rangeRound([0, this.w])
      //   .domain(function(d) { return new Date(d)})
      
      // const y1 = d3. scaleLinear()
      //   .rangeRound([this.h, 0])
      //   .domain([0, 1000])

      // // console.log(y1(359))

      // const _this = this

      // svg.append('rect')
      //   .data(this.chartData)
      //   .attr('x', function(d) { return x1(new Date(d.CDATE)) })
      //   .attr('y', function(d) { return y1(d.PI020_ACTUAL_WEEK) })
      //   .attr('width', 10)
      //   .attr('height', function (d) {
      //     // console.log(_this.h)
      //     // console.log( y1(Number(d.PI020_ACTUAL_WEEK)))
      //     return _this.h - y1(Number(d.PI020_ACTUAL_WEEK));
      //   })

      // svg.append('rect')
      //   .data(this.chartData)
      //   .attr('x', function(d) { return x1(new Date(d.CDATE)) })
      //   .attr('y', function(d) { return y1(d.PI030_ACTUAL_WEEK) })
      //   .attr('width', 10)
      //   .attr('height', function (d) {
      //     // console.log(_this.h)
      //     // console.log( y1(Number(d.PI020_ACTUAL_WEEK)))
      //     return _this.h - y1(Number(d.PI030_ACTUAL_WEEK));
      //   })

    }
  }
}
</script>
<style lang="scss">
.legend-wrap {
  display: flex;
  .legend-item { 
      display: flex;
      font-size: 10px;
      &:hover {
        cursor: pointer;
      }
      &:not(:last-child) {
        margin-right:5px;
      }
      .legend-icon {
        width: 8px;
        height: 8px;
        margin-right: 5px;
      }    
    }
  }

</style>

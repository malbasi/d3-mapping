import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 300 - margin.top - margin.bottom
let width = 330 - margin.left - margin.right

let container = d3.select('#chart-6')

let projection = d3.geoAlbersUsa()

let path = d3.geoPath().projection(projection)

let colorScale = d3
  .scaleOrdinal()
  .range([
    '#8dd3c7',
    '#ffffb3',
    '#bebada',
    '#fb8072',
    '#80b1d3',
    '#fdb462',
    '#b3de69',
    '#fccde5'
  ])

Promise.all([
  d3.json(require('./data/us_states.topojson')),
  d3.csv(require('./data/powerplants.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, allPoints]) {
  let states = topojson.feature(json, json.objects.us_states)

  let radiusScale = d3.scaleSqrt().range([2, 10])

  var mw = allPoints.map(d => d.Total_MW)
  radiusScale.domain(mw)

  projection.fitSize([width, height], states)

  var nested = d3
    .nest()
    .key(function(d) {
      return d.PrimSource
    })
    .entries(allPoints)

  container
    .selectAll('.temp-graph')
    .data(nested)
    .enter()
    .append('svg')
    .attr('class', 'temp-graph')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .each(function(d) {
      var svg = d3.select(this)
      var datapoints = d.values 

      svg
        .selectAll('.state')
        .data(states.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', 'lightgrey')
        .attr('stroke', 'lightgrey')
        .lower()

      // svg
      //   .datum(datapoints)
      //   .append('circle')
      //   .attr('class', 'plants')
      //   .attr('r', 5)
      //   .attr('cx', 0)
      //   .attr('cy', 0)
      //   .attr('transform', d => {
      //     console.log(d[0].Longitude) 
      //     let coords = projection([d.Longitude, d.Latitude])
      //     return `translate(${coords})`
      //   })
      //   .attr('fill', d => colorScale(d.PrimSource))
      //   .attr('opacity', 0.7)

      // console.log('this is d', d)
      // console.log(states.features)
    })
}
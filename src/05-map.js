import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 150, right: 0, bottom: 0 }

let height = 600 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-5')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

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

  svg
    .selectAll('.state')
    .data(states.features)
    .enter()
    .append('path')
    .attr('class', 'state')
    .attr('d', path)
    .attr('fill', 'lightgrey')
    .attr('stroke', 'lightgrey')
    .lower()

  svg
    .selectAll('.plants')
    .data(allPoints)
    .enter()
    .append('circle')
    .attr('class', 'plants')
    .attr('r', d => radiusScale(d.Total_MW))
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('transform', d => {
      let coords = projection([d.Longitude, d.Latitude])
      return `translate(${coords})`
    })
    .attr('fill', d => colorScale(d.PrimSource))
    .attr('opacity', 0.7)

  svg
    .selectAll('.stateNames')
    .data(states.features)
    .enter()
    .append('text')
    .attr('class', 'stateNames')
    .text(d => {
      return d.properties.abbrev
    })
    .attr('transform', d => {
      let coords = path.centroid(d)
      return `translate(${coords})`
    })
    .attr('text-anchor', 'middle')
    .style(
      'text-shadow',
      '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff'
    )

  // make the legend
  let legend = svg.append('g').attr('transform', 'translate(50, 50)')

  legend
    .selectAll('.legend-entry')
    .data(colorScale.domain())
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(-175,${i * 35})`)
    .attr('class', 'legend-entry')
    .each(function(d) {
      let g = d3.select(this)

      g.append('circle')
        .attr('r', 10)
        .attr('cx', 0)
        .attr('cy', 30)
        .attr('fill', d => {
          return colorScale(d)
        })

      g.append('text')
        .text(d.charAt(0).toUpperCase() + d.slice(1))
        .attr('dx', 15)
        .attr('dy', 30)
        .attr('alignment-baseline', 'middle')
    })
}

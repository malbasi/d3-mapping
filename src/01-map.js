import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .style('background', 'black')
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoMercator()
let graticule = d3.geoGraticule()

let path = d3.geoPath().projection(projection)

Promise.all([
d3.json(require('./data/world.topojson')),
d3.csv(require('./data/world-cities.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, allPoints]) {
  let countries = topojson.feature(json, json.objects.countries)

  var xExtent = d3.extent(allPoints, d => +d.lng)
  var yExtent = d3.extent(allPoints, d => +d.lat)

  let xPositionScale = d3
    .scaleLinear()
    .domain(xExtent)
    .range([0, width])

  let yPositionScale = d3
    .scaleLinear()
    .domain(yExtent)
    .range([height, 0])
  
  let countryExtent = d3.extent(allPoints, d => d.population)

  var colorScale = d3.scaleSequential(d3.interpolateCool)
    .domain(countryExtent)
    .clamp(true)

  svg
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', 'black')

  svg
    .append('path')
    .datum(graticule())
    .attr('d', path)
    .attr('stroke', 'lightgrey')
    .attr('stroke-width', 0.5)
    .attr('fill', 'yellow')
    .lower()

  svg.append('g')
    .selectAll('circle')
    .data(allPoints)
    .enter().append('circle')
    .attr('r', 1)
    .attr('transform', d => {
      let coords = projection([d.lng, d.lat])
      return `translate(${coords})`
    })
    .attr('fill', d => colorScale(d.population))
    .attr('opacity', 0.7)
}
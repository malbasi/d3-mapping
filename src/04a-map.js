import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-4a')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoAlbersUsa()

let path = d3.geoPath().projection(projection)

let alphaScale = d3
  .scaleLinear()
  .domain([200, 150000])
  .range([0, 1])

d3.json(require('./data/counties_with_election_data.topojson'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(json) {
  let counties = topojson.feature(json, json.objects.us_counties)

  projection.fitSize([width, height], counties)

  svg
    .selectAll('.state')
    .data(counties.features)
    .enter()
    .append('path')
    .attr('class', 'state')
    .attr('d', path)
    .attr('fill', d => {
      if (d.properties.trump > d.properties.clinton) {
        return 'green'
      } else {
        return 'pink'
      }
    })
    .attr('opacity', d => {
      let trump = d.properties.trump
      let clinton = d.properties.clinton
      let totalVotes = trump + clinton
      return alphaScale(totalVotes)
    })
}

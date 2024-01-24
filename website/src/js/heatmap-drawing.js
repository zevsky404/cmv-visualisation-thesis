// CONSTANTS
import * as d3 from "d3";

const margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 1800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

function drawHeatmap(filename) {
    d3.csv(`../output/occurrences/${filename}`, d3.autoType).then(function (data) {
    // DRAWING SETUP
        console.log(data)
    let svg = d3.select("#main-container")
        .append("svg")
            .attr("width", width + margin.left + margin.right + 600)
            .attr("height", height + margin.top + margin.bottom + 35)
        .append("g")
            .attr("id", "padding")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const groupsX = ["V", "T", "R", "P", "F"];
    const varsY = ["V", "T", "R", "P", "F"];

    let xAxis = d3.scaleBand()
        .range([0, width])
        .domain(groupsX)
        .padding(0.3);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xAxis));

    let yAxis = d3.scaleBand()
        .range([height, 0])
        .domain(varsY)
        .padding(0.3);

    svg.append("g")
        .call(d3.axisLeft(yAxis));

    const colours = d3.scaleSequential()
    .interpolator(d3.interpolateOrRd)
    .domain(d3.extent(data.map((d) => { return d.amount - 1; })));

    svg.selectAll()
        .data(data, (d) => { return `${d.group}:${d.variable}` })
        .enter()
        .append("rect")
        .attr("x", (d) => { return xAxis(d.group); })
        .attr("y", (d) => { return yAxis(d.variable); })
        .attr("width", xAxis.bandwidth)
        .attr("height", yAxis.bandwidth)
        .style("fill", (d) => { return colours(d.amount); });

    });
}

drawHeatmap("occs_overall.csv")
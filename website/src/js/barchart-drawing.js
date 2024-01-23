// CONSTANTS
import * as d3 from "d3";

const margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 1800 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

const colours = d3.scaleOrdinal()
    .range(["#d53e4f","#fc8d59","#fee08b","#e6f598","#99d594","#3288bd"])
    .domain(d3.extent([0,5]));


function drawBarchart(filename) {
    d3.csv(`../output/sequences/${filename}`, d3.autoType).then( function (data) {

    // DRAWING SETUP
    let svg = d3.select("#main-container")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom + 35)
        .append("g")
            .attr("id", "padding")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
        let xAxis = d3.scaleBand()
            .range([0, width])
            .domain(data.map((d) => { return d.sequence; } ))
            .padding(0.4);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("id", "x-axis")
        .call(d3.axisBottom(xAxis))
        .selectAll("text")
            .attr("transform", "translate(-10, 0)rotate(-45)")
            .style("text-anchor", "end");

    let yAxis = d3.scaleLinear()
        .domain(d3.extent(data.map((d) => { return d.frequency - 1; })))
        .range([height, margin.top]);

    svg.append("g")
        .attr("id", "y-axis")
        .call(d3.axisLeft(yAxis))

    svg.selectAll("bars")
        .data(data)
        .enter()
        .append("rect")
            .attr("x", (d) => { return xAxis(d.sequence); })
            .attr("y", (d) => { return yAxis(d.frequency); })
            .attr("width", xAxis.bandwidth())
            .attr("height", (d) => { return height - yAxis(d.frequency); })
            .attr("fill", "#1D2B53");
    }
)
}

drawBarchart("overall.csv")
drawBarchart("c1.csv")
drawBarchart("c2.csv")
drawBarchart("c3.csv")
drawBarchart("c4.csv")
drawBarchart("c5.csv")
drawBarchart("c6.csv")

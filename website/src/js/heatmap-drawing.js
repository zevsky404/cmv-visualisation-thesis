// CONSTANTS
import * as d3 from "d3";

const margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

function drawHeatmap(filename) {
    d3.csv(`../output/occurrences/${filename}`, d3.autoType).then(function (data) {
    // DRAWING SETUP
    let svg = d3.select("#main-container")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom + 35)
        .append("g")
            .attr("id", "padding")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const groupsX = ["V", "T", "R", "P", "F"];
    const varsY = ["V", "T", "R", "P", "F"];

    // title
    svg.append("text")
        .attr("x", -20)
        .attr("y", -12)
        .attr("text-anchor", "center")
        .style("font-size", "22px")
        .text(filename);

    let xAxis = d3.scaleBand()
        .range([0, width])
        .domain(groupsX)
        .padding(0.03);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xAxis));

    let yAxis = d3.scaleBand()
        .range([height, 0])
        .domain(varsY)
        .padding(0.03);

    svg.append("g")
        .call(d3.axisLeft(yAxis));

    const colours = d3.scaleSequential()
    .interpolator(d3.interpolateBlues)
    .domain(d3.extent(data.map((d) => { return d.amount - 1; })));

    // create a tooltip
    const tooltip = d3.select("#main-container")
    .append("div")
        .style("opacity", 0)
        .style("position", "absolute")
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function(event, d) {
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
    }
    const mousemove = function(event, d) {
    tooltip
      .html(`This sequence appeared</br> <b>${d.amount}</b> time(s)`)
      .style("left", `${event.x + 20}px`)
      .style("top", `${event.y + 20}px`)
    }
    const mouseleave = function(event, d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
    }

    svg.selectAll()
        .data(data, (d) => { return `${d.group}:${d.variable}` })
        .enter()
        .append("rect")
        .attr("x", (d) => { return xAxis(d.group); })
        .attr("y", (d) => { return yAxis(d.variable); })
        .attr("width", xAxis.bandwidth)
        .attr("height", yAxis.bandwidth)
        .style("fill", (d) => { return colours(d.amount); })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    });
}

drawHeatmap("occs_overall.csv")
drawHeatmap("occs_c1.csv")
drawHeatmap("occs_c2.csv")
drawHeatmap("occs_c3.csv")
drawHeatmap("occs_c4.csv")
drawHeatmap("occs_c5.csv")
drawHeatmap("occs_c6.csv")
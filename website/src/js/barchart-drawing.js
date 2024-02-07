// CONSTANTS
import * as d3 from "d3";

const margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 1200 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;


function drawBarchart(filename, parentElementId) {
    d3.csv(`../output/sequences/${filename}`, d3.autoType).then( function (data) {

    if (filename === "overall.csv") {
        data = data.slice(0, 100);
    }
    // DRAWING SETUP
    let svg = d3.select(`#${parentElementId}`)
        .append("svg")
            .attr("width", width + margin.left + margin.right + 600)
            .attr("height", height + margin.top + margin.bottom + 35)
            .attr("id", "main-svg")
        .append("g")
            .attr("class", "padding")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // title
    svg.append("text")
        .attr("x", -20)
        .attr("y", -7)
        .attr("text-anchor", "center")
        .style("font-size", "22px")
        .text(filename);

    let xAxis = d3.scaleBand()
            .range([0, width + 600])
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

    /*if (filename === "overall.csv") {
        d3.select("#main-svg").call(d3.zoom()
            .extent([[0,0], [width, height]])
            .scaleExtent([1,8])
            .on("zoom", zoomed));

        function zoomed({transform}) {
            svg.attr("transform", transform);
        }
    }*/

    });
}

function drawPieChart(filename, parentElementId) {
    d3.csv(`../output/occurrences/total/${filename}`, d3.autoType).then( function (data) {
        let convertedData = {};
        data.forEach((d) => {
            convertedData[d.adu_type] = +d.amount;
        });

        console.log(convertedData)

        const pieWidth = 450, pieHeight = 450, pieMargin = 40;

        // DRAWING SETUP
        const svg = d3.select(`#${parentElementId}`)
            .append("svg")
                .attr("width", pieWidth)
                .attr("height", pieHeight)
            .append("g")
                .attr("class", "padding")
                .attr("transform", `translate(${pieWidth/2}, ${pieHeight/2})`);

        // title
        svg.append("text")
            .attr("x", -100)
            .attr("y", -200)
            .attr("text-anchor", "center")
            .style("font-size", "22px")
            .text(filename);

        const radius = Math.min(pieWidth, pieHeight) / 2 - pieMargin;

        const colour = d3.scaleOrdinal()
            .range(["#23171b","#26bce1","#95fb51","#ff821d","#900c00"]);

        const pie = d3.pie()
            .value((d) => { return d[1]; });
        const pieData = pie(Object.entries(convertedData))

        const arcGenerator = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        svg.selectAll('pie-data')
          .data(pieData)
          .join('path')
          .attr('d', arcGenerator)
          .attr('fill', (d) => { return(colour(d.data[0])); })
          .attr("stroke", "black")
          .style("stroke-width", "2px")
          .style("opacity", 0.7);

        svg.selectAll('pie-data')
          .data(pieData)
          .join('text')
          .text(function(d){ return d.data[0][0]; })
          .attr("transform", function(d) { return `translate(${arcGenerator.centroid(d)})`; })
          .style("text-anchor", "middle")
          .style("font-size", 17)

        });
}

let newDiv;
let promise = new Promise((resolve) => {
    newDiv = document.createElement("div");
    newDiv.id = `data-total`;
    newDiv.className = "combined-data";
    resolve();
}).then(result => {
    drawBarchart(`overall.csv`, newDiv.id);
    drawPieChart(`total_overall.csv`, newDiv.id)
    document.getElementById("main-container").appendChild(newDiv);
})

for (let i = 1; i <= 6; ++i) {
    let newDiv;
    let promise = new Promise((resolve) => {
        newDiv = document.createElement("div");
        newDiv.id = `data-cluster-${i}`;
        newDiv.className = "combined-data";
        resolve();
    }).then(result => {
        drawBarchart(`c${i}.csv`, newDiv.id);
        drawPieChart(`total_c${i}.csv`, newDiv.id)
        document.getElementById("main-container").appendChild(newDiv);
    })
}



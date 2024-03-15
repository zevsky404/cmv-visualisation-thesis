// CONSTANTS
import * as d3 from "d3";

const margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 1200 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;


export function drawBarchart(pathToFile, parentElementId) {
    d3.csv(pathToFile, d3.autoType).then( function (data) {
        const pathArray = pathToFile.split("/");
        const chartTitle = pathArray[pathArray.length - 1];
        
        let getAttributeFromXData = (d) => {
            if (chartTitle.includes("ext_sequences")) {
                return d.sequence.length.toString();
            } else {
                return d.sequence;
            }
        };
        
        const dataX = data.map((d) => { return getAttributeFromXData(d); });
        const dataY = d3.extent(data.map((d) => { return d.frequency - 1; }));

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
            .text(chartTitle);

        // x axis setup
        let xAxis = d3.scaleBand()
            .range([0, width + 600])
            .domain(dataX)
            .padding(0.4);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .attr("id", "x-axis")
            .call(d3.axisBottom(xAxis))
            .selectAll("text")
                .attr("transform", "translate(-10, 0)rotate(-45)")
                .style("text-anchor", "end");

        // y axis setup
        let yAxis = d3.scaleLinear()
            .domain(dataY)
            .range([height, margin.top]);

        svg.append("g")
            .attr("id", "y-axis")
            .call(d3.axisLeft(yAxis))

        svg.selectAll("bars")
        .data(data)
        .enter()
        .append("rect")
            .attr("x", (d) => { return xAxis(getAttributeFromXData(d)); })
            .attr("y", (d) => { return yAxis(d.frequency); })
            .attr("width", xAxis.bandwidth())
            .attr("height", (d) => { return height - yAxis(d.frequency); })
            .attr("fill", "#1D2B53");

        if (pathToFile.includes("/overall.csv")) {
            console.log(true)
            d3.select("#main-svg").call(d3.zoom()
                .extent([[margin.left, margin.top], [width - margin.right, height - margin.top]])
                .scaleExtent([1,8])
                .on("zoom", zoomed));
        }

        function zoomed(e) {
            xAxis.range([margin.left, width - margin.right].map(d => e.transform.applyX(d)));
            svg.selectAll("rect")
                .attr("x", (d) => { return xAxis(getAttributeFromXData(d)); })
                .attr("width", xAxis.bandwidth());
            svg.select("#x-axis").call(d3.axisBottom(xAxis));
        }
    });
}

function drawPieChart(pathToFile, parentElementId) {
    d3.csv(pathToFile, d3.autoType).then( function (data) {
        let convertedData = {};
        data.forEach((d) => {
            convertedData[d.adu_type] = +d.amount;
        });

        const pieWidth = 450, pieHeight = 450, pieMargin = 40;

        // DRAWING SETUP
        const svg = d3.select(`#${parentElementId}`)
            .append("svg")
                .attr("width", pieWidth)
                .attr("height", pieHeight)
            .append("g")
                .attr("class", "padding")
                .attr("transform", `translate(${pieWidth/2}, ${pieHeight/2})`);

        const pathArray = pathToFile.split("/");
        const chartTitle = pathArray[pathArray.length - 1];

        // title
        svg.append("text")
            .attr("x", -100)
            .attr("y", -200)
            .attr("text-anchor", "center")
            .style("font-size", "22px")
            .text(chartTitle);

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
    drawBarchart(`../output/sequences/overall.csv`, newDiv.id);
    drawPieChart(`../output/occurrences/total/total_overall.csv`, newDiv.id);
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
        drawBarchart(`../output/sequences/c${i}.csv`, newDiv.id);
        drawPieChart(`../output/occurrences/total/total_c${i}.csv`, newDiv.id)
        document.getElementById("main-container").appendChild(newDiv);
    })
}



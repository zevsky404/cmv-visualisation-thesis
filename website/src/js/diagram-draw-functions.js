import * as d3 from "d3";

const margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 1000 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

export async function drawBarchart(pathToFile, parentElementId,
                                   chartWidth = 1000,
                                   chartHeight = 800,
                                   chartMargin = {top: 30, right: 30, bottom: 70, left: 60}) {
    let data = await d3.csv(pathToFile, d3.autoType);
    const pathArray = pathToFile.split("/");
    const chartTitle = pathArray[pathArray.length - 1];
    console.log("function executed")

        let getAttributeFromXData = (d) => {
            if (chartTitle.includes("ext_sequences")) {
                return d.sequence.length.toString();
            } else {
                return d.sequence;
            }
        };

        const dataX = data.map((d) => { return getAttributeFromXData(d); });
        const dataY = d3.extent(data.map((d) => { return  d.frequency; }));

        chartWidth = chartWidth - chartMargin.left - chartMargin.right;
        chartHeight = chartHeight - chartMargin.top - chartMargin.bottom;

        let svg = d3.create("svg")
            .attr("width", chartWidth + chartMargin.left + chartMargin.right)
            .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
            .attr("id", "main-svg");

        let g = svg.append("g")
            .attr("class", "padding")
            .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

        // title
        g.append("text")
            .attr("x", -20)
            .attr("y", -7)
            .attr("text-anchor", "center")
            .style("font-size", "22px")
            .text(chartTitle);

        // x axis setup
        let xAxis = d3.scaleBand()
            .range([0, chartWidth])
            .domain(dataX)
            .padding(0.4);
        g.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .attr("id", "x-axis")
            .call(d3.axisBottom(xAxis))
            .selectAll("text")
                .attr("transform", "translate(-10, 0)rotate(-45)")
                .style("text-anchor", "end");

        // y axis setup
        let yAxis = d3.scaleLinear()
            .domain([0, dataY[1]])
            .range([chartHeight, chartMargin.top]);

        g.append("g")
            .attr("id", "y-axis")
            .call(d3.axisLeft(yAxis))

        g.selectAll("bars")
        .data(data)
        .enter()
        .append("rect")
            .attr("x", (d) => { return xAxis(getAttributeFromXData(d)); })
            .attr("y", (d) => { return yAxis(d.frequency); })
            .attr("width", xAxis.bandwidth())
            .attr("height", (d) => { return chartHeight - yAxis(d.frequency); })
            .attr("fill", "#1D2B53");

        // add zoom to big overall charts
        if (pathToFile.includes("/overall")) {
            console.log(true)
            svg.call(d3.zoom()
                .extent([[chartMargin.left, chartMargin.top], [chartWidth - chartMargin.right, chartHeight - chartMargin.top]])
                .scaleExtent([1,8])
                //.translateExtent([[0,0], [0,0]])
                .on("zoom", zoomed));
        }

        function zoomed(e) {
            xAxis.range([chartMargin.left, chartWidth - chartMargin.right].map(d => e.transform.applyX(d)));
            g.selectAll("rect")
                .attr("x", (d) => { return xAxis(getAttributeFromXData(d)); })
                .attr("width", xAxis.bandwidth());
            g.select("#x-axis").call(d3.axisBottom(xAxis));
        }
        return svg;
}

export async function drawPieChart(pathToFile, parentElementId,
                                   pieWidth = 450,
                                   pieHeight = 450,
                                   pieMargin = 40) {
    let data = await d3.csv(pathToFile, d3.autoType);
    let convertedData = {};
        data.forEach((d) => {
            convertedData[d.adu_type] = +d.amount;
        });

        const svg = d3.create("svg")
            .attr("width", pieWidth)
            .attr("height", pieHeight);

        let g = svg.append("g")
                .attr("class", "padding")
                .attr("transform", `translate(${pieWidth/2}, ${pieHeight/2})`);

        const pathArray = pathToFile.split("/");
        const chartTitle = pathArray[pathArray.length - 1];

        pieWidth = pieWidth - pieMargin;
        pieHeight = pieHeight - pieMargin;

        // title
        g.append("text")
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

        g.selectAll('pie-data')
          .data(pieData)
          .join('path')
          .attr('d', arcGenerator)
          .attr('fill', (d) => { return(colour(d.data[0])); })
          .attr("stroke", "black")
          .style("stroke-width", "2px")
          .style("opacity", 0.7);

        g.selectAll('pie-data')
          .data(pieData)
          .join('text')
          .text(function(d){ return d.data[0][0]; })
          .attr("transform", function(d) { return `translate(${arcGenerator.centroid(d)})`; })
          .style("text-anchor", "middle")
          .style("font-size", 17)

    return svg;
}

export async function drawHeatmap(groups, vars, groupName, varsName, amountName, path,
                                  delta = true,
                                  containerId="#main-container",
                                  chartWidth = 540,
                                  chartHeight = 540,
                                  chartMargin = {top: 30, right: 30, bottom: 30, left: 30}) {
    let data = await d3.csv(`${path}`)
    // DRAWING SETUP
    let svg = d3.create("svg")
        .attr("width", chartWidth + chartMargin.left + chartMargin.right)
        .attr("height", chartHeight + chartMargin.top + chartMargin.bottom + 35);

    let g = svg.append("g")
            .attr("id", "padding")
            .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

    const groupsX = groups;
    const varsY = vars;

    chartWidth = chartWidth - chartMargin.left - chartMargin.right;
    chartHeight = chartHeight - chartMargin.top - chartMargin.bottom;

    // title
    g.append("text")
        .attr("x", -20)
        .attr("y", -12)
        .attr("text-anchor", "center")
        .style("font-size", "22px")
        .text(path);

    let xAxis = d3.scaleBand()
        .range([0, chartWidth])
        .domain(groupsX)
        .padding(0.03);

    g.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xAxis));

    let yAxis = d3.scaleBand()
        .range([chartHeight, 0])
        .domain(varsY)
        .padding(0.03);

    g.append("g")
        .call(d3.axisLeft(yAxis));

    const deltaColours = d3.scaleSequential()
    .interpolator(d3.interpolateGreens)
    .domain(d3.extent(data.map((d) => { return d[amountName] - 1; })));

    const nonDeltaColours = d3.scaleSequential()
    .interpolator(d3.interpolateReds)
    .domain(d3.extent(data.map((d) => { return d[amountName] - 1; })));

    const colours = delta ? deltaColours : nonDeltaColours;

    // create a tooltip
    const tooltip = svg.append("div")
        .style("opacity", 0)
        .style("position", "absolute")
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");


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
      .html(`This sequence appeared</br> <b>${d[amountName]}</b> time(s)`)
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

    g.selectAll()
        .data(data, (d) => { return `${d[groupName]}:${d[varsName]}`; })
        .enter()
        .append("rect")
            .attr("x", (d) => { return xAxis(d[groupName]); })
            .attr("y", (d) => { return yAxis(d[varsName]); })
            .attr("width", xAxis.bandwidth)
            .attr("height", yAxis.bandwidth)
            .style("fill", (d) => { return colours(d[amountName]); })
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

    return svg;
}

export async function drawStackedBar(pathToFile, parentId, barWidth= 600, barHeight = 100, barMargin = {top: 50, right: 30, bottom: 30, left: 30}) {
    let data = await d3.csv(`${pathToFile}`);
    const totalHeight = barHeight + margin.bottom + margin.top;
    const totalWidth = barWidth + margin.left + margin.right;

    const colourScheme = d3.scaleOrdinal(["#23171b","#2f9df5","#4df884","#dedd32","#f65f18","#900c00"])
        .domain(["c1", "c2", "c3", "c4", "c5", "c6"]);

    const total = d3.sum(data, d => parseInt(d.amount));
    const percentageScale = d3.scaleLinear()
        .domain([0, total])
        .range([0, 100]);

    let sumPriorValues = 0;
    const barData = data.map(d => {
        sumPriorValues += parseInt(d.amount);
        return {
            amount: parseInt(d.amount),
            cumulative: sumPriorValues - parseInt(d.amount),
            label: d.cluster,
            percentage: percentageScale(parseInt(d.amount))
        }
    }).filter(d => d.amount > 0);

    console.log(barData)

    const svg = d3.select(`${parentId}`)
        .append("svg")
        .attr("width", totalWidth)
        .attr("height", totalHeight);

    const xScale = d3.scaleLinear()
        .domain([0, total])
        .range([0, barWidth]);

    const g = svg.selectAll('g')
        .data(barData)
        .join('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    g.append("rect")
            .attr("class", "bar-stack")
            .attr("x", d => xScale(d.cumulative))
            .attr("y", barHeight / 2)
            .attr("height", barHeight)
            .attr("width", d => xScale(d.amount))
            .style("fill", d => colourScheme(d.label));

    g.append("text")
        .attr("class", "stack-text")
        .attr("text-anchor", "middle")
        .attr("x", d => xScale(d.cumulative) + xScale(d.amount) / 2)
        .attr("y", barHeight)
        .text(d => `${d.label}: ${d.percentage.toFixed(2)}`);

    return svg;
}

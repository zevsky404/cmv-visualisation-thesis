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

        let getAttributeFromXData = (d) => {
            if (chartTitle.includes("ext_sequences")) {
                return d.sequence.length.toString();
            } else {
                return d.sequence;
            }
        };

        const dataX = data.map((d) => { return getAttributeFromXData(d); });
        //console.log(`cluster: ${chartTitle} - amount sequences: ${dataX.length}`);
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
                .scaleExtent([1,12])
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
                                  chartWidth = 300,
                                  chartHeight = 300,
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
        .style("font-size", "18px")
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
    let parentContainer = d3.select(containerId)
    const tooltip = parentContainer.append("div")
        .style("opacity", 0)
        .style("position", "absolute")
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("font-size", "14px");


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
            .style("fill", (d) => { return d[amountName] != 0 ? colours(d[amountName]) : "#e0dede"; })
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

export async function drawHeatmapParset(pathToFile, parentId, lengths = false, setWidth = 1300, setHeight = 700) {
    const setMargin = {top: 50, right: 100, bottom: 30, left: 30};
    let dimensions = [];
    let linksMap = new Map();
    let nodesMap = new Map();

    const addNode = (name, cluster) => {
        if (!nodesMap.has(name)) {
            nodesMap.set(name, {name: name, cluster: cluster});
        }
    }

    const addLink = (source, target) => {
        const linkName = [source, target].join("-->");
        if (linksMap.has(linkName)) {
            const linkEntry = linksMap.get(linkName);
            linkEntry.value += 1;
        } else {
            linksMap.set(linkName, {name: linkName, source: source, target: target, value: 1});
        }
    }

    let residuals01 = await d3.json("../output/residuals/residuals_0-1-updated.json");
    let residuals12 = await d3.json("../output/residuals/residuals_1-2-updated.json");
    let residuals23 = await d3.json("../output/residuals/residuals_2-3-updated.json");

    const getResidualForLink = (link) => {
        const targetName = link.target.name.split("-");
        const sourceName = link.source.name.split("-");

        const targetCluster = targetName[0];
        const targetPosition = targetName[1];
        const sourceCluster = sourceName[0];
        const sourcePosition = sourceName[1];

        switch (sourcePosition) {
            case "third_last":
                return residuals01[sourceCluster - 1][`residual_to_${targetCluster}`];
            case "second_last":
                return residuals12[sourceCluster - 1][`residual_to_${targetCluster}`];
            case "last":
                return targetCluster == 0 ? residuals23[sourceCluster - 1]["residual_to_non_delta"] : residuals23[sourceCluster - 1]["residual_to_delta"]
        }
    }

    let data = await d3.csv(`${pathToFile}`, function(row) {
        if (lengths) {
            dimensions = ["third_last_length", "second_last_length", "last_length", "delta"]
            for (const dimension of dimensions.slice(0, -1)) {
                for (const cluster of row[dimension]) {
                    addNode(`${dimension}_cluster-${cluster}`, cluster)
                }
            }
        } else {
            dimensions = ["third_last", "second_last", "last", "delta"];
            const tableLength = row["third_last"].length;

            for (const dimension of dimensions.slice(0, -1)) {
                for (const cluster of row[dimension]) {
                    addNode(`${cluster}-${dimension}`, cluster)
                }
            }
            addNode("1-delta", "1");
            addNode("0-delta", "0");

            const addLinksBetweenAxes = (axis1, axis2) => {
                for (let i = 0; i < tableLength; ++i) {
                    addLink(`${row[dimensions[axis1]][i]}-${dimensions[axis1]}`,
                        `${row[dimensions[axis2]][i]}-${dimensions[axis2]}`);
                }
            }

            addLinksBetweenAxes(0,1);
            addLinksBetweenAxes(1,2);
            addLinksBetweenAxes(2,3);
        }
    });

    // improved link function from: https://observablehq.com/@enjalot/weird-sankey-links
    function sankeyLinkPath(link) {
        const offset = -3;
        let sx = link.source.x1;
        let tx = link.target.x0 + 1;
        let sy0 = link.y0 - link.width/2;
        let sy1 = link.y0 + link.width/2;
        let ty0 = link.y1 - link.width/2;
        let ty1 = link.y1 + link.width/2;

        let halfX = (tx - sx)/2;

        let path = d3.path();
        path.moveTo(sx, sy0);

        let cpx1 = sx + halfX;
        let cpy1 = sy0 + offset;
        let cpx2 = sx + halfX;
        let cpy2 = ty0 - offset;
        path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, tx, ty0);
        path.lineTo(tx, ty1);

        cpx1 = sx + halfX;
        cpy1 = ty1 - offset;
        cpx2 = sx + halfX;
        cpy2 = sy1 + offset;
        path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, sx, sy1);
        path.lineTo(sx, sy0);

        return path.toString();
    }

    const totalHeight = setHeight + setMargin.bottom + setMargin.top;
    const totalWidth = setWidth + setMargin.left + setMargin.right;

    let nodes = Array.from(nodesMap.values()).sort((a, b) => d3.ascending(a.name, b.name));
    let links = Array.from(linksMap.values()).sort((a, b) => d3.ascending(a.name, b.name));

    const svg = d3.select(`#${parentId}`)
        .append("svg")
        .attr("width", totalWidth)
        .attr("height", totalHeight)
        .append("g")
        .attr("transform", `translate(${setMargin.left},${setMargin.top})`);

    const defs = svg.append("defs");

    const colourScale = d3.scaleOrdinal()
        .range(["#4e79a7","#f28e2c","#76b7b2","#edc949","#af7aa1","#bab0ab"])
        .domain([1, 2, 3, 4, 5, 6])

    const sankeyGenerator = sankey()
        .nodeId(d => d.name)
        .nodeWidth(50)
        .nodePadding(10)
        .nodeSort(null)
        .nodeAlign(sankeyJustify)
        .extent([[0, 0], [setWidth, setHeight]]);

    const { links: sankeyLinks, nodes: sankeyNodes } = sankeyGenerator({
        links: links.map(d => Object.assign({}, d)),
        nodes: nodes.map(d => Object.assign({}, d))
    });

    for (let node of sankeyNodes) {
        node.color = colourScale(node.cluster);
    }

    for (let i = 0; i < sankeyLinks.length; ++i) {
        const currentLink = sankeyLinks[i];

        const gradientId = `gradient-${currentLink.name}-at-${i}`;
        currentLink.gradientId = gradientId;

        const gradient = defs.append("linearGradient")
            .attr("id", gradientId)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", currentLink.source.x1)
            .attr("x2", currentLink.target.x0)
            .attr("y1", currentLink.source.y0)
            .attr("y2", currentLink.target.y1);

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", currentLink.source.color);

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", currentLink.target.color);
    }

    console.log(sankeyLinks)
    const paths = svg.append("g")
        .selectAll("path")
        .data(sankeyLinks)
        .enter().append("g")
        .attr("class", "link-container")
        .attr("id", d => `${d.name}-container`)
        .append("path")
            .attr("class", "link")
            .attr("id", d => d.name)
            .attr("d", d => sankeyLinkPath(d))
            .style("stroke-width", d => Math.max(1, d.width))
            .style("opacity", 0.8)
            .style("fill", d =>`url(#${d.gradientId})`);

    const minWidth = 15;

    const linkText = svg.selectAll(".link-container")
        .data(sankeyLinks)
        .append("text")
            .text(d => getResidualForLink(d).toFixed(4))
            .attr("class", d => d.width > minWidth ? "link-text" : "hidden-link-text")
            .attr("x", d => d.target.x0 - 10) // Midpoint of the path on the x-axis
            .attr("y", d => d.y1 - d.width / 2) // Midpoint of the path on the y-axis
            .attr("dy",  "1rem")
            .attr("text-anchor", "end")
            .attr("data-target-node", d => d.target.name)
            .style("fill", d => getResidualForLink(d) > 0 ? "#699c2c" : "#cc4527")
            .style("stroke", d => getResidualForLink(d) > 0 ? "#181c14" : "#1c1414")
            .style("stroke-width", 0.3)
            .style("font-size", "10")
            .on("mouseover", function(event, d) {
                let infoBox = document.getElementById("residual-information");
                infoBox.innerText = `${d.name}: ${this.innerHTML}`;
                getResidualForLink(d) > 0 ? infoBox.classList.add("text-green-900") : infoBox.classList.add("text-red-900");
            })
            .on("mouseout", function(event, d) {
                 document.getElementById("residual-information").innerText = "";
            });

    const rects = svg.append("g")
        .selectAll()
        .data(sankeyNodes)
        .join("g")
        .attr("class", "node-rect")
        .append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => (d.y1 - d.y0))
            .attr("width", sankeyGenerator.nodeWidth())
            .style("stroke", "black")
            .style("stroke-width", 2)
            .style("fill", d => d.color);

    d3.selectAll(".node-rect")
        .data(sankeyNodes)
        .append("text")
        .text(d => d.name)
        .attr("dy",  d => d.y1 - d.y0 > 50 ? "-0.3rem" : "0.6rem")
        .attr("dx", d => d.y1 - d.y0 > 50 ? "0.3rem" : "0.1rem")
        .style("font-size", 9)
        .attr("transform", d => d.y1 - d.y0 > 50 ? `translate(${d.x0},${d.y0})rotate(90)` : `translate(${d.x0},${d.y0})`);
}


export async function drawResiduals(pathToFile, parentId, resWidth= 600, resHeight = 700, resMargin = {top: 50, right: 0, bottom: 30, left: 30}) {
    let data = await d3.json(`${pathToFile}`);
    const totalHeight = resHeight + margin.bottom + margin.top;
    const totalWidth = resWidth + margin.left + margin.right;

    let svg = d3.select(`#${parentId}`)
        .append('svg')
        .attr("width", totalWidth)
        .attr("height", totalHeight);

    let singleResiduals = [];
    for (const residual of data) {
        for (const attr in residual) {
            if (attr === "for_cluster") continue;
            let singleResidual = {
                "residual_for": `${residual["for_cluster"]}-->${attr.slice(-1)}`,
                "decimal": residual[attr]
            };
            singleResiduals.push(singleResidual);
        }
    }

    const allDecimals = singleResiduals.map(d => d.decimal);

    console.log(allDecimals)

    const widthScale = d3.scaleLinear()
        .domain([d3.min(allDecimals), d3.max(allDecimals)])
        .range([0, resWidth - 10]);

    const yPlacementScale = d3.scaleBand()
        .domain(d3.range(allDecimals.length))
        .range([0, resHeight])
        .padding(0.5);


    svg.selectAll('g')
        .data(singleResiduals)
        .enter()
        .append('g')
        .attr('class', "res-container")
        .append('rect')
            .attr('class', "res-bar")
            .attr("width", d => Math.abs(widthScale(d.decimal) - widthScale(0)))
            .attr("height", yPlacementScale.bandwidth())
            .attr("x", d => d.decimal >= 0 ? width / 2 : widthScale(d.decimal))
            .attr("y", (d, i) => yPlacementScale(i))
            .style("fill", d => d.decimal > 0 ? "green" : "red");

    svg.selectAll('.res-container')
        .data(singleResiduals)
        .append('text')
        .text(d => d["residual_for"])
        .attr("x", d => d.decimal >= 0 ? width / 2 : widthScale(d.decimal))
        .attr("y", (d, i) => yPlacementScale(i) + yPlacementScale.bandwidth() + 8)
        .style("font-size", "10px")
        .style("fill", "black")


}
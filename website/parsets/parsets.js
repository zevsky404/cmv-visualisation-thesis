import * as d3 from "d3";
import "../node_modules/d3.parsets/d3.parsets";

async function buildParset(path, dimensions) {
    let chart = d3.parsets()
        .dimensions(dimensions);

    let svg = d3.create("svg")
        .attr("width", chart.width)
        .attr("height", chart.height);

    await d3.csv(path, function(error, csv_data) {
        svg.datum(csv_data).call(chart);
    });

    return svg;
}
let test = await buildParset("../output/parset_data/run-1-full.csv", ["third_last", "second_last", "last", "delta"]);
console.log(test)


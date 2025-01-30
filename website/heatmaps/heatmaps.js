import {drawBarchart, drawHeatmap} from "../src/js/diagram-draw-functions";
import {createDiv} from "../src/js/tools";

const aduGroups = ["V", "T", "P", "R", "F"];
const aduVars = ["V", "T", "P", "R", "F"];
const clusterGroups = ["1", "2", "3", "4", "5", "6"];
const clusterVars = ["1", "2", "3", "4", "5", "6"];

const container = document.getElementById("main-container");
let newDiv = await createDiv("same-occurrences", "flex flex-column flex-wrap border-solid border-2 border-black").then(async result => {
    let overallHeatmap = await drawHeatmap(aduGroups, aduVars, "group", "variable",
        "amount", "../output/occurrences/occs_overall.csv");
    result.appendChild(overallHeatmap.node());
    for (let i of clusterGroups) {
        let heatmap = await drawHeatmap(aduGroups, aduVars, "group", "variable",
            "amount", `../output/occurrences/occs_c${i.toString()}.csv`);
        result.appendChild(heatmap.node());
    }

    for (const aduType of ["V", "T", "P", "R", "F"]) {
        for (const clusterNumber of ["1", "2", "3", "4", "5", "6"]) {
            let barchart = await drawBarchart(`../output/ext_sequences/ext_sequences_${aduType}_${clusterNumber}.csv`, result.id, 400, 300);
            result.appendChild(barchart.node());
        }
    }

    let firstLastHeatmap = await drawHeatmap(clusterGroups, clusterVars, "first_cluster", "last_cluster",
        "amount", "../output/occurrences/first_last_order.csv");
    result.appendChild(firstLastHeatmap.node());

    return result;
});

container.appendChild(newDiv);

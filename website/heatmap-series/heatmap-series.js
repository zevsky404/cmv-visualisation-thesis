import {drawHeatmap, drawStackedBar} from "../src/js/diagram-draw-functions";

const aduGroups = ["V", "T", "P", "R", "F"];
const aduVars = ["V", "T", "P", "R", "F"];

const container = document.getElementById("main-container");

let newDiv = document.createElement("div");
newDiv.id = `last-comment-analysis`;
newDiv.className = "flex flex-column flex-wrap border-solid border-2 border-black";

for (const number in [0, 1, 2]) {
    let dDlHeatmap =
        await drawHeatmap(aduGroups, aduVars, "adu1", "adu2", "amount", `../output/last_comments/delta/${number}-dl.csv`);
    let dPlHeatmap =
        await drawHeatmap(aduGroups, aduVars, "adu1", "adu2", "amount", `../output/last_comments/delta/${number}-pl.csv`);
    let ndDlHeatmap =
        await drawHeatmap(aduGroups, aduVars, "adu1", "adu2", "amount", `../output/last_comments/non-delta/${number}-dl.csv`, false);
    let ndPlHeatmap =
        await drawHeatmap(aduGroups, aduVars, "adu1", "adu2", "amount", `../output/last_comments/non-delta/${number}-dl.csv`, false);

    container.appendChild(dDlHeatmap.node());
    container.appendChild(ndDlHeatmap.node());
    container.appendChild(dPlHeatmap.node());
    container.appendChild(ndPlHeatmap.node());
}






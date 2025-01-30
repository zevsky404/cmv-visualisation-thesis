import {drawBarchart, drawPieChart} from "../src/js/diagram-draw-functions";
import {createDiv} from "../src/js/tools";


let newDiv = await createDiv("test").then(async result => {
    let barchart = await drawBarchart(`../output/sequences/overall.csv`, result.id);
    let nonDeltaBarchart = await drawBarchart(`../output/sequences/overall_non-delta.csv`, result.id);
    let pieChart = await drawPieChart(`../output/occurrences/total/total_overall.csv`, result.id);
    result.appendChild(barchart.node());
    result.appendChild(nonDeltaBarchart.node());
    result.appendChild(pieChart.node());
    return result
});
document.getElementById("main-container").appendChild(newDiv)


for (let i = 1; i <= 6; ++i) {
    let newDiv = await createDiv(`data-cluster-${i}`).then(async result => {
        let barchart = await drawBarchart(`../output/sequences/c${i}.csv`, result.id, 1100);
        let pieChart = await drawPieChart(`../output/occurrences/total/total_c${i}.csv`, result.id)
        result.appendChild(barchart.node());
        result.appendChild(pieChart.node());
        return result
    });
    document.getElementById("main-container").appendChild(newDiv);
}

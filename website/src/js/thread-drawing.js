import * as d3 from "d3";
import {sortByFirstOrLastNode, getOriginalOrder, displayInOriginalOrder, sortByLength} from "./tools"


let getData = d3.json("../output/process_2024-02-07_16:01.json").then((response) => {
    return response;
});

// COLOUR CONSTANTS
const colorOp = d3.scaleOrdinal(d3.schemeTableau10)
    .domain(d3.extent([0,9]));

const colorComments = d3.scaleOrdinal()
    .range(["#d53e4f","#fc8d59","#fee08b","#e6f598","#99d594","#3288bd"])
    .domain(d3.extent([0,5]));

const colorPreds = d3.scaleOrdinal(d3.schemeDark2)
    .domain(["V", "T", "R", "P", "F"]);

// HELPER FUNCTIONS
function reducePreds(predsList) {
    let predsString = "";
    predsList = eval(predsList);
    for (let aduLetter of predsList) {
        predsString += aduLetter;
    }

    return predsString;
}

function buildNodeWindow(pageXY, nodeAdus, nodeUser) {
    let popup = document.createElement("div");
    popup.className = "adu-popup";
    popup.style.background = "white";
    popup.style.opacity = "1";
    popup.style.border = "1px solid black";
    popup.style.borderRadius = "1px";
    popup.style.padding = "5px";
    popup.style.paddingRight = "6px";
    popup.style.position = "absolute";
    popup.style.fontSize = "15px";
    popup.style.left = `${pageXY[0] + 5}px`;
    popup.style.top = `${pageXY[1] + 5}px`;
    popup.innerHTML = `${nodeAdus}</br>
                       ${nodeUser}`;

    let close = document.createElement("div");
    close.style.width = "7px";
    close.style.height = "7px";
    close.style.background = "red";
    close.style.position = "absolute";
    close.style.right = "1px";
    close.style.top = "1px";

    close.addEventListener("click", function (event) {
        event.target.parentNode.style.display = "none";
    });

    popup.appendChild(close);

    return popup;
}

// ENTRY
getData.then((data) => {
    // DRAWING SETUP
    const margin = {top: 10, left: 5, bottom: 10, right: 5};
    let diagonal = function diagonal(d) {
        return "M" + d.source.x + "," + d.source.y
            + " C" + (d.source.x + d.target.x) / 2 + "," + d.source.y
            + " " + (d.source.x + d.target.x) / 2 + "," + d.target.y
            + " " + d.target.x + "," + d.target.y;
    };

    const width = 300 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    function buildTreeForThread(thread) {
        // hierarchy setup for root and links
        const tree = d3.tree().size([width, height]);
        let root = d3.stratify()
            .id(d => d.id)
            .parentId(d => d.parent_id)
            (thread);
        root = tree(root);
        const links = root.links();

        const svg = d3.create("svg")
            .attr("width", 300)
            .attr("height", "400")
            .style("display", "inline-block")
            .style("min-width", "300")
            .style("min-height", "300");

        const g = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 5);


        const node = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", d => "node" + (d.children ? " node-internal "
                : " node-leaf ") + d.id)
            .attr("transform", d => `translate(${d.x}, ${d.y})`)
            .attr("adu-types", d => reducePreds(d.data.preds))
            .attr("thread-user", d => `${d.data.user}`)
            .attr("cluster-type", d => `${d.data.cluster_type}`)
            .attr("cluster-number", d => `${d.data.cluster}`)
            .on("click", nodeClick);

        node.append("circle")
            .attr("r", "5")
            .style("stroke", "black")
            .style("stroke-width", "1")
            .style("fill", d => { return d.data.cluster_type === "OP" ? colorOp(d.data.cluster) : colorComments(d.data.cluster) });

        const edge = g.selectAll(".edge")
            .data(links)
            .enter().append("path")
            .attr("class", "edge")
            .style("stroke", "black")
            .style("stroke-width", "1")
            .style("fill", "none")
            .attr("d", diagonal);

        node.raise();

        let main = document.getElementById('main-container');
        main.appendChild(svg.node());
    }


    const nodeClick = function(hoverEvent) {
        let popup = buildNodeWindow([hoverEvent.pageX, hoverEvent.pageY],
            this.getAttribute("adu-types"), this.getAttribute("thread-user"));

        document.querySelector("#main-container").appendChild(popup);
    }

    let successCounter = 0;
    let errorCounter = 0;
    for (let thread of data) {
        try {
            buildTreeForThread(thread);
            ++successCounter;
        } catch (error) {
            console.error(error);
            ++errorCounter;
            continue;
        }
    }
    console.log(`Amount of successfully drawn trees: ${successCounter}`);
    console.log(`Amount of unsuccessfully drawn trees: ${errorCounter}`);
    const originalOrder = getOriginalOrder();

    let allRadios = document.getElementsByName("clusters");
    for (let radio of allRadios) {
        if (radio.id === "length" || radio.id === "none") {
            continue;
        }
        radio.addEventListener("click", function () {
            if (this.id.includes("f")) {
                sortByFirstOrLastNode(parseInt(radio.value), "first");
            } else if (this.id.includes("l")) {
                sortByFirstOrLastNode(parseInt(radio.value), "last");
            }
        });
    }

    let noneRadio = document.getElementById("none");
    noneRadio.addEventListener("click", () => displayInOriginalOrder(originalOrder));

    let lengthRadio = document.getElementById("length");
    lengthRadio.addEventListener("click", () => sortByLength());
});





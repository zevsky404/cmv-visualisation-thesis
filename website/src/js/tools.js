export function getOriginalOrder() {
    return Array.from(document.querySelector("#main-container").children);
}

export function getFirstNode(graph) {
    const g = graph.children[0];
    for (let child of g.children) {
        if (child.classList.contains("node") && child.getAttribute("cluster-type") !== "OP") {
            return parseInt(child.getAttribute("cluster-number")) + 1;
        }
    }
}

export function getLastNode(graph) {
    const g = graph.children[0];
    return parseInt(g.lastChild.getAttribute("cluster-number")) + 1;
}

export function sortByFirstOrLastNode(clusterNumber, position) {
    let graphs = Array.from(document.querySelector("#main-container").children);
    const graphData = graphs.map(graph => {
        switch (position) {
            case "first": {
                return {
                    element: graph,
                    firstNode: parseInt(getFirstNode(graph))
                }
            }
            case "last": {
                return {
                    element: graph,
                    firstNode: parseInt(getLastNode(graph))
                }
            }
        }
    });

    graphData.sort((a,b) => {
        // Priority to graphs with the selected first node
        if (a.firstNode === clusterNumber && b.firstNode !== clusterNumber) {
            return -1; // a comes first
        } else if (a.firstNode !== clusterNumber && b.firstNode === clusterNumber) {
            return 1; // b comes first
        } else {
            return a.firstNode - b.firstNode; // Normal ascending order for other cases
        }
    });

    graphData.forEach(item => {
        document.getElementById("main-container").appendChild(item.element)
    });
}

export function sortByLength() {
    let graphs = Array.from(document.querySelector("#main-container").children);
    const graphData = graphs.map(graph => {
        return {
            element: graph,
            length: Math.floor(graph.children[0].children.length / 2) + 1
        }
    });

    graphData.sort((a,b) => {
        return a.length - b.length;
    });

    graphData.forEach(item => {
        document.getElementById("main-container").appendChild(item.element);
    });
}

export function displayInOriginalOrder(originalOrder) {
    originalOrder.forEach(item => {
        document.getElementById("main-container").appendChild(item);
    });
}

export async function createDiv(id, className="combined-data flex flex-wrap") {
    let div = document.createElement("div");
    div.id = id;
    div.className = className;
    console.log("creating element")
    return div;
}

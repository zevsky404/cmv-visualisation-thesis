# Bachelor Thesis - CMV Visualisation Project

## Description
This project is part of my bachelor thesis and explores data from the subreddit r/ChangeMyVew. With these visualisations I want to support a previous paper about this data,
and explore it visually to better understand the results of said paper. Right now these visualisations exist:
- Barcharts: Show what sequences of unique ADU types are found in all clusters and also in the single clusters, and how often
- Piecharts: Show the relative amount of single ADU-types found in the clusters and overall
- Threads: Show the structure of the conversations on the subreddit. The colours denote what cluster a comment belongs to (OP clusters are different from comment clusters)
- Heatmaps: Show what ADU tpe (y-axis) followed after another ADU type (x-axis) per cluster and overall
- Barcharts next to Heatmaps: Show how many times an ADU type followed after the same one and how long the sequence was. The number on the x-axis lists the length of the sequence and the bar shows how often this sequence appeared
- Heatmap Series: Shows how often an ADU Type followed after the other for the last three comments, split up into dialogues and polylogues, as well as threads that have received a delta and that have not received a delta

## Installation
1. Install `npm` and Node.js for your operating system. I use `npm` to manage my dependencies and make usage easier.
2. Clone the repository, navigate to where you saved it and then into the `website` directory within it.
3. Open a terminal in that location (if you haven't already) and run:
```shell
npm install
```
This will install all necessary dependencies, including d3, TailwindCSS and snowpack.

## Usage
After the installation finished, run
```shell
npm run start
```
to start the snowpack server at `localhost:8080`. You can then start your browser at that address and start exploring!

### Tailwind Usage
All CSS styles are set with TailwindCSS, which is installed as a dependency automatically. If you wish to add or change anything, you can start the Tailwind listener by running
```shell
npm run tailwind
```
Any styles you then add and remove are dynamically added and removed in `src/css/tailwind-styles.css`, so you can see your changes live on the webpage. See the TailwindCSS documentation for more details.
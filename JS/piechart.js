//global variables for responsiveness, referenced from: https://www.geeksforgeeks.org/javascript/how-to-detect-when-the-window-size-is-resized-using-javascript/
let screenWidth = window.innerWidth;

//create tuples for each vis
let pieDims= [400, 400];
console.log(screenWidth);
updateVisDims();

function updateVisDims(){
  if(screenWidth >= 1800){
    pieDims = [800, 800];
  }else if(screenWidth>=1200){
    pieDims= [600, 600];
  }else if(screenWidth>=600){
    pieDims= [400, 400];
  }else if(screenWidth>=300){
    pieDims= [200, 200];
  }

  let svgElement = document.getElementById("piechart");
  svgElement.setAttribute("width", pieDims[0]);
  svgElement.setAttribute("height", pieDims[1]);
}

window.onresize = function(){
  screenWidth = window.innerWidth;
  console.log(screenWidth);

  updateVisDims();
}

const svg = d3.select("svg"),
      width = pieDims[0],
      height = pieDims[1],
      radius = Math.min(width, height) / 2;

const g = svg.append("g").attr("transform", `translate(${width/2}, ${height/2})`);

const color = d3.scaleOrdinal()
                .domain(["Digital", "Physical"])
                .range(["#1f77b4", "#ff7f0e"]);

const pie = d3.pie().value(d => d.value);
const arc = d3.arc().outerRadius(radius - 10).innerRadius(0);
const labelArc = d3.arc().outerRadius(radius - 40).innerRadius(radius - 40);

// Load CSV
d3.csv("../datasets/piechartdata.csv").then(rawData => {
  const publishers = Array.from(d3.group(rawData, d => d.Publisher), ([Publisher, values]) => {
    return {
      Publisher,
      Digital: +values.find(v => v.Format === "Digital").Frequency,
      Physical: +values.find(v => v.Format === "Physical").Frequency
    };
  });

  function updatePie(index) {
    const pieData = [
      {format: "Digital", value: publishers[index].Digital},
      {format: "Physical", value: publishers[index].Physical}
    ];

    // DATA JOIN for slices
    const paths = g.selectAll("path").data(pie(pieData));

    paths.join(
      enter => enter.append("path")
                    .attr("d", arc)
                    .attr("fill", d => color(d.data.format))
                    .each(function(d) { this._current = d; }),
      update => update.transition()
                      .duration(1000)
                      .attrTween("d", function(d) {
                        const i = d3.interpolate(this._current, d);
                        this._current = i(1);
                        return t => arc(i(t));
                      })
    );

    // DATA JOIN for labels on slices
    const labels = g.selectAll("text.label").data(pie(pieData));

    labels.join(
      enter => enter.append("text")
                    .attr("class", "label")
                    .attr("dy", ".35em")
                    .attr("fill", "#fff")
                    .attr("font-size", "12px")
                    .attr("text-anchor", "middle")
                    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
                    .text(d => `${(d.data.value*100).toFixed(1)}%`),
      update => update.transition()
                      .duration(1000)
                      .attr("transform", d => `translate(${labelArc.centroid(d)})`)
                      .text(d => `${(d.data.value*100).toFixed(1)}%`)
    );

    // DATA JOIN for publisher name in center
    const title = g.selectAll("text.title").data([publishers[index].Publisher]);

    title.join(
      enter => enter.append("text")
                    .attr("class", "title")
                    .attr("text-anchor", "middle")
                    .attr("dy", ".35em")
                    .attr("font-size", "16px")
                    .attr("fill", "#333")
                    .text(d => d),
      update => update.text(d => d)
    );
  }

  // Initialize first pie chart
  updatePie(0);

  // Create buttons dynamically
  const buttonContainer = d3.select("#buttons");
  publishers.forEach((d, i) => {
    buttonContainer.append("button")
                   .text(d.Publisher)
                   .on("click", () => updatePie(i));
  });
});

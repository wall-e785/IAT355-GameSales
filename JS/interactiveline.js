const svg = d3.select("#chart");
const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 50, right: 120, bottom: 50, left: 60 };

const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;

const g = svg.append("g")
  .style("stroke", "#ffffff")
  .attr("transform", `translate(${margin.left},${margin.top})`);

let data;
let currentType = "Physical"; // Physical/Digital for normal chart

// --- FORMAT LABEL ---
const formatLabel = svg.append("text")
  .attr("x", width / 2)
  .attr("y", margin.top / 2)
  .attr("text-anchor", "middle")
  .attr("font-size", 18)
  .attr("font-weight", "bold")
  .style("fill", "#ffffff")
  .text("Physical Sales");

// --- LOAD CSV ---
d3.csv("./datasets/platformdata.csv").then(raw => {
  data = raw.map(d => ({
    Year: +d.Year,
    Developer: d.Developer,
    Physical: +d["Physical (%)"].replace("%","") || 0,
    Digital: +d["Digital (%)"].replace("%","") || 0
  }));

  drawChart(); // initial chart
}).catch(err => console.error(err));

// --- BUTTONS ---
document.getElementById("physicalBtn").onclick = () => {
  currentType = "Physical";
  drawChart(true);
};

document.getElementById("digitalBtn").onclick = () => {
  currentType = "Digital";
  drawChart(true);
};

document.getElementById("outlierBtn").onclick = () => {
  drawOutlier();
};

// --- NORMAL CHART ---
function drawChart(animate = false) {
  g.selectAll("*").remove();

  formatLabel.text(currentType === "Physical" ? "Physical Sales" : "Digital Sales");

  const years = [...new Set(data.map(d => d.Year))];
  const x = d3.scaleLinear().domain(d3.extent(years)).range([0, plotWidth]);
  const y = d3.scaleLinear().domain([0, 100]).range([plotHeight, 0]);

  // axes
  g.append("g").attr("transform", `translate(0,${plotHeight})`).style("stroke", "#ffffff").call(d3.axisBottom(x).tickFormat(d3.format("d")));
  g.append("text").attr("x", plotWidth/2).attr("y", plotHeight+40).attr("text-anchor","middle").style("fill", "#ffffff").text("Year");
  g.append("g").call(d3.axisLeft(y)).style("stroke", "#ffffff");
  g.append("text").attr("transform","rotate(-90)").attr("x",-plotHeight/2).attr("y",-45).attr("text-anchor","middle").style("fill", "#ffffff").text("Percentage (%)");

  const line = d3.line().x(d=>x(d.Year)).y(d=>y(d.value)).curve(d3.curveMonotoneX);

  const developers = d3.groups(data, d => d.Developer);
  const color = d3.scaleOrdinal().domain(developers.map(d=>d[0])).range(["#1f77b4","#e41a1c","#4daf4a"]);

  const groups = g.selectAll(".dev").data(developers).enter().append("g").attr("class","dev");

  groups.append("path")
    .attr("fill","none").attr("stroke-width",3).attr("stroke",d=>color(d[0]))
    .attr("d", d => line(d[1].map(p=>({ Year: p.Year, value: 0 }))))
    .transition().duration(1000)
    .attrTween("d", function(d){
      const newData = d[1].map(p=>({ Year: p.Year, value: currentType==="Physical"?p.Physical:p.Digital }));
      return d3.interpolatePath(d3.select(this).attr("d"), line(newData));
    });

  groups.append("text")
    .attr("class","publisher-label").attr("fill",d=>color(d[0])).attr("font-size",14).attr("dy","0.35em")
    .text(d=>d[0])
    .attr("transform", d => {
      const last = d[1][d[1].length-1];
      return `translate(${x(last.Year)+6},${y(0)})`;
    })
    .transition().duration(1000)
    .attr("transform", d => {
      const last = d[1][d[1].length-1];
      const v = currentType==="Physical"?last.Physical:last.Digital;
      return `translate(${x(last.Year)+6},${y(v)})`;
    });
}

// --- OUTLIER CHART ---
function drawOutlier() {
  g.selectAll("*").remove();

  formatLabel.text("Nintendo Sales");

  const chartData = data.filter(d => d.Developer === "Nintendo");
  const years = [...new Set(chartData.map(d=>d.Year))];
  const x = d3.scaleLinear().domain(d3.extent(years)).range([0, plotWidth]);
  const y = d3.scaleLinear().domain([0,100]).range([plotHeight,0]);

  // axes
  g.append("g").attr("transform", `translate(0,${plotHeight})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
  g.append("text").attr("x", plotWidth/2).attr("y", plotHeight + 40).attr("text-anchor","middle").text("Year");
  g.append("g").call(d3.axisLeft(y));
  g.append("text").attr("transform","rotate(-90)").attr("x",-plotHeight/2).attr("y",-45).attr("text-anchor","middle").text("Percentage (%)");

  const line = d3.line().x(d=>x(d.Year)).y(d=>y(d.value)).curve(d3.curveMonotoneX);

  const outlierLines = [
    { type: "Physical", values: chartData.map(d=>({Year:d.Year,value:d.Physical})), color:"#1f77b4" },
    { type: "Digital", values: chartData.map(d=>({Year:d.Year,value:d.Digital})), color:"#e41a1c" }
  ];

  const groups = g.selectAll(".outlier-line").data(outlierLines).enter().append("g").attr("class","outlier-line");

  groups.append("path")
    .attr("fill","none").attr("stroke-width",3).attr("stroke",d=>d.color)
    .attr("d", d => line(d.values.map(p=>({Year:p.Year,value:0}))))
    .transition().duration(1000)
    .attrTween("d", function(d){
      return d3.interpolatePath(d3.select(this).attr("d"), line(d.values));
    });

  groups.append("text")
    .attr("class","line-label").attr("fill",d=>d.color).attr("font-size",14).attr("dy","0.35em")
    .text(d=>d.type)
    .attr("transform",(d,i)=>{
      const last = d.values[d.values.length-1];
      return `translate(${x(last.Year)+6},${y(0)-i*15})`;
    })
    .transition().duration(1000)
    .attr("transform",(d,i)=>{
      const last = d.values[d.values.length-1];
      return `translate(${x(last.Year)+6},${y(last.value)-i*15})`;
    });
}

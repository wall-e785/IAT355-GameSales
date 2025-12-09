const svg = d3.select("#areachart");

function getSize() {
  const rect = svg.node().getBoundingClientRect(); 
  return {
    width: rect.width || 400,
    height: rect.height || 400
  };
}

let { width, height } = getSize();



// Chart dimensions
const margin = { top: 60, right: 100, bottom: 60, left: 60 };
// const width = 950 - margin.left - margin.right;
// const height = 600 - margin.top - margin.bottom;

// Colors for formats
const colors = {
  Physical: "#d40b0bff",
  Digital:  "#1A9FFF"

};

// Append SVG
svg
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Tooltip
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("background-color", "#1A9FFF")
  .style("color", "white")
  .style("font-family", "GT America");

let mode = "Both"; // initial mode

// Load CSV
d3.csv("datasets/US_SalesData.csv").then(data => {

  data.forEach(d => {
    d.Physical = +d.Physical;
    d.Digital = +d.Digital;
  });

  const formats = ["Physical", "Digital"];

  // Flatten for bars
  const flat = data.flatMap(d =>
    formats.map(f => ({
      Year: d.Year,
      Format: f,
      Sales: d[f]
    }))
  );

  const x = d3.scaleBand()
    .domain(data.map(d => d.Year))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(flat, d => d.Sales)]).nice()
    .range([height, 0]);

  const formatBand = d3.scaleBand()
    .domain(formats)
    .range([0, x.bandwidth()])
    .padding(0.2);

  // Axes
  svg.append("g")
    .attr("class","xaxis")
    .attr("transform", `translate(0,${height})`)
    .style("color", "white")
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("class","yaxis")
    .call(d3.axisLeft(y))
      .style("color", "white");

    
  // -------------------------------
  // UPDATE FUNCTION (bars + lines + circles)
  // -------------------------------
  function update(mode) {

    const visibleFormats =
      mode === "Both" ? formats : [mode];

    // Filter bars/lines
    const barData = flat.filter(d => visibleFormats.includes(d.Format));

    const lineData = formats.map(f => ({
      key: f,
      values: data.map(d => ({
        Year: d.Year,
        Sales: d[f],
        Format: f
      }))
    })).filter(d => visibleFormats.includes(d.key));

    // ------------------------
    // Bars
    // ------------------------
    const bars = svg.selectAll("rect.bar")
      .data(barData, d => d.Year + d.Format);

    bars.enter()
      .append("rect")
      .attr("class","bar")
      .attr("x", d => x(d.Year) + formatBand(d.Format))
      .attr("y", height)
      .attr("width", formatBand.bandwidth())
      .attr("height", 0)
      .attr("fill", d => colors[d.Format])
      .attr("opacity", 0.6)
      .on("mousemove", (event, d) => {
        tooltip.style("opacity",1)
          .html(`<strong>${d.Format}</strong><br>Year: ${d.Year}<br>Sales: ${d.Sales}%`)
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", () => tooltip.style("opacity",0))
      .transition()
      .duration(700)
      .attr("y", d => y(d.Sales))
      .attr("height", d => height - y(d.Sales));

    bars.transition()
      .duration(700)
      .attr("x", d => x(d.Year) + formatBand(d.Format))
      .attr("y", d => y(d.Sales))
      .attr("width", formatBand.bandwidth())
      .attr("height", d => height - y(d.Sales));

    bars.exit()
      .transition().duration(500)
      .attr("y", height)
      .attr("height", 0)
      .remove();

    // ------------------------
    // Lines
    // ------------------------
    const lineGen = d3.line()
      .x(d => x(d.Year) + x.bandwidth() / 2)
      .y(d => y(d.Sales))
      .curve(d3.curveMonotoneX);

    const lines = svg.selectAll("path.line")
      .data(lineData, d => d.key);

    lines.enter()
      .append("path")
      .attr("class","line")
      .attr("fill","none")
      .attr("stroke-width", 4)
      .attr("stroke", d => colors[d.key])
      .attr("d", d => lineGen(d.values))
      .attr("stroke-dasharray", function() {
        const len = this.getTotalLength();
        return `${len} ${len}`;
      })
      .attr("stroke-dashoffset", function() {
        return this.getTotalLength();
      })
      .transition()
      .duration(800)
      .attr("stroke-dashoffset", 0);

    lines.transition()
      .duration(800)
      .attr("stroke", d => colors[d.key])
      .attr("d", d => lineGen(d.values));

    lines.exit()
      .transition().duration(300)
      .style("opacity",0)
      .remove();

    // ------------------------
    // Circles
    // ------------------------
    const circleData = lineData.flatMap(d => d.values);

    const circles = svg.selectAll("circle.point")
      .data(circleData, d => d.Year + d.Format);

    circles.enter()
      .append("circle")
      .attr("class","point")
      .attr("cx", d => x(d.Year) + x.bandwidth()/2)
      .attr("cy", height)
      .attr("r", 0)
      .attr("fill", d => colors[d.Format])
      .on("mousemove", (event, d) => {
        tooltip.style("opacity",1)
          .html(`<strong>${d.Format}</strong><br>Year: ${d.Year}<br>Sales: ${d.Sales}%`)
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", () => tooltip.style("opacity",0))
      .transition()
      .duration(600)
      .attr("r", 3)
      .attr("cy", d => y(d.Sales));

    circles.transition()
      .duration(600)
      .attr("cx", d => x(d.Year) + x.bandwidth()/2)
      .attr("cy", d => y(d.Sales))
      .attr("r", 3)
      .attr("fill", d => colors[d.Format]);

    circles.exit()
      .transition().duration(300)
      .attr("r",0)
      .remove();

  }

  // Initial draw
  update("Both");

  // -------------------------------
  // BUTTON HANDLERS
  // -------------------------------
  d3.selectAll("#controls button").on("click", function() {
    d3.selectAll("#controls button").classed("active", false);
    d3.select(this).classed("active", true);
    let mode = d3.select(this).attr("data-mode");

    //select the labels on the chart
    let physicalLabel = d3.select("#Physical-areachart");
    let digitalLabel = d3.select("#Digital-areachart");

    //hide labels depending on the mode
    if(mode == "Both"){
      physicalLabel.classed("hidden", false);
      digitalLabel.classed("hidden", false);
    }else if(mode == "Physical"){
      physicalLabel.classed("hidden", false);
      digitalLabel.classed("hidden", true);
    }else if(mode == "Digital"){
      physicalLabel.classed("hidden", true);
      digitalLabel.classed("hidden", false);
    }

    update(mode);
  });

  
    //draw legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(0, 0)`); // rpositioning the legend labels

    const legendItems = [
      { label: "Physical", color: colors.Physical },
      { label: "Digital", color: colors.Digital }
    ];

    // legend.selectAll("rect.legend-color")
    //   .data(legendItems)
    //   .enter()
    //   .append("rect")
    //   .attr("class", "legend-color")
    //   .attr("x", 0)
    //   .attr("y", (d, i) => i * 25)
    //   .attr("width", 18)
    //   .attr("height", 18)
    //   .attr("fill", d => d.color);

    legend.selectAll("text.legend-label")
      .data(legendItems)
      .enter()
      .append("text")
      .attr("class", "legend-label")
      .attr("id", d => d.label + "-areachart") //used to identify labels for hiding/showing
      .attr("x", 5)
      .attr("y", (d, i) => i * 90 + 10)
      .attr("z", 5) //add z value so the labels always render on top of everything else
      .text(d => d.label);


});

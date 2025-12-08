// ------------------- Setup -------------------
const svg = d3.select("#piechart");

// get container width/height dynamically
function getSize() {
  const rect = svg.node().getBoundingClientRect(); 
  return {
    width: rect.width || 400,
    height: rect.height || 400
  };
}

let { width, height } = getSize();

let radius = Math.min(width/2, height/2);


svg
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

const g = svg.append("g")
             .attr("transform", `translate(${width / 2}, ${height / 2})`);

const color = d3.scaleOrdinal()
                .domain(["Digital", "Physical"])
                .range(["#1f77b4", "#d40b0bff"]);

const pie = d3.pie().value(d => d.value);
const arc = d3.arc().outerRadius(radius - 10).innerRadius(0);
const labelArc = d3.arc().outerRadius(radius - 40).innerRadius(radius - 40);

// Inner circle radius (donut hub)
const innerCircleRadius = radius * 0.45;

// ------------------- Legend -------------------
const legend = svg.append("g")
                  .attr("class", "legend")
                  .attr("transform", `translate(${width - 300}, 10)`); // position top-right

const legendData = ["Digital", "Physical"];

legend.selectAll("rect")
  .data(legendData)
  .enter()
  .append("rect")
    .attr("x", (d, i) => i * 100 + 75)
    .attr("y", 0)
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", d => color(d));

legend.selectAll("text")
  .data(legendData)
  .enter()
  .append("text")
    .attr("x", (d, i) => i * 100 + 100)
    .attr("y", 12)
    .text(d => d)
    .attr("class", "legend-label");

// ------------------- Load Data -------------------
d3.csv("datasets/piechartdata.csv").then(rawData => {

  // Process CSV into usable format
  const publishers = Array.from(
    d3.group(rawData, d => d.Publisher),
    ([Publisher, values]) => {
      return {
        Publisher,
        Digital: +values.find(v => v.Format === "Digital").Frequency,
        Physical: +values.find(v => v.Format === "Physical").Frequency
      };
    }
  );

  // ------------------- Update Pie Chart -------------------
  function updatePie(index) {
    const pieData = [
      {format: "Digital", value: publishers[index].Digital},
      {format: "Physical", value: publishers[index].Physical}
    ];

    // ---------- 1. Draw pie slices ----------
    const paths = g.selectAll("path.slice").data(pie(pieData));

    paths.join(
      enter => enter.append("path")
                    .attr("class", "slice")
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

    // ---------- 2. Draw inner circle (donut hub) ----------
    const centerCircle = g.selectAll("circle.inner").data([null]);

    centerCircle.join(
      enter => enter.append("circle")
                    .attr("class", "inner")
                    .attr("r", innerCircleRadius)
                    .attr("fill", "#203559")
                    .attr("stroke", "#192a46ff")
                    .attr("stroke-width", 2),
      update => update.attr("r", innerCircleRadius)
    );

    // ---------- 3. Draw slice labels ----------
    const labels = g.selectAll("text.label").data(pie(pieData));

    labels.join(
      enter => enter.append("text")
                    .attr("class", "label")
                    .attr("dy", ".35em")
                    .attr("fill", "#fff")
                    .attr("font-size", "12px")
                    .attr("text-anchor", "middle")
                    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
                    .text(d => `${(d.data.value * 100).toFixed(1)}%`),
      update => update.transition()
                      .duration(1000)
                      .attr("transform", d => `translate(${labelArc.centroid(d)})`)
                      .text(d => `${(d.data.value * 100).toFixed(1)}%`)
    );

    // ---------- 4. Draw publisher name in center ----------
    const title = g.selectAll("text.title").data([publishers[index].Publisher]);

    if(d => d == "Take-Two Entertainment"){
      title.join(
        enter => enter.append("text")
                      .attr("class", "title")
                      .attr("text-anchor", "middle")
                      .attr("dy", ".35em")
                      .text("Take-Two Entertainment"),
        update => update.text(d => d)
      );
    }else{
      title.join(
        enter => enter.append("text")
                      .attr("class", "title")
                      .attr("text-anchor", "middle")
                      .attr("dy", ".35em")
                      .text(d => d),
        update => update.text(d => d)
      );
    }
  }

  // ------------------- Initialize first pie chart -------------------
  updatePie(0);

  // ------------------- Image Buttons -------------------
  const buttonContainer = d3.select("#buttons");
  let selectedButtonIndex = -1;

  publishers.forEach((d, i) => {
    buttonContainer.append("img")
      .attr("src", `img/buttons/${d.Publisher}.png`)  // publisher images
      .attr("class", "pub-btn")
      .attr("id", `btn-${i}`)
      .on("click", function () {
        if(selectedButtonIndex >= 0){
          let currPublisher = publishers[selectedButtonIndex].Publisher;
          d3.select(`#btn-${selectedButtonIndex}`)
          .attr("src", `img/buttons/${currPublisher}.png`)
        }
        d3.select(this).attr("src", `img/buttons/${d.Publisher}_select.png`); 
        selectedButtonIndex = i;
        updatePie(i);
        });
  });

});

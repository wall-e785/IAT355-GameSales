/* used to draw the nintendo outlier line chart*/
/* this script was created with assistance from ChatGPT https://chatgpt.com/share/69360126-de6c-8013-9397-5139d77b9309
originally used for animating between charts, now the portion that animates the lines coming in was used for this chart */
/*this script was derived from the interactiveline.js script */

window.addEventListener("load", function () {

    // -----------------------------
    // GET REAL SIZE OF #chart
    // -----------------------------
    const container = d3.select("#chart4");

    function getSize() {
        const rect = container.node().getBoundingClientRect();
        return {
            width: rect.width || 800,
            height: rect.height || 400
        };
    }

    //dimension variables declared for reuse and responsiveness
    let { width, height } = getSize();
    const margin = { top: 50, right: 120, bottom: 50, left: 60 };

    let plotWidth = width - margin.right - 10;
    let plotHeight = height - margin.top - margin.bottom;

    // -----------------------------
    // SVG + GROUP SETUP
    // -----------------------------
    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "none");

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
      

    let data;

    // -----------------------------
    // FORMAT LABEL
    // -----------------------------
    const formatLabel = svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Nintendo Sales")
        .attr("class", "title-size");

    // -----------------------------
    // LOAD CSV
    // -----------------------------
    d3.csv("./datasets/platformdata.csv").then(raw => {
        data = raw.map(d => ({
            Year: +d.Year,
            Developer: d.Developer,
            Physical: +d["Physical (%)"].replace("%", "") || 0,
            Digital: +d["Digital (%)"].replace("%", "") || 0
        }));

        drawOutlier();
    });

    // -----------------------------
    // DRAW OUTLIER CHART
    // -----------------------------
    function drawOutlier() {

        g.selectAll("*").remove();
        formatLabel.text("Nintendo Sales");

        const chartData = data.filter(d => d.Developer === "Nintendo");
        const years = [...new Set(chartData.map(d => d.Year))];

        const x = d3.scalePoint().domain(years).range([0, plotWidth]);
        const y = d3.scaleLinear().domain([0, 100]).range([plotHeight, 0]);

        //variable for mobile screens
        const isMobile = window.innerWidth < 600;

        const xAxis = g.append("g")
            .attr("transform", `translate(0,${plotHeight})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")))
            .attr("class", "tick-text-size");

        //controller for mobile screens
        if (isMobile) {
        xAxis.selectAll("text")
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "-0.3em");
        }

        //axes labels
        g.append("text")
            .attr("x", plotWidth / 2)
            .attr("y", plotHeight + 40)
            .attr("text-anchor", "middle")
            .text("Year")
            .attr("class", "label-size");

        g.append("g").call(d3.axisLeft(y))
            .style("color", "white");
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -plotHeight / 2)
            .attr("y", -45)
            .attr("text-anchor", "middle")
            .text("Percentage (%)")
            .attr("class", "label-size");

        const line = d3.line()
            .x(d => x(d.Year))
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);

        //declaration of lines and colours for the charts
        const lines = [
            { type: "Physical", values: chartData.map(d => ({ Year: d.Year, value: d.Physical })), color: "#1f77b4" },
            { type: "Digital", values: chartData.map(d => ({ Year: d.Year, value: d.Digital })), color: "#e41a1c" }
        ];

        const groups = g.selectAll(".outlier")
            .data(lines)
            .enter()
            .append("g")
            .attr("class", "outlier");

        groups.append("path")
            .attr("fill", "none")
            .attr("stroke-width", 3)
            .attr("stroke", d => d.color)
            .attr("d", d => line(d.values.map(p => ({ Year: p.Year, value: 0 }))))
            .transition()
            .duration(1000)
            .attrTween("d", function (d) {
                return d3.interpolatePath(d3.select(this).attr("d"), line(d.values));
            });
      
            //annotations for lines, placed at the end
        groups.append("text")
            .attr("fill", d => d.color)
            .attr("font-size", 14)
            .attr("dy", "0.35em")
            .text(d => d.type)
            .attr("transform", (d, i) => {
                const last = d.values[d.values.length - 1];
                return `translate(${x(last.Year) + 6},${y(0) - i * 15})`;
            })
            .transition()
            .duration(1000)
            .attr("transform", (d, i) => {
                const last = d.values[d.values.length - 1];
                return `translate(${x(last.Year) + 6},${y(last.value) - i * 15})`;
            });
    }

    // -----------------------------
    // ON WINDOW RESIZE
    // -----------------------------
    window.addEventListener("resize", () => {

        ({ width, height } = getSize());
        plotWidth = width - margin.right - 10;
        plotHeight = height - margin.top - margin.bottom;

        svg.attr("viewBox", `0 0 ${width} ${height}`);

        drawOutlier();
    });

});

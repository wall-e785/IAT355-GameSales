window.addEventListener("load", function () {

    // -----------------------------
    // GET REAL SIZE OF #chart
    // -----------------------------
    const container = d3.select("#chart1");

    function getSize() {
        const rect = container.node().getBoundingClientRect();
        return {
            width: rect.width || 800,
            height: rect.height || 400
        };
    }

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
        .attr("transform", `translate(${margin.left},${margin.top})`);

    let data;
    let currentType = "Physical";

    // -----------------------------
    // FORMAT LABEL
    // -----------------------------
    const formatLabel = svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Physical Sales")
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

        drawChart();
    });

    // -----------------------------
    // BUTTONS
    // -----------------------------
    document.getElementById("physicalBtn").onclick = () => {
        currentType = "Physical";
        drawChart(true);
    };

    document.getElementById("digitalBtn").onclick = () => {
        currentType = "Digital";
        drawChart(true);
    };

    // Highlight active button
    d3.selectAll("#line-controls button").on("click", function () {
        d3.selectAll("#line-controls button").classed("active", false);
        d3.select(this).classed("active", true);
    });

    // -----------------------------
    // DRAW CHART
    // -----------------------------
    function drawChart(animate = false) {

        g.selectAll("*").remove();
        formatLabel.text(currentType === "Physical" ? "Physical Sales" : "Digital Sales");

        const years = [...new Set(data.map(d => d.Year))];

        const x = d3.scaleLinear().domain(d3.extent(years)).range([0, plotWidth]);
        const y = d3.scaleLinear().domain([0, 100]).range([plotHeight, 0]);

        const isMobile = window.innerWidth < 600;

        // -----------------------------
        // X AXIS
        // -----------------------------
        const xAxis = g.append("g")
            .attr("transform", `translate(0,${plotHeight})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")))
            .attr("class", "tick-text-size");

        if (isMobile) {
            xAxis.selectAll("text")
                .attr("transform", "rotate(-90)")
                .style("text-anchor", "end")
                .attr("dx", "-0.8em")
                .attr("dy", "-0.3em");
        }

        g.append("text")
            .attr("x", plotWidth / 2)
            .attr("y", plotHeight + 40)
            .attr("text-anchor", "middle")
            .text("Year")
            .attr("class", "label-size");

        // -----------------------------
        // Y AXIS (NORMAL)
        // -----------------------------
        const yAxis = g.append("g")
            .call(d3.axisLeft(y))
            .attr("class", "tick-text-size");

        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -plotHeight / 2)
            .attr("y", -45)
            .attr("text-anchor", "middle")
            .text("Percentage (%)")
            .attr("class", "label-size");

        // -----------------------------
        // LINES + LABELS
        // -----------------------------
        const line = d3.line()
            .x(d => x(d.Year))
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);

        const groups = d3.groups(data, d => d.Developer);
        const color = d3.scaleOrdinal()
            .domain(groups.map(d => d[0]))
            .range(["#1f77b4", "#e41a1c", "#4daf4a"]);

        const devGroups = g.selectAll(".dev")
            .data(groups)
            .enter()
            .append("g")
            .attr("class", "dev");

        devGroups.append("path")
            .attr("fill", "none")
            .attr("stroke-width", 3)
            .attr("stroke", d => color(d[0]))
            .attr("d", d => line(d[1].map(p => ({ Year: p.Year, value: 0 }))))
            .transition()
            .duration(1000)
            .attrTween("d", function (d) {
                const newData = d[1].map(p => ({
                    Year: p.Year,
                    value: currentType === "Physical" ? p.Physical : p.Digital
                }));
                return d3.interpolatePath(d3.select(this).attr("d"), line(newData));
            });

        devGroups.append("text")
            .attr("fill", d => color(d[0]))
            .attr("font-size", 14)
            .attr("dy", "0.35em")
            .text(d => d[0])
            .style("font-size", ".7rem")
            .style("font-family", "GT America, Arial")
            .attr("transform", d => {
                const last = d[1][d[1].length - 1];
                return `translate(${x(last.Year) + 6},${y(0)})`;
            })
            .transition()
            .duration(1000)
            .attr("transform", d => {
                const last = d[1][d[1].length - 1];
                const v = currentType === "Physical" ? last.Physical : last.Digital;
                return `translate(${x(last.Year) + 6},${y(v)})`;
            });
    }

    // -----------------------------
    // HANDLE RESIZE
    // -----------------------------
    window.addEventListener("resize", () => {

        ({ width, height } = getSize());
        plotWidth = width - margin.right - 10;
        plotHeight = height - margin.top - margin.bottom;

        svg.attr("viewBox", `0 0 ${width} ${height}`);

        drawChart();
    });

});

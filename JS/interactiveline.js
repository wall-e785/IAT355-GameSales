window.addEventListener("load", function () {

    // -----------------------------
    // GET REAL SIZE OF #chart
    // -----------------------------
    const container = d3.select("#chart");

    function getSize() {
        const rect = container.node().getBoundingClientRect();
        return {
            width: rect.width || 800,
            height: rect.height || 400
        };
    }

    let { width, height } = getSize();
    const margin = { top: 50, right: 120, bottom: 50, left: 60 };

    let plotWidth = width - margin.left - margin.right;
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
        .style("stroke", "#ffffff");

    let data;
    let currentType = "Physical";

    // -----------------------------
    // FORMAT LABEL
    // -----------------------------
    const formatLabel = svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", 18)
        .attr("font-weight", "bold")
        .style("fill", "#ffffff")
        .text("Physical Sales");

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

    document.getElementById("outlierBtn").onclick = () => {
        drawOutlier();
    };

    // -----------------------------
    // DRAW NORMAL CHART
    // -----------------------------
    function drawChart(animate = false) {

        g.selectAll("*").remove();
        formatLabel.text(currentType === "Physical" ? "Physical Sales" : "Digital Sales");

        const years = [...new Set(data.map(d => d.Year))];

        const x = d3.scaleLinear().domain(d3.extent(years)).range([0, plotWidth]);
        const y = d3.scaleLinear().domain([0, 100]).range([plotHeight, 0]);

        // axes
        g.append("g")
            .attr("transform", `translate(0,${plotHeight})`)
            .style("stroke", "#ffffff")
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        g.append("text")
            .attr("x", plotWidth / 2)
            .attr("y", plotHeight + 40)
            .style("fill", "#ffffff")
            .attr("text-anchor", "middle")
            .text("Year");

        g.append("g")
            .style("stroke", "#ffffff")
            .call(d3.axisLeft(y));

        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -plotHeight / 2)
            .attr("y", -45)
            .attr("text-anchor", "middle")
            .style("fill", "#ffffff")
            .text("Percentage (%)");

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

        // lines
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

        // labels
        devGroups.append("text")
            .attr("fill", d => color(d[0]))
            .attr("font-size", 14)
            .attr("dy", "0.35em")
            .text(d => d[0])
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
    // DRAW OUTLIER CHART
    // -----------------------------
    function drawOutlier() {

        g.selectAll("*").remove();
        formatLabel.text("Nintendo Sales");

        const chartData = data.filter(d => d.Developer === "Nintendo");
        const years = [...new Set(chartData.map(d => d.Year))];

        const x = d3.scaleLinear().domain(d3.extent(years)).range([0, plotWidth]);
        const y = d3.scaleLinear().domain([0, 100]).range([plotHeight, 0]);

        g.append("g")
            .attr("transform", `translate(0,${plotHeight})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        g.append("text")
            .attr("x", plotWidth / 2)
            .attr("y", plotHeight + 40)
            .attr("text-anchor", "middle")
            .style("fill", "#ffffff")
            .text("Year");

        g.append("g").call(d3.axisLeft(y));
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -plotHeight / 2)
            .attr("y", -45)
            .attr("text-anchor", "middle")
            .style("fill", "#ffffff")
            .text("Percentage (%)");

        const line = d3.line()
            .x(d => x(d.Year))
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);

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
        plotWidth = width - margin.left - margin.right;
        plotHeight = height - margin.top - margin.bottom;

        svg.attr("viewBox", `0 0 ${width} ${height}`);

        drawChart();
    });

});

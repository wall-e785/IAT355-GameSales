async function run() {
  const companies = await d3.csv("./datasets/chart1data format column v2@2.csv");
  const platforms = await d3.csv("./datasets/Single Platform (Console Developer) vs. Multi Platform.csv");
  const usData = await d3.csv("./datasets/US_SalesData.csv");

  const visComparison = vl.markSquare()
    .data(platforms)
    .transform([
      vl.fold(["Physical (%)", "Digital (%)"])
        .as(["Format", "Sales"])
    ])
    .encode(
      vl.x().fieldO("Year"),
      vl.y().fieldN("Developer"),
      vl.size().fieldQ("Sales").scale({ range: [10, 1000] }),
      vl.color().fieldN("Format").scale({range: ["#1f77b4", "#ff7f0e"]}), //put colour values here to pic them,
      vl.tooltip([
        { field: "Developer", type: "nominal" },
        { field: "Format", type: "nominal" },
        { field: "Sales", type: "quantitative" }
      ]),
      vl.yOffset().fieldN("Sales")
    )
    .config({
      background: "white",        // <-- keep axes/legend white
      view: {
        //fill: null
        fill: "transparent",      // <-- chart area transparent
        stroke: "#ccc"            // optional border
      }
    })
    .width(800)
    .height(400)
    .toSpec(); 


  const visRevenueShare = vl
      .markBar()
      .data(companies)
      .title("Digital Revenue Share of Video Game Publishers Worldwide in 2024")
      .encode(
          vl.column().fieldN("Publisher").sort(vl.fieldQ("Frequency").order("ascending")).title(""),
          vl.x().fieldN("Format").title(""),
          vl.y().fieldQ("Frequency").axis({ format: "%"}).title("Percentage of Sales"),
          vl.color().fieldN("Format"),
      ).width(210).toSpec();
    
    //radio button selector for visUSSales
    //referenced: https://www.javascripttutorial.net/javascript-dom/javascript-radio-button/
    const button = document.getElementById("formatButton");
    const formatRadioButtons = document.querySelectorAll('input[name="formatHighlight"]');
    let selectedFormat;
    button.addEventListener("click", () => {
            for (const radioButton of formatRadioButtons) {
                if (radioButton.checked) {
                    selectedFormat = radioButton.value;
                    break;
                }
              }
    })

    const visUSSales = vl.markRect()
      .data(
        usData.flatMap(d => 
          ["Physical", "Digital"].map(format => ({
            Year: d.Year,
            Format: format,
            Sales: +d[format],  // ensure numeric
            opacity: selectedFormat === "Both" || selectedFormat === format ? 1 : 0.2
          }))
        )
      )
      .encode(
        vl.x().fieldO("Year"),
        vl.y().fieldQ("Sales"),
        vl.color().fieldN("Format").scale({range: ["#1f77b4", "#ff7f0e"]}), //put colour values here to pic them
        vl.opacity().fieldQ("opacity"),
        vl.tooltip([
          {field: "Year", type: "ordinal"},
          {field: "Format", type: "nominal"},
          {field: "Sales", type: "quantitative"}
        ])
    )
    .width(1000)
    .height(490)
    .toSpec(); 

  const visSquareEnixSales = vl.markBar()                        // Make a scatter chart
    .data(
      //filter control
      platforms.filter(d =>
        (d.Developer === "Square Enix")
      )
    )
    .title("Square Enix Sales by Format")
    .transform([ //transform the data into an array
      vl.fold(["Physical (%)", "Digital (%)"])
        .as(["Format", "Sales"]),
    
    ])
    .encode(
      vl.x().fieldO("Year"),       // Platform
      vl.y().fieldQ("Sales"),              // Genre
      //vl.size().fieldQ("Sales"),
      vl.color().fieldN("Format"),
    // vl.tooltip().fieldN("Developer"),
      vl.tooltip([ //copied the tooltip from the previous visualization
        {field: "Developer", type: "nominal"},
        {field: "Format", type: "nominal"},
        {field: "Sales", type: "quantitative"}
        ]),
      vl.yOffset().fieldN("Sales") // makes bars grouped by region
      
    )
    .width(840)
    .height(400)
    .toSpec(); 

  const visNintendoSales= vl.markBar()                        // Make a scatter chart
    .data(
      //filter control
      platforms.filter(d =>
        (d.Developer === "Nintendo")
      )
    )
    .title("Nintendo Sales by Format")
    .transform([ //transform the data into an array
      vl.fold(["Physical (%)", "Digital (%)"])
        .as(["Format", "Sales"]),
    
    ])
    .encode(
      vl.x().fieldO("Year"),       // Platform
      vl.y().fieldQ("Sales"),              // Genre
      //vl.size().fieldQ("Sales"),
      vl.color().fieldN("Format"),
    // vl.tooltip().fieldN("Developer"),
      vl.tooltip([ //copied the tooltip from the previous visualization
        {field: "Developer", type: "nominal"},
        {field: "Format", type: "nominal"},
        {field: "Sales", type: "quantitative"}
        ]),
      vl.yOffset().fieldN("Sales") // makes bars grouped by region
      
    )
    .width(840)
    .height(400)
    .toSpec();

  const visCapcomSales = vl.markBar()                        // Make a scatter chart
    .data(
      //filter control
      platforms.filter(d =>
        (d.Developer === "Capcom")
      )
    )
    .title("Capcom Sales by Format")
    .transform([ //transform the data into an array
      vl.fold(["Physical (%)", "Digital (%)"])
        .as(["Format", "Sales"]),
    
    ])
    .encode(
      vl.x().fieldO("Year"),       // Platform
      vl.y().fieldQ("Sales"),              // Genre
      //vl.size().fieldQ("Sales"),
      vl.color().fieldN("Format"),
    // vl.tooltip().fieldN("Developer"),
      vl.tooltip([ //copied the tooltip from the previous visualization
        {field: "Developer", type: "nominal"},
        {field: "Format", type: "nominal"},
        {field: "Sales", type: "quantitative"}
        ]),
      vl.yOffset().fieldN("Sales") // makes bars grouped by region
      
    )
    .width(950)
    .height(600)
    .toSpec() 
 


  await render("#visComparison", visComparison);
  await render("#visRevenueShare", visRevenueShare);
  await render("#visUSSales", visUSSales);
  //await render("#visSquareEnixSales", visSquareEnixSales);
  await render("#visNintendoSales", visNintendoSales);
  // await render("#visCapcomSales", visCapcomSales);

}

async function render(viewID, spec) {
  const result = await vegaEmbed(viewID, spec);
  result.view.run();
}

run();

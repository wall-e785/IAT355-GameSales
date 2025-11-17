async function run() {
  const companies = await d3.csv("./datasets/chart1data format column v2@2.csv");
  const platforms = await d3.csv("./datasets/Single Platform (Console Developer) vs. Multi Platform.csv");
  const usData = await d3.csv("./datasets/US_SalesData.csv");

  const visComparison = vl.markCircle()                        // Make a scatter chart
    .data(platforms)
    .title("Comparison of Sales by Format between Capcom, Nintendo, and Square Enix")
    .transform([ //transform the data into an array
        vl.fold(["Physical (%)", "Digital (%)"])
        .as(["Format", "Sales"])
    ])
    .encode(
        vl.x().fieldO("Year"),       // Platform
        vl.y().fieldN("Developer"),              // Genre
        vl.size().fieldQ("Sales"),
        vl.color().fieldN("Format"),
    // vl.tooltip().fieldN("Developer"),
        vl.tooltip([ //copied the tooltip from the previous visualization
        {field: "Developer", type: "nominal"},
        {field: "Format", type: "nominal"},
        ]),
        vl.yOffset().fieldN("Sales") // makes bars grouped by region
        
    )
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

  const visUSSales = vl.markRect()                        // Make a scatter chart
    .data(usData)
    .title("U.S. Sales Data from 2009 to 2018")
    .transform([ //transform the data into an array
      vl.fold(["Physical", "Digital"])
        .as(["Format", "Sales"])
    ])
    .encode(
      vl.x().fieldO("Year"),       // Platform
      vl.y().fieldQ("Sales"),              // Genre
      //vl.size().fieldQ("Sales"),
      vl.color().fieldN("Format"),
      vl.opacity().fieldN("Format"),
    // vl.tooltip().fieldN("Developer"),
      // vl.tooltip([ //copied the tooltip from the previous visualization
      //   {field: "Year", type: "ordinal"},
      //   {field: "Format", type: "qualitative"},
      //   {field: "Sales", type: "qualitative"}
      //   ]),
      vl.yOffset().fieldO("Year") // makes bars grouped by region
      
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

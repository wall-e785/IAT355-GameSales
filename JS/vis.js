async function run() {
  const companies = await d3.csv("./datasets/chart1data format column v2@2.csv");
  const platforms = await d3.csv("./datasets/Single Platform (Console Developer) vs. Multi Platform.csv");

  const vis1 = vl.markCircle()                        // Make a scatter chart
    .data(platforms)
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
    .width(950)
    .height(600)
    .toSpec(); 


  const vis2 = vl
    .markBar()
    .data(companies)
    .title("Digital Revenue Share of Video Game Publishers Worldwide in 2024")
    .encode(
        vl.column().fieldN("Publisher").sort(vl.fieldQ("Frequency").order("ascending")).title(""),
        vl.x().fieldN("Format").title(""),
        vl.y().fieldQ("Frequency").axis({ format: "%"}).title("Percentage of Sales"),
        vl.color().fieldN("Format"),
    ).toSpec();


  await render("#vis1", vis1);
  await render("#vis2", vis2);

}

async function render(viewID, spec) {
  const result = await vegaEmbed(viewID, spec);
  result.view.run();
}

run();

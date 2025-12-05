// //global variables for responsiveness, referenced from: https://www.geeksforgeeks.org/javascript/how-to-detect-when-the-window-size-is-resized-using-javascript/
// let screenWidth = window.innerWidth;

// //create tuples for each vis
// let usSalesWH= [400, 300];
// let comparisonWH = [400, 300];
// let nintendoWH = [400, 300];
// console.log(screenWidth);
// updateVisDims();

// function updateVisDims(){
//   if(screenWidth >= 1500){
//     usSalesWH = [1000, 490];
//     comparisonWH = [800, 400];
//     nintendoWH = [835, 400];
//   }else if(screenWidth>=1200){
//     usSalesWH = [400, 500];
//     comparisonWH = [350, 500];
//     nintendoWH = [390, 500];
//   }else if(screenWidth>=900){
//     usSalesWH = [700, 400];
//     comparisonWH = [620, 400];
//     nintendoWH = [660, 400];
//   }else if(screenWidth>=600){
//     usSalesWH = [400, 300];
//     comparisonWH = [350, 250];
//     nintendoWH = [390, 250];
//   }else if(screenWidth>=300){
//     usSalesWH= [150, 200];
//     comparisonWH = [90, 250];
//     nintendoWH = [120, 200];
//   }

//     run();
//     runUSVis();
// }

// window.addEventListener("resize", () =>{
//   screenWidth = window.innerWidth;
//   console.log(screenWidth);
//   updateVisDims();

// })

//global variables for 2009-2018 US Sales Visualization
let visUSSales;
let visUSData;

//radio button selector for visUSSales, button to toggle between the three different views.
//referenced: https://www.javascripttutorial.net/javascript-dom/javascript-radio-button/
let selectedFormat = "Both";
const button = document.getElementById("formatButton");
const formatRadioButtons = document.querySelectorAll('input[name="formatHighlight"]');
button.addEventListener("click", () => {
  for (const radioButton of formatRadioButtons) {
      if (radioButton.checked) {
          //console.log(radioButton.value);

          //create the visualization based on the selected option
          selectedFormat = radioButton.value;
          visUSSales = createVisUSSales(visUSData, selectedFormat);

          //rerender the US Vis
          runUSVis();
          break;
      }
    }
})

//to implement the interactivity from observable, this function recreates the VisUSSales visualization using whichever format is seleted by HTML radio buttons.
function createVisUSSales(usData, selectedFormat){
  console.log("Creating US Vis");
  return vl.markRect()
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
  .width("container")
  .height(300)
  // .width(usSalesWH[0])
  // .height(usSalesWH[1])
  .toSpec(); 
}

//used as seperate run function to only render the 2009-2018 vis
async function runUSVis(){
  const usData = await d3.csv("./datasets/US_SalesData.csv");

  visUSData = usData;

  visUSSales = createVisUSSales(usData, selectedFormat);
  await render("#visUSSales", visUSSales);
}

async function run() {
  const companies = await d3.csv("./datasets/piechartdata.csv");
  const platforms = await d3.csv("./datasets/platformdata.csv");

  // const visComparison = vl.markSquare()
  //   .data(platforms)
  //   .transform([
  //     vl.fold(["Physical (%)", "Digital (%)"])
  //       .as(["Format", "Sales"])
  //   ])
  //   .encode(
  //     vl.x().fieldO("Year"),
  //     vl.y().fieldN("Developer"),
  //     vl.size().fieldQ("Sales").scale({ range: [10, 1000] }),
  //     vl.color().fieldN("Format").scale({range: ["#1f77b4", "#ff7f0e"]}), //put colour values here to pic them,
  //     vl.tooltip([
  //       { field: "Developer", type: "nominal" },
  //       { field: "Format", type: "nominal" },
  //       { field: "Sales", type: "quantitative" }
  //     ]),
  //     vl.yOffset().fieldN("Sales")
  //   )
  //   .config({
  //     background: "white",        // <-- keep axes/legend white
  //     view: {
  //       //fill: null
  //       fill: "transparent",      // <-- chart area transparent
  //       stroke: "#ccc"            // optional border
  //     }
  //   })
  //   .width(comparisonWH[0])
  //   .height(comparisonWH[1])
  //   .toSpec(); 


  // const visRevenueShare = vl
  //     .markBar()
  //     .data(companies)
  //     .title("Digital Revenue Share of Video Game Publishers Worldwide in 2024")
  //     .encode(
  //         vl.column().fieldN("Publisher").sort(vl.fieldQ("Frequency").order("ascending")).title(""),
  //         vl.x().fieldN("Format").title(""),
  //         vl.y().fieldQ("Frequency").axis({ format: "%"}).title("Percentage of Sales"),
  //         vl.color().fieldN("Format"),
  //     ).width(210).toSpec();

  // const visSquareEnixSales = vl.markBar()                        // Make a scatter chart
  //   .data(
  //     //filter control
  //     platforms.filter(d =>
  //       (d.Developer === "Square Enix")
  //     )
  //   )
  //   .title("Square Enix Sales by Format")
  //   .transform([ //transform the data into an array
  //     vl.fold(["Physical (%)", "Digital (%)"])
  //       .as(["Format", "Sales"]),
    
  //   ])
  //   .encode(
  //     vl.x().fieldO("Year"),       // Platform
  //     vl.y().fieldQ("Sales"),              // Genre
  //     //vl.size().fieldQ("Sales"),
  //     vl.color().fieldN("Format"),
  //   // vl.tooltip().fieldN("Developer"),
  //     vl.tooltip([ //copied the tooltip from the previous visualization
  //       {field: "Developer", type: "nominal"},
  //       {field: "Format", type: "nominal"},
  //       {field: "Sales", type: "quantitative"}
  //       ]),
  //     vl.yOffset().fieldN("Sales") // makes bars grouped by region
      
  //   )
  //   .width(800)
  //   .height(400)
  //   .toSpec(); 

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
    .width("container")
    .height(300)
    .toSpec();

  // const visCapcomSales = vl.markBar()                        // Make a scatter chart
  //   .data(
  //     //filter control
  //     platforms.filter(d =>
  //       (d.Developer === "Capcom")
  //     )
  //   )
  //   .title("Capcom Sales by Format")
  //   .transform([ //transform the data into an array
  //     vl.fold(["Physical (%)", "Digital (%)"])
  //       .as(["Format", "Sales"]),
    
  //   ])
  //   .encode(
  //     vl.x().fieldO("Year"),       // Platform
  //     vl.y().fieldQ("Sales"),              // Genre
  //     //vl.size().fieldQ("Sales"),
  //     vl.color().fieldN("Format"),
  //   // vl.tooltip().fieldN("Developer"),
  //     vl.tooltip([ //copied the tooltip from the previous visualization
  //       {field: "Developer", type: "nominal"},
  //       {field: "Format", type: "nominal"},
  //       {field: "Sales", type: "quantitative"}
  //       ]),
  //     vl.yOffset().fieldN("Sales") // makes bars grouped by region
      
  //   )
  //   .width(950)
  //   .height(600)
  //   .toSpec() 
 


  // await render("#visComparison", visComparison);
  // await render("#visRevenueShare", visRevenueShare);

  //await render("#visSquareEnixSales", visSquareEnixSales);
  await render("#visNintendoSales", visNintendoSales);
  // await render("#visCapcomSales", visCapcomSales);

  runUSVis();

}

async function render(viewID, spec) {
  const result = await vegaEmbed(viewID, spec, {actions: false, config: {
    autosize: {
      type: "fit",
      contains: "padding",
      resize: true       
    }
  }});
  result.view.run();
}



run();

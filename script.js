
/* === Additional styles merged  === */
// Define the canvas dimensions and margins
const width = 800, height = 600;
const margin = { top: 60, right: 30, bottom: 80, left: 80 };
const barWidth = width - margin.left - margin.right;
const barHeight = height - margin.top - margin.bottom;

// Select the main SVG element and tooltip/message overlays
const svg = d3.select("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "100%");
const tooltip = d3.select("#tooltip");
const message = document.getElementById("message-overlay");

// Define race categories used across charts
const races = ["Anti-Black", "Anti-Asian", "Anti-Hispanic"];

// Text messages to show during each scroll step
const messages = {
  0: "Even after COVID, anti-Asian hate crimes remain elevated.",
  1: "Even after COVID, anti-Asian hate crimes remain elevated.",
  2: "Victims of hate crimes share similar gender characteristics.",
  3: "Victims of hate crimes share similar age characteristics.",
  4: "Asian people are more often targeted<br>by strangers in public spaces.",
  5: "Asian people are more often targeted<br>by strangers in public spaces."
};

// Append SVG groups for each chart and set initial opacity to 0
const scale = 0.75;
const offsetX = (width - barWidth * scale) / 2;
const offsetY = (height - barHeight * scale) / 2;

const lineChart = svg.append("g")
  .attr("id", "line-chart")
  .attr("transform", `translate(${offsetX}, ${offsetY}) scale(${scale})`)
  .style("opacity", 0);

const lineChartPerCapita = svg.append("g")
  .attr("id", "line-chart-percapita")
  .attr("transform", `translate(${offsetX}, ${offsetY}) scale(${scale})`)
  .style("opacity", 0);

const sexPieGroup = svg.append("g")
  .attr("id", "sex-pie-group")
  .attr("transform", `translate(${offsetX}, ${offsetY}) scale(${scale})`)
  .style("opacity", 0);

const barLocation = svg.append("g")
  .attr("id", "bar-location")
  .attr("transform", `translate(${offsetX}, ${offsetY}) scale(${scale})`)
  .style("opacity", 0);

const barRelationship = svg.append("g")
  .attr("id", "bar-relationship")
  .attr("transform", `translate(${offsetX}, ${offsetY}) scale(${scale})`)
  .style("opacity", 0);

const densityGroup = svg.append("g")
  .attr("id", "density-group")
  .attr("transform", `translate(${offsetX}, ${offsetY}) scale(${scale})`)
  .style("opacity", 0);


// Transition between chart steps based on scroll position
function transitionTo(step) {
  // Define chart groups and the step at which each should be shown
  const groups = [
    { el: lineChart, step: 0 },
    { el: lineChartPerCapita, step: 1 },
    { el: sexPieGroup, step: 2 },
    { el: d3.select("#pie-legend"), step: 2 },
    { el: densityGroup, step: 3 },
    { el: barLocation, step: 4 },
    { el: barRelationship, step: 5 }
  ];

  // Fade in the target chart and fade out others
  groups.forEach(({ el, step: target }) => {
    el.transition()
      .duration(800)
      .style("opacity", step === target ? 1 : 0);
  });

  // Handle overlay message
  const messageText = document.getElementById("message-text");
  const currentMessage = messages[step];
  const prevMessage = messageText.innerHTML;
  const message = document.getElementById("message-overlay");

  // Show the overlay message only during steps 0–5 (victim section)
  if (step >= 0 && step <= 5 && currentMessage && currentMessage !== prevMessage) {
    message.classList.remove("visible");
    setTimeout(() => {
      messageText.innerHTML = currentMessage;
      message.classList.add("visible");
    }, 300);
  } else {
    // Hide the message outside of the victim section
    message.classList.remove("visible");
  }
}

// Initialize scrollama to trigger chart transitions on scroll
scrollama().setup({
  step: ".stride",
  offset: 0.5
}).onStepEnter(response => transitionTo(response.index));


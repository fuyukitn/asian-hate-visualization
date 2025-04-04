// Donut pie charts showing victim sex distribution by group
// Data source: hardcoded pieData array

const colorSex = d3.scaleOrdinal()
  .domain(["Female", "Male", "Unknown"])
  .range(["#a78bfa", "#34d399", "#9ca3af"]);

const pieData = [
  {
    group: "Anti-Black",
    values: [
      { sex: "Female", value: 35 },
      { sex: "Male", value: 63 },
      { sex: "Unknown", value: 2 }
    ]
  },
  {
    group: "Anti-Asian",
    values: [
      { sex: "Female", value: 33 },
      { sex: "Male", value: 66 },
      { sex: "Unknown", value: 1 }
    ]
  },
  {
    group: "Anti-Hispanic",
    values: [
      { sex: "Female", value: 27 },
      { sex: "Male", value: 72 },
      { sex: "Unknown", value: 1 }
    ]
  }
];

const radius = 80;
const pie = d3.pie().value(d => d.value);
const arc = d3.arc().innerRadius(30).outerRadius(radius);

// Clear previous content if any
sexPieGroup.selectAll("*").remove();

// Draw each group’s donut chart
pieData.forEach((group, i) => {
  const g = sexPieGroup.append("g")
    .attr("transform", `translate(${160 + i * 220}, ${height / 2})`);

  const arcs = pie(group.values);

  g.selectAll("path")
    .data(arcs)
    .join("path")
    .attr("d", arc)
    .attr("fill", d => colorSex(d.data.sex))
    .on("mouseover", (event, d) => {
      tooltip.transition().style("opacity", 0.95);
      tooltip.html(`<strong>${group.group}</strong><br>${d.data.sex}: ${d.data.value}%`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", () => tooltip.transition().style("opacity", 0));

  g.append("text")
    .attr("y", radius + 20)
    .attr("text-anchor", "middle")
    .style("fill", "#ccc")
    .style("font-size", "14px")
    .text(group.group);
});

// Create legend for the pie chart
const legend = svg.append("g")
  .attr("id", "pie-legend")
  .attr("transform", `translate(${width - 180}, ${margin.top})`)
  .style("opacity", 0);

["Female", "Male", "Unknown"].forEach((label, i) => {
  const row = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
  row.append("rect")
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", colorSex(label));
  row.append("text")
    .attr("x", 18)
    .attr("y", 10)
    .attr("fill", "#ccc")
    .style("font-size", "12px")
    .text(label);
});

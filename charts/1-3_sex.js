// Draw victim sex pie charts inside #sex-pie-group

const chartRadius = 80;
const pieGroupY = 300; // vertically center in svg height (600)

const colorSex = d3.scaleOrdinal()
  .domain(["Female", "Male", "Unknown"])
  .range(["#a78bfa", "#34d399", "#9ca3af"]);

  const biasLabelMap = {
    14: "Anti-Asian",
    12: "Anti-Black",
    32: "Anti-Hispanic"
  };

d3.csv("data/1-3_sex.csv").then(data => {
  // Ensure numeric values
  data.forEach(d => {
    d.Female = +d.Female;
    d.Male = +d.Male;
    d.Unknown = +d.Unknown;
  });

  const pie = d3.pie().value(d => d.value);
  const arc = d3.arc().innerRadius(chartRadius * 0.5).outerRadius(chartRadius * 0.8);

  const sexPieGroup = d3.select("#sex-pie-group");

  data.forEach((row, i) => {
    const groupData = [
      { sex: "Female", value: row.Female },
      { sex: "Male", value: row.Male },
      { sex: "Unknown", value: row.Unknown }
    ];

    const groupLabel = biasLabelMap[row.bias_code];
    const g = sexPieGroup.append("g")
      .attr("transform", `translate(${180 + i * 220}, ${pieGroupY})`);

    const arcs = pie(groupData);

    // Donut paths
    g.selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => colorSex(d.data.sex))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.85);

    // Labels below each pie
    g.append("text")
      .attr("y", chartRadius + 20)
      .attr("text-anchor", "middle")
      .style("fill", "#ccc")
      .style("font-size", "14px")
      .text(groupLabel);
  });
});
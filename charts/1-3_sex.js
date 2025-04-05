// Pie chart showing victim sex distribution by race
// Data source: 1-3_sex.csv

const chartRadius = 80;
const pieGroupY = 300;

const colorSex = d3.scaleOrdinal()
  .domain(["Female", "Male", "Unknown"])
  .range(["#a78bfa", "#34d399", "#9ca3af"]);

const biasLabelMap = {
  14: "Anti-Asian",
  12: "Anti-Black",
  32: "Anti-Hispanic"
};

d3.csv("data/1-3_sex.csv").then(data => {
  // Convert string values to numbers
  data.forEach(d => {
    d.Female = +d.Female;
    d.Male = +d.Male;
    d.Unknown = +d.Unknown;
  });

  const pie = d3.pie().value(d => d.value);
  const arc = d3.arc()
    .innerRadius(chartRadius * 0.5)
    .outerRadius(chartRadius * 0.8);

  const outerArc = d3.arc()
    .innerRadius(chartRadius * 0.9)
    .outerRadius(chartRadius * 0.9);

  const tooltip = d3.select("body").select("#tooltip");
  const sexPieGroup = d3.select("#sex-pie-group");

  data.forEach((row, i) => {
    const raceLabel = biasLabelMap[row.bias_code];
    const values = [
      { sex: "Female", value: row.Female },
      { sex: "Male", value: row.Male },
      { sex: "Unknown", value: row.Unknown }
    ];

    const g = sexPieGroup.append("g")
      .attr("transform", `translate(${180 + i * 220}, ${pieGroupY})`);

    const arcs = pie(values);

    // Pie arcs
    g.selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => colorSex(d.data.sex))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.85)
      .on("mouseover", (event, d) => {
        tooltip
          .style("display", "block")
          .transition()
          .duration(200)
          .style("opacity", 0.95);
        tooltip.html(`
          <strong>${raceLabel}</strong><br>
          Sex: ${d.data.sex}<br>
          Victims: ${d.data.value}
        `)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => {
        tooltip.transition()
          .duration(200)
          .style("opacity", 0)
          .on("end", () => tooltip.style("display", "none"));
      });

    // Polylines
    g.selectAll("polyline")
      .data(arcs)
      .enter()
      .append("polyline")
      .attr("stroke", "#fff")
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr("points", d => {
        const posA = arc.centroid(d);
        const posB = outerArc.centroid(d);
        const posC = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        posC[0] = chartRadius * 0.95 * (midangle < Math.PI ? 1 : -1);
        return [posA, posB, posC];
      });

    // External labels
    g.selectAll("text.label")
      .data(arcs)
      .enter()
      .append("text")
      .attr("class", "label")
      .text(d => `${d.data.sex} (${d.data.value})`)
      .attr("transform", d => {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = chartRadius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style("text-anchor", d => {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return (midangle < Math.PI ? "start" : "end");
      })
      .style("fill", "#fff")
      .style("font-size", "11px");

    // Group label
    g.append("text")
      .attr("y", chartRadius + 20)
      .attr("text-anchor", "middle")
      .style("fill", "#ccc")
      .style("font-size", "14px")
      .text(raceLabel);
  });

  // Add chart title
  sexPieGroup.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top - 30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("fill", "#ccc")
    .text("Victim Sex Distribution");
});
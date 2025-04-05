// Line chart showing per capita hate crime trends
// Data source: 1-2_percapita.csv

d3.csv("data/1-2_percapita.csv", d3.autoType).then(data => {
  const x = d3.scalePoint()
    .domain([...new Set(data.map(d => d.data_year))])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.per_100k)]).nice()
    .range([height - margin.bottom, margin.top]);

  // Color scale for Anti-Black, Anti-Asian, and Anti-Hispanic
  const color = d3.scaleOrdinal()
    .domain(["Anti-Black", "Anti-Asian", "Anti-Hispanic"])
    .range(["#a3a3a3", "#ef4444", "#6b7280"]);

  const groups = d3.groups(data, d => d.group);
  const line = d3.line()
    .x(d => x(d.data_year))
    .y(d => y(d.per_100k));

  const g = lineChartPerCapita.append("g");
  const tooltip = d3.select("body").select(".tooltip");

  // Draw lines
  g.selectAll("path")
    .data(groups)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", d => color(d[0]))
    .attr("stroke-width", 2.5)
    .attr("d", d => line(d[1]));

  // Draw points with tooltips
  g.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.data_year))
    .attr("cy", d => y(d.per_100k))
    .attr("r", 4)
    .attr("fill", d => color(d.group))
    .on("mouseover", (event, d) => {
      tooltip
        .style("display", "block")
        .transition()
        .duration(200)
        .style("opacity", 0.95);
      tooltip.html(`<strong>${d.group}</strong><br>Year: ${d.data_year}<br>Per 100k: ${d.per_100k.toFixed(2)}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", () => {
      tooltip.transition()
        .duration(200)
        .style("opacity", 0)
        .on("end", () => tooltip.style("display", "none"));
    });

  // X Axis with 5-year ticks
  const yearTicks = [...new Set(data.map(d => d.data_year))].filter(y => y % 5 === 0);
  g.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickValues(yearTicks).tickFormat(d3.format("d")));

  // Y Axis
  g.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // X axis label
  g.append("text")
    .attr("x", width / 2)
    .attr("y", height - margin.bottom + 35)
    .attr("text-anchor", "middle")
    .style("fill", "#ccc")
    .style("font-size", "12px")
    .text("Year");

  // Y axis label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", margin.left - 40)
    .attr("text-anchor", "middle")
    .style("fill", "#ccc")
    .style("font-size", "12px")
    .text("Incidents per 100,000");

  // Chart title
  g.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top - 30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("fill", "#ccc")
    .text("Per Capita Hate Crime Trends");

  // Legend
  const legend = g.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width / 2 - 80}, ${margin.top - 10})`);

  // Add color legend based on race groups
  ["Anti-Black", "Anti-Asian", "Anti-Hispanic"].forEach((race, i) => {
    const legendRow = legend.append("g")
      .attr("transform", `translate(${i * 100}, 0)`);

    legendRow.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", color(race));

    legendRow.append("text")
      .attr("x", 16)
      .attr("y", 10)
      .attr("fill", "#ccc")
      .style("font-size", "12px")
      .text(race.replace("Anti-", ""));
  });
});
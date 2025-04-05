// Line chart showing yearly hate crime trends by group
// Data source: counts_by_year.csv

d3.csv("data/1-1_trend.csv", d3.autoType).then(data => {
  const x = d3.scaleBand()
    .domain([...new Set(data.map(d => d.data_year))])
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const tooltip = d3.select("body").select(".tooltip");

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)]).nice()
    .range([height - margin.bottom, margin.top]);

  // Define color scale for Anti-Black, Anti-Asian, Anti-Hispanic
  const color = d3.scaleOrdinal()
    .domain(["Anti-Black", "Anti-Asian", "Anti-Hispanic"])
    .range(["#a3a3a3", "#ef4444", "#6b7280"]);

  const line = d3.line()
    .x(d => x(d.data_year) + x.bandwidth() / 2)
    .y(d => y(d.count));

  const g = lineChart.append("g");

  const groups = d3.groups(data, d => d.group);

  // Draw lines
  g.selectAll("path")
    .data(groups)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", d => color(d[0]))
    .attr("stroke-width", 2.5)
    .attr("d", d => line(d[1]));

  // Draw points with tooltip
  g.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.data_year) + x.bandwidth() / 2)
    .attr("cy", d => y(d.count))
    .attr("r", 4)
    .attr("fill", d => color(d.group))
    .on("mouseover", (event, d) => {
      tooltip
        .style("display", "block")
        .transition()
        .duration(200)
        .style("opacity", 0.95);
      tooltip.html(`<strong>${d.group}</strong><br>Year: ${d.data_year}<br>Incidents: ${d.count}`)
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
  const yearTicks = [...new Set(data.map(d => d.data_year))].filter(year => year % 5 === 0);
  const xAxis = d3.axisBottom(x)
    .tickValues(yearTicks)
    .tickFormat(d3.format("d"));

  g.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

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
    .text("Number of Incidents");

  // Chart title
  g.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top - 30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("fill", "#ccc")
    .text("Trends in Hate Crime by Group");

  // Legend (top-center)
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
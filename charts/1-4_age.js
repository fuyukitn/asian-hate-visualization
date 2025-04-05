// Line chart showing age density distribution by race
// Data source: age_density_by_race.csv

d3.csv("data/1-4_age.csv", d3.autoType).then(data => {
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.age))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.density)]).nice()
    .range([height - margin.bottom, margin.top]);

  const color = d3.scaleOrdinal()
    .domain(races)
    .range(["#a3a3a3", "#ef4444", "#6b7280"]);

  const line = d3.line()
    .x(d => x(d.age))
    .y(d => y(d.density))
    .curve(d3.curveBasis); // Smooth curve

  const grouped = d3.groups(data, d => d.race_label);

  const tooltip = d3.select("body").select("#tooltip");
  const g = densityGroup.append("g");

  // Draw smoothed density lines
  g.selectAll("path")
    .data(grouped)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", d => color(d[0]))
    .attr("stroke-width", 2.5)
    .attr("d", d => line(d[1]));

  // Add invisible hover points, only shown on hover
  g.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.age))
    .attr("cy", d => y(d.density))
    .attr("r", 4)
    .attr("fill", d => color(d.race_label))
    .style("pointer-events", "all")
    .style("opacity", 0) // Start hidden
    .on("mouseover", (event, d) => {
      // Show the hovered circle
      d3.select(event.currentTarget).style("opacity", 1);

      tooltip
        .style("display", "block")
        .transition()
        .duration(200)
        .style("opacity", 0.95);

      tooltip.html(`
        <strong>${d.race_label}</strong><br>
        Age: ${d.age}<br>
        Share: ${(d.density * 100).toFixed(1)}%
      `)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", (event) => {
      // Hide the circle again
      d3.select(event.currentTarget).style("opacity", 0);

      tooltip.transition()
        .duration(200)
        .style("opacity", 0)
        .on("end", () => tooltip.style("display", "none"));
    });

  // X-axis
  const xAxis = d3.axisBottom(x)
    .tickValues(x.domain().filter((year, i) => year % 5 === 0)) // 5-year ticks
    .tickFormat(d3.format("d"));

  g.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  // Y-axis
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
    .text("Age");

  // Y axis label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", margin.left - 40)
    .attr("text-anchor", "middle")
    .style("fill", "#ccc")
    .style("font-size", "12px")
    .text("Density");

  // Chart title
  g.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top - 30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("fill", "#ccc")
    .text("Victim Age Distribution");

  // Legend (top-center)
  const legend = g.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width / 2 - 80}, ${margin.top - 10})`);

  races.forEach((race, i) => {
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
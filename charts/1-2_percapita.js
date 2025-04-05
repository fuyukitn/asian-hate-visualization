// Line chart showing per capita hate crime trends
// Data source: counts_per_100k.csv

d3.csv("data/1-2_percapita.csv", d3.autoType).then(data => {
  const x = d3.scalePoint()
    .domain([...new Set(data.map(d => d.data_year))])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.per_100k)]).nice()
    .range([height - margin.bottom, margin.top]);

  const color = d3.scaleOrdinal()
    .domain(races)
    .range(["#a3a3a3", "#ef4444", "#6b7280"]);

  const groups = d3.groups(data, d => d.group);
  const line = d3.line()
    .x(d => x(d.data_year))
    .y(d => y(d.per_100k));

  const g = lineChartPerCapita.append("g");

  g.selectAll("path")
    .data(groups)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", d => color(d[0]))
    .attr("stroke-width", 2.5)
    .attr("d", d => line(d[1]));

  g.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.data_year))
    .attr("cy", d => y(d.per_100k))
    .attr("r", 4)
    .attr("fill", d => color(d.group))
    .on("mouseover", (event, d) => {
      tooltip.transition().style("opacity", 0.95);
      tooltip.html(`<strong>${d.group}</strong><br>Year: ${d.data_year}<br>Per 100k: ${d.per_100k.toFixed(2)}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", () => tooltip.transition().style("opacity", 0));

  g.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  g.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  g.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top - 30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("fill", "#ccc")
    .text("Per Capita Hate Crime Trends");
});

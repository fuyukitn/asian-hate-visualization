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
    .curve(d3.curveBasis); // Use smooth curve

  const grouped = d3.groups(data, d => d.race_label);

  const g = densityGroup.append("g");

  g.selectAll("path")
    .data(grouped)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", d => color(d[0]))
    .attr("stroke-width", 2.5)
    .attr("d", d => line(d[1]));

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
    .text("Victim Age Distribution");
});

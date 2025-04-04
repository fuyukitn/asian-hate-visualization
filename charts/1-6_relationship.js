// Grouped bar chart showing victim-offender relationships by race
// Data source: relationship_distribution.csv

d3.csv("data/1-6_relationship.csv", d3.autoType).then(data => {
  const g = barRelationship.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const categories = ["Acquaintance", "Stranger", "Unknown"];
  const x0 = d3.scaleBand().domain(categories).range([0, barWidth]).paddingInner(0.1);
  const x1 = d3.scaleBand().domain(races).range([0, x0.bandwidth()]).padding(0.05);
  const y = d3.scaleLinear().domain([0, 100]).range([barHeight, 0]);

  const categoryGroups = g.selectAll("g.category")
    .data(categories)
    .join("g")
    .attr("class", "category")
    .attr("transform", d => `translate(${x0(d)},0)`);

  categoryGroups.each(function(category) {
    const group = d3.select(this);
    const bars = races.map(r => {
      const row = data.find(row => row.bias_group === r);
      return {
        category,
        race: r,
        value: row && !isNaN(row[category]) ? +row[category] : 0
      };
    });

    group.selectAll("rect")
      .data(bars)
      .join("rect")
      .attr("x", d => x1(d.race))
      .attr("y", y(0))
      .attr("width", x1.bandwidth())
      .attr("height", 0)
      .attr("rx", 4)
      .attr("fill", d => {
        if (d.race === "Anti-Asian" && d.category === "Acquaintance") return "#3b82f6";
        if (d.race === "Anti-Asian" && d.category === "Stranger") return "#ef4444";
        return "#666";
      })
      .on("mouseover", (event, d) => {
        tooltip.transition().style("opacity", 0.95);
        tooltip.html(`<strong>${d.race.replace("Anti-", "")}</strong><br>${d.category}: ${d.value.toFixed(1)}%`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => tooltip.transition().style("opacity", 0))
      .transition()
      .duration(1000)
      .delay((_, i) => i * 100)
      .ease(d3.easeCubicOut)
      .attr("y", d => y(d.value))
      .attr("height", d => barHeight - y(d.value));

    group.selectAll("text.race-label")
      .data(bars)
      .join("text")
      .attr("class", "race-label")
      .attr("x", d => x1(d.race) + x1.bandwidth() / 2)
      .attr("y", barHeight + 12)
      .attr("text-anchor", "middle")
      .text(d => d.race.replace("Anti-", ""));
  });

  g.append("g")
    .attr("transform", `translate(0,${barHeight})`)
    .call(d3.axisBottom(x0));

  g.append("g")
    .call(d3.axisLeft(y).ticks(10).tickFormat(d => `${d}%`));

  g.append("text")
    .attr("x", barWidth / 2)
    .attr("y", -30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("fill", "#ccc")
    .text("Victim-Offender Relationship");
});

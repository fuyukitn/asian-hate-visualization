// Grouped bar chart showing victim-offender relationships by race
// Data source: relationship_distribution.csv

d3.csv("data/1-6_relationship.csv", d3.autoType).then(data => {
  const g = barRelationship.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const categories = ["Acquaintance", "Stranger", "Unknown"];
  const x0 = d3.scaleBand().domain(categories).range([0, barWidth]).paddingInner(0.1);
  const x1 = d3.scaleBand().domain(races).range([0, x0.bandwidth()]).padding(0.05);
  const y = d3.scaleLinear().domain([0, 75]).range([barHeight, 0]); // Set max to 75%

  // Adjust the color map
  const colorMap = {
    highlightLow: "#b91c1c",  // Dark red for Acquaintance
    highlightHigh: "#ef4444", // Bright red for Stranger
    others: "#666"            // Gray for Unknown
  };

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
        // Apply color based on category and race
        if (d.race === "Anti-Asian" && d.category === "Acquaintance") return colorMap.highlightLow;  // Dark red
        if (d.race === "Anti-Asian" && d.category === "Stranger") return colorMap.highlightHigh;     // Bright red
        return colorMap.others;  // For other races
      })
      .on("mouseover", (event, d) => {
        tooltip.transition().style("opacity", 0.95);
        tooltip.html(`<strong>${d.race}</strong><br>${d.category}: ${d.value.toFixed(1)}%`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => tooltip.transition().style("opacity", 0))
      .transition()
      .duration(1000)
      .delay((_, i) => i * 100)
      .ease(d3.easeCubicOut)
      .attr("y", d => y(d.value))
      .attr("height", d => barHeight - y(d.value)); // Set height based on value

    group.selectAll("text.race-label")
      .data(bars)
      .join("text")
      .attr("class", "race-label")
      .attr("x", d => x1(d.race) + x1.bandwidth() / 2)
      .attr("y", barHeight + 25)  // Adjust label position vertically further
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#ccc")
      .text(d => d.race.replace("Anti-", ""));
  });

  g.append("g")
    .attr("transform", `translate(0,${barHeight})`)
    .call(d3.axisBottom(x0).tickSize(0)) // Removing tick lines
    .selectAll(".tick text")
    .style("fill", "#fff") // White text for the labels
    .style("font-size", "14px");

  g.append("g")
    .call(d3.axisLeft(y).ticks(7).tickFormat(d => `${d}%`)) // Adjust Y-axis ticks to 7
    .selectAll(".tick text")
    .style("fill", "#fff") // White text for the labels
    .style("font-size", "14px"); // Make the text bigger

  g.append("text")
    .attr("x", barWidth / 2)
    .attr("y", -30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("fill", "#ccc")
    .text("Victim-Offender Relationship");

});
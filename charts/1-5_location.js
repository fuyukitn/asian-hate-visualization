// Grouped bar chart showing hate crime locations by race
// Data source: location_distribution.csv

const locationCategories = ["Residence", "School", "Commercial", "Road", "Other"];
const colorMap = {
  highlightLow: "#3b82f6",
  highlightHigh: "#ef4444",
  others: "#666"
};

d3.csv("data/1-5_location.csv", d3.autoType).then(data => {
  const g = barLocation.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const x0 = d3.scaleBand().domain(locationCategories).range([0, barWidth]).paddingInner(0.1);
  const x1 = d3.scaleBand().domain(races).range([0, x0.bandwidth()]).padding(0.05);
  const y = d3.scaleLinear().domain([0, 100]).range([barHeight, 0]);

  const categoryGroups = g.selectAll("g.category")
    .data(locationCategories)
    .join("g")
    .attr("class", "category")
    .attr("transform", d => `translate(${x0(d)},0)`);

  categoryGroups.each(function(category) {
    const group = d3.select(this);
    const bars = races.map(r => {
      const row = data.find(row => row.Race === r);
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
        if (d.race === "Anti-Asian" && ["Residence", "School"].includes(d.category)) return colorMap.highlightLow;
        if (d.race === "Anti-Asian" && ["Commercial", "Road"].includes(d.category)) return colorMap.highlightHigh;
        return colorMap.others;
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
    .text("Locations of Hate Crimes");
});

// Grouped bar chart showing hate crime locations by race
// Data source: location_distribution.csv

const locationCategories = ["Residence", "School", "Commercial", "Road", "Other"];
const colorMap = {
  highlightLow: "#e74c3c",  // Dark red for Residence and School
  highlightHigh: "#f44336", // Bright red for Commercial and Road
  others: "#666" // Gray for Other
};

d3.csv("data/1-5_location.csv", d3.autoType).then(data => {
  const g = barLocation.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const x0 = d3.scaleBand().domain(locationCategories).range([0, barWidth]).paddingInner(0.1);
  const x1 = d3.scaleBand().domain(races).range([0, x0.bandwidth()]).padding(0.05);
  const y = d3.scaleLinear().domain([0, 50]).range([barHeight, 0]);  // Set max to 50%

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
      .attr("y", y(0))  // Start from the bottom
      .attr("width", x1.bandwidth())
      .attr("height", 0)  // Start with 0 height
      .attr("rx", 4)
      .attr("fill", d => {
        // Apply color based on location and race
        if (d.race === "Anti-Asian" && ["Residence", "School"].includes(d.category)) return colorMap.highlightLow;
        if (d.race === "Anti-Asian" && ["Commercial", "Road"].includes(d.category)) return colorMap.highlightHigh;
        return colorMap.others;  // For other races
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
      .attr("y", d => y(d.value))  // Calculate the height based on the value
      .attr("height", d => barHeight - y(d.value)); // Set the actual height

    // Adjust label positions vertically to avoid overlap with other categories
    group.selectAll("text.race-label")
      .data(bars)
      .join("text")
      .attr("class", "race-label")
      .attr("x", d => x1(d.race) + x1.bandwidth() / 2)
      .attr("y", barHeight + 40)  // Adjust y position to place further above the bar
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#ccc")
      .text(d => d.race.replace("Anti-", ""));
  });

  g.append("g")
    .attr("transform", `translate(0,${barHeight})`)
    .call(d3.axisBottom(x0).tickSize(0)) // Removing the tick lines
    .selectAll(".tick text")
    .style("fill", "#fff") // White text for the labels
    .style("font-size", "14px");  // Make the text bigger

  g.append("g")
    .call(d3.axisLeft(y).ticks(10).tickFormat(d => `${d}%`))
    .selectAll(".tick text")
    .style("fill", "#fff") // White text for the labels
    .style("font-size", "14px");  // Make the text bigger

  g.append("text")
    .attr("x", barWidth / 2)
    .attr("y", -30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("fill", "#ccc")
    .text("Locations of Hate Crimes");

});
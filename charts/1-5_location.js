console.log("🧩 1-5_location.js loaded");

window.renderChart5 = function () {
  console.log("📊 renderChart5 called (location bar)");

  // 🔧: Clear previous content
  barLocation.selectAll("*").remove();

  const locationOrder = ["Residence", "School", "Commercial", "Road", "Other"];
  const intimacyGroup = {
    Residence: "Private",
    School: "Private",
    Commercial: "Public",
    Road: "Public",
    Other: "Public"
  };

  const locationColor = d3.scaleOrdinal()
    .domain(locationOrder)
    .range(["#6366f1", "#3b82f6", "#34d399", "#f97316", "#9ca3af"]);

  const races = ["Anti-Black", "Anti-Asian", "Anti-Hispanic"];
  const g = barLocation.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const y = d3.scaleBand().domain(races).range([0, barHeight]).padding(0.3);
  const x = d3.scaleLinear().domain([0, 100]).range([0, barWidth]);

  d3.csv("data/1-5_location.csv", d3.autoType).then(data => {
    const stack = d3.stack()
      .keys(locationOrder)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const stackedData = stack(data);

    g.selectAll("g.layer")
      .data(stackedData)
      .join("g")
      .attr("fill", d => locationColor(d.key))
      .selectAll("rect")
      .data(d => d.map(([x0, x1], i) => ({
        category: d.key,
        race: data[i].Race,
        x0,
        x1,
        value: x1 - x0
      })))
      .join("rect")
      .attr("y", d => y(d.race))
      .attr("x", d => x(d.x0))
      .attr("height", y.bandwidth())
      .attr("width", d => x(d.x1) - x(d.x0))
      .attr("rx", 4)
      .style("opacity", 0.85)
      .on("mouseover", (event, d) => {
        if (typeof tooltip !== "undefined") {
          tooltip.transition().style("opacity", 0.95);
          tooltip.html(`<strong>${d.race.replace("Anti-", "")}</strong><br>${d.category}: ${d.value.toFixed(1)}%`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`);
        }
      })
      .on("mouseout", () => {
        if (typeof tooltip !== "undefined") {
          tooltip.transition().style("opacity", 0);
        }
      });

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => d.replace("Anti-", "")));

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${barHeight})`)
      .call(d3.axisBottom(x).ticks(10).tickFormat(d => `${d}%`));

    // Title
    g.append("text")
      .attr("x", barWidth / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("fill", "#ccc")
      .text("Hate Crime Locations by Intimacy of Place");

    // Legend
    const legend = g.append("g").attr("transform", `translate(${barWidth + 40}, 0)`);
    const legendGroups = ["Private", "Public"];
    let legendYOffset = 0;

    legendGroups.forEach(group => {
      legend.append("text")
        .attr("x", 0)
        .attr("y", legendYOffset)
        .attr("fill", "#ccc")
        .style("font-size", "13px")
        .style("font-weight", "bold")
        .text(`${group} Space`);
      legendYOffset += 16;

      locationOrder.filter(loc => intimacyGroup[loc] === group).forEach(loc => {
        const row = legend.append("g").attr("transform", `translate(0, ${legendYOffset})`);
        row.append("rect")
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", locationColor(loc));
        row.append("text")
          .attr("x", 18)
          .attr("y", 10)
          .attr("fill", "#ccc")
          .style("font-size", "12px")
          .text(loc);
        legendYOffset += 18;
      });

      legendYOffset += 6;
    });
  });
};
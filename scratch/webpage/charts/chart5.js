// chart5.js
// Rewritten so we can call window.renderChart5(...) in a flexible way.

window.renderChart5 = function(parentSelector = "#chart5") {
    d3.csv("data/offender.csv").then(function(data) {
      const biasTypes = ["Anti-Asian", "Anti-Black", "Anti-Hispanic"];
  
      // Filter for rows that have an offender_race and relevant bias
      const filtered = data.filter(d =>
        d.offender_race &&
        d.offender_race !== "NA" &&
        biasTypes.includes(d.hate_crime)
      );
  
      // Group by hate_crime, then offender_race
      // nested: Map( hate_crime => Map(race => count) )
      const nested = d3.rollup(
        filtered,
        v => v.length,
        d => d.hate_crime.trim(),
        d => d.offender_race.trim()
      );
  
      // Collect all unique offender races from the filtered data
      const allRaces = Array.from(
        new Set(filtered.map(d => d.offender_race.trim()))
      );
  
      // Build a data array where each row = one race,
      // with columns for the percentage of each bias type
      const dataArray = allRaces.map(race => {
        const obj = { race };
        biasTypes.forEach(bias => {
          const raceCount = nested.get(bias)?.get(race) || 0;
          const total = d3.sum(
            allRaces.map(r => nested.get(bias)?.get(r) || 0)
          );
          obj[bias] = total ? (raceCount / total) * 100 : 0;
        });
        return obj;
      });
  
      // Dimensions
      const margin = { top: 70, right: 150, bottom: 80, left: 80 },
            width = 800 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
  
      // Container
      const container = d3.select(parentSelector);
      container.selectAll("svg").remove();
  
      const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      // Title
      svg.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("Offender Race Distribution per Hate Crime Type");
  
      // Ordinal color scale (one color per bias type)
      const color = d3.scaleOrdinal()
        .domain(biasTypes)
        .range(["#ff5252", "#9e9e9e", "#757575"]);
  
      // X scale: each race is a group
      const x0 = d3.scaleBand()
        .domain(dataArray.map(d => d.race))
        .rangeRound([0, width])
        .paddingInner(0.2);
  
      // X1: the sub-band for each bias type
      const x1 = d3.scaleBand()
        .domain(biasTypes)
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05);
  
      // Y scale: 0–100%
      const y = d3.scaleLinear()
        .domain([0, 100])
        .nice()
        .range([height, 0]);
  
      // Tooltip
      const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
  
      // Draw grouped bars
      svg.append("g")
        .selectAll("g")
        .data(dataArray)
        .join("g")
        .attr("transform", d => `translate(${x0(d.race)},0)`)
        .selectAll("rect")
        .data(d => biasTypes.map(key => ({
          key,
          value: d[key],
          race: d.race
        })))
        .join("rect")
          .attr("x", d => x1(d.key))
          .attr("y", d => y(d.value))
          .attr("width", x1.bandwidth())
          .attr("height", d => height - y(d.value))
          .attr("fill", d => color(d.key))
          .attr("class", d => d.key === "Anti-Asian" ? "bar anti-asian" : "bar")
          .on("mouseover", function(event, d) {
            tooltip
              .transition()
              .duration(200)
              .style("opacity", 0.9);
            tooltip.html(`
              <strong>${d.race}</strong><br>
              ${d.key}: ${d.value.toFixed(1)}%
            `)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
          });
  
      // X axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .style("text-anchor", "center");
  
      // Y axis (0–100%)
      svg.append("g")
        .call(d3.axisLeft(y).ticks(10).tickFormat(d => d + "%"));
  
      // Y-axis label
      svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .text("Percentage within Hate Crime Type");
  
      // Legend
      const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width + 10}, 0)`);
  
      biasTypes.forEach((type, i) => {
        const row = legend.append("g")
          .attr("transform", `translate(0, ${i * 20})`);
        row.append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", color(type));
        const label = row.append("text")
          .attr("x", 15)
          .attr("y", 10)
          .text(type);
  
        // If you want "Anti-Asian" to stand out:
        if (type === "Anti-Asian") {
          label.attr("class", "anti-asian-marker").attr("font-weight", "bold");
        }
      });
    });
  };
  
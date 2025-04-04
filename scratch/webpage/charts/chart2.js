// chart2.js
// Rewritten version that defines window.renderChart2(...) instead of invoking immediately.

window.renderChart2 = function(parentSelector = "#chart2") {
    d3.csv("data/offender.csv").then(function (raw) {
      // Define which bias types and offense categories we care about
      const biasTypes = ["Anti-Asian", "Anti-Black", "Anti-Hispanic"];
      const offenseTypes = [
        "Violent Crimes",
        "Property Crimes",
        "Drug & Vice Crimes",
        "Sex & Human Trafficking",
        "Other Crimes"
      ];
  
      // Filter rows that match these bias and offense categories
      const filtered = raw.filter(d =>
        biasTypes.includes(d.hate_crime) &&
        offenseTypes.includes(d.offense_cat)
      );
  
      // Build a nested rollup:
      //   Map of ( bias => Map(offense_cat => count) )
      const nested = d3.rollup(
        filtered,
        v => v.length,
        d => d.hate_crime,
        d => d.offense_cat
      );
  
      // For each offense category, compute the percentage distribution
      // across the three bias types.
      const data = offenseTypes.map(offense => {
        const obj = { offense_category: offense };
        biasTypes.forEach(bias => {
          const sub = nested.get(bias);
          const count = sub?.get(offense) || 0;
          const total = d3.sum(offenseTypes.map(o => sub?.get(o) || 0));
          obj[bias] = total ? (count / total) * 100 : 0;
        });
        return obj;
      });
  
      // Basic dimensions
      const margin = { top: 70, right: 150, bottom: 80, left: 80 },
            width = 800 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
  
      // Select or create the chart container
      const container = d3.select(parentSelector);
      // Remove any existing SVG (optional if you want a fresh re-draw)
      container.selectAll("svg").remove();
  
      // Append an <svg> within that container
      const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      // Title
      svg.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("Distribution of Hate Crime Offenses per Bias Type");
  
      // Ordinal color scale
      const color = d3.scaleOrdinal()
        .domain(biasTypes)
        .range(["#ff5252", "#9e9e9e", "#757575"]);
  
      // X scales
      const x0 = d3.scaleBand()
        .domain(offenseTypes)
        .rangeRound([0, width])
        .paddingInner(0.2);
  
      const x1 = d3.scaleBand()
        .domain(biasTypes)
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05);
  
      // Y scale (0–100%)
      const y = d3.scaleLinear()
        .domain([0, 100])
        .nice()
        .rangeRound([height, 0]);
  
      // Tooltip
      const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
  
      // Draw grouped bars
      svg.append("g")
        .selectAll("g")
        .data(data)
        .join("g")
        .attr("transform", d => `translate(${x0(d.offense_category)},0)`)
        .selectAll("rect")
        .data(d => biasTypes.map(key => ({
          key,
          value: d[key],
          category: d.offense_category
        })))
        .join("rect")
          .attr("x", d => x1(d.key))
          .attr("y", d => y(d.value))
          .attr("width", x1.bandwidth())
          .attr("height", d => height - y(d.value))
          .attr("fill", d => color(d.key))
          .on("mouseover", function (event, d) {
            tooltip
              .style("display", "block")
              .transition()
              .duration(200)
              .style("opacity", 0.9);
            tooltip.html(`
              <strong>${d.category}</strong><br>
              ${d.key}: ${d.value.toFixed(1)}%
            `)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function () {
            tooltip.style("display", "none").transition().duration(500).style("opacity", 0);
          });
  
      // X-axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));
  
      // Y-axis (with % format)
      svg.append("g")
        .call(d3.axisLeft(y).ticks(10).tickFormat(d => d + "%"))
        .call(g => g.select(".domain").remove());
  
      // Legend
      const legend = svg.append("g")
        .attr("transform", `translate(${width + 10}, 0)`);
  
      biasTypes.forEach((type, i) => {
        const row = legend.append("g")
          .attr("transform", `translate(0, ${i * 25})`);
        row.append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", color(type));
        row.append("text")
          .attr("x", 20)
          .attr("y", 10)
          .text(type);
      });
    });
  };
  
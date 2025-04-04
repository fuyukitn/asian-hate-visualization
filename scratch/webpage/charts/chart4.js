// chart4.js
// Rewritten version. Instead of an IIFE, it exposes window.renderChart4(...).

window.renderChart4 = function(parentSelector = "#chart4") {
    d3.csv("data/offender.csv").then(function(raw) {
      const biasTypes = ["Anti-Asian", "Anti-Black", "Anti-Hispanic"];
  
      // Filter for valid sex data and relevant bias types
      const filtered = raw.filter(d =>
        d.offender_sex &&
        d.offender_sex !== "NA" &&
        biasTypes.includes(d.hate_crime)
      );
  
      // Unique offender sexes
      const sexTypes = Array.from(
        new Set(filtered.map(d => d.offender_sex.trim()))
      );
  
      // For each hate crime type, count how many offenders of each sex
      // then convert counts to percentages
      const grouped = d3.rollups(
        filtered,
        v => {
          const counts = Object.fromEntries(sexTypes.map(s => [s, 0]));
          v.forEach(row => {
            const sex = row.offender_sex.trim();
            if (counts[sex] !== undefined) counts[sex]++;
          });
          const total = d3.sum(Object.values(counts));
          const percentages = Object.fromEntries(
            sexTypes.map(s => [s, total ? (counts[s] / total) * 100 : 0])
          );
          const se = Object.fromEntries(
            sexTypes.map(s => {
              const p = counts[s] / total;
              const stderr = total ? (100 * Math.sqrt(p * (1 - p) / total)) : 0;
              return [s, stderr];
            })
          );
          return { percentages, se };
        },
        d => d.hate_crime.trim()
      );
      
  
      // Flatten that structure into an array
      // e.g. [ { hate_crime: "Anti-Asian", Male: 60, Female: 40 }, ...]
      const data = grouped.map(([hate_crime, { percentages, se }]) => {
        const out = { hate_crime };
        sexTypes.forEach(s => {
          out[s] = percentages[s];
          out[s + "_se"] = se[s];
        });
        return out;
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
        .text("Percentage of Offender Sex by Hate Crime Type");
  
      // Ordinal color scale for sexes
      const color = d3.scaleOrdinal()
        .domain(sexTypes)
        .range(["#ff5252", "#9e9e9e"]);
  
      // X scales
      const x0 = d3.scaleBand()
        .domain(biasTypes)
        .rangeRound([0, width])
        .paddingInner(0.2);
  
      const x1 = d3.scaleBand()
        .domain(sexTypes)
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05);
  
      // Y scale
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
        .data(data)
        .join("g")
        .attr("transform", d => `translate(${x0(d.hate_crime)},0)`)
        .selectAll("rect")
        .data(d => sexTypes.map(sex => ({
          sex,
          value: d[sex],
          type: d.hate_crime
        })))
        .join("rect")
          .attr("x", d => x1(d.sex))
          .attr("y", d => y(d.value))
          .attr("width", x1.bandwidth())
          .attr("height", d => height - y(d.value))
          .attr("fill", d => color(d.sex))
          .on("mouseover", function(event, d) {
            tooltip
              .style("display", "block")
              .transition()
              .duration(200)
              .style("opacity", 0.9);
            tooltip.html(`
              <strong>${d.type}</strong><br>
              ${d.sex}: ${d.value.toFixed(1)}%
            `)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function () {
            tooltip.style("display", "none").transition().duration(500).style("opacity", 0);
          });

    // Add error bars
svg.append("g")
.selectAll("g")
.data(data)
.join("g")
.attr("transform", d => `translate(${x0(d.hate_crime)},0)`)
.selectAll("line")
.data(d => sexTypes.map(sex => ({
  sex,
  value: d[sex],
  se: d[sex + "_se"],
  type: d.hate_crime
})))
.join("line")
  .attr("x1", d => x1(d.sex) + x1.bandwidth() / 2)
  .attr("x2", d => x1(d.sex) + x1.bandwidth() / 2)
  .attr("y1", d => y(d.value - d.se))
  .attr("y2", d => y(d.value + d.se))
  .attr("stroke", "black")
  .attr("stroke-width", 1.5);

  
      // Axes
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));
  
      svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d + "%"));
  
      // Y-axis label
      svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .text("Percentage of Offenders");
  
      // Legend
      const legend = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width + 10}, 0)`);
  
      sexTypes.forEach((sex, i) => {
        const row = legend.append("g")
          .attr("transform", `translate(0, ${i * 20})`);
        row.append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", color(sex));
        row.append("text")
          .attr("x", 15)
          .attr("y", 10)
          .text(sex);
      });
    });
  };
  
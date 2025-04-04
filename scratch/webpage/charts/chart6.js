window.renderChart6 = function(parentSelector = "#chartContainer") {
    d3.csv("data/offender.csv").then(function(data) {
      const binSize = 10;
      const ageBins = d3.range(0, 81, binSize);
      const binLabels = ageBins.map(d => `${d}–${d + binSize - 1}`);
      binLabels[binLabels.length - 1] = "80+";
  
      function assignBin(age) {
        if (age >= 80) return "80+";
        const bin = Math.floor(age / binSize);
        return `${bin * binSize}–${bin * binSize + binSize - 1}`;
      }
  
      const cleaned = data
        .filter(d => d.offender_age && d.hate_crime)
        .map(d => ({
          age: +d.offender_age,
          bin: assignBin(+d.offender_age),
          type: d.hate_crime.trim()
        }))
        .filter(d => !isNaN(d.age) && d.age > 0 && d.age <= 100);
  
      const grouped = d3.groups(cleaned, d => d.type)
        .filter(([type]) => ["Anti-Asian", "Anti-Black", "Anti-Hispanic"].includes(type));
  
      const customColor = d3.scaleOrdinal()
        .domain(["Anti-Asian", "Anti-Black", "Anti-Hispanic"])
        .range(["#ff5252", "#9e9e9e", "#757575"]);
  
      const margin = { top: 40, right: 60, bottom: 40, left: 120 };
      const width = 800 - margin.left - margin.right;
      const rowHeight = 100;  // increased height
      const height = rowHeight * grouped.length;
  
      const container = d3.select(parentSelector);
      container.selectAll("svg").remove();
  
      const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      const x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);
  
      const y = d3.scaleLinear()
        .domain([0, 0.3])
        .range([rowHeight, 0]);
  
      // Draw each group
      grouped.forEach(([type, values], i) => {
        const binCounts = d3.rollup(
          values,
          v => v.length,
          d => assignBin(d.age)
        );
  
        const total = d3.sum(Array.from(binCounts.values()));
        const rowData = ageBins.map((start, idx) => {
          const label = binLabels[idx];
          const count = binCounts.get(label) || 0;
          const mid = (idx < ageBins.length - 1) ? (start + ageBins[idx + 1]) / 2 : 85;
          return {
            bin: label,
            x: mid,
            percent: count / total
          };
        }).filter(d => d.percent > 0); // remove 0 values
  
        const row = svg.append("g")
          .attr("transform", `translate(0, ${i * rowHeight})`);
  
        // Histogram bars
        row.selectAll("rect")
          .data(rowData)
          .join("rect")
          .attr("x", d => x(d.x - binSize / 2))
          .attr("y", d => y(d.percent))
          .attr("width", x(binSize) - x(0) - 1)
          .attr("height", d => rowHeight - y(d.percent))
          .attr("fill", customColor(type))
          .attr("stroke", "#333")
          .attr("stroke-width", 0.3)
          .attr("opacity", 0.85);
  
        // Type label
        row.append("text")
          .attr("x", -10)
          .attr("y", rowHeight / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "end")
          .style("font-size", "13px")
          .style("font-weight", "bold")
          .text(type);
  
        // Y axis (percent scale) on the right of each row
        const yAxis = d3.axisRight(y)
          .ticks(3)
          .tickFormat(d3.format(".0%"));
  
        row.append("g")
          .attr("transform", `translate(${width}, 0)`)
          .call(yAxis)
          .selectAll("text")
          .style("font-size", "10px");
      });
  
      // X Axis once at the bottom
      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(10));
  
      // Title
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Age Distribution of Offenders by Hate Crime Type (Histograms)");
    });
  };
  
// chart5.js — X-axis: white/non-white, legend: hate crime type
window.renderChart5 = function(parentSelector = "#chart5") {
    d3.csv("data/offender.csv").then(function(data) {
      const raceGroups = ["white", "non-white"];
      const biasTypes = ["Anti-Asian", "Anti-Black", "Anti-Hispanic"];
  
      // Step 1: Clean and filter data
      const filtered = data.filter(d =>
        raceGroups.includes(d.white) &&
        biasTypes.includes(d.hate_crime)
      );
  
      // Step 2: Group counts: Map(race => Map(hate_crime => count))
      const nested = d3.rollup(
        filtered,
        v => v.length,
        d => d.white.trim(),
        d => d.hate_crime.trim()
      );
  
      // Step 3: Prepare chart-friendly data structure
      const dataArray = raceGroups.map(race => {
        const obj = { race };
        const total = d3.sum(biasTypes.map(b => nested.get(race)?.get(b) || 0));
        biasTypes.forEach(bias => {
          const count = nested.get(race)?.get(bias);
          obj[bias] = (count != null && total > 0) ? (count / total) * 100 : 0;
        });
        return obj;
      });
  
      // Step 4: Chart setup
      const margin = { top: 70, right: 150, bottom: 80, left: 80 },
            width = 800 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
  
      const container = d3.select(parentSelector);
      container.selectAll("svg").remove();
  
      const svg = container.append("svg")
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
        .text("Distribution of Hate Crimes by Offender Race");
  
      // Scales
      const x0 = d3.scaleBand()
        .domain(raceGroups)
        .range([0, width])
        .paddingInner(0.2);
  
      const x1 = d3.scaleBand()
        .domain(biasTypes)
        .range([0, x0.bandwidth()])
        .padding(0.05);
  
      const y = d3.scaleLinear()
        .domain([0, 100])
        .nice()
        .range([height, 0]);
  
      const color = d3.scaleOrdinal()
        .domain(biasTypes)
        .range(["#ff5252", "#9e9e9e", "#757575"]);
  
      // Tooltip
      const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
  
      // Bars
      svg.append("g")
        .selectAll("g")
        .data(dataArray)
        .join("g")
        .attr("transform", d => `translate(${x0(d.race)},0)`)
        .selectAll("rect")
        .data(d => biasTypes.map(bias => ({
          bias,
          value: d[bias],
          race: d.race
        })))
        .join("rect")
        .attr("x", d => x1(d.bias))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => isNaN(d.value) ? 0 : height - y(d.value))
        .attr("fill", d => color(d.bias))
        .on("mouseover", (event, d) => {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip.html(`<strong>${d.race}</strong><br>${d.bias}: ${d.value.toFixed(1)}%`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));
  
      // Axes
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));
  
      svg.append("g")
        .call(d3.axisLeft(y).ticks(10).tickFormat(d => d + "%"));
  
      // Y-axis label
      svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .text("Percentage of Hate Crime Type");
  
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
        row.append("text")
          .attr("x", 15)
          .attr("y", 10)
          .text(type);
      });
    });
  };
  
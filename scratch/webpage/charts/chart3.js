(function () {
    d3.csv("data/offender.csv").then(function(data) {
        const biasTypes = ["Anti-Asian", "Anti-Black", "Anti-Hispanic"];
        const filtered = data.filter(d => d.arrest && d.arrest !== "NA" && biasTypes.includes(d.hate_crime));
  
        const grouped = d3.rollup(
          filtered,
          v => {
            const counts = {"Anti-Asian": 0, "Anti-Black": 0, "Anti-Hispanic": 0};
            v.forEach(d => {
              const hate = d.hate_crime?.trim();
              if (counts[hate] !== undefined) counts[hate]++;
            });
            return counts;
          },
          d => d.arrest.trim()
        );
  
        const dataArray = Array.from(grouped, ([arrest_type, counts]) => ({ arrest_type, ...counts }));
  
        const margin = {top: 70, right: 150, bottom: 80, left: 80},
              width = 800 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;
  
        const svg = d3.select("#chart3")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);
  
        svg.append("text")
          .attr("class", "chart-title")
          .attr("x", width / 2)
          .attr("y", -40)
          .attr("text-anchor", "middle")
          .text("Hate Crime Arrests by Arrest Type");
  
        const color = d3.scaleOrdinal()
          .domain(biasTypes)
          .range(["#ff5252", "#9e9e9e", "#757575"]);
  
        const x0 = d3.scaleBand()
          .domain(dataArray.map(d => d.arrest_type))
          .rangeRound([0, width])
          .paddingInner(0.2);
  
        const x1 = d3.scaleBand()
          .domain(biasTypes)
          .rangeRound([0, x0.bandwidth()])
          .padding(0.05);
  
        const y = d3.scaleLinear()
          .domain([0, d3.max(dataArray, d => d3.max(biasTypes, key => d[key] || 0))])
          .nice()
          .range([height, 0]);
  
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);
  
        svg.append("g")
          .selectAll("g")
          .data(dataArray)
          .join("g")
          .attr("transform", d => `translate(${x0(d.arrest_type)},0)`)
          .selectAll("rect")
          .data(d => biasTypes.map(key => ({key, value: d[key], arrest_type: d.arrest_type})))
          .join("rect")
          .attr("class", d => d.key === "Anti-Asian" ? "bar anti-asian" : "bar")
          .attr("x", d => x1(d.key))
          .attr("y", d => y(d.value))
          .attr("width", x1.bandwidth())
          .attr("height", d => height - y(d.value))
          .attr("fill", d => color(d.key))
          .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`<strong>${d.arrest_type}</strong><br>${d.key}: ${d.value}`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
          });
  
        svg.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x0))
          .selectAll("text")
          .style("text-anchor", "center");
  
        svg.append("g")
          .call(d3.axisLeft(y));
  
        svg.append("text")
          .attr("class", "axis-label")
          .attr("transform", "rotate(-90)")
          .attr("y", -50)
          .attr("x", -height / 2)
          .attr("text-anchor", "middle")
          .text("Number of Arrests");
  
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
          if (type === "Anti-Asian") label.attr("class", "anti-asian-marker").attr("font-weight", "bold");
        });
      });
  })();
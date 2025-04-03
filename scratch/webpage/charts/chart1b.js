(function () {
  const width = 975, height = 610;
  const svg = d3.select("#map2").append("svg")
    .attr("width", width)
    .attr("height", height);

  const color = d3.scaleQuantize().range(d3.schemeReds[9]);
  const crimeData = new Map();

  d3.csv("data/map.csv", d3.autoType).then(data => {
    // Expecting columns: state, rate_asian, rate_hispanic
    data.forEach(d => {
      const state = d.state.trim().toUpperCase();
      const asianRate = d.rate_asian;
      const hispanicRate = d.rate_hispanic;

      const ratio = (hispanicRate && hispanicRate !== 0) ? (asianRate / hispanicRate) : null;
      crimeData.set(state, {
        ...d,
        asian_to_hispanic_ratio: ratio
      });
    });

    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json").then(us => {
      const states = topojson.feature(us, us.objects.states);
      const path = d3.geoPath();

      const idToAbbrev = new Map([
        ["01", "AL"], ["02", "AK"], ["04", "AZ"], ["05", "AR"], ["06", "CA"],
        ["08", "CO"], ["09", "CT"], ["10", "DE"], ["11", "DC"], ["12", "FL"],
        ["13", "GA"], ["15", "HI"], ["16", "ID"], ["17", "IL"], ["18", "IN"],
        ["19", "IA"], ["20", "KS"], ["21", "KY"], ["22", "LA"], ["23", "ME"],
        ["24", "MD"], ["25", "MA"], ["26", "MI"], ["27", "MN"], ["28", "MS"],
        ["29", "MO"], ["30", "MT"], ["31", "NE"], ["32", "NV"], ["33", "NH"],
        ["34", "NJ"], ["35", "NM"], ["36", "NY"], ["37", "NC"], ["38", "ND"],
        ["39", "OH"], ["40", "OK"], ["41", "OR"], ["42", "PA"], ["44", "RI"],
        ["45", "SC"], ["46", "SD"], ["47", "TN"], ["48", "TX"], ["49", "UT"],
        ["50", "VT"], ["51", "VA"], ["53", "WA"], ["54", "WV"], ["55", "WI"],
        ["56", "WY"]
      ]);

      function updateLegend(scale) {
        const legend = d3.select("#legend2");
        legend.html("");
        const w = 160, h = 10;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");
        for (let i = 0; i < w; ++i) {
          ctx.fillStyle = scale(scale.domain()[0] + i / w * (scale.domain()[1] - scale.domain()[0]));
          ctx.fillRect(i, 0, 1, 1);
        }
        const svgLegend = legend.append("svg")
          .attr("width", w)
          .attr("height", h + 20);
        svgLegend.append("image")
          .attr("x", 0).attr("y", 0)
          .attr("width", w).attr("height", h)
          .attr("preserveAspectRatio", "none")
          .attr("xlink:href", canvas.toDataURL());
        svgLegend.append("text").attr("x", 0).attr("y", h + 10).text(scale.domain()[0].toFixed(2));
        svgLegend.append("text").attr("x", w).attr("y", h + 10).attr("text-anchor", "end").text(scale.domain()[1].toFixed(2));
      }

      function updateMap() {
        svg.selectAll(".state").remove();
        const values = Array.from(crimeData.values())
          .map(d => d.asian_to_hispanic_ratio)
          .filter(v => v !== null && !isNaN(v));
        const extent = d3.extent(values);
        if (extent[0] === extent[1]) extent[1] += 0.1;
        color.domain(extent);
        updateLegend(color);

        svg.append("g")
          .selectAll("path")
          .data(states.features)
          .join("path")
          .attr("class", "state")
          .attr("fill", d => {
            const abbrev = idToAbbrev.get(d.id);
            const val = crimeData.get(abbrev)?.asian_to_hispanic_ratio;
            return val !== undefined && val !== null ? color(val) : "#ccc";
          })
          .attr("d", path)
          .on("mousemove", function (event, d) {
            const abbrev = idToAbbrev.get(d.id);
            const val = crimeData.get(abbrev)?.asian_to_hispanic_ratio;
            const tooltip = d3.select("#tooltip");
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 28) + "px")
                   .style("display", "block")
                   .html(`<strong>${abbrev}</strong><br>Asian-to-Hispanic Hate Crime Ratio:<br>${val !== null && !isNaN(val) ? val.toFixed(2) : "No data"}`);
          })
          .on("mouseout", function () {
            d3.select("#tooltip").style("display", "none");
          });
      }

      updateMap();
    });
  });
})()
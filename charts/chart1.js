(async function() {
    /************************************************************
     * 1) Basic Setup
     ************************************************************/
    const width = 975,
          height = 610;
  
    // 1) Create an <svg> that covers #map, with "meet" so we see margins
    const svg = d3.select("#map")
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "100%");
  
    // We'll have a <g> for states, and a <g> for labels
    const gStates = svg.append("g");
    const gLabels = svg.append("g");
  
    // d3-zoom => up to 6x
    const zoom = d3.zoom()
      .scaleExtent([1, 6])
      .on("zoom", event => {
        gStates.attr("transform", event.transform);
        gLabels.attr("transform", event.transform);
      });
    svg.call(zoom);
  
    // Color scale => fewer bins => smaller legend
    const color = d3.scaleQuantize().range(d3.schemeReds[5]);
  
    // Tooltip + Legend
    const tooltip = d3.select("#tooltip");
    const legendContainer = d3.select("#legend");
  
    // Load CSV data
    const data = await d3.csv("data/map.csv", d3.autoType);
    const crimeMap = new Map(data.map(d => [d.state, d]));
  
    // Load US TopoJSON
    const us = await d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json");
    const statesGeo = topojson.feature(us, us.objects.states);
    const path = d3.geoPath();
  
    // ID => two-letter abbreviation
    const idToAbbrev = new Map([
      ["01","AL"], ["02","AK"], ["04","AZ"], ["05","AR"], ["06","CA"],
      ["08","CO"], ["09","CT"], ["10","DE"], ["11","DC"], ["12","FL"],
      ["13","GA"], ["15","HI"], ["16","ID"], ["17","IL"], ["18","IN"],
      ["19","IA"], ["20","KS"], ["21","KY"], ["22","LA"], ["23","ME"],
      ["24","MD"], ["25","MA"], ["26","MI"], ["27","MN"], ["28","MS"],
      ["29","MO"], ["30","MT"], ["31","NE"], ["32","NV"], ["33","NH"],
      ["34","NJ"], ["35","NM"], ["36","NY"], ["37","NC"], ["38","ND"],
      ["39","OH"], ["40","OK"], ["41","OR"], ["42","PA"], ["44","RI"],
      ["45","SC"], ["46","SD"], ["47","TN"], ["48","TX"], ["49","UT"],
      ["50","VT"], ["51","VA"], ["53","WA"], ["54","WV"], ["55","WI"],
      ["56","WY"]
    ]);

    const idToStateName = new Map([
        ["01", "Alabama"], ["02", "Alaska"], ["04", "Arizona"], ["05", "Arkansas"], ["06", "California"],
        ["08", "Colorado"], ["09", "Connecticut"], ["10", "Delaware"], ["11", "District of Columbia"], ["12", "Florida"],
        ["13", "Georgia"], ["15", "Hawaii"], ["16", "Idaho"], ["17", "Illinois"], ["18", "Indiana"],
        ["19", "Iowa"], ["20", "Kansas"], ["21", "Kentucky"], ["22", "Louisiana"], ["23", "Maine"],
        ["24", "Maryland"], ["25", "Massachusetts"], ["26", "Michigan"], ["27", "Minnesota"], ["28", "Mississippi"],
        ["29", "Missouri"], ["30", "Montana"], ["31", "Nebraska"], ["32", "Nevada"], ["33", "New Hampshire"],
        ["34", "New Jersey"], ["35", "New Mexico"], ["36", "New York"], ["37", "North Carolina"], ["38", "North Dakota"],
        ["39", "Ohio"], ["40", "Oklahoma"], ["41", "Oregon"], ["42", "Pennsylvania"], ["44", "Rhode Island"],
        ["45", "South Carolina"], ["46", "South Dakota"], ["47", "Tennessee"], ["48", "Texas"], ["49", "Utah"],
        ["50", "Vermont"], ["51", "Virginia"], ["53", "Washington"], ["54", "West Virginia"], ["55", "Wisconsin"],
        ["56", "Wyoming"]
      ]);
      
  
    // Draw states
    gStates.selectAll(".state")
      .data(statesGeo.features)
      .join("path")
      .attr("class", "state")
      .attr("d", path);
  
    // Draw labels => each state's abbreviation at centroid
    gLabels.selectAll(".state-label")
      .data(statesGeo.features)
      .join("text")
      .attr("class", "state-label")
      .attr("x", d => path.centroid(d)[0])
      .attr("y", d => path.centroid(d)[1])
      .text(d => idToAbbrev.get(d.id) || "");
  
    /************************************************************
     * 2) Legend + Map Rendering
     ************************************************************/
    function updateLegend(scale, metric) {
      legendContainer.html("");
      const [min, max] = scale.domain();
      const w = 100, h = 8;
  
      // gradient
      const canvas = document.createElement("canvas");
      canvas.width = w; 
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      for (let i=0; i<w; i++) {
        ctx.fillStyle = scale(min + (i/w)*(max-min));
        ctx.fillRect(i, 0, 1, 1);
      }
  
      const legendSvg = legendContainer.append("svg")
        .attr("width", w)
        .attr("height", h+30);
  
      // gradient bar
      legendSvg.append("image")
        .attr("x", 0).attr("y", 0)
        .attr("width", w).attr("height", h)
        .attr("xlink:href", canvas.toDataURL());
  
      // min label
      legendSvg.append("text")
        .attr("x", 0)
        .attr("y", h+12)
        .text(min.toFixed(2));
  
      // max label
      legendSvg.append("text")
        .attr("x", w)
        .attr("y", h+12)
        .attr("text-anchor","end")
        .text(max.toFixed(2));
  
      // label
      legendSvg.append("text")
        .attr("x", w/2)
        .attr("y", h+26)
        .attr("text-anchor","middle")
        .text(metric === "cr_asian" ? "Total" : "Rate");
    }
  
    function renderMap(metric) {
      // domain
      const vals = data.map(d => d[metric]).filter(x => x!=null && !isNaN(x));
      color.domain(d3.extent(vals));
      updateLegend(color, metric);
  
      gStates.selectAll(".state")
        .on("mousemove", (event, d) => {
            const abbrev = idToAbbrev.get(d.id);
            const fullName = idToStateName.get(d.id) || abbrev;
            const row = crimeMap.get(abbrev);
            const val = row ? row[metric] : null;
            const label = (metric === "cr_asian")
              ? `Total: ${val}`
              : `Rate: ${val}`;
            
            tooltip
              .style("display", "block")
              .style("left", (event.pageX + 8) + "px")
              .style("top", (event.pageY - 24) + "px")
              .html(`<strong>${fullName}</strong><br>${label}`);
            
        })
        .on("mouseout", () => {
          tooltip.style("display","none");
        })
        .transition()
        .duration(500)
        .attr("fill", d => {
          const abbrev = idToAbbrev.get(d.id);
          const row = crimeMap.get(abbrev);
          const val = row ? row[metric] : null;
          return (val != null) ? color(val) : "#ccc";
        });
    }
  
    /************************************************************
     * 3) Zoom Functions
     ************************************************************/
    function zoomOut() {
      svg.transition()
        .duration(750)
        .call( zoom.transform, d3.zoomIdentity );
    }
  
    function zoomToMEVT() {
      const statesWanted = ["ME","VT"];
      const features = statesGeo.features.filter(f => {
        const ab = idToAbbrev.get(f.id);
        return statesWanted.includes(ab);
      });
      if (!features.length) return;
  
      const coll = { type:"FeatureCollection", features };
      const [[x0,y0],[x1,y1]] = path.bounds(coll);
      const dx = x1 - x0, dy = y1 - y0;
      const xCenter = (x0+x1)/2, yCenter = (y0+y1)/2;
  
      const maxScale = 6;
      const scale = Math.min(maxScale, 0.9 / Math.max(dx/width, dy/height));
      const translateX = width/2 - scale*xCenter;
      const translateY = height/2 - scale*yCenter;
  
      svg.transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity.translate(translateX, translateY).scale(scale)
        );
    }
  
    /************************************************************
     * 4) IntersectionObserver => Steps 1,2,3
     ************************************************************/
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px', 
        threshold: 0
      };
    
      function onStepEnter(entries) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const stepNum = entry.target.getAttribute("data-step");
      
            if (stepNum === "5") {
              renderMap("cr_asian");
              zoomOut();
            }
            else if (stepNum === "6") {
              renderMap("rate_asian");
              zoomOut();
            }
            else if (stepNum === "7") {
              renderMap("rate_asian");
              zoomToMEVT();
            }
          }
        });
      }
    
      const observer = new IntersectionObserver(onStepEnter, observerOptions);
      document.querySelectorAll(".step").forEach(s => {
        const stepNum = s.getAttribute("data-step");
        if (stepNum === "5" || stepNum === "6" || stepNum === "7") {
          observer.observe(s);
        }
      });
    
      // Initial render
      renderMap("cr_asian");
      zoomOut();
    })();
  
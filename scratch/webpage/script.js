const scroller = scrollama();

    scroller
      .setup({
        step: "#chart1-section",
        offset: 0.6,
        once: true
      })
      .onStepEnter(response => {
        document.querySelector("#chart1-section").classList.add("visible");
      });
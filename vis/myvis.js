
function myfirstVis() {
    d3.select("body").append("div").attr("class", "overview_chart")

    var margin = { top: 50, right: 20, bottom: 20, left: 60 };
    var width = 400 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;

    var data_overview = [
        { "type": "left", "value": 15 },
        { "type": "middle", "value": 18 },
        { "type": "right", "value": 10 },
    ];
    const domainValues = [...new Set(data_overview.map(d => d.type))];

    var y = d3.scaleLinear()
        .domain([0, 1.1 * 18])
        .range([height, 0]);

    // X axis
    var x = d3.scaleBand()
        .range([0, width])
        .domain(domainValues)
        .padding(0.2);


    // svg for plotting 
    var svg = d3.select(".overview_chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")
    .attr("id", "trg")




    // Add Y axis
    //initial with max number of points for daily tasks

    svg.append("g")
    .attr("class", "myYaxis")
    .call(d3.axisLeft(y));

    //yAxis label
    svg.append("text")
    .attr("class", "y axislabel")
    .attr("text-anchor", "end")
    .attr("y", -20)
    .attr("dy", ".75em")
    //.attr("transform", "translate(-40," + height/2 + "),rotate(-90)")
    .text("points");



    svg.append("g").attr("class", "bars")
    .selectAll("rect")
    .data(data_overview)
    .enter().append("rect")
    //.text(function (d) { console.log(d.type); })
    .attr("x", function (d) { return x(d.type); })
    .attr("y", function (d) { return y(d.value); })
    //.text(function(d) {console.log(d.type);})
    .attr("width", x.bandwidth())
    .attr("height", function (d) { return height - y(d.value); })
    .attr("fill", "#ABABAB")
    //   .on("mouseover", function (event, d) {
    //     tooltip.style("visibility", "visible").text(d.value + " Points");
    //     d3.select(this).attr("fill", "#ABABAB")
    //   })
    //   .on("mousemove", function (event, d) {
    //     tooltip.style("top", (event.pageY - 10) + "px")
    //       .style("left", (event.pageX + 10) + "px");
    //   })
    //   .on("mouseout", function (event, d) {
    //     d3.select(this).attr("fill", mntlld_lightblue);
    //     tooltip.style("visibility", "hidden");
    //   });



    //add bar labels
    svg.append("g").attr("class", "label")
    .selectAll("text.sum")
    .data(data_overview)
    .enter()
    .append("text")
    .attr("class", "sum")
    // .text(function(d) {console.log(d)})
    .attr("x", (d) => x(d.type) + x.bandwidth() / 2)
    .attr("y", (d) => y(d.value))
    .attr("dy", "-1em")
    .style("text-anchor", "middle")
    .text(d => d.value);


    //x-Axis on top
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

}
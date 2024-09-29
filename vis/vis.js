
function Visualisation() {
    // set base URL
    this.baseurl = "";
    this.hash = window.location.hash.substring(1);
    this.inflection = {
        col:"ABABAB",
        line:"0",
        ann:"",
        high:""
    };
    var highlight_colour = "#C8532E"

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



    // $(window).resize(function(){
    //     window.clearTimeout(that.resizeTimeout);
    //     that.resizeTimeout = window.setTimeout(function(){
    //         // window.clearTimeout(that.resizeTimeout);
    //         that.setWindow();
    //         that.elements();
    //         that.draw();
    //     }, 250);
    // });

    // hash change / history
    this.init = function() {

        var that = this;
        this.baseurl = document.URL.split("#")[0];
        // that.col = that.hash.split("_")[0]
        var hashA = this.hash.split("&");
        checkHash(hashA)
        
                          
        setInterval(function() {
            var newhash = window.location.hash.substring(1);
            // console.log(newhash)

            if (that.hash!=newhash) {

                that.hash = newhash;

                // draw or zoom?
                var walk = false;
                var zoom = false;

                // var mode = parseInt(hashA[0]);
                var hashA = that.hash.split("&");
                checkHash(hashA);
                d3.selectAll(".ann").raise()
                
            }
        }
        , 500);

        function checkHash(hash) {
            var cats_in_hash = [];
            hash.forEach(element => {
                // console.log(element)
                let splitted = element.split("=")
                let cat = splitted[0]
                let value = splitted[1]
                switch (cat) {
                    case "col":
                        if (value!=that.inflection.col) {
                            that.inflection.col = value;
                            that.colour();
                        }
                    break;
                        
                    case "line":
                        if (value!=that.inflection.line) {
                            that.inflection.line = value;
                            that.line();
                        }
                    break;
                    case "ann":
                        if (value!=that.inflection.ann) {
                            that.inflection.ann = value;
                            that.ann();
                        }
                    break;
                    case "high":
                        if (value!=that.inflection.high) {
                            that.inflection.high = value;
                            that.highlight();
                        }
                    break;
                    default:
                        break;
                }
                cats_in_hash.push(cat)
            });
            
            if (!cats_in_hash.includes("col") && that.inflection.col != "ABABAB") {
                that.inflection.col = "ABABAB"
                that.colour();
            }
            if (!cats_in_hash.includes("line") && that.inflection.line != "0") {
                that.inflection.line = "0"
                that.line();
            }
            if (!cats_in_hash.includes("ann") && that.inflection.ann != "") {
                that.inflection.ann = ""
                that.ann();
            }
            if (!cats_in_hash.includes("high") && that.inflection.high != "") {
                that.inflection.high = ""
                that.highlight();
            }
            
        }

        this.draw()

    }


    this.draw = function() {

        

        d3.select("body").append("div").attr("class", "overview_chart")
        

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
        // .attr("fill", "#C8532E")
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

    
        // //add 50% line
        // svg.selectAll(".dashed_line")
        //   .data([max_num_points / 2, max_num_points])
        //   .enter()
        //   .append("line")
        //   .attr("class", "dashed_line")
        //   .attr("x1", 0)
        //   .attr("x2", width)
        //   .attr("y1", d => y(d))
        //   .attr("y2", d => y(d));

        // //line labels
        // svg.append("g").attr("class", "line_labels")
        //   .selectAll("label")
        //   .data([
        //     { "value": max_num_points / 2, "text": "50% of reachable points" },
        //     { "value": max_num_points, "text": "reachable points: " + max_num_points }
        //   ])
        //   .enter()
        //   .append("text")
        //   .attr("class", "label")
        //   .attr("x", width)
        //   .attr("y", d => y(d.value))
        //   .attr("dy", "-.35em")
        //   .style("text-anchor", "end")
        //   .text(d => d.text)

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

        this.colour();
        this.line();
        this.ann();
        this.highlight();
    }

    this.colour = function(){
        let colour = "#" + this.inflection.col
        d3.selectAll("rect")
        .transition()
            .duration(200)
            .ease(d3.easeLinear)
        .attr("fill", colour)

    }

    this.line = function(){
        //add 50% line

        let place = (Number(this.inflection.line) | 0)
        // console.log(d3.select("#trg").selectAll(".dashed_line"))
        if (place == 0) {
            d3.selectAll(".line")
            .transition()
                    .duration(200)
                    .ease(d3.easeLinear)
                .remove()
        }
        else {
            d3.select("#trg").selectAll(".line")
            .data([place])
            .join("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("class", "line")
            .attr("stroke-dasharray", "4 4")
            .transition()
                .duration(200)
                .ease(d3.easeLinear)
                .attr("stroke", "black")
                // .text(function(d) {console.log(d)})
                .attr("y1", d => y(d))
                .attr("y2", d => y(d));
        }
    }

    this.ann = function(){
        //add 50% line
        let ann = this.inflection.ann
        if (ann == "") {
            d3.selectAll(".ann")
            .transition()
                    .duration(200)
                    .ease(d3.easeLinear)
            .remove()
        }
        else {
            var annlist = ann.split(",");

            // [ {"x": x(numbers[0] + division_numbers[1]/2),  "text":Math.round((1000*division_numbers[1]/numbers[1]))/10 + "%"},
            //             {"x":x(numbers[0] + division_numbers[1] + division_numbers[2]/2),  "text": Math.round((1000*division_numbers[2]/(numbers[1])))/10 + "%"}
            // ]

            let data = [];
            annlist.forEach(element => {
                let splitted = element.split("-")
                let x = splitted[0]
                let y = splitted[1]
                let text = splitted[2].replace("_", " ")
                data.push({"x": x, "y": y, "text":text})

            });

            d3.select("#trg").selectAll(".ann")
                .data(data)
                .join("text")
                .style("text-anchor", "middle")
                .attr("class", "ann")
                .attr("dy", ".35em")
                // .text(function(d) {console.log(d)})
                .transition()
                    .duration(200)
                    .ease(d3.easeLinear)
                .attr("x", d => (x(d.x) + x.bandwidth()/2))
                .attr("y", d => y(d.y))
                .text(d => d.text);
        }
    }

    this.highlight = function(){
        //add 50% line
        let highlight = this.inflection.high
        if (highlight == "") {
            d3.selectAll("rect")
            .transition()
                .duration(200)
                .ease(d3.easeLinear)
            .attr("fill", "#" + this.inflection.col)
        }
        else {
            d3.select("#trg").selectAll("rect").filter(d => d.type == highlight)
            .transition()
            .duration(200)
            .ease(d3.easeLinear)
                .attr("fill", highlight_colour)

            d3.select("#trg").selectAll("rect").filter(d => d.type != highlight)
                .transition()
                .duration(200)
                .ease(d3.easeLinear)
                    .attr("fill", "#" + this.inflection.col)
        }
    }

    return this
}
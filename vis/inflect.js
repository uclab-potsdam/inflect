
function Inflection() {
    // set base URL
    this.baseurl = "";
    this.hash = window.location.hash.substring(1);
    this.inflection = {
        col:"ABABAB",
        line:"",
        ann:"",
        high:""
    };
    var highlight_colour = "#C8532E"

    this.editable = true;

    



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
    this.init = function(which) {

        var that = this;
        this.baseurl = document.URL.split("#")[0];
        // that.col = that.hash.split("_")[0]
        var hashA = this.hash.split("&");
        this.draw(which)
        d3.select("svg").append("g").attr("class", "line-group")

        // add switch to toggle editability

        if(window.top == window.self) {
            // Top level window
            d3.select("body").append("div").attr("class", "inflect_ui")
            d3.select(".inflect_ui").append("p")
                .attr("class", "infl_ui_titles").html("Toggle editability")
            d3.select(".inflect_ui").append("label")
            .attr("class", "switch");

            d3.select(".switch").append("input")
                .attr("type", "checkbox")
                .attr("checked", true)
                .on("change", function() {
                    that.editable = this.checked;
                    that.updateEditable();
                });

            d3.select(".switch").append("span")
                .attr("class", "slider");
            
        } else {
            // Not top level. An iframe, popup or something
            that.editable = false;
        }



        


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
                d3.selectAll(".annotation-group").raise()
                
                
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
            if (!cats_in_hash.includes("line") && that.inflection.line != "") {
                that.inflection.line = ""
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

    
        this.colour();
        this.line();
        this.ann();
        this.highlight();

        this.updateEditable();

    }


    this.draw = function(fun) {
        window[fun]();
        // myfirstVis()
 
    }

    this.updateEditable = function(){
        let that = this;

        if(this.editable) {
            var lineGroup = d3.selectAll("g.line");

            lineGroup.each(function() {
                // Select all the lines inside the group
                var linegroup = d3.select(this);

                var line = linegroup.select(".infl-line");

            // Append circles to the line ends
                
            // Get the start and end points of the line
            var x1 = +line.attr("x1"),
                y1 = +line.attr("y1"),
                x2 = +line.attr("x2"),
                y2 = +line.attr("y2");

            // Append circle at the start of the line
            linegroup.append("circle")
                .attr("cx", x1)
                .attr("cy", y1)
                .attr("r", 10)
                .attr("class", "infl-handle left")

                // .attr("fill", "grey")
                // .attr("fill-opacity", 0.1)
                // .attr("cursor", "move")
                // .attr("stroke-dasharray", 5)
                // .attr("stroke", "grey")

            // Append circle at the end of the line
            linegroup.append("circle")
                .attr("cx", x2)
                .attr("cy", y2)
                .attr("r", 10)
                .attr("class", "infl-handle right")
            
            });

            d3.select("svg").selectAll("rect")
                .attr("")

            


        }
        else {
            d3.selectAll(".infl-handle")
            .transition()
                    .duration(200)
                    .ease(d3.easeLinear)
                .remove()
        }

        d3.selectAll(".infl-handle").call(d3.drag().on("drag", function (event, d) {
            // console.log(d);
                d3.select(this)
                    .attr("cx", event.x)
                    .attr("cy", event.y);
                if(this.classList[1] == "left") {
                    d3.select(this.parentNode).select(".infl-line")
                        .attr("x1", event.x)
                        .attr("y1", event.y)
                } else if(this.classList[1] == "right") {
                    d3.select(this.parentNode).select(".infl-line")
                        .attr("x2", event.x)
                        .attr("y2", event.y)
                }
            })
            .on("end", function() {that.updateHash("line")})
        )

    }

    this.updateHash = function(kind){
        
        if(kind == "line") {
            var lines = [];
            d3.select("svg").selectAll(".infl-line")
            .each(function(d) {
                let line = d3.select(this)
                lines.push(
                    {
                        x1: line.attr("x1"),
                        x2: line.attr("x2"),
                        y1: line.attr("y1"),
                        y2: line.attr("y2"),
                    }
                )
            })
            let linetext = ""
            lines.forEach((element, i) => {
                if(i > 0) {linetext += ","}
                linetext += element.x1
                linetext += "-"
                linetext += element.x2
                linetext += "-"
                linetext += element.y1
                linetext += "-"
                linetext += element.y2
    
            })
            this.inflection.line = linetext;
        }
        this.hash = 
            "col=" + this.inflection.col + "&" +
            "line=" + this.inflection.line + "&" +
            "ann=" + this.inflection.ann + "&" +
            "high=" + this.inflection.high;
        window.location.hash = "#" + this.hash
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

        let place = this.inflection.line

        if (place == "") {
            d3.selectAll(".infl-line")
            .transition()
                    .duration(200)
                    .ease(d3.easeLinear)
                .remove()
        }
        else {
            var placelist = place.split(",");

            let data = [];
            placelist.forEach(element => {
                let splitted = element.split("-")
                let x1value = splitted[0]
                let x2value = splitted[1]
                let y1value = splitted[2]
                let y2value = splitted[3]
                
                data.push(
                {
                    x1: x1value,
                    x2: x2value,
                    y1: y1value,
                    y2: y2value,
                })

            });

            

            d3.select(".line-group").selectAll(".line")
            .data(data)
            .join("g").attr("class", "line")
            .each(function(d) {
                var g = d3.select(this); // Select the current group
        
                g.selectAll(".infl-line")
                    .data([d])
                    .join("line")
                    .attr("x1", d => d.x1)
                    .attr("x2", d => d.x2)
                    .attr("y1", d => d.y1)
                    .attr("y2", d => d.y2)
                    .attr("class", "infl-line")
                    .attr("stroke-dasharray", "3 3")
                    .transition()
                        .duration(200)
                        .ease(d3.easeLinear)
                        .attr("stroke", "black")
            });

            // .selectAll(".infl-line")
            // .data(data)
            // .join("line")
            // .attr("x1", d => d.x1)
            // .attr("x2", d => d.x2)
            // .attr("class", "infl-line")
            // .attr("stroke-dasharray", "3 3")
            // .transition()
            //     .duration(200)
            //     .ease(d3.easeLinear)
            //     .attr("stroke", "black")
            //     // .text(function(d) {console.log(d)})
            //     .attr("y1", d => d.y1)
            //     .attr("y2", d => d.y2);
        }
    }

    this.ann = function(){
        //add 50% line
        let ann = this.inflection.ann
        if (ann == "") {
            d3.selectAll(".annotation-group")
            .transition()
                    .duration(200)
                    .ease(d3.easeLinear)
            .remove()
        }
        else {
            var annlist = ann.split(",");

            let annotations = [];
            annlist.forEach(element => {
                let splitted = element.split("-")
                let xvalue = splitted[0]
                let yvalue = splitted[1]
                let dxvalue = splitted[2]
                let dyvalue = splitted[3]
                let typevalue = splitted[4]
                let text = splitted[5].replace("_", " ")
                annotations.push(
                {
                    note: { label: text },
                    x: xvalue,
                    y: yvalue,
                    dx: dxvalue,
                    dy: dyvalue,
                    type: d3.annotationCalloutElbow,
                    connector: { end: "arrow" },
                    color: "#000000"
                })

            });

              
            const makeAnnotations = d3.annotation()
            .annotations(annotations)

            if(this.editable) {
                makeAnnotations.editMode(true)
            } else {
                makeAnnotations.editMode(false)
            }


            d3.selectAll(".annotation-group")
            .transition()
                    .duration(200)
                    .ease(d3.easeLinear)
            .remove()
    
            d3.select("svg").append("g")
              .attr("class", "annotation-group")
              .call(makeAnnotations)
    
    

        //     let data = [];
        //     annlist.forEach(element => {
        //         let splitted = element.split("-")
        //         let x = splitted[0]
        //         let y = splitted[1]
        //         let text = splitted[2].replace("_", " ")
        //         data.push({"x": x, "y": y, "text":text})

        //     });

        //     d3.select("#trg").selectAll(".ann")
        //         .data(data)
        //         .join("text")
        //         .style("text-anchor", "middle")
        //         .attr("class", "ann")
        //         .attr("dy", ".35em")
        //         // .text(function(d) {console.log(d)})
        //         .transition()
        //             .duration(200)
        //             .ease(d3.easeLinear)
        //         .attr("x", d => (x(d.x) + x.bandwidth()/2))
        //         .attr("y", d => y(d.y))
        //         .text(d => d.text);
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
            d3.select("svg").selectAll("rect").filter(d => d.type == highlight)
            .transition()
            .duration(200)
            .ease(d3.easeLinear)
                .attr("fill", highlight_colour)

            d3.select("svg").selectAll("rect").filter(d => d.type != highlight)
                .transition()
                .duration(200)
                .ease(d3.easeLinear)
                    .attr("fill", "#" + this.inflection.col)
        }
    }

    return this
}
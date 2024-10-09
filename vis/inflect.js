
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
        d3.select("svg").append("g").attr("class", "ann-group")

        // add switch to toggle editability

        if(window.top == window.self) {
            that.addUI();
            
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
                that.updateEditable()
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

    this.addUI = function() {

        var that = this;
        // Top level window
        d3.select("body").append("div").attr("class", "inflect_ui");
        
        // switch

        d3.select(".inflect_ui").append("div")
        .attr("class", "infl-ui-div")
        .attr("id", "toggle")
        // .style("display", "block")

        d3.select("#toggle")
        .append("p")
        .attr("class", "infl-ui-titles")
            .html("Toggle editability")
            .style("margin-top", "3px")
            .style("margin-bottom", "0px");

        d3.select("#toggle").append("label")
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

        // Lines
        d3.select(".inflect_ui").append("div")
        .attr("class", "infl-ui-div")
        .attr("id", "line-div");

        d3.select("#line-div").append("button")
            .attr("class", "infl-buttons").html("Add Line")
            .on("click", function() {
                let lines = that.inflection.line
                var list = lines.split(",");
                if(list.length > 0 && list[0].length > 0) {
                    lines += ","
                }
                lines += "120-330-80-80"
                that.inflection.line = lines;
                that.line()
                that.updateHash("line")
                that.updateEditable()

            });
        
            d3.select("#line-div").append("p").html("appears in a random place")
                .style("margin-top", "6px")
                .style("font-size", "13px");

        // Annotations
        d3.select(".inflect_ui").append("div")
        .attr("class", "infl-ui-div")
        .attr("id", "annotation-div");

        d3.select("#annotation-div").append("button")
            .attr("class", "infl-buttons").html("Add Annotation")
            .attr("id", "ann-button")

        d3.select("#annotation-div").append("input")
            .attr("id", "infl-text-input")
            .attr("type", "text")
            .attr("placeholder", "annotation text")
            .style("margin-top", "2px")

        // now define button behaviour
        d3.select("#ann-button")
            .on("click", function() {
                let anns = that.inflection.ann
                var list = anns.split(",");
                if(list.length > 0 && list[0].length > 0) {
                    anns += ","
                }
                let text = d3.select("#infl-text-input").property("value")
                if(text == "") {
                    text = "text"
                }
                anns += ("140-70-175-90-"+text.replace(" ", "_"));
                that.inflection.ann = anns;
                that.ann()
                that.updateHash("ann")
                that.updateEditable()

            });
        
        d3.select(".inflect_ui")
            .append("div")
            .attr("class", "infl-ui-div")
            // .attr("id", "annotation-div")
            .append("p").html("double click on handle to remove element")
            // .style("margin-top", "12px")
            .style("font-size", "13px")
            .style("float", "right")



    }

    this.updateEditable = function(){
        let that = this;

        if(this.editable) {

            // lines
            var lineGroup = d3.selectAll("g.infl-line");

            lineGroup.each(function() {
                // Select all the lines inside the group
                var linegroup = d3.select(this);

                var line = linegroup.select(".single-line");
                // Append circles to the line ends
                    
                // Get the start and end points of the line
                var x1 = +line.attr("x1"),
                    y1 = +line.attr("y1"),
                    x2 = +line.attr("x2"),
                    y2 = +line.attr("y2");

                linegroup.selectAll(".infl-handle.left.line")
                    .data([""])
                    .join("circle")
                    .attr("cx", x1)
                    .attr("cy", y1)
                    .attr("r", 10)
                    .attr("class", "infl-handle left line")


                // Append circle at the end of the line
                linegroup.selectAll(".infl-handle.right.line")
                    .data([""])
                    .join("circle")
                    .attr("cx", x2)
                    .attr("cy", y2)
                    .attr("r", 10)
                    .attr("class", "infl-handle right line")
                
            });

            // remove line
            // d3.selectAll(".infl-line")
            //     .style("cursor", "pointer")
            //     .on("dblclick", function(){
            //         d3.select(this.parentNode)
            //             // .transition()
            //             // .duration(200)
            //             // .ease(d3.easeLinear)
            //             .remove();
            //         that.updateHash("line")
                    
            //     });

            // annotations
            var ann_lines = d3.selectAll(".infl-ann-line")
            ann_lines.each(function() {
                var line = d3.select(this)
                var group = d3.select(this.parentNode)

                var x1 = +line.attr("x1"),
                    y1 = +line.attr("y1"),
                    x2 = +line.attr("x2"),
                    y2 = +line.attr("y2");

                group.selectAll(".infl-handle.left.ann")
                    .data([""])
                    .join("circle")
                    .attr("cx", x1)
                    .attr("cy", y1)
                    .attr("r", 10)
                    .attr("class", "infl-handle left ann")

                // Append circle at the end of the line
                group.selectAll(".infl-handle.right.ann")
                    .data([""])
                    .join("circle")
                    .attr("cx", x2)
                    .attr("cy", y2)
                    .attr("r", 10)
                    .attr("class", "infl-handle right ann")
            })
            
            // change highlight
            d3.select("svg").selectAll("rect")
                .style("cursor", "pointer")
                .on("mousedown", function(event, d) {
                    let highlight = d.type;
                    let current_col = d3.select(this).attr("fill");
                    let col_in_hex = rgbToHex(current_col)
                    if(col_in_hex == highlight_colour.toUpperCase()) {
                        that.inflection.high = "";
                    } else {
                        that.inflection.high = highlight
                    }

                    that.highlight()
                    that.updateHash("high")
                    // that.highlight()
                })

            


        }
        else {
            d3.selectAll(".infl-handle")
            .transition()
                    .duration(200)
                    .ease(d3.easeLinear)
                .remove()

            d3.select("svg").selectAll("rect")
                .style("cursor", "default")
                .on("mousedown", function(event, d) {//do nothing
                    });

            
        }

        d3.selectAll(".infl-handle").call(d3.drag().on("drag", function (event, d) {
            // console.log(d);
                d3.select(this)
                    .attr("cx", event.x)
                    .attr("cy", event.y);

                //lines 
                if(this.classList[2] == "line") {
                    if(this.classList[1] == "left") {
                        d3.select(this.parentNode).select(".single-line")
                            .attr("x1", event.x)
                            .attr("y1", event.y);
                    } else if(this.classList[1] == "right") {
                        d3.select(this.parentNode).select(".single-line")
                            .attr("x2", event.x)
                            .attr("y2", event.y);
                    }
                }

                //annotation lines 
                if(this.classList[2] == "ann") {
                    if(this.classList[1] == "left") {
                        d3.select(this.parentNode).select(".infl-ann-line")
                            .attr("x1", event.x)
                            .attr("y1", event.y);
                        d3.select(this.parentNode).select(".infl-ann-text")
                            .attr("x", event.x)
                            .attr("y", event.y);
                    } else if(this.classList[1] == "right") {
                        d3.select(this.parentNode).select(".infl-ann-line")
                            .attr("x2", event.x)
                            .attr("y2", event.y);
                    }
                }
            })
            .on("end", function() {
                if(this.classList[2] == "line") {
                    that.updateHash("line")
                }
                if(this.classList[2] == "ann") {
                    that.updateHash("ann")
                }
            })
        )

        d3.selectAll(".infl-handle")
                .on("dblclick", function(){
                    d3.select(this.parentNode)
                    // .transition()
                    // .duration(200)
                    // .ease(d3.easeLinear)
                    .remove();
                    if(this.classList[2] == "line") {
                        that.updateHash("line")
                    }
                    if(this.classList[2] == "ann") {
                        that.updateHash("ann")
                    }
                });

    }

    this.updateHash = function(kind){
        
        if(kind == "line") {
            var lines = [];
            d3.select("svg").selectAll(".single-line")
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
        if(kind == "high") {
            
        }
        if(kind == "ann") {
            var lines = [];
            d3.select("svg").selectAll(".infl-ann-line")
            .each(function(d) {
                let line = d3.select(this)
                let text = d3.select(this.parentElement).text().replace(" ", "_")
                lines.push(
                    {
                        x1: line.attr("x1"),
                        y1: line.attr("y1"),
                        x2: line.attr("x2"),
                        y2: line.attr("y2"),
                        text: text
                    }
                )
            })

            let anntext = ""
            lines.forEach((element, i) => {
                if(i > 0) {anntext += ","}
                anntext += element.x1
                anntext += "-"
                anntext += element.y1
                anntext += "-"
                anntext += element.x2
                anntext += "-"
                anntext += element.y2
                anntext += "-"
                anntext += element.text

                // .attr("x1", single_ann.x)
                //     .attr("x2", (single_ann.x-single_ann.dx))
                //     .attr("y1", single_ann.y)
                //     .attr("y2", (single_ann.y-single_ann.dy))
    
            })
            this.inflection.ann = anntext;

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

            

            d3.select(".line-group").selectAll(".infl-line")
            .data(data)
            .join("g").attr("class", "infl-line")
            .each(function(d) {
                var g = d3.select(this);
        
                g.selectAll(".single-line")
                    .data([d])
                    .join("line")
                    .attr("x1", d => d.x1)
                    .attr("x2", d => d.x2)
                    .attr("y1", d => d.y1)
                    .attr("y2", d => d.y2)
                    .attr("class", "single-line")
                    .transition()
                        .duration(200)
                        .ease(d3.easeLinear)
                        .attr("stroke", "black")
            });

        }
    }

    this.ann = function(){
        // notation: x1-y1-x2-y2-text
        // 
        //      /  x1, y2
        //     /
        //    /
        //   /
        // text
        // x1, y1


        let ann = this.inflection.ann
        if (ann == "") {
            d3.selectAll(".infl-ann")
            .transition()
                    .duration(200)
                    .ease(d3.easeLinear)
            .remove()
        }
        else {
            var annlist = ann.split(",");

            let data = [];
            annlist.forEach(element => {
                let splitted = element.split("-")
                let x1value = splitted[0]
                let y1value = splitted[1]
                let x2value = splitted[2]
                let y2value = splitted[3]
                let text = splitted[4].replace("_", " ")
                data.push({
                    x1: x1value,
                    y1: y1value,
                    x2: x2value,
                    y2: y2value,
                    text: text})

            });

            d3.select(".ann-group").selectAll(".infl-ann")
            .data(data)
            .join("g").attr("class", "infl-ann")
            .each(function(d) {
                let single_ann = d
                var g = d3.select(this);
                // console.log(d)
        
                g.selectAll(".infl-ann-line")
                    .data([""])
                    .join("line")
                    .attr("x1", single_ann.x1)
                    .attr("x2", (single_ann.x2))
                    .attr("y1", single_ann.y1)
                    .attr("y2", (single_ann.y2))
                    .attr("class", "infl-ann-line")
                    .transition()
                        .duration(200)
                        .ease(d3.easeLinear)
                        .attr("stroke", "black")


                g.selectAll(".infl-ann-text")
                    .data([""])
                    .join("text")
                    .style("text-anchor", "middle")
                    .attr("class", "infl-ann-text")
                    .attr("dy", "-.35em")
                    // .text(function(d) {console.log(d)})
                    .attr("x", single_ann.x1)
                    .attr("y", single_ann.y1)
                    .transition()
                        .duration(200)
                        .ease(d3.easeLinear)
                    .text(single_ann.text);
            })


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

    function rgbToHex(rgb) {
        // Extract the RGB values using a regular expression
        var rgbValues = rgb.match(/\d+/g); // Matches all numbers in the string
    
        // Convert each RGB component to a 2-digit hex value
        var r = parseInt(rgbValues[0]).toString(16).padStart(2, '0'); // Red
        var g = parseInt(rgbValues[1]).toString(16).padStart(2, '0'); // Green
        var b = parseInt(rgbValues[2]).toString(16).padStart(2, '0'); // Blue
    
        // Combine into the hex format
        return `#${r}${g}${b}`.toUpperCase(); // Uppercase for consistency
    }

    return this
}
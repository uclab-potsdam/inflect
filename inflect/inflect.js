
function Inflection() {
    // set base URL
    this.baseurl = "";
    this.hash = window.location.hash.substring(1);
    this.inflection = {
        line: "",
        ann: "",
        high: "",
        yax: ""
    };
    var highlight_colour = "#C8532E"
    this.basecol = "";
    this.baseyax = "";

    this.editable = true;
    this.SVGheight = 0;





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
    this.init = function (which) {

        var that = this;
        this.baseurl = document.URL.split("#")[0];
        // that.col = that.hash.split("_")[0]
        var hashA = this.hash.split("&");

        var transformation = d3.select("svg").select("g").attr("transform")
        
        d3.select("svg").append("g").attr("class", "line-group")
        d3.select("svg").append("g").attr("class", "ann-group")
        d3.select("svg").append("g").attr("class", "label-group").attr("transform", transformation)

        this.basecol = d3.select(".mark-rect").select("path").attr("fill").split("#")[1]

        this.baseyax = determineCurrentYax().toString()
        this.inflection.yax = this.baseyax;

        this.SVGheight = +d3.selectAll("g.mark-group.role-axis").filter(function() {
            return String(d3.select(this).attr("aria-label")).includes("Y-axis")
        }).select(".role-axis-domain").select("line").attr("transform").match(/translate\(.*?,([^\)]+)\)/)[1]; // get length in y-direction of y-axis line


        // add switch to toggle editability

        if (window.top == window.self) {
            that.addUI();

        } else {
            // Not top level. An iframe, popup or something
            that.editable = false;
            d3.select("details").remove()
        }






        checkHash(hashA)


        setInterval(function () {
            var newhash = window.location.hash.substring(1);
            // console.log(newhash)

            if (that.hash != newhash) {

                that.hash = newhash;

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

                    case "line":
                        if (value != that.inflection.line) {
                            that.inflection.line = value;
                            that.line();
                        }
                        break;
                    case "ann":
                        if (value != that.inflection.ann) {
                            that.inflection.ann = value;
                            that.ann();
                        }
                        break;
                    case "yax":
                        if (value != that.inflection.yax) {
                            that.inflection.yax = value;
                            that.yAx();
                        }
                        break;
                    case "high":
                        if (value != that.inflection.high) {
                            that.inflection.high = value;
                            that.highlight();
                        }
                        break;
                    default:
                        break;
                }
                cats_in_hash.push(cat)
            });

            if (!cats_in_hash.includes("line") && that.inflection.line != "") {
                that.inflection.line = ""
                that.line();
            }
            if ((!cats_in_hash.includes("yax") && that.inflection.yax != that.baseyax) | that.inflection.yax == "") {
                that.inflection.yax = that.baseyax
                that.yAx();
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


        this.line();
        this.ann();
        this.highlight();
        this.yAx();

        this.updateEditable();

    }



    this.addUI = function () {

        var that = this;
        // Top level window
        d3.select("body").append("div").attr("class", "inflect_ui");
        d3.select(".inflect_ui").append("div").attr("class", "infl-tooltip")
        var tooltip = d3.select(".infl-tooltip")
        d3.select(".inflect_ui")
            // .append("a")
            // .attr("href", that.hash)
            .append("img").attr("src", "../img/link.png")
            .style("width", "20px")
            .style("float", "right")
            .style("cursor", "pointer")
            .on("mouseover", function () {
                tooltip.style("visibility", "visible").text("Copy hash to clipboard");
            })
            .on("mousemove", function (event) {
                tooltip.style("top", (event.pageY - 35) + "px")
                    .style("left", (event.pageX - 20) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden");
            })
            .on("click", function () {

                // Copy the text inside the text field
                navigator.clipboard.writeText("#" + that.hash);

                // Alert the copied text
                tooltip.text("Copied to clipboard.");

            });

        // define toggle div
        // d3.select(".inflect_ui").append("div")
        //     .attr("class", "infl-ui-div")
        //     .attr("id", "toggle")
        // // .style("display", "block")

        // d3.select("#toggle")
        // .append("p")
        // .attr("class", "infl-ui-titles")
        //     .html("Toggle editability")
        //     .style("margin-top", "3px")
        //     .style("margin-bottom", "0px");

        // d3.select("#toggle").append("label")
        // .attr("class", "switch");

        // d3.select(".switch").append("input")
        //     .attr("type", "checkbox")
        //     .attr("checked", true)
        //     .on("change", function() {
        //         that.editable = this.checked;
        //         that.updateEditable();
        //     });

        d3.select(".switch").append("span")
            .attr("class", "slider");

        // reset axis
        // d3.select(".inflect_ui").append("div")
        //     .attr("class", "infl-ui-div")
        //     .attr("id", "yax-div");

        // d3.select("#yax-div").append("button")
        //     .attr("class", "infl-buttons").html("Reset Y-Axis")
        //     .on("click", function () {
        //         that.inflection.yax = that.baseyax;
        //         that.yAx()
        //         that.updateHash("line")
        //         that.updateEditable()

        //     });

        // d3.select("#yax-div").append("p").html("back to original")
        //     .style("margin-top", "6px")
        //     .style("font-size", "13px");

        // Lines
        d3.select(".inflect_ui").append("div")
            .attr("class", "infl-ui-div")
            .attr("id", "line-div");

        d3.select("#line-div").append("button")
            .attr("class", "infl-buttons").html("Add Line")
            .on("click", function () {
                let lines = that.inflection.line
                var list = lines.split(",");
                if (list.length > 0 && list[0].length > 0) {
                    lines += ","
                }
                lines += "42-226-40-41"
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
            .on("click", function () {
                let anns = that.inflection.ann
                var list = anns.split(",");
                if (list.length > 0 && list[0].length > 0) {
                    anns += ","
                }
                let text = d3.select("#infl-text-input").property("value")
                if (text == "") {
                    text = "text"
                }
                anns += ("140-70-" + text.replace(" ", "_"));
                that.inflection.ann = anns;
                that.ann()
                that.updateHash("ann")
                that.updateEditable()

            });


        // note about double click
        d3.select(".inflect_ui")
            .append("div")
            .attr("class", "infl-ui-div")
            // .attr("id", "annotation-div")
            .append("p").html("double click on element to remove/reset")
            // .style("margin-top", "12px")
            .style("font-size", "13px")
            .style("float", "right")



    }

    this.updateEditable = function () {
        let that = this;

        if (that.editable) {

            var shiftPressed = false;

            // Listen for keydown and keyup events to track the shift key
            d3.select(window)
                .on("keydown", function(event) {
                    if (event.key === "Shift") {
                        shiftPressed = true;
                    }
                })
                .on("keyup", function(event) {
                    if (event.key === "Shift") {
                        shiftPressed = false;
                    }
                });

            // lines
            var lineGroup = d3.selectAll("g.infl-line");

            lineGroup.each(function () {
                // Select all the lines inside the group
                var linegroup = d3.select(this);

                var line = linegroup.select(".single-line");
                // Append circles to the line ends

                // Get the start and end points of the line
                var left_data = {
                    x1: +line.attr("x1"),
                    y1: +line.attr("y1")
                }

                var right_data = {
                    x2: +line.attr("x2"),
                    y2: +line.attr("y2")
                }

                // Append circle at the end of the line
                linegroup.selectAll(".infl-handle.line.left")
                    .data([left_data])
                    .join("circle")
                    .attr("cx", d => d.x1)
                    .attr("cy", d => d.y1)
                    .attr("r", 10)
                    .attr("class", "infl-handle line left")


                // Append circle at the end of the line
                linegroup.selectAll(".infl-handle.line.right")
                    .data([right_data])
                    .join("circle")
                    .attr("cx", d => d.x2)
                    .attr("cy", d => d.y2)
                    .attr("r", 10)
                    .attr("class", "infl-handle line right")

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


            // change highlight
            d3.selectAll("path")
                .filter(function() {
                    return d3.select(this).attr("aria-roledescription") == "bar"
                    })
                .style("cursor", "pointer")
                .on("mousedown", function () {
                    var path = d3.select(this)
                    // get x value of bar to store it
                    let descr = path.attr("aria-label")
                    let regex = /\b\w+:\s*([\w]+)\b/;
            
                    let highlight = descr.match(regex)[1];
                    let current_col = path.attr("fill");
                    if (current_col[0] != "#") {
                        current_col = rgbToHex(current_col)
                    }
                    if (current_col == highlight_colour.toUpperCase()) {
                        that.inflection.high = "";
                    } else {
                        that.inflection.high = highlight
                    }

                    that.highlight()
                    that.updateHash("high")
                    // that.highlight()
                })

            // scale y-Axis
            // d3.selectAll("g.mark-group.role-axis").filter(function() {
                    //     return d3.select(this).attr("aria-hidden") != "true";
                    //   }).select("g").attr("transform")
            var yaxis_placement = d3.selectAll("g.mark-group.role-axis").filter(function() {
                return String(d3.select(this).attr("aria-label")).includes("Y-axis")
                }).select("g").node().getBoundingClientRect()

            d3.select("svg").selectAll(".infl-drag-area")
                .data([""])
                .enter()
                .insert("rect", ".line-group")
                .attr("class", "infl-drag-area")
                .attr("width", yaxis_placement.width)
                .attr("height", yaxis_placement.height)
                .attr("x", yaxis_placement.x)
                .attr("y", yaxis_placement.y)
                .style("fill", "none")
                .style("pointer-events", "all")
                .style("cursor", "n-resize")

            // ann text
            d3.selectAll(".infl-ann-text")
                .style("cursor", "move")
                .call(d3.drag()
                    .on("start", function (event) {
                        // var text_object = d3.select(this)
                        // text_object
                        //     .attr("x", event.sourceEvent.clientX)
                        //     .attr("y", event.sourceEvent.clientY);
                    })
                    .on("drag", function (event) {
                        var text_object = d3.select(this);

                        var text_current_pos = {
                            x: +text_object.attr("x"),
                            y: +text_object.attr("y"),
                        }
                        const xdragAmount = event.dx;
                        const ydragAmount = event.dy;

                        text_object
                            .attr("x", text_current_pos.x + xdragAmount)
                            .attr("y", text_current_pos.y + ydragAmount);
                    })
                    .on("end", function () {
                        that.updateHash("ann")
                    }))

            d3.selectAll(".infl-ann-text")
                .on("dblclick", function () {
                    d3.select(this)
                        .remove();
                    that.updateHash("ann")
                });

            // lines
            d3.selectAll(".single-line")
                .style("cursor", "move")
                .on("dblclick", function () {
                    d3.select(this.parentNode)
                        .remove();
                    that.updateHash("line")
                })            
                .call(d3.drag()
                    .on("drag", function (event) {
                        var line = d3.select(this);

                        var line_current_pos = {
                            x1: +line.attr("x1"),
                            y1: +line.attr("y1"),
                            x2: +line.attr("x2"),
                            y2: +line.attr("y2"),

                        }
                        const xdragAmount = event.dx;
                        const ydragAmount = event.dy;

                        line
                            .attr("x1", line_current_pos.x1 + xdragAmount)
                            .attr("y1", line_current_pos.y1 + ydragAmount)
                            .attr("x2", line_current_pos.x2 + xdragAmount)
                            .attr("y2", line_current_pos.y2 + ydragAmount);

                        //also drag handles
                        d3.select(this.parentNode).selectAll(".infl-handle")
                            .each(function (d) {
                                var handle = d3.select(this);
                                var handle_current_pos = {
                                    cx: +handle.attr("cx"),
                                    cy: +handle.attr("cy"),
                                }

                                handle
                                    .attr("cx", handle_current_pos.cx + xdragAmount)
                                    .attr("cy", handle_current_pos.cy + ydragAmount);
                            })

                    })
                    .on("end", function () {
                        that.updateHash("line")
                    })
                );

            //handles of lines
            d3.selectAll(".infl-handle")
            .on("dblclick", function () {
                d3.select(this.parentNode)
                    .remove();
                that.updateHash("line")

            })            
            .call(d3.drag()
                .on("drag", function (event, d) {

                    let line = d3.select(this.parentNode).select(".single-line");
                    let x1 = +line.attr("x1");
                    let y1 = +line.attr("y1");
                    let x2 = +line.attr("x2");
                    let y2 = +line.attr("y2");
                    
                    // Determine if the handle is "left" or "right"
                    let isLeft = this.classList.contains("left");
                    let cx = event.x;
                    let cy = event.y;
                    
                    // Snap to angles when shift key is pressed
                    if (shiftPressed) {
                        let referencePoint = isLeft ? { x: x2, y: y2 } : { x: x1, y: y1 };
                        let dx = cx - referencePoint.x;
                        let dy = cy - referencePoint.y;
                        let snapped = snapAngle(dx, dy);
        
                        cx = Math.round(referencePoint.x + snapped.dx);
                        cy = Math.round(referencePoint.y + snapped.dy);
                    }
        
                    // Update the position of the handle
                    d3.select(this)
                        .attr("cx", cx)
                        .attr("cy", cy);
        
                    // Update the line endpoint
                    if (isLeft) {
                        line.attr("x1", cx).attr("y1", cy);
                    } else {
                        line.attr("x2", cx).attr("y2", cy);
                    }

                })
                .on("end", function () {
                    that.updateHash("line")
                })
            )

                

            // yaxis drag

        var yScaleReconstructed = d3.scaleLinear()


        // define drag of axis
        d3.select(".infl-drag-area")
            .on("dblclick", function(){
                that.inflection.yax = that.baseyax;
                that.yAx()
                that.updateHash("line")
            })
            .call(d3.drag()
                .on("start", function () {
                    var curYAxValue = determineCurrentYax()
                    yScaleReconstructed
                        .domain([0, curYAxValue])
                        .range([that.SVGheight, 0]);
                })
                .on("drag", function (event) {
                    // Calculate the change in the y-axis based on the drag
                    const dragAmount = event.dy;

                    // Adjust the domain of the y-scale
                    const currentDomain = yScaleReconstructed.domain();
                    const rangeExtent = yScaleReconstructed.range();
                    const domainExtent = currentDomain[1] - currentDomain[0]; // The current range of the Y-axis domain

                    // Map the pixel drag amount to the data scale
                    const dataDragAmount = (dragAmount / (rangeExtent[0] - rangeExtent[1])) * domainExtent;

                    // Calculate the new maximum Y-axis value
                    const newMaxY = currentDomain[1] + dataDragAmount;  
                    // Update the domain of the scale
                    yScaleReconstructed.domain([0, newMaxY]);
                    
                    that.inflection.yax = newMaxY
                    that.yAx()
                })
                .on("end", function () {
                    that.updateHash("yax")
                })
            );



        }
        else { //not editable
            d3.selectAll(".infl-handle")
                .remove()

            //bar/highlight behaviour
            d3.selectAll("path")
                .filter(function() {
                    return d3.select(this).attr("aria-roledescription") == "bar"
                    })
                .style("cursor", "default")
                .on("mousedown", function (event, d) {//do nothing
                    });

            d3.select("g.myYaxis")
                .style("cursor", "auto")

            d3.select(".infl-drag-area").remove()

            d3.selectAll(".infl-ann-text")
                .style("cursor", "default")
                .on("dblclick", function () {})
                .call(d3.drag()
                    .on("start", function () {
                    })
                    .on("drag", function () {
                    })
                    .on("end", function () {
                    }))
            
            d3.select(".single-line")
                .style("cursor", "default")
                .on("dblclick", function () {})
                .call(d3.drag()
                    .on("start", function () {})
                    .on("drag", function () {})
                    .on("end", function () {})
                );

        }

    }




    this.updateHash = function (kind) {

        if (kind == "line") {
            var lines = [];
            d3.select("svg").selectAll(".single-line")
                .each(function (d) {
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
                if (i > 0) { linetext += "," }
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
        if (kind == "high") {

        }
        if (kind == "ann") {
            var anns = [];
            d3.select("svg").selectAll(".infl-ann-text")
                .each(function (d) {
                    let text_object = d3.select(this)
                    anns.push(
                        {
                            x: text_object.attr("x"),
                            y: text_object.attr("y"),
                            text: text_object.text().replace(" ", "_")
                        }
                    )
                })

            let anntext = ""
            anns.forEach((element, i) => {
                if (i > 0) { anntext += "," }
                anntext += element.x
                anntext += "-"
                anntext += element.y
                anntext += "-"
                anntext += element.text

            })
            this.inflection.ann = anntext;

        }
        if (kind == "yax") {
            this.inflection.yax = determineCurrentYax().toString();
        }
        this.hash =
            "yax=" + this.inflection.yax + "&" +
            "line=" + this.inflection.line + "&" +
            "ann=" + this.inflection.ann + "&" +
            "high=" + this.inflection.high;
        window.location.hash = "#" + this.hash
    }



    this.line = function () {

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
                .each(function (d) {
                    var g = d3.select(this);

                    g.selectAll(".single-line")
                        .data([d])
                        .join("line")
                        .attr("x1", d => d.x1)
                        .attr("x2", d => d.x2)
                        .attr("y1", d => d.y1)
                        .attr("y2", d => d.y2)
                        .attr("class", "mark-line single-line")
                        .transition()
                        .duration(200)
                        .ease(d3.easeLinear)
                        .attr("stroke", "#C8532E")
                });

        }
    }

    this.ann = function () {
        // notation: x-y-text

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
                let xvalue = splitted[0]
                let yvalue = splitted[1]
                let text = splitted[2].replace("_", " ")
                data.push({
                    x: xvalue,
                    y: yvalue,
                    text: text
                })

            });


            d3.select(".ann-group").selectAll(".infl-ann-text")
                .data(data)
                .join("text")
                .style("text-anchor", "middle")
                .attr("class", "infl-ann-text")
                .text(d => d.text)
                .attr("x", d => d.x)
                .attr("y", d => d.y)
                .transition()
                .duration(200)
                .ease(d3.easeLinear)
            // })


        }
    }

    this.highlight = function () {
        // bar rects are defined as paths like this:
        // <path aria-label="a: A; b: 28" role="graphics-symbol" aria-roledescription="bar" d="M1,144h18v56h-18Z" fill="#4c78a8"></path>
        let highlight = this.inflection.high
        if (highlight == "") {
            d3.selectAll("path")
                .filter(function() {
                    return d3.select(this).attr("aria-roledescription") == "bar"
                    })
                .transition()
                .duration(200)
                .ease(d3.easeLinear)
                .attr("fill", "#" + this.basecol)

            d3.selectAll(".infl-label")
                .transition()
                .duration(200)
                .ease(d3.easeLinear)
                .remove()
        }
        else {
            // select correct path of bar that has to be highlighted

            var path = d3.selectAll("path")
                .filter(function() {
                    return d3.select(this).attr("aria-roledescription") == "bar" && String(d3.select(this).attr("aria-label")).includes(highlight)
                    })

            path
                // .transition()
                // .duration(200)
                // .ease(d3.easeLinear)
                .attr("fill", highlight_colour)
            
            // var i = 0;
            // while(path.attr("fill") != highlight_colour) {
            //     i++;
            // }

            var aria_label = path.attr("aria-label") // e.g. "a: D; b: 91"
            // filter y value
            let yvalue = aria_label.match(/\b\w+:\s*(\d+)\b/)[1];  // "91" 

            // get x-and y-position
            let path_descr = path.attr("d")

            let match = path_descr.match(/M(\d+),(-?[0-9.]+)h(\d+)/);

    

            if (match) {
                let topLeftX = parseFloat(match[1]); // X coordinate (top-left corner)
                let topLeftY = parseFloat(match[2]); // Y coordinate (top-left corner)
                let width = parseFloat(match[3]);    // Width from the `h` command

                //add bar labels
                var label_data = [{
                    x: topLeftX,
                    y: topLeftY,
                    width: width,
                    value: +yvalue
                }]

                d3.select(".label-group")
                .selectAll("text.infl-label")
                .data(label_data)
                .join("text")
                .attr("class", "infl-label")
                // .text(function(d) {console.log(d)})
                .attr("dy", "-1em")
                .style("text-anchor", "middle")
                .text(d => d.value)
                // .transition()
                // .duration(200)
                // .ease(d3.easeLinear)
                .attr("x", (d) => d.x + d.width / 2)
                .attr("y", (d) => d.y);
            }
            
            // colour non-highlight bars back to normal
            d3.selectAll("path")
                .filter(function() {
                    return d3.select(this).attr("aria-roledescription") == "bar" && !String(d3.select(this).attr("aria-label")).includes(highlight)
                    })
                // .transition()
                // .duration(200)
                // .ease(d3.easeLinear)
                .attr("fill", "#" + this.basecol)
                

        }
    }

    this.yAx = function () {
        var that = this;
        var yAxValue = that.inflection.yax

        var newYScale = d3.scaleLinear()
            .domain([0, yAxValue])
            .range([that.SVGheight, 0]);

        var YaxisSelection = d3.selectAll("g.mark-group.role-axis").filter(function() {
                return String(d3.select(this).attr("aria-label")).includes("Y-axis")
            })


        // Update tick labels and lines and grid
            var line_nodeArray = YaxisSelection.selectAll('.mark-rule.role-axis-tick line').nodes()
            var grid_nodeArray = d3.selectAll('.mark-rule.role-axis-grid line').nodes()
            YaxisSelection.selectAll('.mark-text.role-axis-label text') // Select all tick labels
            .each(function(d, i) {
                
                var tick_line = d3.select(line_nodeArray[i])
                var grid_line = d3.select(grid_nodeArray[i])

                var tick_value = +d3.select(this).text()
                
                // Use newYScale to calculate the new position
                var newYPosition = newYScale(tick_value);

                if (newYPosition < 0) {
                    d3.select(this)
                    .remove()

                    tick_line.remove()
                    grid_line.remove()
                } else {
                    // Update the transform attribute with the new Y position
                    d3.select(this) //label
                        .transition()
                        .duration(200)
                        .ease(d3.easeLinear)
                        .attr('transform', 'translate(-7,' + (newYPosition + 3) + ')');

                    tick_line
                        .transition()
                        .duration(200)
                        .ease(d3.easeLinear)
                        .attr('transform', 'translate(0,' + newYPosition + ')');

                    grid_line
                        .transition()
                        .duration(200)
                        .ease(d3.easeLinear)
                        .attr('transform', 'translate(0,' + newYPosition + ')');
                
                }
            });

            
            // add ticks and labels that are now missing
            var label_nodeArray = YaxisSelection.selectAll('.mark-text.role-axis-label text').nodes()
            var curr_num_of_ticks  = label_nodeArray.length
            var max_tick_value = +d3.select(label_nodeArray[curr_num_of_ticks-1]).text()
            var tick_val_dist = max_tick_value - +d3.select(label_nodeArray[curr_num_of_ticks-2]).text()

            if((yAxValue - tick_val_dist) > max_tick_value) {
                var new_tick_val = max_tick_value + tick_val_dist
                var new_tick_pos = newYScale(new_tick_val)

                //clone attributes of existing labels and lines
                var one_label = YaxisSelection.select('.mark-text.role-axis-label text')

                YaxisSelection.select('.mark-text.role-axis-label text').clone().call(function(sel) {
                    sel.attr("transform", 'translate(-7,' + (new_tick_pos + 3) + ')')
                    sel.text(new_tick_val)
                    sel.node().parentNode.appendChild(sel.node()); //append as last child
                });

                YaxisSelection.select('.mark-rule.role-axis-tick line').clone().call(function(sel) {
                    sel.attr("transform", 'translate(0,' + new_tick_pos + ')')
                    sel.node().parentNode.appendChild(sel.node()); //append as last child
                });
                

                d3.select('.mark-rule.role-axis-grid line').clone().call(function(sel) {
                    sel.attr("transform", 'translate(0,' + new_tick_pos + ')')
                    sel.node().parentNode.appendChild(sel.node()); //append as last child
                });
     
            }
            
            


        // Update bar labels
        d3.select("svg").selectAll(".infl-label")
            // .transition()
            // .duration(200)
            // .ease(d3.easeLinear)
            .attr("y", (d) => newYScale(d.value));

        d3.selectAll("path")
            .filter(function() {
                    return d3.select(this).attr("aria-roledescription") == "bar"
            })
            .each(function(){
                var bar = d3.select(this)
                var aria_label = bar.attr("aria-label") // e.g. "a: D; b: 91"

                // filter y value
                var yvalue = aria_label.match(/\b\w+:\s*(\d+)\b/)[1];  // "91" 

                var path = bar.attr("d") // e.g. "M1,144h18v56h-18Z"

                let regex = /M(\d+),(-?[0-9.]+)h(\d+)v(\d+)/;
                let match = path.match(regex);
        
                if (match) {
                    let topLeftX = parseFloat(match[1]); // X coordinate (top-left corner)
                    let topLeftY = parseFloat(match[2]); // Y coordinate (top-left corner)
                    let width = parseFloat(match[3]);    // Width from the `h` command
                    let old_height = parseFloat(match[4]);   // Height from the `v` command
        
                    let new_height = Math.max(newYScale(yvalue),0)

                    // Replace the original height (v command) with the new height
                    let newPath = `M${topLeftX},${new_height}h${width}v${that.SVGheight - new_height}h-${width}Z`;
                    
                    bar
                        .transition()
                        .duration(200)
                        .ease(d3.easeLinear)
                            .attr("d", newPath)
                    
                }
            })
    

    }

    // helper functions

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

    function determineCurrentYax() {
        var axisSelection = d3.selectAll("g.mark-group.role-axis").filter(function() {
            return String(d3.select(this).attr("aria-label")).includes("Y-axis")
        })

        // get length of y-axis 
        // get distance between ticks
        
        var tickPositions = axisSelection.select(".role-axis-tick").selectAll("line")
        .nodes()
        .map(tick => {
            const transform = d3.select(tick).attr("transform");
            var translateY = 0;
            if(transform != "") {
                translateY = transform.match(/translate\(.*?,([^\)]+)\)/)[1]; // Extract Y value from translate(0,Y)
            }
            return +translateY;
        });

        var label_nodeArray = axisSelection.selectAll('.mark-text.role-axis-label text').nodes()
        var curr_num_of_ticks  = label_nodeArray.length
        var max_tick_value = +d3.select(label_nodeArray[curr_num_of_ticks-1]).text()


        var yaxValue = max_tick_value + (d3.min(tickPositions) / ((d3.max(tickPositions) - d3.min(tickPositions)) / max_tick_value))
        return Math.round(10 * yaxValue) / 10

    }

    function snapAngle(dx, dy) {
        // Calculate the angle of the line in degrees
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
        // Snap to nearest multiple of 22.5 degrees
        const snapAngles = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, -22.5, -45, -67.5, -90, -112.5, -135, -157.5, -180];
        let closestAngle = snapAngles.reduce((prev, curr) => 
            Math.abs(curr - angle) < Math.abs(prev - angle) ? curr : prev
        );
    
        // Convert snapped angle back to radians
        let rad = closestAngle * (Math.PI / 180);
        
        // Calculate new dx and dy based on the snapped angle
        let distance = Math.sqrt(dx * dx + dy * dy);
        return {
            dx: distance * Math.cos(rad),
            dy: distance * Math.sin(rad)
        };
    }

    return this
}
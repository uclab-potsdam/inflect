
function Inflection() {
    // set base URL
    this.baseurl = "";
    this.hash = window.location.hash.substring(1);
    this.inflection = {
        line: "",
        ann: "",
        high: "",
        yax: "",
        xax: "",
        col: ""
    };

    this.charttype = "";
    this.xAxEditable = false;
    this.yAxEditable = false;

    this.default_infl_col = "#00F05E"
    this.basecol = ""; // colour of the bars
    this.baseyax = "";
    this.basexax = "";

    this.editable = true; // states if page in iframe or separate window with UI
    var SVGheight = 0;
    var SVGwidth = 0;

    var promises = []; // Array to store promises for transitions





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
        

        // establish borders
        let first_transform = d3.select("svg").select("g").attr("transform");
        let second_transform = d3.select("svg").select("g").select("g").select("g").attr("transform");
        // let third_transform = d3.select(".mark-group.role-axis").select("g").attr("transform")
        let expr_y = /translate\(.*?,([^\)]+)\)/
        let expr_x = /translate\(([^,]+),/
        let border_y = +first_transform.match(expr_y)[1] + +second_transform.match(expr_y)[1] + 0.5;
        let border_x = +first_transform.match(expr_x)[1] + +second_transform.match(expr_x)[1] + 0.5;

        // append groups to insert lines and annotations
        d3.select("svg").append("g").attr("class", "line-group")
        .attr("transform", "translate(" + border_x + "," + border_y + ")")
        // .append("rect").style("border", "2px solid black")
        // .style("width", "210px").style("height", "333px")
        // .style("fill", "red").style("opacity", "0.4")

        d3.select("svg").append("g").attr("class", "ann-group")
        .attr("transform", "translate(" + border_x + "," + border_y + ")")


        d3.select("svg").append("g").attr("class", "label-group")
        .attr("transform", "translate(" + border_x + "," + border_y + ")")


        this.basecol = d3.select(".mark-rect").select("path").attr("fill").split("#")[1]
           
        this.inflection.col = this.default_infl_col

        
        SVGheight = +d3.selectAll("g.mark-group.role-axis").filter(function() {
            return String(d3.select(this).attr("aria-label")).includes("Y-axis")
        }).select(".role-axis-domain").select("line").attr("transform").match(/translate\(.*?,([^\)]+)\)/)[1]; // get length in y-direction of y-axis line
        // alternative method, if this is 0:
        if (SVGheight == 0) {
            SVGheight = +d3.selectAll("g.mark-group.role-axis").filter(function() {
                return String(d3.select(this).attr("aria-label")).includes("Y-axis")
            }).select(".role-axis-domain").select("line").attr("y2")
        }

        SVGwidth = +d3.selectAll("g.mark-group.role-axis").filter(function() {
            return String(d3.select(this).attr("aria-label")).includes("X-axis")
        }).select(".role-axis-domain").select("line").attr("x2")

        this.charttype = which;
        switch (which) {
            case "barchart":
                this.yAxEditable = true;
                this.xAxEditable = false;

                this.baseyax = determineMaxOfEditableAx("yax").toString()
                this.inflection.yax = this.baseyax;
                break;
            case "columnchart":
                    this.yAxEditable = false;
                    this.xAxEditable = true;

                    this.basexax = determineMaxOfEditableAx("xax").toString()
                    this.inflection.xax = this.basexax;
                    break;

            case "scatterplot":
                this.yAxEditable = true;
                this.xAxEditable = true;

                this.basexax = determineMaxOfEditableAx("xax").toString()
                this.inflection.xax = this.basexax;

                this.baseyax = determineMaxOfEditableAx("yax").toString()
                this.inflection.yax = this.baseyax;
                break;
        
            default:
                this.yAxEditable = true;
                this.xAxEditable = false;
                break;
        }

        // add switch to toggle editability

        if (window.top == window.self) {
            that.addUI();

        } else {
            // Not top level. An iframe, popup or something
            that.editable = false;
            d3.select("details").remove()
        }





        checkHash(that.hash)


        setInterval(function () {
            var newhash = window.location.hash.substring(1);
            // console.log(newhash)

            if (that.hash != newhash) {

                that.hash = newhash;

                checkHash(that.hash);
                that.updateEditable()
                // d3.selectAll(".annotation-group").raise()


            }
        }
            , 500);

        function checkHash(hash) {
            var hash_elements = hash.split("&");
            var cats_in_hash = [];
            hash_elements.forEach(element => {
                // console.log(element)
                let splitted = element.split("=")
                let cat = splitted[0]
                let value = decodeURIComponent(splitted[1])
                switch (cat) {
                    case "yax":
                        if (value != that.inflection.yax && that.yAxEditable) {
                            that.inflection.yax = value;
                            that.yAx();
                        }
                        break; 
                    case "xax":
                            if (value != that.inflection.xax && that.xAxEditable) {
                                that.inflection.xax = value;
                                that.xAx();
                            }
                            break; 
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
                    case "high":
                        if (value != that.inflection.high) {
                            that.inflection.high = value;
                            that.highlight();
                        }
                        break;
                    case "col":
                        if (value != that.inflection.col) {
                            that.inflection.col = value;
                            that.col();
                        }
                        break;      

                    default:
                        break;
                }
                cats_in_hash.push(cat)
            });

            if ((!cats_in_hash.includes("col") && that.inflection.col != that.default_infl_col) | that.inflection.col == "") {
                that.inflection.col = that.default_infl_col
                that.col();
            }

            if (!cats_in_hash.includes("line") && that.inflection.line != "") {
                that.inflection.line = ""
                that.line();
            }
            if (((!cats_in_hash.includes("yax") && that.inflection.yax != that.baseyax) | that.inflection.yax == "") && that.yAxEditable) {
                that.inflection.yax = that.baseyax
                that.yAx();
            }

            if (((!cats_in_hash.includes("xax") && that.inflection.xax != that.basexax) | that.inflection.xax == "") && that.xAxEditable) {
                that.inflection.xax = that.basexax
                that.xAx();
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


        this.yAx();
        this.line();
        this.ann();
        this.highlight();

        this.updateEditable();

    }



    this.addUI = function () {

        var that = this;
        var icon_button_width = 27;
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

                // Copy the hash
                navigator.clipboard.writeText("#" + that.hash);

                // Alert the copied text
                tooltip.text("Copied to clipboard.");

            });

        // Lines
        d3.select(".inflect_ui").append("div")
            .attr("class", "infl-ui-div")
            .attr("id", "line-div");

        d3.select("#line-div").append("svg")
            .attr("class", "icon-button")
            .attr("id", "line-button")
            .attr("width", icon_button_width)
            .attr("height", icon_button_width)
            // .style("float", "left")
            .style("margin-right", "15px")
            .style("cursor", "pointer")
            .on("mouseover", function () {
                tooltip.style("visibility", "visible").text("Add line");
            })
            .on("mousemove", function (event) {
                tooltip.style("top", (event.pageY - 35) + "px")
                    .style("left", (event.pageX - 20) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden");
            })
            .on("click", function () {
                let lines = that.inflection.line
                var list = lines.split(",");
                if (list.length > 0 && list[0].length > 0) {
                    lines += ","
                }

                if(that.xAxEditable) {
                    let xAxValue = that.inflection.xax;
                    let randomEntryX1 = Math.round(10*Math.random() * xAxValue)/10
                    let randomEntryX2 = Math.round(10*Math.random() * xAxValue)/10
                    var random_x_part = randomEntryX1 + "-0-" + randomEntryX2 + "-0-";

                } else {
                    let xscale = getCatAxsiScale("xax")
                    let x_domain = xscale.domain()
                    var randomEntryX1 = x_domain[Math.floor(Math.random() * x_domain.length)];
                    var randomEntryX2 = x_domain[Math.floor(Math.random() * x_domain.length)];
                    while (randomEntryX1 == randomEntryX2) {
                        randomEntryX2 = x_domain[Math.floor(Math.random() * x_domain.length)];
                    }
                    var random_x_part = randomEntryX1 + "-0.2-" + randomEntryX2 + "-0.8-" 

                }

                if(that.yAxEditable) {
                    let yAxValue = that.inflection.yax;
                    let randomEntryY1 = Math.round(10*Math.random() * yAxValue)/10
                    let randomEntryY2 = Math.round(10*Math.random() * yAxValue)/10
                    var random_y_part = randomEntryY1 + "-0-" + randomEntryY2 + "-0" ;
                } else {
                    let yscale = getCatAxsiScale("yax")
                    let y_domain = yscale.domain()
                    var randomEntryY1 = y_domain[Math.floor(Math.random() * y_domain.length)];
                    var randomEntryY2 = y_domain[Math.floor(Math.random() * y_domain.length)];
                    while (randomEntryY1 == randomEntryY2) {
                        randomEntryY2 = y_domain[Math.floor(Math.random() * y_domain.length)];
                    }
                    var random_y_part = randomEntryY1 + "-0.2-" + randomEntryY2 + "-0.8" ;

                }


                lines += random_x_part + random_y_part;
                        

                that.inflection.line = lines;
                that.line()
                that.updateHash("line")
                that.updateEditable()

            });
        
        d3.select("#line-button")
            .append("rect")
                .attr("class", "button-bg")
                .attr("width", icon_button_width)
                .attr("height", icon_button_width)
                .style("stroke-width", "2.5px")
                .style("stroke", "black")
                .style("fill", that.inflection.col)
                .style("fill-opacity", 0.3);
        
        var dist = 5;
        d3.select("#line-button")
            .append("line")
            .attr("x1", dist)
            .attr("x2", icon_button_width - dist)
            .attr("y1", icon_button_width - dist)
            .attr("y2", dist)
            .style("stroke", "black")
            .style("stroke-width", "3px")
            .style("stroke-linecap", "round")
        

        // Annotations
        d3.select(".inflect_ui").append("div")
            .attr("class", "infl-ui-div")
            .attr("id", "annotation-div");

        d3.select("#annotation-div").append("input")
            .attr("id", "infl-text-input")
            .attr("type", "text")
            .attr("placeholder", "input")
            .style("margin-top", "3px")
            .style("border-color", that.inflection.col)
            .on("focus", function() {
                d3.select(this)
                    .style("border-color", "black")
            })
            .on("blur", function() {
                d3.select(this)
                    .style("border-color", that.inflection.col);
            });

        d3.select("#annotation-div").append("svg")
            .attr("class", "icon-button")
            .attr("id", "ann-button")
            .attr("width", icon_button_width)
            .attr("height", icon_button_width)
            // .style("float", "left")
            .style("margin-left", "15px")
            .style("cursor", "pointer")
            .on("mouseover", function () {
                tooltip.style("visibility", "visible").text("Add annotation");
            })
            .on("mousemove", function (event) {
                tooltip.style("top", (event.pageY - 35) + "px")
                    .style("left", (event.pageX - 20) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden");
            })
        
        d3.select("#ann-button")
            .append("rect")
                .attr("class", "button-bg")
                .attr("width", icon_button_width)
                .attr("height", icon_button_width)
                .style("stroke-width", "2.5px")
                .style("stroke", "black")
                .style("fill", that.inflection.col)
                .style("fill-opacity", 0.3);
        
        var dist = 5;
        d3.select("#ann-button")
            .append("text")
            .attr("x", icon_button_width/2)
            .attr("y", icon_button_width/2)
            .attr("dy", "0.35em")
            .style("font-family", "Ubuntu")
            .style("font-size", "10px")
            .style("text-anchor", "middle")
            .text("text");

        // d3.select("#annotation-div").append("button")
        //     .attr("class", "infl-buttons").html("Add Annotation")
        //     .attr("id", "ann-button")




        // now define button behaviour to add annotation
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

                // randomize, adapt to scale
                if(that.xAxEditable) {
                    var xAxValue = that.inflection.xax;
                    var randomXEntry = Math.round(10*Math.random() * xAxValue)/10;
                    var randomX = randomXEntry + "-0-"

                } else {
                    var xscale = getCatAxsiScale("xax")
                    var x_domain = xscale.domain()
                    var randomXEntry = x_domain[Math.floor(Math.random() * x_domain.length)];
                    var randomX = randomXEntry + "-0.2-"
                }

                if(that.yAxEditable) {
                    var yAxValue = that.inflection.yax;
                    var randomYEntry = Math.round(10*Math.random() * yAxValue)/10;
                    var randomY = randomYEntry + "-0-"

                } else {
                    var yscale = getCatAxsiScale("yax")
                    var y_domain = yscale.domain()
                    var randomYEntry = y_domain[Math.floor(Math.random() * y_domain.length)];
                    var randomY = randomYEntry + "-0.2-"

                }

                anns += randomX + randomY + text
          
                that.inflection.ann = anns;
                that.ann()
                that.updateHash("ann")
                that.updateEditable()

            });

        // Colour
        d3.select(".inflect_ui").append("div")
            .attr("class", "infl-ui-div")
            .attr("id", "colour-div");

            // <input type="color" id="head" name="head" value="#e66465" />
        d3.select("#colour-div").append("input")
            .attr("class", "infl-col-input")
            .attr("type", "color")
            .attr("value", that.inflection.col)
            .on("change", function(d) {
                var new_col = d3.select(this).property("value")
                // highlight_colour = new_col
                that.inflection.col = new_col
                that.col()
                that.updateHash("col")
            })


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

    this.updateEditable = async function () {
        await Promise.all(promises);
        promises = [];

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

            // add handles to lines

            var lineGroup = d3.selectAll("g.infl-line");

            lineGroup.each(function () {
                // Select all the lines inside the group
                var linegroup = d3.select(this);

                var linedata = linegroup.select(".single-line").data()[0];
                // Append circles to the line ends

                // Get the start and end points of the line
                var left_data = {
                    x1: +linedata.x1,
                    y1: +linedata.y1,
                    mark: {
                        marktype: "circle",
                        markgroup: "inflection"
                    }
                }

                var right_data = {
                    x2: +linedata.x2,
                    y2: +linedata.y2,
                    mark: {
                        marktype: "circle",
                        markgroup: "inflection"
                    }
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

                        var line_new_pos = {
                            x1: line_current_pos.x1 + xdragAmount,
                            y1: line_current_pos.y1 + ydragAmount,
                            x2: line_current_pos.x2 + xdragAmount,
                            y2: line_current_pos.y2 + ydragAmount,

                        }

                        if(line_new_pos.x1 >= 0 && line_new_pos.x1 <= SVGwidth && // only move when not touching edge of svg
                            line_new_pos.x2 >= 0 && line_new_pos.x2 <= SVGwidth &&
                            line_new_pos.y1 >= 0 && line_new_pos.y1 <= SVGheight &&
                            line_new_pos.y2 >= 0 && line_new_pos.y2 <= SVGheight) {
                        

                            line
                                .attr("x1", clampToWidth(line_new_pos.x1))
                                .attr("y1", clampToHeight(line_new_pos.y1))
                                .attr("x2", clampToWidth(line_new_pos.x2))
                                .attr("y2", clampToHeight(line_new_pos.y2));

                            //also drag handles
                            d3.select(this.parentNode).selectAll(".infl-handle")
                                .each(function (d) {
                                    var handle = d3.select(this);
                                    var handle_current_pos = {
                                        cx: +handle.attr("cx"),
                                        cy: +handle.attr("cy"),
                                    }

                                    handle
                                        .attr("cx", clampToWidth(handle_current_pos.cx + xdragAmount))
                                        .attr("cy", clampToHeight(handle_current_pos.cy + ydragAmount));
                                })
                        }

                    })
                    .on("end", function () {
                        var curr_x1_pos = d3.select(this).attr("x1")
                        var curr_y1_pos = d3.select(this).attr("y1")
                        var curr_x2_pos = d3.select(this).attr("x2")
                        var curr_y2_pos = d3.select(this).attr("y2")

                        var linedata = d3.select(this).data()[0]

                        if(that.xAxEditable) {
                            var currXScale = d3.scaleLinear()
                                .domain([0, determineMaxOfEditableAx("xax")])
                                .range([0, SVGwidth]);
                                
                            var x1_data_value = Math.round(10*currXScale.invert(+curr_x1_pos))/10;
                            var x2_data_value = Math.round(10*currXScale.invert(+curr_x2_pos))/10;

                            linedata.x1Data[0] = x1_data_value;
                            linedata.x2Data[0] = x2_data_value;
                        
                        } else {
                            var [x1_data_value, between1] = invertCatScale("xax", +curr_x1_pos)
                            var [x2_data_value, between2] = invertCatScale("xax", +curr_x2_pos)

                            linedata.x1Data[0] = x1_data_value;
                            linedata.x1Data[1] = Math.round(100*between1)/100;
                            linedata.x2Data[0] = x2_data_value;
                            linedata.x2Data[1] = Math.round(100*between2)/100;
                        }
                        if(that.yAxEditable) {
                            var currYScale = d3.scaleLinear()
                                .domain([0, determineMaxOfEditableAx("yax")])
                                .range([SVGheight, 0]);

                            var y1_data_value = Math.round(10*currYScale.invert(+curr_y1_pos))/10;
                            var y2_data_value = Math.round(10*currYScale.invert(+curr_y2_pos))/10;
                            
                            linedata.y1Data[0] = y1_data_value;
                            linedata.y2Data[0] = y2_data_value;

                        } else {
                            var [y1_data_value, between1] = invertCatScale("yax", +curr_y1_pos)
                            var [y2_data_value, between2] = invertCatScale("yax", +curr_y2_pos)

                            linedata.y1Data[0] = y1_data_value;
                            linedata.y1Data[1] = Math.round(100*between1)/100;
                            linedata.y2Data[0] = y2_data_value;
                            linedata.y2Data[1] = Math.round(100*between2)/100;
                        }

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
                        .attr("cx", clampToWidth(cx))
                        .attr("cy", clampToHeight(cy));
        
                    // Update the line endpoint
                    if (isLeft) {
                        line.attr("x1", clampToWidth(cx)).attr("y1", clampToHeight(cy));
                    } else {
                        line.attr("x2", clampToWidth(cx)).attr("y2", clampToHeight(cy));
                    }

                })
                .on("end", function () {
                    let line = d3.select(this.parentNode).select(".single-line");
                    var curr_x1_pos = line.attr("x1")
                    var curr_y1_pos = line.attr("y1")
                    var curr_x2_pos = line.attr("x2")
                    var curr_y2_pos = line.attr("y2")

                    var linedata = line.data()[0]

                    if(that.xAxEditable) {
                        var currXScale = d3.scaleLinear()
                            .domain([0, determineMaxOfEditableAx("xax")])
                            .range([0, SVGwidth]);
                            
                        var x1_data_value = Math.round(10*currXScale.invert(+curr_x1_pos))/10;
                        var x2_data_value = Math.round(10*currXScale.invert(+curr_x2_pos))/10;

                        linedata.x1Data[0] = x1_data_value;
                        linedata.x2Data[0] = x2_data_value;
                    
                    } else {
                        var [x1_data_value, between1] = invertCatScale("xax", +curr_x1_pos)
                        var [x2_data_value, between2] = invertCatScale("xax", +curr_x2_pos)

                        linedata.x1Data[0] = x1_data_value;
                        linedata.x1Data[1] = Math.round(100*between1)/100;
                        linedata.x2Data[0] = x2_data_value;
                        linedata.x2Data[1] = Math.round(100*between2)/100;
                    }
                    if(that.yAxEditable) {
                        var currYScale = d3.scaleLinear()
                            .domain([0, determineMaxOfEditableAx("yax")])
                            .range([SVGheight, 0]);

                        var y1_data_value = Math.round(10*currYScale.invert(+curr_y1_pos))/10;
                        var y2_data_value = Math.round(10*currYScale.invert(+curr_y2_pos))/10;
                        
                        linedata.y1Data[0] = y1_data_value;
                        linedata.y2Data[0] = y2_data_value;

                    } else {
                        var [y1_data_value, between1] = invertCatScale("yax", +curr_y1_pos)
                        var [y2_data_value, between2] = invertCatScale("yax", +curr_y2_pos)

                        linedata.y1Data[0] = y1_data_value;
                        linedata.y1Data[1] = Math.round(100*between1)/100;
                        linedata.y2Data[0] = y2_data_value;
                        linedata.y2Data[1] = Math.round(100*between2)/100;
                    }

                    that.updateHash("line")
                })
            )



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
                    if (current_col.toUpperCase() == that.inflection.col.toUpperCase()) {
                        that.inflection.high = "";
                    } else {
                        that.inflection.high = highlight
                    }

                    that.highlight()
                    that.updateHash("high")
                    // that.highlight()
                })


            // annotation text
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
                            .attr("x", clampToWidth(text_current_pos.x + xdragAmount))
                            .attr("y", clampToHeight(text_current_pos.y + ydragAmount));
                    })
                    .on("end", function () {
                        var curr_y_pos = d3.select(this).attr("y")
                        var curr_x_pos = d3.select(this).attr("x")
                        var textdata = d3.select(this).data()[0]

                        if(that.xAxEditable) {
                            var currXScale = d3.scaleLinear()
                                .domain([0, determineMaxOfEditableAx("xax")])
                                .range([0, SVGwidth]);
                                
                            textdata.xData[0] = Math.round(10*currXScale.invert(+curr_x_pos))/10;
                        
                        } else {
                            var [x_data_value, between] = invertCatScale("xax", +curr_x_pos)
                            textdata.xData[0] = x_data_value;
                            textdata.xData[1] = +Math.round(100*between)/100;
                        }

                        if(that.yAxEditable) {
                            var currYScale = d3.scaleLinear()
                                .domain([0, determineMaxOfEditableAx("yax")])
                                .range([SVGheight, 0]);
                                
                            textdata.yData[0] = Math.round(10*currYScale.invert(+curr_y_pos))/10;
                        
                        } else {
                            var [y_data_value, between] = invertCatScale("yax", +curr_y_pos)
                            textdata.yData[0] = y_data_value;
                            textdata.yData[1] = +Math.round(100*between)/100;
                        }


                        that.updateHash("ann")


                    }))

            d3.selectAll(".infl-ann-text")
                .on("dblclick", function () {
                    d3.select(this)
                        .remove();
                    that.updateHash("ann")
                })
                .on("mouseover", function(event) {
                    event.preventDefault();
                });

                

        if(that.yAxEditable) {
         // scale y-Axis
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
                        .style("cursor", "ns-resize")


            // y-axis drag
            var yScaleReconstructed = d3.scaleLinear()


            // define drag of axis
            d3.select(".infl-drag-area")
                .on("dblclick", function(){
                    that.inflection.yax = that.baseyax;
                    that.yAx()
                    that.updateHash("yax")
                })
                .call(d3.drag()
                    .on("start", function () {
                        var curYAxValue = determineMaxOfEditableAx("yax")
                        yScaleReconstructed
                            .domain([0, curYAxValue])
                            .range([SVGheight, 0]);
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

            // x-axis drag
            if(that.xAxEditable) {
                var xaxis_placement = d3.selectAll("g.mark-group.role-axis").filter(function() {
                    return String(d3.select(this).attr("aria-label")).includes("X-axis")
                    }).select("g").node().getBoundingClientRect()
    
                d3.select("svg").selectAll(".infl-drag-area")
                    .data([""])
                    .enter()
                    .insert("rect", ".line-group")
                    .attr("class", "infl-drag-area")
                    .attr("width", xaxis_placement.width)
                    .attr("height", xaxis_placement.height)
                    .attr("x", xaxis_placement.x)
                    .attr("y", xaxis_placement.y)
                    .style("fill", "none")
                    .style("pointer-events", "all")
                            .style("cursor", "ew-resize")

                            
                // define drag of axis
                var xScaleReconstructed = d3.scaleLinear()
    
    
                d3.select(".infl-drag-area")
                    .on("dblclick", function(){
                        that.inflection.xax = that.basexax;
                        that.xAx()
                        that.updateHash("xax")
                    })
                    .call(d3.drag()
                        .on("start", function () {
                            var curXAxValue = determineMaxOfEditableAx("xax")
                            xScaleReconstructed
                                .domain([0, curXAxValue])
                                .range([0, SVGwidth]);
                        })
                        .on("drag", function (event) {
                            // Calculate the change in the y-axis based on the drag
                            const dragAmount = event.dx;
    
                            // Adjust the domain of the y-scale
                            const currentDomain = xScaleReconstructed.domain();
                            const rangeExtent = xScaleReconstructed.range();
                            const domainExtent = currentDomain[1] - currentDomain[0]; // The current range of the Y-axis domain
    
                            // Map the pixel drag amount to the data scale
                            const dataDragAmount = (dragAmount / (rangeExtent[0] - rangeExtent[1])) * domainExtent;
    
                            // Calculate the new maximum Y-axis value
                            const newMaxX = currentDomain[1] + dataDragAmount;  
                            // Update the domain of the scale
                            xScaleReconstructed.domain([0, newMaxX]);
                            
                            that.inflection.xax = newMaxX
                            that.xAx()
                        })
                        .on("end", function () {
                            that.updateHash("xax")
                        })
                    );
            }



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




    this.updateHash = async function (kind) {
        await Promise.all(promises);
        promises = [];

        if (kind == "line") {
            var lines = [];
            d3.select("svg").selectAll(".single-line")
                .each(function (d) {
                    let linedata = d3.select(this).data()[0]
                    lines.push(
                        {   
                            xd1: linedata.x1Data[0],
                            xb1: linedata.x1Data[1],
                            xd2: linedata.x2Data[0],
                            xb2: linedata.x2Data[1],
                            yd1: linedata.y1Data[0],
                            yb1: linedata.y1Data[1],
                            yd2: linedata.y2Data[0],
                            yb2: linedata.y2Data[1]
                        }
                    )
                })
            let linetext = ""
            lines.forEach((element, i) => {
                if (i > 0) { linetext += "," }
                linetext += element.xd1
                linetext += "-"
                linetext += element.xb1
                linetext += "-"
                linetext += element.xd2
                linetext += "-"
                linetext += element.xb2
                linetext += "-"
                linetext += element.yd1
                linetext += "-"
                linetext += element.yb1
                linetext += "-"
                linetext += element.yd2
                linetext += "-"
                linetext += element.yb2

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
                    let text_object_data = text_object.data()[0]
                    anns.push(
                        {
                            xd: text_object_data.xData[0],
                            xb: text_object_data.xData[1],
                            yd: text_object_data.yData[0],
                            yb: text_object_data.yData[1],
                            text: text_object.text()
                        }
                    )
                    
                })

            let anntext = ""
            anns.forEach((element, i) => {
                if (i > 0) { anntext += "," }
                anntext += element.xd
                anntext += "-"
                anntext += element.xb
                anntext += "-"
                anntext += element.yd
                anntext += "-"
                anntext += element.yb
                anntext += "-"
                anntext += element.text

            })
            this.inflection.ann = anntext;

        }
        if (kind == "yax") {
            this.inflection.yax = determineMaxOfEditableAx("yax").toString();
        }
        if (kind == "xax") {
            this.inflection.xax = determineMaxOfEditableAx("xax").toString();
        }
        if (kind == "col") {
            
        }
        this.hash =
            "vis=" + this.charttype + "&" +
            "col=" + encodeURIComponent(this.inflection.col) + "&"

        if (this.yAxEditable) {
            this.hash += "yax=" + this.inflection.yax + "&"
        }
        if (this.xAxEditable) {
            this.hash += "xax=" + this.inflection.xax + "&"
        }
        this.hash +=
            "line=" + this.inflection.line + "&" +
            "ann=" + encodeURIComponent(this.inflection.ann) + "&" +
            "high=" + this.inflection.high;
        window.location.hash = "#" + this.hash
    }



    this.line = async function () {
        
        var that = this;
        let place = that.inflection.line

        if (place == "") {
            d3.selectAll(".infl-line")
                .transition()
                .duration(200)
                .ease(d3.easeLinear)
                .remove()
        }
        else {
            await Promise.all(promises);
            promises = [];

            var placelist = place.split(",");

            if(that.xAxEditable) {
                var currXScale = d3.scaleLinear()
                            .domain([0, determineMaxOfEditableAx("xax")])
                            .range([0, SVGwidth]);
            } else {
                var currXScale = getCatAxsiScale("xax")
            }

            if(that.yAxEditable) {
                var currYScale = d3.scaleLinear()
                            .domain([0, determineMaxOfEditableAx("yax")])
                            .range([SVGheight, 0]);
            } else {
                var currYScale = getCatAxsiScale("yax")
            }


            let data = [];
            placelist.forEach(element => {
                let splitted = element.split("-")
                let x1_data_pos = splitted[0]
                let x1_between = +splitted[1]
                let x2_data_pos = splitted[2]
                let x2_between = +splitted[3]
                let y1_data_pos = splitted[4]
                let y1_between = +splitted[5]
                let y2_data_pos = splitted[6]
                let y2_between = +splitted[7]

                if(that.xAxEditable) {
                    //linear scale, no between necessary
                    var x1value = Math.round(10*currXScale(x1_data_pos))/10
                    var x2value = Math.round(10*currXScale(x2_data_pos))/10
                } else {
                    // use between values to interpolate
                    var x1value = Math.round(10*(currXScale(x1_data_pos) + currXScale.step()*x1_between))/10
                    var x2value = Math.round(10*(currXScale(x2_data_pos) + currXScale.step()*x2_between))/10
                }
    
                if(that.yAxEditable) {
                    // calculate postition in pixel space
                    var y1value = Math.round(10*currYScale(y1_data_pos))/10
                    var y2value = Math.round(10*currYScale(y2_data_pos))/10
                } else {
                    var y1value = Math.round(10*(currYScale(y1_data_pos) + currYScale.step()*y1_between))/10
                    var y2value = Math.round(10*(currYScale(y2_data_pos) + currYScale.step()*y2_between))/10
                }


                data.push(
                    {
                        x1: x1value,
                        x2: x2value,
                        y1: y1value,
                        y2: y2value,
                        x1Data: [x1_data_pos, x1_between],
                        x2Data: [x2_data_pos, x2_between],
                        y1Data: [y1_data_pos, y1_between],
                        y2Data: [y2_data_pos, y2_between],
                        mark: {
                            marktype: "line",
                            markgroup: "inflection"
                        }
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
                            .attr("class", "mark-line single-line")
                            .transition("move-line")
                            .duration(200)
                            .ease(d3.easeLinear)
                                .attr("stroke", that.inflection.col)
                                .attr("x1", d => d.x1)
                                .attr("x2", d => d.x2)
                                .attr("y1", d => d.y1)
                                .attr("y2", d => d.y2)
                });

        }
    }

    this.ann = async function () {
        // notation: x-y-text
        var that = this;

        let ann = this.inflection.ann
        if (ann == "") {
            d3.selectAll(".infl-ann")
                .transition()
                .duration(200)
                .ease(d3.easeLinear)
                .remove()
        }
        else {
            await Promise.all(promises);
            promises = [];

            var annlist = ann.split(",");
                        //transform to data coordinates
            if(that.xAxEditable) {
                var currXScale = d3.scaleLinear()
                .domain([0, determineMaxOfEditableAx("xax")])
                .range([0, SVGwidth]);
            } else {
                var currXScale = getCatAxsiScale("xax")
            }

            if(that.yAxEditable) {
                var currYScale = d3.scaleLinear()
                .domain([0, determineMaxOfEditableAx("yax")])
                .range([SVGheight, 0]);
            } else {
                var currYScale = getCatAxsiScale("yax")
            }
            

            let data = [];
            annlist.forEach(element => {
                let splitted = element.split("-")
                let x_data_pos = splitted[0]
                let x_between = +splitted[1]
                let y_data_pos = splitted[2]
                let y_between = +splitted[3]
                let text = splitted[4]

                // calculate postition in pixel space
                if(that.xAxEditable) {
                    var x_value = Math.round(10*currXScale(x_data_pos))/10
                } else {
                    var x_value = Math.round(10*(currXScale(x_data_pos) + currXScale.step()*x_between))/10
                }

                if(that.yAxEditable) {
                    var y_value = Math.round(10*currYScale(y_data_pos))/10
                } else {
                    var y_value = Math.round(10*(currYScale(y_data_pos) + currYScale.step()*y_between))/10
                }


                data.push({
                    x: x_value,
                    y: y_value,
                    yData: [y_data_pos, y_between],
                    xData: [x_data_pos, x_between],
                    text: text,
                    mark: {
                        marktype: "text",
                        markgroup: "inflection"
                    }
                })

            });

            
            d3.select(".ann-group").selectAll(".infl-ann-text")
                .data(data)
                .join("text")
                .style("text-anchor", "middle")
                .attr("class", "infl-ann-text")
                .style("fill", that.inflection.col)
                .transition("move-ann")
                .duration(200)
                .ease(d3.easeLinear)
                    .text(d => d.text)
                    .attr("x", d => d.x)
                    .attr("y", d => d.y)
                // 
            // })


        }
    }

    this.highlight = async function () {
        // bar rects are defined as paths like this:
        // <path aria-label="a: A; b: 28" role="graphics-symbol" aria-roledescription="bar" d="M1,144h18v56h-18Z" fill="#4c78a8"></path>
        var that = this;
        let highlight = that.inflection.high

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

            await Promise.all(promises);
            promises = [];

            var path = d3.selectAll("path")
                .filter(function() {
                    return d3.select(this).attr("aria-roledescription") == "bar" && String(d3.select(this).attr("aria-label")).includes(highlight)
                    })

            path
                .transition("trans-high")
                .duration(200)
                .ease(d3.easeLinear)
                .attr("fill", that.inflection.col)
            


            var aria_label = path.attr("aria-label") // e.g. "a: D; b: 91"
            // filter y value
            let yvalue = aria_label.match(/\b\w+:\s*(\d+)\b/)[1];  // "91" 

            // get x-and y-position
            let path_descr = path.attr("d")

            let match = path_descr.match(/M(\d+),(-?[0-9.]+)h([0-9.]+)v([0-9.]+)h-([0-9.]+)Z/);
            
    

            if (match) {
                let topLeftX = parseFloat(match[1]); // X coordinate (top-left corner)
                let topLeftY = parseFloat(match[2]); // Y coordinate (top-left corner)
                let width = parseFloat(match[3]);    // Width from the `h` command
                let height = parseFloat(match[4]); // Height

                //add bar labels
                var label_data = [{
                    x: topLeftX,
                    y: topLeftY,
                    width: width,
                    height: height,
                    value: +yvalue,
                    mark: {
                        marktype: "text",
                        markgroup: "inflection"
                    }
                }]


                // label
                 d3.select(".label-group")
                    .selectAll("text.infl-label")
                    .data(label_data)
                    .join("text")
                    .attr("class", "infl-label")
                    


                switch (that.charttype) {
                    case "barchart":
                        d3.selectAll(".infl-label")
                            .attr("dy", "-1em")
                            .style("text-anchor", "middle")
                            .transition("trans-high")
                            .duration(200)
                            .ease(d3.easeLinear)
                                .text(d => d.value)
                                .attr("x", (d) => d.x + d.width / 2)
                                .attr("y", (d) => d.y)
                                .style("fill", that.inflection.col)
                        break;
                    case "columnchart":
                        d3.selectAll(".infl-label")
                            .attr("dx", "1em")
                            .attr("dy", ".35em")
                            .style("text-anchor", "start")
                            .transition("trans-high")
                            .duration(200)
                            .ease(d3.easeLinear)
                                .text(d => d.value)
                                .attr("x", (d) => d.x + d.width)
                                .attr("y", (d) => d.y + d.height/2)
                                .style("fill", that.inflection.col)
                        break;
                
                    default:
                        break;
                }
                    
            }
            
            // colour non-highlight bars back to normal
             d3.selectAll("path")
                .filter(function() {
                    return d3.select(this).attr("aria-roledescription") == "bar" && !String(d3.select(this).attr("aria-label")).includes(highlight)
                    })
                .transition()
                .duration(200)
                .ease(d3.easeLinear)
                .attr("fill", "#" + this.basecol)
                
                

        }
    }

    this.yAx = function () {
        if (this.yAxEditable) {
            promises = [];
        
            var that = this;
            var yAxValue = that.inflection.yax

            var newYScale = d3.scaleLinear()
                .domain([0, yAxValue])
                .range([SVGheight, 0]);

            var YaxisSelection = d3.selectAll("g.mark-group.role-axis").filter(function() {
                    return String(d3.select(this).attr("aria-label")).includes("Y-axis")
                })
            
            var opacities = []
            // Update tick labels and lines and grid
                var line_nodeArray = YaxisSelection.selectAll('.mark-rule.role-axis-tick line').nodes()
                var grid_nodeArray = d3.selectAll('.mark-rule.role-axis-grid line').nodes()
                YaxisSelection.selectAll('.mark-text.role-axis-label text') // Select all tick labels
                .each( function(d, i) {
                    
                    var tick_line = d3.select(line_nodeArray[i])
                    var grid_line = d3.select(grid_nodeArray[i])

                    var tick_value = +d3.select(this).text().replaceAll(",","")
                    
                    // Use newYScale to calculate the new position
                    var newYPosition = newYScale(tick_value);

                    let opacity = d3.select(this).attr('opacity');
                    opacity = opacity === '' || opacity === 'auto' ? 1 : parseFloat(opacity);
                    opacities.push(opacity);

                    if (newYPosition < 0) {
                        d3.select(this)
                        .remove()

                        tick_line.remove()
                        grid_line.remove()
                    } else {
                        // Update the transform attribute with the new Y position
                        // TODO where are the -7 from?
                        d3.select(this) //label
                            .transition()
                            .duration(200)
                            .ease(d3.easeLinear)
                            .attr('transform', 'translate(-7,' + (newYPosition + 3) + ')')

                        tick_line
                            .transition()
                            .duration(200)
                            .ease(d3.easeLinear)
                            .attr('transform', 'translate(0,' + newYPosition + ')')

                        grid_line
                            .transition()
                            .duration(200)
                            .ease(d3.easeLinear)
                            .attr('transform', 'translate(0,' + newYPosition + ')')
                            
                    
                    }
                });

                
                // add ticks and labels that are now missing
                var label_nodeArray = YaxisSelection.selectAll('.mark-text.role-axis-label text').nodes()
                var curr_num_of_ticks  = label_nodeArray.length
                var max_tick_value = +d3.select(label_nodeArray[curr_num_of_ticks-1]).text().replaceAll(",","")
                var tick_val_dist = max_tick_value - +d3.select(label_nodeArray[curr_num_of_ticks-2]).text().replaceAll(",","")

                let period = detectPeriodicity(opacities);

                if((yAxValue - tick_val_dist) > max_tick_value) {
                    var num_of_missin_ticks = Math.floor((+yAxValue - max_tick_value) / tick_val_dist);
                    for (let i = 0; i < num_of_missin_ticks; i++) {
                        
                        var new_tick_val = max_tick_value + (i+1)*tick_val_dist
                        var new_tick_pos = newYScale(new_tick_val)
                        let new_opacity =  opacities[(curr_num_of_ticks+i) % period];

                        //clone attributes of existing labels and lines
                        // TODO where are the "-7" from?
                        YaxisSelection.select('.mark-text.role-axis-label text').clone().call(function(sel) {
                            sel.attr("transform", 'translate(-7,' + (new_tick_pos + 3) + ')')
                                .text(new_tick_val.toLocaleString('en-US'))
                                .attr("opacity", new_opacity)
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
        
                }
    

            
            // update bars

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
                        let newPath = `M${topLeftX},${new_height}h${width}v${SVGheight - new_height}h-${width}Z`;
                        
                        const barPromise = new Promise((resolve) => {
                            bar
                                .transition("move-y")
                                .duration(200)
                                .ease(d3.easeLinear)
                                    .attr("d", newPath)
                                .on("end", () => resolve());
                        });
                        
                        promises.push(barPromise);
                        
                    }
                });

        
                
            // Update bar labels
            d3.select("svg").selectAll(".infl-label")
                .transition("move-y")
                .duration(200)
                .ease(d3.easeLinear)
                    .attr("y", (d) => newYScale(d.value))
            


            //annotations
            d3.select("svg").selectAll(".infl-ann-text")
                .transition("move-y")
                .duration(200)
                .ease(d3.easeLinear)
                .attr("y", (d) => newYScale(+d.yData[0]))

            //lines
            d3.select("svg").selectAll(".single-line")
                .transition("move-x")
                .duration(200)
                .ease(d3.easeLinear)
                .attr("y1", (d) => newYScale(+d.y1Data[0]))
                .attr("y2", (d) => newYScale(+d.y2Data[0]))



            d3.select("svg").selectAll(".infl-handle")
                .each(function() {
                    let line = d3.select(this.parentNode).select(".single-line");
                    // Determine if the handle is "left" or "right"
                    let isLeft = this.classList.contains("left");
                    if(isLeft) {
                        d3.select(this)
                            .attr("cy", newYScale(+line.data()[0].y1Data[0]))
                    } else {
                        d3.select(this)
                            .attr("cy", newYScale(+line.data()[0].y2Data[0]))
                    }
                })

            // console.log(promises)
        }


    }

    this.xAx = function () {
        if (this.xAxEditable) {
            promises = [];
        
            var that = this;
            var xAxValue = that.inflection.xax

            var newXScale = d3.scaleLinear()
                .domain([0, xAxValue])
                .range([0, SVGwidth]);

            var XaxisSelection = d3.selectAll("g.mark-group.role-axis").filter(function() {
                    return String(d3.select(this).attr("aria-label")).includes("X-axis")
                })

            var opacities = []

            // Update tick labels and lines and grid
                var line_nodeArray = XaxisSelection.selectAll('.mark-rule.role-axis-tick line').nodes()
                var grid_nodeArray = d3.selectAll('.mark-rule.role-axis-grid line').nodes()
                XaxisSelection.selectAll('.mark-text.role-axis-label text') // Select all tick labels
                .each( function(d, i) {
                    
                    var tick_line = d3.select(line_nodeArray[i])
                    var grid_line = d3.select(grid_nodeArray[i])

                    var tick_value = +d3.select(this).text().replaceAll(",","")
                    
                    let opacity = d3.select(this).attr('opacity');
                    opacity = opacity === '' || opacity === 'auto' ? 1 : parseFloat(opacity);
                    opacities.push(opacity);
                    
                    // Use newYScale to calculate the new position
                    var newXPosition = newXScale(tick_value);

                    if (newXPosition > SVGwidth) {
                        d3.select(this)
                        .remove()

                        tick_line.remove()
                        grid_line.remove()
                    } else {
                        // Update the transform attribute with the new Y position
                        // TODO where are the -7 from?
                        d3.select(this) //label
                            .transition()
                            .duration(200)
                            .ease(d3.easeLinear)
                            .attr('transform', 'translate(' + (newXPosition + 3) + ',15)')

                        tick_line
                            .transition()
                            .duration(200)
                            .ease(d3.easeLinear)
                            .attr('transform', 'translate(' + newXPosition + ', 0)')

                        grid_line
                            .transition()
                            .duration(200)
                            .ease(d3.easeLinear)
                            .attr('transform', 'translate(' + newXPosition + ', 0)')
                            
                    
                    }
                });
                

                // add ticks and labels that are now missing
                var label_nodeArray = XaxisSelection.selectAll('.mark-text.role-axis-label text').nodes()
                var curr_num_of_ticks  = label_nodeArray.length
                var max_tick_value = +d3.select(label_nodeArray[curr_num_of_ticks-1]).text().replaceAll(",","")
                var tick_val_dist = max_tick_value - +d3.select(label_nodeArray[curr_num_of_ticks-2]).text().replaceAll(",","")

                let period = detectPeriodicity(opacities);
                

                if((xAxValue - tick_val_dist) > max_tick_value) {
                    var num_of_missin_ticks = Math.floor((+xAxValue - max_tick_value) / tick_val_dist);
                    for (let i = 0; i < num_of_missin_ticks; i++) {
                        
                        var new_tick_val = max_tick_value + (i+1)*tick_val_dist
                        var new_tick_pos = newXScale(new_tick_val)
                        let new_opacity =  opacities[(curr_num_of_ticks+i) % period];

                        //clone attributes of existing labels and lines
                        // TODO where are the "-7" from?
                        XaxisSelection.select('.mark-text.role-axis-label text').clone().call(function(sel) {
                            sel.attr("transform", 'translate(' + (new_tick_pos + 3) + ',15)')
                                .text(new_tick_val.toLocaleString('en-US'))
                                .attr("text-anchor", "middle")
                                .attr("opacity", new_opacity)
                            sel.node().parentNode.appendChild(sel.node()); //append as last child
                        });

                        XaxisSelection.select('.mark-rule.role-axis-tick line').clone().call(function(sel) {
                            sel.attr("transform", 'translate(' + new_tick_pos + ',0)')
                            sel.node().parentNode.appendChild(sel.node()); //append as last child
                        });
                        

                        d3.select('.mark-rule.role-axis-grid line').clone().call(function(sel) {
                            sel.attr("transform", 'translate(' + new_tick_pos + ',0)')
                            sel.node().parentNode.appendChild(sel.node()); //append as last child
                        });
                    }  
        
                }
    

            
            // update bars

            d3.selectAll("path")
                .filter(function() {
                        return d3.select(this).attr("aria-roledescription") == "bar"
                })
                .each(function(){
                    var bar = d3.select(this)
                    var aria_label = bar.attr("aria-label") // e.g. "a: D; b: 91"

                    // filter y value
                    var xvalue = aria_label.match(/\b\w+:\s*(\d+)\b/)[1];  // "91" 

                    var path = bar.attr("d") // e.g. "M1,144h18v56h-18Z"

                    let regex = /M(\d+),(-?[0-9.]+)h([0-9.]+)v([0-9.]+)h-([0-9.]+)Z/;
                    let match = path.match(regex);
            
                    if (match) {
                        let startX = parseFloat(match[1]);         // Initial x
                        let startY = parseFloat(match[2]);       // Initial y
                        let old_width = parseFloat(match[3]);         // Horizontal length (width)
                        let height = parseFloat(match[4]);       // Vertical length (height)
            
                        let new_width = Math.max(newXScale(xvalue),0)

                        // Replace the original width with the new width
                        let newPath = `M${startX},${startY}h${new_width}v${height}h-${new_width}Z`;
                        
                        const barPromise = new Promise((resolve) => {
                            bar
                                .transition("move-x")
                                .duration(200)
                                .ease(d3.easeLinear)
                                    .attr("d", newPath)
                                .on("end", () => resolve());
                        });
                        
                        promises.push(barPromise);
                        
                    }
                });

        
                
            // Update bar labels
            d3.select("svg").selectAll(".infl-label")
                .transition("move-x")
                .duration(200)
                .ease(d3.easeLinear)
                    .attr("x", (d) => newXScale(d.value))
            


            //annotations
            d3.select("svg").selectAll(".infl-ann-text")
                .transition("move-x")
                .duration(200)
                .ease(d3.easeLinear)
                .attr("x", (d) => newXScale(+d.xData[0]))

            //lines
            d3.select("svg").selectAll(".single-line")
                .transition("move-x")
                .duration(200)
                .ease(d3.easeLinear)
                .attr("x1", (d) => newXScale(+d.x1Data[0]))
                .attr("x2", (d) => newXScale(+d.x2Data[0]))



            d3.select("svg").selectAll(".infl-handle")
                .each(function() {
                    let line = d3.select(this.parentNode).select(".single-line");
                    // Determine if the handle is "left" or "right"
                    let isLeft = this.classList.contains("left");
                    if(isLeft) {
                        d3.select(this)
                            .attr("cx", newXScale(+line.data()[0].x1Data[0]))
                    } else {
                        d3.select(this)
                            .attr("cx", newXScale(+line.data()[0].x2Data[0]))
                    }
                })

            // console.log(promises)
        }


    }

    this.col = function () {
     
        var that = this;
        var colour = that.inflection.col

        that.highlight();
        that.ann();
        that.line();

        //Change UI
        d3.select(".infl-col-input")
            .attr("value", colour)
        d3.selectAll(".button-bg").style("fill", colour)
        d3.select("#infl-text-input").style("border-color", colour)

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

    function determineMaxOfEditableAx(axis) {
        if(axis == "yax") {
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
            var max_tick_value = +d3.select(label_nodeArray[curr_num_of_ticks-1]).text().replaceAll(",", "")
            var max_tick_pos = tickPositions[curr_num_of_ticks-1]

            var currScale = d3.scaleLinear()
                            .domain([0, max_tick_value])
                            .range([SVGheight, max_tick_pos]);


            var yaxValue = currScale.invert(0)

            return Math.round(10 * yaxValue) / 10
        }

        else if(axis == "xax") {
            var axisSelection = d3.selectAll("g.mark-group.role-axis").filter(function() {
                return String(d3.select(this).attr("aria-label")).includes("X-axis")
            })

            // get length of y-axis 
            // get distance between ticks
            
            var tickPositions = axisSelection.select(".role-axis-tick").selectAll("line")
            .nodes()
            .map(tick => {
                const transform = d3.select(tick).attr("transform");
                var translateX = 0;
                if(transform != "") {
                    translateX = transform.match(/translate\(([^,]+),/)[1]; // Extract X value from translate(X,Y)
                }
                return +translateX;
            });

            var label_nodeArray = axisSelection.selectAll('.mark-text.role-axis-label text').nodes()
            var curr_num_of_ticks  = label_nodeArray.length
            var max_tick_value = +d3.select(label_nodeArray[curr_num_of_ticks-1]).text().replaceAll(",", "")
            var max_tick_pos = tickPositions[curr_num_of_ticks-1]

            var currScale = d3.scaleLinear()
                            .domain([0, max_tick_value])
                            .range([0, max_tick_pos]);


            var XaxValue = currScale.invert(SVGwidth)
            return Math.round(10 * XaxValue) / 10
        }
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

    function clampToWidth(x) {
        return Math.max( 0, Math.min(x, SVGwidth) )
    } 

    function clampToHeight(x) {
        return Math.max( 0, Math.min(x, SVGheight) )
    } 
    

    function invertCatScale(axis, position) {
        var scale = getCatAxsiScale(axis)
        var eachBand = scale.step();
        var index = Math.floor((position / eachBand));
        var val = scale.domain()[index];
        var extra = (position - scale(val)) / eachBand

        return [val, extra, eachBand]
        
    }

    function getCatAxsiScale(axis) {
        if(axis == "xax") {
            var axisSelection = d3.selectAll("g.mark-group.role-axis").filter(function() {
                return String(d3.select(this).attr("aria-label")).includes("X-axis")
            })

            var axis_labels = axisSelection.select(".mark-text.role-axis-label").selectAll("text")
                .nodes()
                .map(d => d.textContent)
            
            var x = d3.scaleBand() // X axis
                .range([0, SVGwidth])
                .domain(axis_labels);
                // .padding(0.2);

            return x    

        }
        else if(axis == "yax") {
            var axisSelection = d3.selectAll("g.mark-group.role-axis").filter(function() {
                return String(d3.select(this).attr("aria-label")).includes("Y-axis")
            })

            var axis_labels = axisSelection.select(".mark-text.role-axis-label").selectAll("text")
                .nodes()
                .map(d => d.textContent)
            
            var y = d3.scaleBand() // X axis
                .range([0, SVGheight])
                .domain(axis_labels);
                // .padding(0.2);

            return y  
        }
        

    }

    function detectPeriodicity(op) { //for opacity of new labels of axis
        let n = op.length;
        for (let period = 1; period <= n; period++) {
            let isRepeating = true;
            for (let i = 0; i < n; i++) {
                if (op[i] !== op[i % period]) {
                    isRepeating = false;
                    break;
                }
            }
            if (isRepeating) {
                return period; // Found the repeating period
            }
        }
        return n; // No repeating pattern, assume full length
    }



    return this
}
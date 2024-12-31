
function Inflection() {
    // set base URL
    this.baseurl = "";
    this.hash = window.location.hash.substring(1);
    this.inflection = {
        line: [],
        ann: [],
        high: "",
        yax: [0, 0],
        xax: [0, 0],
        col: ""
    };

    this.chartPath = "";
    this.xAxQuant = false; //if axis is quantitative
    this.yAxQuant = false;

    this.default_infl_col = "#00F05E"
    this.basecol = ""; // colour of the bars
    this.baseyax = [0, 0];
    this.basexax = [0, 0];

    this.editable = true; // states if page in iframe or separate window with UI
    this.isScatter = false;
    var SVGheight = 0;
    var SVGwidth = 0;

    var promises = []; // Array to store promises for transitions
    var tooltip;

    //initialise
    this.init = function (chartPath, xAxQuant, yAxQuant, isScatter) {

        var that = this;
        this.baseurl = document.URL.split("#")[0];
        // that.col = that.hash.split("_")[0]
        

        // establish borders
        let first_transform = d3.select("svg").select("g").attr("transform");
        let second_transform = d3.select("svg").select("g").select("g").select("g").attr("transform");

        let border_y = +get_y_translate(first_transform) + +get_y_translate(second_transform) + 0.5;
        let border_x = +get_x_translate(first_transform) + +get_x_translate(second_transform) + 0.5;

        // append groups to insert lines and annotations
        d3.select("svg").append("g").attr("class", "line-group")
        .attr("transform", "translate(" + border_x + "," + border_y + ")")
        

        d3.select("svg").append("g").attr("class", "ann-group")
        .attr("transform", "translate(" + border_x + "," + border_y + ")")
        // .append("rect").style("border", "2px solid black") //for debugging
        // .style("width", "210px").style("height", "333px")
        // .style("fill", "red").style("opacity", "0.4")


        d3.select("svg").append("g").attr("class", "label-group")
        .attr("transform", "translate(" + border_x + "," + border_y + ")")

        // Establish plot area height and width
        SVGheight = +get_y_translate(d3.selectAll("g.mark-group.role-axis").filter(function() {
            return String(d3.select(this).attr("aria-label")).includes("Y-axis")
        }).select(".role-axis-domain").select("line").attr("transform")) // get length in y-direction of y-axis line
        // alternative method, if this is 0:
        if (SVGheight == 0) {
            SVGheight = +d3.selectAll("g.mark-group.role-axis").filter(function() {
                return String(d3.select(this).attr("aria-label")).includes("Y-axis")
            }).select(".role-axis-domain").select("line").attr("y2")
        }

        SVGwidth = +d3.selectAll("g.mark-group.role-axis").filter(function() {
            return String(d3.select(this).attr("aria-label")).includes("X-axis")
        }).select(".role-axis-domain").select("line").attr("x2")


        // Set Axis
        this.inflection.col = this.default_infl_col
        this.isScatter = isScatter;
        this.xAxQuant = xAxQuant;
        this.yAxQuant = yAxQuant;

        this.basexax = this.xAxQuant ? getValuesOfQuantAx("xax") : [0, 0];
        this.inflection.xax = this.basexax;

        this.baseyax = this.yAxQuant ? getValuesOfQuantAx("yax") : [0, 0];
        this.inflection.yax = this.baseyax;

        this.chartPath = chartPath;



        //try multiple options to set basecolour of element
        try {
            this.basecol = d3.select(".mark-rect").select("path").attr("fill")
        } catch {
            this.basecol = d3.select(".mark-symbol").select("path").attr("fill")

            if(typeof this.basecol == 'undefined' || this.basecol == "transparent") {
                this.basecol = d3.select(".mark-symbol").select("path").attr("stroke")
            }
        }
       


        if (window.top == window.self) {
            that.addUI();

        } else {
            // Not top level. An iframe, popup or something
            that.editable = false;
            d3.select("details").remove()
        }
        //add tooltip on top
        d3.select("body").append("div").attr("class", "infl-tooltip")
        tooltip = d3.select(".infl-tooltip")

        checkHash(that.hash)

        setInterval(function () {
            var newhash = window.location.hash.substring(1);

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
                let splitted = element.split("=")
                let cat = splitted[0]
                let value = decodeURIComponent(splitted[1])
                switch (cat) {
                    case "vis":
                        if (value != that.chartPath) {
                            location.reload() //reload page!
                        }
                        break;
                    case "yax":
                        if (value != that.inflection.yax.join(";") && that.yAxQuant) {
                            that.inflection.yax = value.split(";").map(Number);
                            that.axis("yax");
                        }
                        break; 
                    case "xax":
                        if (value != that.inflection.xax.join(";") && that.xAxQuant) {
                            that.inflection.xax = value.split(";").map(Number);
                            that.axis("xax");
                        }
                        break;
                    case "line":
                        if (value != that.inflection.line.join(",")) {
                            that.inflection.line = value.split(",");
                            that.line();
                        }
                        break;
                    case "ann":
                        if (value != that.inflection.ann.join(",")) {
                            that.inflection.ann = value.split(",");
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
                that.inflection.line = that.baseyax
                that.line();
            }
            if (((!cats_in_hash.includes("yax") && that.inflection.yax != that.baseyax) | that.inflection.yax == "") && that.yAxQuant) {
                that.inflection.yax = that.baseyax
                that.axis("yax");
            }

            if (((!cats_in_hash.includes("xax") && that.inflection.xax != that.basexax) | that.inflection.xax == "") && that.xAxQuant) {
                that.inflection.xax = that.basexax
                that.axis("xax");
            }

            if (!cats_in_hash.includes("ann") && that.inflection.ann != "") {
                that.inflection.ann = [];
                that.ann();
            }
            if (!cats_in_hash.includes("high") && that.inflection.high != "") {
                that.inflection.high = ""
                that.highlight();
            }

        }


        this.axis("yax");
        this.axis("xax");
        this.line();
        this.ann();
        this.highlight();
        this.col();

        this.updateEditable();

    }



    this.addUI = function () {

        var that = this;
        var icon_button_width = 27;
        // Top level window
        d3.select("body").append("div").attr("class", "inflect_ui");
        
        
        d3.select(".inflect_ui")
            .append("span").text("🔗")
            .style("font-size", "20px")
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

        // #region Lines button UI
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
                // var list = lines.split(",");
                                
                let random_x1_pixel = Math.random() * SVGwidth;
                let random_x2_pixel = Math.random() * SVGwidth;
                let random_y1_pixel = Math.random() * SVGheight;
                let random_y2_pixel = Math.random() * SVGheight;

                var [x1_data, x1_between] = that.invertXScale(random_x1_pixel)
                var [x2_data, x2_between] = that.invertXScale(random_x2_pixel)
                var [y1_data, y1_between] = that.invertYScale(random_y1_pixel)
                var [y2_data, y2_between] = that.invertYScale(random_y2_pixel)

                var array = [x1_data, x1_between, x2_data, x2_between, y1_data, y1_between, y2_data, y2_between]

                lines.push(array.join(";"))
                // lines.push(x1_data + ";" + x1_between + ";" +
                //         x2_data + ";" + x2_between + ";" +
                //         y1_data + ";" + y1_between + ";" +
                //         y2_data + ";" + y2_between)


                that.inflection.line = lines;
                that.line()
                that.updateHash()
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
        // #endregion

        // #region Annotations button UI
        d3.select(".inflect_ui").append("div")
            .attr("class", "infl-ui-div")
            .attr("id", "annotation-div");

        d3.select("#annotation-div").append("textarea")
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
            // .style("font-family", "sans-serif")
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
                
                let text = d3.select("#infl-text-input").property("value")
                if (text == "") {
                    text = d3.select("#infl-text-input").attr("placeholder")
                }

                //position in middle
                var mid_x_pixel = SVGwidth/2;
                var [mid_x_data, xbetween] = that.invertXScale(mid_x_pixel)

                var mid_y_pixel = SVGheight/2;
                var [mid_y_data, ybetween] = that.invertYScale(mid_y_pixel)
                var array = [mid_x_data, xbetween, mid_y_data, ybetween, text]
            
                anns.push(array.join(";"))
          
                that.inflection.ann = anns;
                that.ann()
                that.updateHash()
                that.updateEditable()

            });
        // #endregion

        // #region Colour button UI
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
                that.updateHash()
            })
        // #endregion


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

            // #region lines
            // the lines
            d3.selectAll(".single-line")
                .style("cursor", "move")
                .on("dblclick", function () {
                    var lines = that.inflection.line

                    var line = d3.select(this);
                    var linedata = line.data()[0];

                    var index_in_lines = lines.indexOf(linedata.hash)

                    that.inflection.line.splice(index_in_lines, 1);
                    
                    d3.select(this.parentNode)
                        .remove();

                    that.updateHash()
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

                            
                            var line = d3.select(this);
                            var lines = that.inflection.line

                            var linedata = line.data()[0]
                            var index_in_lines = lines.indexOf(linedata.hash)

                            var curr_x1_pos = line.attr("x1")
                            var curr_x2_pos = line.attr("x2")
                            var curr_y1_pos = line.attr("y1")
                            var curr_y2_pos = line.attr("y2")

                            // update pixel position
                            linedata.x1 = curr_x1_pos;
                            linedata.x2 = curr_x2_pos;
                            linedata.y1 = curr_y1_pos;
                            linedata.y2 = curr_y2_pos;

                            // update data position
                            linedata.x1Data = that.invertXScale(curr_x1_pos)
                            linedata.y1Data = that.invertYScale(curr_y1_pos)
                            linedata.x2Data = that.invertXScale(curr_x2_pos)
                            linedata.y2Data = that.invertYScale(curr_y2_pos)

                            // update hash
                            var array = [linedata.x1Data, linedata.x2Data, linedata.y1Data, linedata.y2Data].flat()
                            linedata.hash = array.join(";")
            
                            that.inflection.line[index_in_lines] = linedata.hash

                            that.updateHash()
                        }

                    })
                    .on("end", function () {
                        var line = d3.select(this);
                        var lines = that.inflection.line

                        var linedata = line.data()[0]
                        var index_in_lines = lines.indexOf(linedata.hash)

                        var curr_x1_pos = line.attr("x1")
                        var curr_x2_pos = line.attr("x2")
                        var curr_y1_pos = line.attr("y1")
                        var curr_y2_pos = line.attr("y2")

                        // update pixel position
                        linedata.x1 = curr_x1_pos;
                        linedata.x2 = curr_x2_pos;
                        linedata.y1 = curr_y1_pos;
                        linedata.y2 = curr_y2_pos;

                        // update data position
                        linedata.x1Data = that.invertXScale(curr_x1_pos)
                        linedata.y1Data = that.invertYScale(curr_y1_pos)
                        linedata.x2Data = that.invertXScale(curr_x2_pos)
                        linedata.y2Data = that.invertYScale(curr_y2_pos)

                        // update hash
                        var array = [linedata.x1Data, linedata.x2Data, linedata.y1Data, linedata.y2Data].flat()
                        linedata.hash = array.join(";")
        
                        that.inflection.line[index_in_lines] = linedata.hash

                        that.updateHash()
                    })
                );

            //handles of lines
            d3.selectAll(".infl-handle")
            .on("dblclick", function () {
                var lines = that.inflection.line
                
                var line = d3.select(this.parentNode).select(".single-line");
                var linedata = line.data()[0];

                var index_in_lines = lines.indexOf(linedata.hash)
                that.inflection.line.splice(index_in_lines, 1);
                
                d3.select(this.parentNode)
                    .remove();
                
                that.updateHash()

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
                    var lines = that.inflection.line

                    var linedata = line.data()[0]
                    var index_in_lines = lines.indexOf(linedata.hash)


                    var curr_x1_pos = line.attr("x1")
                    var curr_x2_pos = line.attr("x2")
                    var curr_y1_pos = line.attr("y1")
                    var curr_y2_pos = line.attr("y2")

                    // update pixel position
                    linedata.x1 = curr_x1_pos;
                    linedata.x2 = curr_x2_pos;
                    linedata.y1 = curr_y1_pos;
                    linedata.x2 = curr_y2_pos;

                    // update data position
                    linedata.x1Data = that.invertXScale(curr_x1_pos)
                    linedata.x2Data = that.invertXScale(curr_x2_pos)
                    linedata.y1Data = that.invertYScale(curr_y1_pos)
                    linedata.y2Data = that.invertYScale(curr_y2_pos)

                    // update hash
                    var array = [linedata.x1Data, linedata.x2Data, linedata.y1Data, linedata.y2Data].flat()
                    linedata.hash = array.join(";")
    
                    that.inflection.line[index_in_lines] = linedata.hash

                    that.updateHash()
                })
            )
            // #endregion

            // #region change highlight
            d3.selectAll("path")
                .filter(function() {
                    let role_descr = d3.select(this).attr("aria-roledescription");
                    return (role_descr == "bar") || (role_descr == "point") || (role_descr == "circle")
                    })
                .style("cursor", "pointer")
                .on("mouseover", function () {
                    var label = d3.select(this).attr("aria-label")
                    tooltip.style("visibility", "visible")
                        .text(label);
                })
                .on("mousemove", function (event) {
                    tooltip.style("top", (event.pageY - 35) + "px")
                        .style("left", (event.pageX - 20) + "px");
                })
                .on("mouseout", function () {
                    tooltip.style("visibility", "hidden");
                })
                .on("mousedown", function () {
                    var path = d3.select(this)
                    // get x value of bar to store it
                    let aria_label = path.attr("aria-label")
                    let xvalue = get_x_of_aria_label(aria_label);
                    let yvalue = get_y_of_aria_label(aria_label);
                    var highlight = xvalue + ";" + yvalue

                    let current_col = path.attr("fill");
                    if (!current_col || current_col == "transparent" || current_col == 'undefined' ) {
                        current_col = path.attr("stroke")
                    }
                    if (current_col[0] != "#") {
                        current_col = rgbToHex(current_col) //reformat to enable comparison
                    }
                    if (current_col.toUpperCase() == that.inflection.col.toUpperCase()) { //was already highlighted
                        document.getElementById('infl-text-input').value = "";
                        that.inflection.high = ""; //reset to old colour
                        
                    } else {
                        that.inflection.high = highlight
                        document.getElementById('infl-text-input').value = aria_label.replace("; ", "\n");
                    }

                    that.highlight()
                    that.updateHash()
                    // that.highlight()
                })
            // #endregion

            // #region annotation text

            d3.selectAll(".infl-ann-text")
                .style("cursor", "move")
                .on("dblclick", function () {

                    var anns = that.inflection.ann

                    var ann = d3.select(this);
                    var anndata = ann.data()[0];

                    var index_in_anns = anns.indexOf(anndata.hash)

                    that.inflection.ann.splice(index_in_anns, 1);
                    
                    d3.select(this)
                        .remove();

                    that.updateHash()


                    
                })
                .call(d3.drag()
                    .on("start", function () {
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
                        var anns = that.inflection.ann

                        var text_object = d3.select(this);
                        var curr_x_pos = text_object.attr("x")
                        var curr_y_pos = text_object.attr("y")
                        
                        var textdata = text_object.data()[0]
                        var text = textdata.text;
                        var index_in_anns = anns.indexOf(textdata.hash)

                        // update data position
                        textdata.xData = that.invertXScale(curr_x_pos)
                        textdata.yData = that.invertYScale(curr_y_pos)

                        // update pixel position
                        textdata.x = curr_x_pos;
                        textdata.y = curr_y_pos;
                        
                        // update hash
                        var array = [textdata.xData, textdata.yData, text].flat()
                        textdata.hash = array.join(";")
                        
                        that.inflection.ann[index_in_anns] = textdata.hash
                        
                        that.updateHash()

                    }))

            
            // #endregion 

            // #region scale y-Axis
            if(that.yAxQuant && !that.isScatter) {
                var yaxis_placement = d3.selectAll("g.mark-group.role-axis").filter(function() {
                    return String(d3.select(this).attr("aria-label")).includes("Y-axis")
                    }).select("g").node().getBoundingClientRect()

                d3.select("svg").selectAll(".infl-drag-area.yaxis")
                    .data([""])
                    .enter()
                    .insert("rect", ".line-group")
                    .attr("class", "infl-drag-area yaxis")
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
                d3.select(".infl-drag-area.yaxis")
                    .on("dblclick", function(){
                        that.inflection.yax = that.baseyax;
                        that.axis("yax")
                        that.updateHash()
                    })
                    .call(d3.drag()
                        .on("start", function () {
                            yScaleReconstructed = that.getLinAxisScale("yax")
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
                            
                            that.inflection.yax = [0, Math.round(10*newMaxY)/10]
                            that.axis("yax")
                        })
                        .on("end", function () {
                            that.updateHash()
                        })
                    );
            }
            // #endregion

            // #region scale x-Axis
            if(that.xAxQuant && !that.isScatter) {
                var xaxis_placement = d3.selectAll("g.mark-group.role-axis").filter(function() {
                    return String(d3.select(this).attr("aria-label")).includes("X-axis")
                    }).select("g").node().getBoundingClientRect()
    
                d3.select("svg").selectAll(".infl-drag-area.xaxis")
                    .data([""])
                    .enter()
                    .insert("rect", ".line-group")
                    .attr("class", "infl-drag-area xaxis")
                    .attr("width", xaxis_placement.width)
                    .attr("height", xaxis_placement.height)
                    .attr("x", xaxis_placement.x)
                    .attr("y", xaxis_placement.y)
                    .style("fill", "none")
                    .style("pointer-events", "all")
                            .style("cursor", "ew-resize")

                            
                // define drag of axis
                var xScaleReconstructed = d3.scaleLinear()
    
    
                d3.select(".infl-drag-area.xaxis")
                    .on("dblclick", function(){
                        that.inflection.xax = that.basexax;
                        that.axis("xax")
                        that.updateHash()
                    })
                    .call(d3.drag()
                        .on("start", function () {
                            xScaleReconstructed = that.getLinAxisScale("xax")
                        })
                        .on("drag", function (event) {
                            // Calculate the change in the y-axis based on the drag
                            const dragAmount = event.dx;
    
                            // Adjust the domain of the y-scale
                            const currentDomain = xScaleReconstructed.domain();
                            const rangeExtent = xScaleReconstructed.range();
                            const domainExtent = currentDomain[1] - currentDomain[0]; // The current range of the X-axis domain
    
                            // Map the pixel drag amount to the data scale
                            const dataDragAmount = (dragAmount / (rangeExtent[0] - rangeExtent[1])) * domainExtent;
    
                            // Calculate the new maximum Y-axis value
                            const newMaxX = currentDomain[1] + dataDragAmount;  
                            // Update the domain of the scale
                            xScaleReconstructed.domain([0, newMaxX]);
                            
                            that.inflection.xax = [0, Math.round(10*newMaxX)/10]
                            that.axis("xax")
                        })
                        .on("end", function () {
                            that.updateHash()
                        })
                    );
            }
            // #endregion

            // #region move if scatterplot
            // y-axis drag
            var xScaleReconstructed = d3.scaleLinear()
            var yScaleReconstructed = d3.scaleLinear()
            if(that.xAxQuant && that.isScatter) {
                d3.select(".background")
                    .call(d3.drag()
                    .on("start", function () {
                        xScaleReconstructed = that.getLinAxisScale("xax")
                        yScaleReconstructed = that.getLinAxisScale("yax")
                    })
                    .on("drag", function (event) {
                        // Calculate the change in the y-axis based on the drag
                        const dragXAmount = event.dx;
                        const dragYAmount = event.dy;
    
                        // Adjust the domain of the y-scale
                        const currentXDomain = xScaleReconstructed.domain();
                        const currentYDomain = yScaleReconstructed.domain();

                        const rangeXExtent = xScaleReconstructed.range();
                        const rangeYExtent = yScaleReconstructed.range();

                        const domainXExtent = currentXDomain[1] - currentXDomain[0]; // The current range of the X-axis domain
                        const domainYExtent = currentYDomain[1] - currentYDomain[0]; // The current range of the Y-axis domain

                        // Map the pixel drag amount to the data scale
                        const dataXDragAmount = (dragXAmount / (rangeXExtent[0] - rangeXExtent[1])) * domainXExtent;
                        const dataYDragAmount = (dragYAmount / (rangeYExtent[0] - rangeYExtent[1])) * domainYExtent;

                        // domain span needs to remain the same
                        let old_x = currentXDomain[1] - currentXDomain[0]
                        let old_y = currentYDomain[1] - currentYDomain[0]

                        // Calculate the new maximum value and add lower domain extent
                        var newXDomain = [(currentXDomain[1] + dataXDragAmount - old_x), currentXDomain[1] + dataXDragAmount]; 
                        var newYDomain = [(currentYDomain[1] + dataYDragAmount - old_y), (currentYDomain[1] + dataYDragAmount)];  
                        
                        
                        // Update the domain of the scale
                        xScaleReconstructed.domain(newXDomain);
                        yScaleReconstructed.domain(newYDomain);
                        
                        that.inflection.xax = newXDomain.map(num => Math.round(num * 100) / 100);
                        that.inflection.yax = newYDomain.map(num => Math.round(num * 100) / 100);
                        that.axis("xax")
                        that.axis("yax")
                    })
                    .on("end", function () {
                        that.updateHash()
                    }))

                    d3.select(".background")
                        .on("dblclick", function(){
                            that.inflection.yax = that.baseyax;
                            that.inflection.xax = that.basexax;
                            that.axis("yax")
                            that.axis("xax")
                            that.updateHash()
                        })
                        

                    d3.select(".background").call(
                        d3.zoom()
                        .on("zoom", function(event) {
                            // Calculate the new y-axis domain
                            const wheelDelta = event.sourceEvent ? event.sourceEvent.wheelDelta : 0;
                            const zoomFactor = wheelDelta > 0 ? 0.9 : 1.1; // Adjust these values as needed

                            const yMid = (that.inflection.yax[0] + that.inflection.yax[1]) / 2;
                            const yRange = (that.inflection.yax[1] - that.inflection.yax[0]) / 2 * zoomFactor;
                            that.inflection.yax = [yMid - yRange, yMid + yRange].map(num => Math.round(num * 100) / 100);

                            // Calculate the new x-axis domain
                            const xMid = (that.inflection.xax[0] + that.inflection.xax[1]) / 2;
                            const xRange = (that.inflection.xax[1] - that.inflection.xax[0]) / 2  * zoomFactor;
                            that.inflection.xax = [xMid - xRange, xMid + xRange].map(num => Math.round(num * 100) / 100);


                            that.axis("yax")
                            that.axis("xax")
                            that.updateHash()
                          
                        })
                    )
                    .on("dblclick.zoom", null)

            }
            // #endregion

        }
        else { //not editable
            d3.selectAll(".infl-handle")
                .remove()

            //bar/highlight behaviour
            d3.selectAll("path")
                .filter(function() {
                    let role_descr = d3.select(this).attr("aria-roledescription");
                    return (role_descr == "bar") || (role_descr == "point") || (role_descr == "circle")
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

    this.updateHash = async function() {
        await Promise.all(promises);
        promises = [];
         
        this.hash =
            "vis=" + this.chartPath + "&" +
            "col=" + encodeURIComponent(this.inflection.col) + "&"

        if (this.yAxQuant) {
            this.hash += "yax=" + this.inflection.yax.join(";") + "&"
        }
        if (this.xAxQuant) {
            this.hash += "xax=" + this.inflection.xax.join(";") + "&"
        }
        this.hash +=
            "line=" + this.inflection.line.join(",") + "&" +
            "ann=" + encodeURIComponent(this.inflection.ann.join(",")) + "&" +
            "high=" + this.inflection.high;
        window.location.hash = "#" + this.hash
    }


    this.line = async function () {
        
        var that = this;
        let lines = that.inflection.line

        if (lines.length == 0) {
            d3.selectAll(".infl-line")
                .transition()
                .duration(200)
                .ease(d3.easeLinear)
                .remove()
        }
        else {
            await Promise.all(promises);
            promises = [];

            // var placelist = place.split(",");

            currXScale = that.getXAxScale()
            currYScale = that.getYAxScale()

            var xStepValue = (typeof currXScale.step === 'function') ? currXScale.step() : 0 //get step if categorical
            var yStepValue = (typeof currYScale.step === 'function') ? currYScale.step() : 0 //get step if categorical

            let data = [];
            lines.forEach(element => {
                let splitted = element.split(";")
                let x1_data_pos = splitted[0]
                let x1_between = +splitted[1]
                let x2_data_pos = splitted[2]
                let x2_between = +splitted[3]
                let y1_data_pos = splitted[4]
                let y1_between = +splitted[5]
                let y2_data_pos = splitted[6]
                let y2_between = +splitted[7]

                
                var x1value = Math.round(10*(currXScale(x1_data_pos) + xStepValue*x1_between))/10
                var x2value = Math.round(10*(currXScale(x2_data_pos) + xStepValue*x2_between))/10

                
                var y1value = Math.round(10*(currYScale(y1_data_pos) + yStepValue*y1_between))/10
                var y2value = Math.round(10*(currYScale(y2_data_pos) + yStepValue*y2_between))/10

                
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
                        hash: element,
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
                            .transition("move-line") // bei erstem Rendern?!
                            .duration(200)
                            .ease(d3.easeLinear)
                                .attr("stroke", that.inflection.col)
                                .attr("x1", d => d.x1)
                                .attr("x2", d => d.x2)
                                .attr("y1", d => d.y1)
                                .attr("y2", d => d.y2)

                    // add handles
                    // Get the start and end points of the line
                    var left_data = {
                        x1: +d.x1,
                        y1: +d.y1,
                        mark: {
                            marktype: "circle",
                            markgroup: "inflection"
                        }
                    }
    
                    var right_data = {
                        x2: +d.x2,
                        y2: +d.y2,
                        mark: {
                            marktype: "circle",
                            markgroup: "inflection"
                        }
                    }
    
                    // Append circle at the end of the line
                    g.selectAll(".infl-handle.line.left")
                        .data([left_data])
                        .join("circle")
                        .attr("cx", d => d.x1)
                        .attr("cy", d => d.y1)
                        .attr("r", 10)
                        .attr("class", "infl-handle line left")
    
    
                    // Append circle at the end of the line
                    g.selectAll(".infl-handle.line.right")
                        .data([right_data])
                        .join("circle")
                        .attr("cx", d => d.x2)
                        .attr("cy", d => d.y2)
                        .attr("r", 10)
                        .attr("class", "infl-handle line right")


                            
                });

                

        }
    }

    this.ann = async function () {
        // notation: x-y-text
        var that = this;

        let annlist = this.inflection.ann
        if (annlist.length == 0) {
            d3.selectAll(".infl-ann")
                .transition()
                .duration(200)
                .ease(d3.easeLinear)
                .remove()
        }
        else {
            await Promise.all(promises);
            promises = [];

            // var currXScale = d3.scaleLinear()
            //     .domain(that.inflection.xax)
            //     .range([0, SVGwidth]);

            // var currYScale = d3.scaleLinear()
            //     .domain(that.inflection.yax)
            //     .range([SVGheight, 0]);
            var currXScale = that.getXAxScale()
            var currYScale = that.getYAxScale()
            

            let data = [];
            annlist.forEach(element => {
                let splitted = element.split(";")
                let x_data_pos = splitted[0]
                let x_between = +splitted[1]
                let y_data_pos = splitted[2]
                let y_between = +splitted[3]
                let text = splitted[4]

                // calculate postition in pixel space
                var xStepValue = (typeof currXScale.step === 'function') ? currXScale.step() : 0 //get step if categorical
                var x_value = Math.round(10*(currXScale(x_data_pos) + xStepValue*x_between))/10
                var yStepValue = (typeof currYScale.step === 'function') ? currYScale.step() : 0 //get step if categorical
                var y_value = Math.round(10*(currYScale(y_data_pos) + yStepValue*y_between))/10

                data.push({
                    x: x_value,
                    y: y_value,
                    yData: [y_data_pos, y_between],
                    xData: [x_data_pos, x_between],
                    text: text,
                    hash: element,
                    mark: {
                        marktype: "text",
                        markgroup: "inflection"
                    }
                })

                // console.log(text.split("\n")) //TODO Umbruch in Texts

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


        }
    }

    this.highlight = async function () {
        // bar rects are defined as paths like this:
        // <path aria-label="a: A; b: 28" role="graphics-symbol" aria-roledescription="bar" d="M1,144h18v56h-18Z" fill="#4c78a8"></path>
        var that = this;
        let highlight = that.inflection.high
        //TODO save initial colour to data of element/marker

        if (highlight == "") {
            d3.selectAll("path")
                .filter(function() {
                    let role_descr = d3.select(this).attr("aria-roledescription");
                    return (role_descr == "bar") || (role_descr == "point") || (role_descr == "circle")
                    })
                .transition()
                .duration(200)
                .ease(d3.easeLinear)
                .attr("fill", function() {
                    let current_col = d3.select(this).attr("fill")
                    if(current_col && (typeof current_col !== 'undefined') && (current_col !== 'transparent')) {
                        return that.basecol
                    }
                })
                .attr("stroke", function() {
                    let current_col = d3.select(this).attr("stroke")
                    if(current_col && (typeof current_col !== 'undefined')  && (current_col !== 'transparent')) {
                        return that.basecol
                    }
                })

            
        }
        else {

            await Promise.all(promises);
            promises = [];

            var splitted = highlight.split(";")
            //transform to number if number, leave as string if not
            var x_of_high = splitted[0]
            var y_of_high = splitted[1]

            var path = d3.selectAll("path")
                .filter(function() {
                    let role_descr = d3.select(this).attr("aria-roledescription");
                    var ismarker = (role_descr == "bar") || (role_descr == "point") || (role_descr == "circle")

                    let aria_label = d3.select(this).attr("aria-label") // e.g. "a: D; b: 91"
                    if(aria_label) {
                        let xvalue = get_x_of_aria_label(aria_label);
                        let yvalue = get_y_of_aria_label(aria_label);

                        var isx = (xvalue == x_of_high);
                        var isy = (yvalue == y_of_high);
                        return  ismarker && isx && isy
                    } else {
                        return false;
                    }

                    })

            path
                .transition("trans-high")
                .duration(200)
                .ease(d3.easeLinear)
                // .attr("fill", that.inflection.col)
                .attr("fill", function() {
                    let current_col = d3.select(this).attr("fill")
                    if(current_col && (typeof current_col !== 'undefined') && (current_col !== 'transparent')) {
                        return that.inflection.col
                    }
                })
                .attr("stroke", function() {
                    let current_col = d3.select(this).attr("stroke")
                    if(current_col && (typeof current_col !== 'undefined')  && (current_col !== 'transparent')) {
                        return that.inflection.col
                    }
                })

            //raise to top
            let node = path.node();
            if (node) {
                node.parentNode.append(node);
            }
            
            // switch (that.chartPath) {
            //     case "barchart":
            //         var xscale = that.getXAxScale()
            //         var yscale = that.getYAxScale()

            //         //in the middle of the bar, if categorical
            //         var xStepValue = (typeof xscale.step === 'function') ? xscale.step() : 0 
            //         var yStepValue = (typeof yscale.step === 'function') ? yscale.step() : 0

            //         //add labels
            //         var label_data = [{
            //             x: Math.round(10*(xscale(x_of_high) + xStepValue*0.5))/10,
            //             y: Math.round(10*(yscale(y_of_high) + yStepValue*0.5))/10,
            //             value: [x_of_high, y_of_high],
            //             text: y_of_high,
            //             mark: {
            //                 marktype: "text",
            //                 markgroup: "inflection"
            //             }
            //         }]

            //         // label
            //         d3.select(".label-group")
            //             .selectAll("text.infl-label")
            //             .data(label_data)
            //             .join("text")
            //             .attr("class", "infl-label")
            //             d3.selectAll(".infl-label")
            //                 .attr("dy", "-1em")
            //                 // .attr("dy", ".35em")
            //                 .style("text-anchor", "middle")
            //                 .transition("trans-high")
            //                 .duration(200)
            //                 .ease(d3.easeLinear)
            //                     .text(d => d.text)
            //                     .attr("x", (d) => d.x)
            //                     .attr("y", (d) => d.y)
            //                     .style("fill", that.inflection.col)

                    
            //         break;
            //     case "columnchart":
            //         var xscale = that.getXAxScale()
            //         var yscale = that.getYAxScale()

            //         //in the middle of the bar, if categorical
            //         var xStepValue = (typeof xscale.step === 'function') ? xscale.step() : 0 
            //         var yStepValue = (typeof yscale.step === 'function') ? yscale.step() : 0

            //         //add labels
            //         var label_data = [{
            //             x: Math.round(10*(xscale(x_of_high) + xStepValue*0.5))/10,
            //             y: Math.round(10*(yscale(y_of_high) + yStepValue*0.5))/10,
            //             value: [x_of_high, y_of_high],
            //             text: x_of_high,
            //             mark: {
            //                 marktype: "text",
            //                 markgroup: "inflection"
            //             }
            //         }]

            //         // label
            //         d3.select(".label-group")
            //             .selectAll("text.infl-label")
            //             .data(label_data)
            //             .join("text")
            //             .attr("class", "infl-label")
            //             d3.selectAll(".infl-label")
            //                 .attr("dx", "1em")
            //                 .attr("dy", ".35em")
            //                 .style("text-anchor", "start")
            //                 .transition("trans-high")
            //                 .duration(200)
            //                 .ease(d3.easeLinear)
            //                     .text(d => d.text)
            //                     .attr("x", (d) => d.x)
            //                     .attr("y", (d) => d.y)
            //                     .style("fill", that.inflection.col)

            //         break;

            //     case "scatterplot":
            //         // get x-and y-position
            //         var transform = path.attr("transform");
            //         var x_pos = get_x_translate(transform);
            //         var y_pos = get_y_translate(transform);


            //         //add labels
            //         var label_data = [{
            //             x: x_pos,
            //             y: y_pos,
            //             value: [x_of_high, y_of_high],
            //             text: x_of_high + ", " + y_of_high,
            //             mark: {
            //                 marktype: "text",
            //                 markgroup: "inflection"
            //             }
            //         }]

            //         // label
            //         d3.select(".label-group")
            //             .selectAll("text.infl-label")
            //             .data(label_data)
            //             .join("text")
            //             .attr("class", "infl-label")
            //             d3.selectAll(".infl-label")
            //                 .attr("dx", "1em")
            //                 .attr("dy", ".35em")
            //                 .style("text-anchor", "start")
            //                 .transition("trans-high")
            //                 .duration(200)
            //                 .ease(d3.easeLinear)
            //                     .text(d => d.text)
            //                     .attr("x", (d) => d.x)
            //                     .attr("y", (d) => d.y)
            //                     .style("fill", that.inflection.col)

            //         break;
            
            //     default:
            //         break;
            // }


                    
            
            // colour non-highlight mark back to normal
             d3.selectAll("path")
                .filter(function() {
                    // return d3.select(this).attr("aria-roledescription") == "bar" && !String(d3.select(this).attr("aria-label")).includes(highlight)
                    
                    let role_descr = d3.select(this).attr("aria-roledescription");
                    var ismarker = (role_descr == "bar") || (role_descr == "point") || (role_descr == "circle")

                    let aria_label = d3.select(this).attr("aria-label") // e.g. "a: D; b: 91"
                    if(aria_label) {
                        let xvalue = get_x_of_aria_label(aria_label); 
                        let yvalue = get_y_of_aria_label(aria_label); 
                        var isx = (xvalue == x_of_high)
                        var isy =(yvalue == y_of_high)
                        return  !(ismarker && isx && isy)
                    } else {
                        return false;
                    }
                
                })
                .transition()
                .duration(200)
                .ease(d3.easeLinear)
                .attr("fill", function() {
                    let current_col = d3.select(this).attr("fill")
                    if(current_col && (typeof current_col !== 'undefined') && (current_col !== 'transparent')) {
                        return that.basecol
                    }
                })
                .attr("stroke", function() {
                    let current_col = d3.select(this).attr("stroke")
                    if(current_col && (typeof current_col !== 'undefined')  && (current_col !== 'transparent')) {
                        return that.basecol
                    }
                })
                
            

        }
    }

    this.axis = function (axisType) {
        if (axisType === "yax" && this.yAxQuant || axisType === "xax" && this.xAxQuant) {
            promises = [];
    
            var that = this;
            var minValue = that.inflection[axisType][0];
            var maxValue = that.inflection[axisType][1];
    
            var newScale = d3.scaleLinear()
                .domain([minValue, maxValue])
                .range(axisType === "yax" ? [SVGheight, 0] : [0, SVGwidth]);
    
            var axisSelection = d3.selectAll("g.mark-group.role-axis").filter(function() {
                return String(d3.select(this).attr("aria-label")).includes(axisType === "yax" ? "Y-axis" : "X-axis");
            });
    
            var opacities = [];
            var tick_lines_nodeArray = axisSelection.selectAll('.mark-rule.role-axis-tick line').nodes();
            var grid_lines_nodeArray = d3.selectAll('.mark-rule.role-axis-grid line').filter(function() {
                return axisType === "yax" ? +d3.select(this).attr("y2") == 0 : +d3.select(this).attr("x2") == 0;
            }).nodes();
    
            var grid_transf = axisType === "yax" ? get_x_translate(d3.select(grid_lines_nodeArray[1]).attr("transform")) : get_y_translate(d3.select(grid_lines_nodeArray[1]).attr("transform"));
            var label_transf = axisType === "yax" ? get_x_translate(axisSelection.select('.mark-text.role-axis-label text').attr("transform")) : get_y_translate(axisSelection.select('.mark-text.role-axis-label text').attr("transform"));
    
            axisSelection.selectAll('.mark-text.role-axis-label text').each(function(d, i) {
                var tick_line = d3.select(tick_lines_nodeArray[i]);
                var grid_line = d3.select(grid_lines_nodeArray[i]);
    
                var tick_value = +d3.select(this).text().replaceAll(",", "");
    
                var newPosition = newScale(tick_value);
    
                let opacity = d3.select(this).attr('opacity');
                opacity = opacity === '' || opacity === 'auto' ? 1 : parseFloat(opacity);
                opacities.push(opacity);
    
                if (newPosition > (axisType === "yax" ? SVGheight : SVGwidth) || newPosition < 0) {
                    d3.select(this).style("visibility", "hidden");
                    tick_line.style("visibility", "hidden");
                    grid_line.style("visibility", "hidden");
                } else {
                    d3.select(this).style("visibility", "visible")
                        .transition()
                        .duration(200)
                        .ease(d3.easeLinear)
                        .attr('transform', 'translate(' + (axisType === "yax" ? label_transf + ',' + (newPosition + 3) : (newPosition + 3) + ', ' + label_transf) + ')');
    
                    tick_line.style("visibility", "visible")
                        .transition()
                        .duration(200)
                        .ease(d3.easeLinear)
                        .attr('transform', 'translate(' + (axisType === "yax" ? '0,' + newPosition : newPosition + ',0') + ')');
    
                    grid_line.style("visibility", "visible")
                        .transition()
                        .duration(200)
                        .ease(d3.easeLinear)
                        .attr('transform', 'translate(' + (axisType === "yax" ? grid_transf + ',' + newPosition : newPosition + ',' + grid_transf) + ')');
                }
            });
    
            // Add missing ticks and labels
            var label_nodeArray = axisSelection.selectAll('.mark-text.role-axis-label text').nodes();
            var curr_num_of_ticks = label_nodeArray.length;
            var max_tick_value = +d3.select(label_nodeArray[curr_num_of_ticks - 1]).text().replaceAll(",", "");
            var min_tick_value = +d3.select(label_nodeArray[0]).text().replaceAll(",", "");
            var tick_val_dist = max_tick_value - +d3.select(label_nodeArray[curr_num_of_ticks - 2]).text().replaceAll(",", "");
    
            let period = detectPeriodicity(opacities);
            if ((maxValue - tick_val_dist) > max_tick_value || (minValue + tick_val_dist) < min_tick_value) {
                var num_of_missin_max_ticks = Math.floor((+maxValue - max_tick_value) / tick_val_dist);
    
                for (let i = 0; i < num_of_missin_max_ticks; i++) {
                    var new_tick_val = max_tick_value + (i + 1) * tick_val_dist;
                    var new_tick_pos = newScale(new_tick_val);
                    let new_opacity = opacities[(curr_num_of_ticks + i) % period];
    
                    axisSelection.select('.mark-text.role-axis-label text').clone().call(function(sel) {
                        sel.attr("transform", 'translate(' + (axisType === "yax" ? label_transf + ',' + (new_tick_pos + 3) : (new_tick_pos + 3) + ',15') + ')')
                            .text(new_tick_val.toLocaleString('en-US'))
                            .attr("opacity", new_opacity);
                        sel.node().parentNode.appendChild(sel.node());
                    });
    
                    axisSelection.select('.mark-rule.role-axis-tick line').clone().call(function(sel) {
                        sel.attr("transform", 'translate(' + (axisType === "yax" ? '0,' + new_tick_pos : new_tick_pos + ',0') + ')');
                        sel.node().parentNode.appendChild(sel.node());
                    });
    
                    d3.select(grid_lines_nodeArray[0]).clone().call(function(sel) {
                        sel.attr("transform", 'translate(' + (axisType === "yax" ? grid_transf + ',' + new_tick_pos : new_tick_pos + ',' + grid_transf) + ')');
                        sel.node().parentNode.appendChild(sel.node());
                    });
                }
    
                var num_of_missin_min_ticks = Math.floor(Math.abs(+minValue + min_tick_value) / tick_val_dist);
    
                for (let i = 0; i < num_of_missin_min_ticks; i++) {
                    var new_tick_val = min_tick_value - (i + 1) * tick_val_dist;
                    var new_tick_pos = newScale(new_tick_val);
                    let new_opacity = opacities[(curr_num_of_ticks + i) % period];
    
                    axisSelection.select('.mark-text.role-axis-label text').clone().call(function(sel) {
                        sel.attr("transform", 'translate(' + (axisType === "yax" ? label_transf + ',' + (new_tick_pos + 3) : (new_tick_pos + 3) + ',15') + ')')
                            .text(new_tick_val.toLocaleString('en-US'))
                            .attr("opacity", new_opacity);
                        let parent = sel.node().parentNode;
                        parent.insertBefore(sel.node(), parent.firstChild);
                    });
    
                    axisSelection.select('.mark-rule.role-axis-tick line').clone().call(function(sel) {
                        sel.attr("transform", 'translate(' + (axisType === "yax" ? '0,' + new_tick_pos : new_tick_pos + ',0') + ')');
                        let parent = sel.node().parentNode;
                        parent.insertBefore(sel.node(), parent.firstChild);
                    });
    
                    d3.select(grid_lines_nodeArray[0]).clone().call(function(sel) {
                        sel.attr("transform", 'translate(' + (axisType === "yax" ? grid_transf + ',' + new_tick_pos : new_tick_pos + ',' + grid_transf) + ')');
                        let parent = sel.node().parentNode;
                        parent.insertBefore(sel.node(), parent.firstChild);
                    });
                }
            }
    
            // Update data markers (bars, points, etc.)
            d3.selectAll("path")
                .filter(function() {
                    let role_descr = d3.select(this).attr("aria-roledescription");
                    return (role_descr == "bar") || (role_descr == "point") || (role_descr == "circle");
                })
                .each(function() {
                    var marker = d3.select(this);
                    var aria_label = marker.attr("aria-label");
                    var value = axisType === "yax" ? get_y_of_aria_label(aria_label) : get_x_of_aria_label(aria_label);
    
                    let other_transl = axisType === "yax" ? get_x_translate(marker.attr("transform")) : get_y_translate(marker.attr("transform"));
    
                    if (other_transl != -1) {
                        let new_transl = newScale(value);
                        // const markerPromise = new Promise((resolve) => {
                            marker
                                .style("visibility", "visible")
                                // .transition("move-" + axisType[0])
                                // .duration(200)
                                // .ease(d3.easeLinear)
                                .attr("transform", 'translate(' + (axisType === "yax" ? other_transl + ',' + new_transl : new_transl + ',' + other_transl) + ')')
                                // .on("end", () => resolve());
                            // });
                            // promises.push(markerPromise);
                            const [x, y] = axisType === "yax" ? [other_transl, new_transl] : [new_transl, other_transl];
                            if (x > SVGwidth || y > SVGheight || x < 0 || y < 0) {
                                marker.style("visibility", "hidden");
                            }
                            //  else {
                            //     marker.style("visibility", "visible");
                            // }
                    } else {
                        var path = marker.attr("d");
                        let regex = axisType === "yax" ? /M(\d+),(-?[0-9.]+)h(\d+)v(\d+)/ : /M(\d+),(-?[0-9.]+)h([0-9.]+)v([0-9.]+)h-([0-9.]+)Z/;
                        let match = path.match(regex);
    
                        if (match) {
                            let start = parseFloat(match[axisType === "yax" ? 2 : 1]);
                            let length = parseFloat(match[axisType === "yax" ? 4 : 3]);
                            let new_length = Math.max(newScale(value), 0);
    
                            let newPath = axisType === "yax" ? `M${match[1]},${new_length}h${match[3]}v${SVGheight - new_length}h-${match[3]}Z` : `M${match[1]},${match[2]}h${new_length}v${match[4]}h-${new_length}Z`;
    
                            const markerPromise = new Promise((resolve) => {
                                marker.transition("move-" + axisType[0])
                                    .duration(200)
                                    .ease(d3.easeLinear)
                                    .attr("d", newPath)
                                    .on("end", () => resolve());
                            });
    
                            promises.push(markerPromise);
                        }
                    }
                });
    
            // Annotations
            // const markerPromise = new Promise((resolve) => {
            d3.select("svg").selectAll(".infl-ann-text")
                .transition("move-" + axisType[0])
                .duration(200)
                .ease(d3.easeLinear)
                .attr(axisType[0], (d) => newScale(+d[axisType[0] + "Data"][0]))
                // .on("end", () => resolve());
            // });
    
            // promises.push(markerPromise);
    
            // Lines
            d3.select("svg").selectAll(".single-line")
                // .transition("move-" + axisType[0])
                // .duration(200)
                // .ease(d3.easeLinear)
                .attr(axisType[0] + "1", (d) => newScale(+d[axisType[0] + "1Data"][0]))
                .attr(axisType[0] + "2", (d) => newScale(+d[axisType[0] + "2Data"][0]));
    
            d3.select("svg").selectAll(".infl-handle")
                .each(function() {
                    let line = d3.select(this.parentNode).select(".single-line");
                    let isLeft = this.classList.contains("left");
                    d3.select(this).attr(axisType[0] === "y" ? "cy" : "cx", newScale(+line.data()[0][axisType[0] + (isLeft ? "1" : "2") + "Data"][0]));
                });
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



    this.getScale = function (axis) {
        if(axis == "xax"){
            return this.getXAxScale()
        }
        else if(axis == "yax"){
            return this.getYAxScale()
        }
    }

    this.invertScale = function (axis, value) {
        if(axis == "xax"){
            return this.invertXScale(value)
        }
        else if(axis == "yax"){
            return this.invertYScale(value)
        }
    }

    this.getXAxScale = function() {

        if(this.xAxQuant) { //linear x axis
            return this.getLinAxisScale("xax")
        } else { // categorical x axis
            return getCatAxisScale("xax")
        }
    }

    this.getYAxScale = function() {
        if(this.yAxQuant) { //linear y axis
            return this.getLinAxisScale("yax")
        } else { // categorical y axis
            return getCatAxisScale("yax")
        }
    }

    this.invertYScale = function(value) {
        if(this.yAxQuant) { //linear x axis
            var scale = this.getYAxScale()
            var inverse = scale.invert(value)
            return [Math.round(10*inverse)/10, 0 ]
        } else { // categorical x axis
            return invertCatScale("yax", value)
        }
    }

    this.invertXScale = function(value) {
        if(this.xAxQuant) { //linear x axis
            var scale = this.getXAxScale()
            var inverse = scale.invert(value)
            return [Math.round(10*inverse)/10, 0 ]
        } else { // categorical x axis
            return invertCatScale("xax", value)
        }
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

    this.getLinAxisScale = function(axis) {
        var that = this;
        if(axis == "xax") {
            var scale = d3.scaleLinear()
                .domain(that.inflection.xax)
                .range([0, SVGwidth]);
        }

        if(axis == "yax") {
            var scale = d3.scaleLinear()
                .domain(that.inflection.yax)
                .range([SVGheight, 0]);
        }


        return scale;
    }

    function getValuesOfQuantAx(axis) {
        if(axis == "yax") {
            var axisSelection = d3.selectAll("g.mark-group.role-axis").filter(function() {
                return String(d3.select(this).attr("aria-label")).includes("Y-axis")
            })

            // get length of y-axis 
            // get distance between ticks
            
            var tickPositions = axisSelection.select(".role-axis-tick").selectAll("line")
            .filter(function() {return d3.select(this).style("visibility") === "visible"})
            .nodes()
            .map(tick => {
                const transform = d3.select(tick).attr("transform");
                var translateY = 0;
                if(transform != "") {
                    translateY = get_y_translate(transform) // Extract Y value from translate(0,Y)
                }
                return +translateY;
            });

            var label_nodeArray = axisSelection.selectAll('.mark-text.role-axis-label text')
                .filter(function() {return d3.select(this).style("visibility") === "visible"})
                .nodes()
            var curr_num_of_ticks  = label_nodeArray.length
            var max_tick_value = +d3.select(label_nodeArray[curr_num_of_ticks-1]).text().replaceAll(",", "")
            var min_tick_value = +d3.select(label_nodeArray[0]).text().replaceAll(",", "")
            
            var max_tick_pos = tickPositions[curr_num_of_ticks-1]
            var min_tick_pos = tickPositions[0]

            var currScale = d3.scaleLinear()
                            .domain([min_tick_value, max_tick_value])
                            .range([min_tick_pos, max_tick_pos]);


            var yAxValues = [Math.round(10 * currScale.invert(SVGheight)) / 10, Math.round(10 * currScale.invert(0)) / 10]

            return yAxValues
        }

        else if(axis == "xax") {
            var axisSelection = d3.selectAll("g.mark-group.role-axis").filter(function() {
                return String(d3.select(this).attr("aria-label")).includes("X-axis")
            })

            // get length of y-axis 
            // get distance between ticks
            
            var tickPositions = axisSelection.select(".role-axis-tick").selectAll("line")
                .filter(function() {return d3.select(this).style("visibility") === "visible"})
                .nodes()
                .map(tick => {
                    const transform = d3.select(tick).attr("transform");
                    var translateX = 0;
                    if(transform != "") {
                        translateX = get_x_translate(transform) // Extract X value from translate(X,Y)
                    }
                    return +translateX;
                });

            var label_nodeArray = axisSelection.selectAll('.mark-text.role-axis-label text')
                .filter(function() {return d3.select(this).style("visibility") === "visible"})
                .nodes()
            var curr_num_of_ticks  = label_nodeArray.length
            var max_tick_value = +d3.select(label_nodeArray[curr_num_of_ticks-1]).text().replaceAll(",", "")
            var min_tick_value = +d3.select(label_nodeArray[0]).text().replaceAll(",", "")
            var max_tick_pos = tickPositions[curr_num_of_ticks-1]
            var min_tick_pos = tickPositions[0]

            var currScale = d3.scaleLinear()
                            .domain([min_tick_value, max_tick_value])
                            .range([min_tick_pos, max_tick_pos]);

            var xAxValues = [Math.round(10 * currScale.invert(0)) / 10, Math.round(10 * currScale.invert(SVGwidth)) / 10]

            return xAxValues

        }
    }
    
    function getCatAxisScale(axis) {
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

    function invertCatScale(axis, position) {
            var scale = getCatAxisScale(axis)
            var step = scale.step();
            var index = Math.floor((position / step));
            var val = scale.domain()[index];
            var between = (position - scale(val)) / step
        return [val, Math.round(10*between)/10]
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

    function get_y_translate(transform) { // Extract Y value from translate(X,Y)
        var match = -1;
        if(transform) {
            var match = +transform.match(/translate\(.*?,([^\)]+)\)/)[1];
        }
        return match;
    }

    function get_x_translate(transform) { // Extract X value from translate(X,Y)
        var match = -1;
        if(transform) {
            var match = +transform.match(/translate\(([^,]+),/)[1];
        }
        return match;
    }

    function get_x_of_aria_label(aria_label) { // Extract X value from translate(X,Y)
        var match = -1;
        if(aria_label) {
            var match = aria_label.match(/\b\w+:\s*([\w.]+)/)[1];
        }
        return match;
    }

    function get_y_of_aria_label(aria_label) { // Extract X value from translate(X,Y)
        var match = -1;
        if(aria_label) {
            var match = aria_label.match(/(?:\b\w+:\s*[\w.]+;?\s*)\b\w+:\s*([\w.]+)/)[1];
        }
        return match;
    }




    return this
}
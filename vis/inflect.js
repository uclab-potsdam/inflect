
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

    }


    this.draw = function(fun) {
        window[fun]();
        // myfirstVis()
 
    }

    this.updateEditable = function(){
        console.log("something");
        // makeAnnotations.editMode(true)
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
            d3.selectAll(".line")
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

            d3.select("svg").selectAll(".line")
            .data(data)
            .join("line")
            .attr("x1", d => d.x1)
            .attr("x2", d => d.x2)
            .attr("class", "line")
            .attr("stroke-dasharray", "4 4")
            .transition()
                .duration(200)
                .ease(d3.easeLinear)
                .attr("stroke", "black")
                // .text(function(d) {console.log(d)})
                .attr("y1", d => d.y1)
                .attr("y2", d => d.y2);
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
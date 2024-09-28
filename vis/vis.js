
function Visualisation() {
    // set base URL
    this.baseurl = "";
    this.hash = window.location.hash.substring(1);
    this.inflection = {
        col:"C8532E",
        line:"0"
    };

    var margin = { top: 50, right: 20, bottom: 20, left: 60 };
    var width = 400 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;

    var y = d3.scaleLinear()
        .domain([0, 1.1 * 15])
        .range([height, 0]);



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
        
                          
        setInterval(function() {
            var newhash = window.location.hash.substring(1);
            console.log(newhash)

            if (that.hash!=newhash) {

                that.hash = newhash;

                // draw or zoom?
                var walk = false;
                var zoom = false;

                // var mode = parseInt(hashA[0]);
                var hashA = that.hash.split("&");
                var cats_in_hash = [];
                hashA.forEach(element => {
                    console.log(element)
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
                        default:
                            break;
                    }
                    cats_in_hash.push(cat)
                });
                i = 0;
                if (!cats_in_hash.includes("col") && that.inflection.col != "C8532E") {
                    that.inflection.col = "C8532E"
                    that.colour();
                }
                if (!cats_in_hash.includes("line") && that.inflection.line != "0") {
                    that.inflection.line = "0"
                    that.line();
                }
                // var col = hashA[0].split("=")[1];
                // var li = hashA[1].split("=")[1];

                // if (col!=that.inflection.col) {
                //     that.inflection.col = col;
                //     that.colour();
                // }

                // if (li!=that.inflection.line) {
                //     that.inflection.line = li;
                //     that.line();
                // }
                
                // if (typeof that.Nodes[ id ] === "undefined") id = -1;

                // if (filtered.length !== app.node_types.length) {
                //     filtered = "";
                //     for (var i = 0; i < app.node_types.length; i++) filtered = filtered + "0";					
                // }

                // if (filtered!=that.filtered) {
                //     that.filtered = filtered;
                //     that.filter();
                // }

                // if (id!=that.selected) that.walk(id);				

            }
        }
        , 500);

        this.setWindow()
        this.draw()

    }

    
    this.setWindow = function() {
		var that = this;

		// // sizing constants
		// var winside = Math.min($(window).width(), $(window).height());

		// this.fs = 5+Math.round(winside/75);
		// this.s = Math.round(winside/100);
		// this.r = Math.round(winside/5);

		// this.w = $(window).width();
		// this.h = $(window).height();
		// this.h_ = $(document).height();

		// // history
		// if (this.selected==-1) this.hash = "-1:"+this.filtered;
		// else this.hash = this.selected+":"+this.filtered;
        
        if (this.inflection.col== "") {
            this.inflection.col = "C8532E";
        }
		this.hash = "col=" + this.inflection.col+"&"+"line=" + this.inflection.line;
		
		window.location.hash = "#"+this.hash;

		// // window title
		// var name = "Monadic Exploration";
		// if (typeof this.Nodes[this.selected] !== "undefined") name = this.Nodes[this.selected].title;
		// document.title = name;

		// // overlays
		// $("#hint").css({width: this.r, height: this.fs*3, top: this.h/2-this.fs, left: this.w/2-this.r/2, 'font-size': this.fs*1.25});

		// // show hint if no node is selected, and in mode 1
		// if (this.selected==-1) $("#hint").addClass("active");		
		// else $("#hint").removeClass("active");

		// // legend
		// $("#info li").css({fontSize: this.fs*.9});
		// $("#info h1").css({fontSize: this.fs*1.1});
		// $("#info h1 span").css({fontSize: this.fs*.9});

		// var w = $("nav #modes").width();
		// $("#modes").css({left: Math.round(this.w/2 - w/2) });

		// if (this.selected==-1) $("#mn_article").unbind().addClass("inactive");
		// else $("#mn_article").removeClass("inactive");
	}


    this.draw = function() {

        let data_overview = [
            { "type": "left", "value": 15 },
            { "type": "right", "value": 10 },
        ];

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

        // X axis
        var x = d3.scaleBand()
        .range([0, width])
        .domain(["left", "right"])
        .padding(0.2);


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
        d3.select("#trg").selectAll(".dashed_line")
            .data([place])
            .join("line")
            .attr("stroke", "black")
            .attr("class", "dashed_line")
            // .text(function(d) {console.log(d)})
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", d => y(d))
            .attr("y2", d => y(d));
    }

    return this
}
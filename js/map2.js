function mapjsrun(){
	//console.log(d3);
	var dispathMap = d3.dispatch("load");
	var DataforMap = undefined;
	var MapPathData = undefined;
    var USDataforMap = undefined;
	d3.csv("data/election1.csv", function(error, data){
		if (error) throw error;
        USDataforMap = data[0];
		data = data.slice(1);	
		DataforMap = data;		
		dispathMap.load(data);
	});

	dispathMap.on("load.map", function(data){
		drawMap(data);
        DrawMapHoverCharts(USDataforMap);
	});

	function GetCodeMaptoName(pathdata){
		var statemap = {};
		for (var i = 0; i <pathdata.length; i++){
			var key = pathdata[i].id;
			statemap[key] = pathdata[i].n;
		}
		return statemap;
	};

	function drawMap(mapdata){
		var mapwidth = 560,
			mapheight = 360;
		var projection = d3.geoAlbersUsa()
        	.scale([700])
        	.translate([mapwidth / 2, mapheight/2.5 ]);
        var path = d3.geo.path()
			.projection(projection);

		var svgMap = d3.select("#usmap1").append("svg")
			.attr("width", mapwidth)
			.attr("height", mapheight)
			.attr("id", "mapsvg").append('g').attr("class",'states');
		MapPathData = uStates.getpath();
		StateNameDict = GetCodeMaptoName(MapPathData);
		//console.log(StateNameDict);
		d3.json("data/us-states.json", function(error,pathdata){
			if(error) throw error;
			svgMap.selectAll("path")
				.data(pathdata.features)
				.enter()
				.append("path")
				.attr("id", function(d){
                    //console.log(d.properties.name.split(' ').join('_'));
					return d.properties.name.split(' ').join('_')
				})
				.attr("d", path)
				.style("fill", function(d){
					return MapColorJude(mapdata, StateNameDict, d)
    			})
    			.style("stroke", "#fff")
    			.attr("opacity", 0.9)
    			.on("mouseover", function(d){
                    d3.select(this).style("fill", "#ffff00");
                    for(var i = 0; i <mapdata.length; i++){
                        statename = StateNameDict[mapdata[i].STATE];
                        if(statename == d.properties.name){
                            //console.log(mapdata[i]);
                            InitialHoverCharts();
                            DrawMapHoverCharts(mapdata[i])
                        }
                    };
                    var mouseposition = d3.mouse(this);
                    return mouseOvermap(mapdata, StateNameDict, d, mouseposition);
                })
    			.on("mouseout", function(d){
                    d3.select(this).transition().duration(500)
                    .style("fill", function(d){
                        return MapColorJude(mapdata, StateNameDict, d)
                    });

                    return mouseOutmap(mapdata, StateNameDict, d)
                });

                svgMap.selectAll("text")
                .data(pathdata.features)
                .enter()
                .append("text")
                .attr("x", function(d){
                    if(d.properties.name != "Puerto Rico"){
                        return path.centroid(d)[0];
                    };
                })
                .attr("y",function(d){
                    if(d.properties.name != "Puerto Rico"){
                        return path.centroid(d)[1];
                    }
                })
                .text(function(d){
                    for(var i = 0; i <mapdata.length; i++){
                        statename = StateNameDict[mapdata[i].STATE];
                        if(statename == d.properties.name){
                            return mapdata[i].STATE;
                        }
                    }
                })
                .style("fill", "black")
                .attr("text-anchor","middle")
                .attr('font-size','6pt');
		})
	};

	function maptoolTip(mapdata, StateNameDict, d){
        for(var i = 0; i <mapdata.length; i++){
        	statename = StateNameDict[mapdata[i].STATE];
            if(statename == d.properties.name){
                return "<h4>"+statename+"</h4><table>"+
                    "<tr><td>TRUMP</td><td>"+(mapdata[i].TRUMP)+"</td></tr>"+
                    "<tr><td>CLINTON</td><td>"+(mapdata[i].CLINTON)+"</td></tr>"+
                    "<tr><td>NON-COLLEGE-EDUCATED WHITE</td><td>"+(mapdata[i]["NON-COLLEGE-EDUCATED WHITE"])+"</td></tr>"+
                    "<tr><td>COLLEGE-EDUCATED WHITE</td><td>"+(mapdata[i]["COLLEGE-EDUCATED WHITE"])+"</td></tr>"+
                    "<tr><td>BLACK</td><td>"+(mapdata[i]["BLACK"])+"</td></tr>"+
                    "<tr><td>HISPANIC/LATINO</td><td>"+(mapdata[i]["HISPANIC/LATINO"])+"</td></tr>"+
                    "<tr><td>ASIAN/OTHER</td><td>"+(mapdata[i]["ASIAN/OTHER"])+"</td></tr>"+
                    "</table>"; 
            }
        }
    };

    function mouseOvermap(mapdata, StateNameDict, d, mouseposition){
        d3.select("#maptooltip").transition().duration(200).style("opacity", .9);              
        d3.select("#maptooltip").html(maptoolTip(mapdata, StateNameDict, d))  
          .style("left", (mouseposition[0] + 100) + "px")     
          .style("top", (mouseposition[1] - 100) + "px");

    };

    function mouseOutmap(mapdata, StateNameDict, d){
        d3.select("#maptooltip").transition().duration(500).style("opacity", 0);      
    };

    function MapColorJude(mapdata, StateNameDict, d){
        for(var i=0; i < mapdata.length; i++){
            statename = StateNameDict[mapdata[i].STATE];
            // console.log(statename);
            // console.log(d.properties.name);
            if (statename == d.properties.name){
                TrumpRate = StringtoPercentage(mapdata[i].TRUMP);
                ClintonRate = StringtoPercentage(mapdata[i].CLINTON);
                if (TrumpRate > ClintonRate){
                    return "#D72729"
                }else{
                    return "#1B6AA5"
                }
            }
        }
    };
    function StringtoPercentage(str){
        return parseFloat(str)/100;
    }


    function DrawMapHoverCharts(data){
        var GrouplistinArray = [];
        var CandidatelistinArray = []
        var grouplist = ["NON-COLLEGE-EDUCATED WHITE", "COLLEGE-EDUCATED WHITE", "BLACK", "HISPANIC/LATINO", "ASIAN/OTHER"];
        var candidatelist = ["TRUMP", "CLINTON", "OTHER"]
        var tempdata = {}
        for(var key in data){
            
            //console.log((key != "ELECTORAL VOTES")&&(key != "STATE"))
            if ((key != "ELECTORAL VOTES")&&(key != "STATE")){
                tempdata[key] = StringtoPercentage(data[key]).toFixed(3);
            }else if(key == "ELECTORAL VOTES"){
                tempdata[key] = parseInt(data[key])
            }else{
                tempdata[key] = data[key]
            }               
        }
        //console.log(tempdata)
        for(var i in grouplist){
            var itemdict ={};
            itemdict["category"] = grouplist[i];
            itemdict["num"] = (tempdata[grouplist[i]]*100).toFixed(1);
            itemdict["num2"] = 100;
            GrouplistinArray.push(itemdict)
        }
        for(var i in candidatelist){
            var itemdict ={};
            itemdict["category"] = candidatelist[i];
            if (candidatelist[i] == "OTHER"){    
                itemdict["value"] = (1 - tempdata["TRUMP"] - tempdata["CLINTON"]).toFixed(3)
            }else{
                itemdict["value"] = tempdata[candidatelist[i]]
                
            }
            CandidatelistinArray.push(itemdict)

        }
        //console.log(GrouplistinArray);
        //console.log(CandidatelistinArray);
        DrawBar(tempdata["ELECTORAL VOTES"], tempdata.STATE, GrouplistinArray);
        DrawPie(tempdata.STATE,CandidatelistinArray);
    }
    function DrawBar(votenum, state, data){
        var headline = state + " " + votenum + " VOTES";
        var margin = {top: 10, right: 50, bottom: 20, left: 227};
        var width = 800 - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;
        var barHeight = 20;      
        //Appends the svg to the chart-container div
        var svg = d3.select(".g-chart").append("svg").attr("id", "hoverbarsvg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var xScale = d3.scale.linear()
            .range([0,width]);

        var y0 = d3.scale.ordinal()
            .rangeBands([height, 0], 0)
            .domain(["NON-COLLEGE-EDUCATED WHITE", "COLLEGE-EDUCATED WHITE", "BLACK", "HISPANIC/LATINO", "ASIAN/OTHER"]);

        var yAxis = d3.svg.axis()
            .scale(y0)
            .orient("left");

        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .tickFormat(function(d) {return d + "%"; })
            .tickSize(height); 

        d3.select(".g-hed").text(headline);
          var maxX = 100;
          var minX = 0;
          xScale.domain([0, maxX ]);

        var yAxisGroup = svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        //Appends the x axis    
        var xAxisGroup = svg.append("g")
            .attr("class", "x axis")
            .call(xAxis); 

        //Binds the data to the bars      
        var categoryGroup = svg.selectAll(".g-category-group")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "g-category-group")
            .attr("transform", function(d) {
                //console.log(d)
              return "translate(0," + y0(d.category) + ")";
            });

        //Appends background bar   
        var bars2 = categoryGroup.append("rect")
            .attr("width", function(d) { return xScale(d.num2); })
            .attr("height", barHeight - 1 )
            .attr("class", "g-num2")
            .attr("transform", "translate(0,4)");   

        //Appends main bar   
        var bars = categoryGroup.append("rect")
            .attr("width", function(d) { return xScale(d.num); })
            .attr("height", barHeight - 1 )
            .attr("class", "g-num")
            .attr("transform", "translate(0,4)"); 

        //Binds data to labels
        var labelGroup = svg.selectAll("g-num")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "g-label-group")
            .attr("transform", function(d) {
              return "translate(0," + y0(d.category) + ")";
            });

        //Appends main bar labels   
        var barLabels = labelGroup.append("text") 
            .text(function(d) {return  d.num + "%";})
            .attr("x", function(d) { 
              if (minX > 32) {
                return xScale(d.num) - 37;}
              else {
                return xScale(d.num) + 6;}})
            .style("fill", function(d){
              if (minX > 32) {
                return "white";}
              else {
                return "#696969";}}) 
            .attr("y", y0.rangeBand()/1.6 )
            .attr("class", "g-labels");        
    }
    function DrawPie(state, data){
        var width = 200,
            height = 200;
        var radius = Math.min(width, height) / 2;
        var arc = d3.svg.arc()
            .outerRadius(radius)
            .innerRadius(0);

        var svgHoverpie = d3.select(".hoverpie").append("svg").attr("id", "hoverpiesvg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d){
                return d.value; 
            }); 

        var g = svgHoverpie.selectAll(".fan")
            .data(pie(data))
            .enter()
            .append("g")
            .attr("class", "fan");  

        g.append("path")
            .attr("d", arc)
            .attr("fill", function(d) {
                if(d.data.category == "TRUMP"){
                    return "#D72729"
                }else if(d.data.category == "CLINTON"){
                    return "#1B6AA5"
                }else{
                    return "#D3D3D3"
                }
            });
        g.append("text")
            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
            .style("text-anchor", "middle")
            .html(function(d) { return d.data.category + (d.data.value*100).toFixed(1)+ "%"; })
            .style("font-size","12px")
            .style("fill", "white");


    }
    function InitialHoverCharts(){
        d3.select("#hoverpiesvg").remove();
        d3.select("#hoverbarsvg").remove();
    }

}
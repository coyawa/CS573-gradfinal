function mapjsrun(){
	var dispathMap = d3.dispatch("load");
	var DataforMap = undefined;
	var MapPathData = undefined;
	d3.csv("data/election1.csv", function(error, data){
		if (error) throw error;
		data = data.slice(1)	
		DataforMap = data;		
		dispathMap.load(data);
	});

	dispathMap.on("load.map", function(data){
		drawMap(data);
	})
	function GetCodeMaptoName(pathdata){
		var statemap = {};
		for (var i = 0; i <pathdata.length; i++){
			var key = pathdata[i].id;
			statemap[key] = pathdata[i].n;
		}
		return statemap;
	}
	function drawMap(mapdata){
		var mapwidth = 960,
			mapheight = 600;
		var projection = d3.geoAlbersUsa()
	    	.scale([800])
	    	.translate([mapwidth / 2, mapheight/2.5 ]);
	    var path = d3.geo.path()
			.projection(projection);

		var svgMap = d3.select("#usmap1").append("svg")
			.attr("width", mapwidth)
			.attr("height", mapheight)
			.attr("id", "mapsvg");
		MapPathData = uStates.getpath();
		StateNameDict = GetCodeMaptoName(MapPathData);
		//console.log(StateNameDict);
		d3.json("data/us-states.json", function(error,pathdata){
			if(error) throw error;
			svgMap.append('g').attr("class",'states').selectAll("path")
				.data(pathdata.features)
				.enter()
				.append("path")
				.attr("id", function(d){
					return d.properties.name
				})
				.attr("d", path)
				.style("fill", function(d){
					for(var i=0; i < mapdata.length; i++){
						statename = StateNameDict[mapdata[i].STATE];
						// console.log(statename);
						// console.log(d.properties.name);
						if (statename == d.properties.name){
							TrumpRate = parseFloat(mapdata[i].TRUMP)/100;
							ClintonRate = parseFloat(mapdata[i].CLINTON)/100;
							if (TrumpRate > ClintonRate){
								return "#D72729"
							}else{
								return "1B6AA5"
							}
						}
					}
				})
				.style("stroke", "#d0d7db")
				.attr("opacity", 0.9)
				.on("mouseover", function(d){
	                var mouseposition = d3.mouse(this)
	                return mouseOvermap(mapdata, StateNameDict, d, mouseposition)
	            })
				.on("mouseout", function(d){return mouseOutmap(mapdata, StateNameDict, d)});
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
	}
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
	                "<tr><td>ELECTORAL VOTES</td><td>"+(mapdata[i]["ELECTORAL VOTES"])+"</td></tr>"+
	                "</table>"; 
	        }
	    }
	};
	function mouseOvermap(mapdata, StateNameDict, d, mouseposition){
	    d3.select("#maptooltip").transition().duration(200).style("opacity", .9);              
	    d3.select("#maptooltip").html(maptoolTip(mapdata, StateNameDict, d))  
	      .style("left", (mouseposition[0] + 100) + "px")     
	      .style("top", (mouseposition[1] - 28) + "px");

	};

	function mouseOutmap(mapdata, StateNameDict, d){
	    d3.select("#maptooltip").transition().duration(500).style("opacity", 0);      
	};
};
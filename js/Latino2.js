var margin = {top: 20, right: 20, bottom: 50, left: 50},
    width = 480 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

// setup x
var xValue = function(d) { return d.trump;},
    xScale = d3.scale.linear().range([0, width]),
    xMap = function(d) { return xScale(xValue(d));},
    xAxis = d3.svg.axis().scale(xScale).orient("bottom")
              .innerTickSize(-height)
              .outerTickSize(0);
// setup y
var yValue = function(d) { return d.share;},
    yScale = d3.scale.linear().range([height, 0]),
    yMap = function(d) { return yScale(yValue(d));},
    yAxis = d3.svg.axis().scale(yScale).orient("left")
              .innerTickSize(-width)
              .outerTickSize(0);

// setup fill color
var color = d3.scale
              .linear()
              .domain([0,100])
              .range(['Blue', 'Red']);

// add the graph canvas to the body of the webpage
var svg4 = d3.select("body").select(".state-chartLatino").select('.chart').append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip4 = d3.select("body").select(".state-chartLatino").select('.chart').append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

/*var tooltipPrompt4 = d3.select("body").select(".state-chartLatino").select('.chart').append("div")
    .attr("class", "tooltipPrompt")
    .style("opacity", 0);*/

var rect4 = svg4.append("rect").attr({
    width: width,
    height: height,
    fill: "#ffffff"
});

// Level 3, add prompt box.
/*tooltipPrompt4.html("<b>Drag the line to see how many states have less Trump vote than the line indicate.</b>")
     .style("left", width+300+"px")
     .style("top", height+951+"px")
     .style("opacity", 1);*/

// load data
d3.csv("data\\latino.csv", function(error, data) {

//Add Verticle line
var verticalLine4 = svg4.append('line')
// .attr('transform', 'translate(100, 50)')
.attr({
    'x1': 0,
    'y1': 0,
    'x2': 0,
    'y2': height
})
    .attr("stroke", "steelblue")
    .attr("stroke-width","1px")
    .attr('class', 'verticalLine4');
  // change string (from CSV) into number format
  data.forEach(function(d) {
    d.trump = +d.trump;
    d.share = +d.share;
//    console.log(d);
  });

  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([0, 100]);

  yScale.domain([0,100]);

  // x-axis
  svg4.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width/2)
      .attr("y", 40)
      .style("text-anchor", "end")
      .style("font-weight","bold")
      .style("font-size","16px")
      .text("Trump Vote");

  // y-axis
  svg4.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("font-weight","bold")
      .style("font-size","16px")
      .text("Share Of State Electorate");

  // draw dots
var dots =
    svg4.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
// Store vote rate
var c=0;
var vote = []
data.forEach(function(d){
  vote.push(d.trump);
})

var dotAttribute = dots
      .attr("r", 3.5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d,i) {return color(d.trump);})
      .on("mouseover", function(d) {
        var xPos = d3.mouse(this)[0];
        var trans = xPos-width/2;
        d3.select(".verticalLine4").attr("transform", function () {
            return "translate(" + xPos + ",0)";
        });
        if(d.trump!=d3.max(vote)&&d.trump!=d3.min(vote)){
          tooltip4.transition()
               .duration(200)
               .style("opacity", 1);
          tooltip4.html(d.State)
               .style("left", (d3.event.pageX - 150) + "px")
               .style("top", (d3.event.pageY - 14) + "px");}
      })
      .on("mouseout", function(d) {
        var xPos = d3.mouse(this)[0];
        var trans = xPos-width/2;
        d3.select(".verticalLine4").attr("transform", function () {
            return "translate(" + xPos + ",0)";
        });
          tooltip4.transition()
               .duration(500)
               .style("opacity", 0);
      });
var text = svg4.selectAll("text")
              .data(data)
              .enter()
              .append("text");
      //Add SVG Text Element Attributes
var textLabels = text
               .attr("x", function(d) { return xMap(d)+2; })
               .attr("y", function(d) { return yMap(d)-9; })
               .text( function (d) { if(d.trump==d3.max(vote) || d.trump==d3.min(vote)) return d.State; })
               .attr("font-family", "sans-serif")
               .attr("font-size", "10px")
               .attr("fill", "black");
vote = [];
// Add introduction
var instruction = d3.select(".state-chartLatino").select('.description').select('p');
instruction.html("Latino voters are about 11 percent of the eligible electorate in 2016, up 1 percentage point from four years ago. Romney received just average 15 percent of their votes in 2012, and Trump is in danger of faring even worse. ");

// Verticle line move with mouse
rect4.on('mousemove', function () {
    //tooltipPrompt4.remove();
    var xPos = d3.mouse(this)[0];
    var trans = xPos-width/2;
    d3.select(".verticalLine4").attr("transform", function () {
        return "translate(" + xPos + ",0)";
    });
    var less = 0;
    var pos = Math.round(xPos/width*100);
    data.forEach(function(d) {
      if(d.trump<pos) less += 1;
    });
    tooltip4.transition()
         .duration(200)
         .style("opacity", 1);
    var t = xScale(xPos);
    tooltip4.html(less + " states have Trump vote lower than " + pos+"%.")
    .style("left", (d3.event.pageX-300) + "px")
    .style("top", (d3.event.pageY-1000 ) + "px")
         .style("color","black")
         .style("font-weight", "bold");
});


});

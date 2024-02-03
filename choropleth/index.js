//Initialise the plot element
const plot = document.getElementById("plot");

//Request data form the server

async function getData(){
    //Load in topological data
    var requestURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
    var request = new Request(requestURL);

    var response = await fetch(request);
    const geoDataText = await response.text();
    const geoData = JSON.parse(geoDataText);

    //Load in the educational data
    var requestURL2 = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
    var request2 = new Request(requestURL2);

    var response2 = await fetch(request2);
    const edDataText = await response2.text();
    const edData = JSON.parse(edDataText);

    //Loop through the counties data and add the county name and education data as a property
    for(let i=0;i<edData.length;i++){
        let geoIdx = geoData.objects.counties.geometries.findIndex((element)=>element.id===edData[i].fips);
        geoData.objects.counties.geometries[geoIdx].properties = {
            area_name: edData[i].area_name,
            state: edData[i].state,
            education: edData[i].bachelorsOrHigher
        };
    }


    //Function to scale eduucation values between 0 and 1
    const minEd = d3.min(edData,(d)=>d.bachelorsOrHigher);
    const maxEd = d3.max(edData,(d)=>d.bachelorsOrHigher);
    
    const normaliseValue = function(edValue,max=maxEd,min=minEd){
        return 1/(max-min)*(edValue-min);
    }

    //Prepare the color scale depending on the education value
    var color = d3.scaleSequential(d3.interpolateYlGn);

    //Create the svg heigth, width and margins
    const height = 700;
    const width = 1000;
    const margin = 200;
    
    var svg = d3.select('svg')
        .attr("width",width+margin)
        .attr("height",height+margin);

    //Add title to the plot
    svg.append("text")
        .attr('class','title')
        .style("font-size",30)
        .attr('x',width/2+100)
        .attr('y',30)
        .attr('text-anchor','middle')
        .text("USA Education Level by Region")
    
    svg.append("text")
        .attr('class','subtitle')
        .style("font-size",25)
        .attr('x',width/2+100)
        .attr('y',55)
        .attr('text-anchor','middle')
        .text("Percentage of the county population with at least a Bachelor's degree")



    //convert topojson to geojson
    const geoData2 = topojson.feature(geoData,geoData.objects.counties);
    //Prepare projection and path
    var projection = d3.geoIdentity().fitSize([width+100,height+100],geoData2);
    var path = d3.geoPath(projection);

    //Attach the data to the svg 
    const choro = svg.selectAll("path")
        .data(geoData2.features)
        .enter()
        .append("path")
        .attr("d",path)

    //Add the state boundaries
    //convert topojson to geojson
    const geoDataState = topojson.feature(geoData,geoData.objects.states);
    //Prepare projection and path
    var projectionState = d3.geoIdentity().fitSize([width+100,height+100],geoDataState);
    var pathState = d3.geoPath(projectionState);

    svg.selectAll(".stateBoundaries")
        .data(geoDataState.features)
        .enter()
        .append("path")
        .attr("d",pathState)
        .attr("fill","none")
        .attr("stroke","black")



    //Fill colors based on education value
    choro.attr('fill',(d)=>color(normaliseValue(d.properties.education)))

    //Add color legend to the plot
    const legendWidth = 200;
    //create a vector of pixel coordinates
    var legendArr = [];
    let i = 1;
    while(i<=legendWidth){
        legendArr.push(i);
        i++;
    }

    //Plot the color bar
    svg.selectAll('.legendCol')
        .data(legendArr)
        .enter()
        .append('rect')
        .attr('x',(d,idx)=>750+(idx+1))
        .attr('y',800)
        .attr('height',20)
        .attr('width',1)
        .attr('fill',(d)=>color(normaliseValue(d,200,1)))

    //Add a border around the color bar
    svg.append('rect')
        .attr('x',751)
        .attr('y',800)
        .attr('height',20)
        .attr('width',legendWidth)
        .attr('fill','none')
        .attr('stroke','black')

    //Add ticks and labels to the legend
    const numTicks = 5;

    //Get the interval for legend width and education value
    var dx = (legendWidth-1)/(numTicks-1);
    var dy = (maxEd-minEd)/(numTicks-1);
    
    var legendTicksArr = [{width:1,education:Math.round(minEd)}];
    
    for(let i=1;i<numTicks;i++){
        legendTicksArr.push({width:1+i*dx,
            education:Math.round(minEd+i*dy)})
    }

    //Append the tick labels to the legend
    svg.selectAll('.legendLabels')
        .data(legendTicksArr)
        .enter()
        .append('text')
        .attr('text-anchor','middle')
        .attr('x',(d)=>750+d.width)
        .attr('y',850)
        .text((d)=>d.education+'%')

    //append legend line
    svg.append('line')
        .attr('x1',748)
        .attr('x2',952)
        .attr('y1',830)
        .attr('y2',830)    
        .attr('stroke','black');


    //Create tooltip
    var tooltip = d3.select("body").append("div")
    .attr("class","tooltip")
    .style("opacity",0)
    .style("z-index",100)

    choro.on("mouseover",function(d) { 
        tooltip.style("opacity",1)
        .html(d.properties.area_name + "<br/>" + 'State: ' + d.properties.state + '<br/>' + 'Education: ' + d.properties.education + "%")
        .style("left",(d3.event.pageX-25) + "px")
        .style("top",(d3.event.pageY-75) + "px");
}) 
.on("mouseout",function (d){
    tooltip.style("opacity",0);
})

}

getData();







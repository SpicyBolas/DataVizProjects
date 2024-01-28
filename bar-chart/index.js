//Initialise the plot element
const plot = document.getElementById("plot");

//Request data form the server

async function getData(){
    const requestURL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
    const request = new Request(requestURL);

    const response = await fetch(request);
    const gdpDataText = await response.text();
    const gdpData = JSON.parse(gdpDataText);

    //get the numerical data
    var gdp = gdpData.data.map((value,idx)=>value[1]);
    var dateStr = gdpData.data.map((value,idx)=>value[0]);
    
    var fmt1 = d3.timeParse("%Y-%m-%d"); //Create format for string dates
    var date = dateStr.map((x)=>fmt1(x));


    //Create combined dataset
    var plotData = [];
    for (let i=0;i<date.length;i++){
        plotData.push([date[i],gdp[i]])
    }

    const rectWidth = 2;
    const height = 700;
    const width = 700;
    const margin = 200;

    //Scales
    let dateExtent = d3.extent(date);
    let gdpExtent = d3.extent(gdp);

    let scaleX = d3.scaleTime()
        .domain(dateExtent)    
        .range([0,width]);
        
    let scaleY = d3.scaleLinear()
        .domain(gdpExtent)
        .range([height,0]);
        
    //Set properties of svg
    var svg = d3.select('svg')
        .attr("margin",margin)
        .attr("width",width+margin)
        .attr("height",height+margin);
    
    //Add Labels
    //Title
    svg.append("text")
        .attr("x",width/2+100)
        .attr("y",75)
        .attr("id","title")
        .attr("text-anchor","middle")
        .style("font-size",30)
        .text("United States GDP")

    //X-Label
    svg.append("text")
        .attr("x",width/2+100)
        .attr("y",height+140)
        .attr("id","x-label")
        .attr("text-anchor","middle")
        .style("font-size",20)
        .text("Year")

    //Y-Label
    svg.append("text")
        .attr("id","y-label")
        .attr("text-anchor","middle")
        .attr("transform","translate(30,"+(height/2+100)+")rotate(-90)")
        .style("font-size",20)
        .text("GDP ($)")
        
    
    //Creates a group element where we will render our plot with 100 margin
    var g = svg.append("g")
            .attr("id","plot")
            .attr("transform","translate(100,100)")    

    //Create bottom axis
   g.append("g")
        .attr("class","axis")
        .attr("transform","translate(0,"+height+")")
        .style("font-size","14px")
        .call(d3.axisBottom(scaleX))

    //Create left axis
    g.append("g")
        .attr("class","axis")
        .attr("transform","translate(0,0)")
        .style("font-size","14px")
        .call(d3.axisLeft(scaleY).tickFormat((d)=>"$"+d).ticks(10))

    //Create tooltip
    var tooltip = 
        d3.select("body").append("div")
        .attr("class","tooltip")
        .style("opacity",0)
        .style("z-index",100)
    
    
    //Create bars
    var rect = g.selectAll("rect")
        .data(plotData)
        .enter()
        .append("rect")
        .attr("class","bar")
        .style("fill","blue");

    //Plot Bars
    rect.on("mouseover",function (d){
        tooltip.style("opacity",1)
            .html("Date: " + d3.timeFormat("%Y-%m")(d[0]) + "<br/>" + "GDP: $" + (Math.round(d[1]*100)/100).toFixed(2))
            .style("left",(d3.event.pageX-25) + "px")
            .style("top",(d3.event.pageY-75) + "px");
        d3.select(d3.event.currentTarget).style("fill","yellow")
        }) //Change color when mouse over
        .on("mouseout",function (d){
            tooltip.style("opacity",0);
            d3.select(d3.event.currentTarget).style("fill","blue")
        })
        .attr("x",(d)=>scaleX(d[0]))
        .attr("y",(d)=>scaleY(d[1]))
        .attr('width',rectWidth)
        .attr("height",(d)=>height-scaleY(d[1]));

  
}

getData();







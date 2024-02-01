//Initialise the plot element
const plot = document.getElementById("plot");

//Request data form the server

async function getData(){
    const requestURL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
    const request = new Request(requestURL);

    const response = await fetch(request);
    const tempDataText = await response.text();
    const tempData = JSON.parse(tempDataText);


    const height = 700;
    const width = 1700;
    const margin = 200;
    
    //Create months vector
    monthsMap = {1:'January',2:'February',3:'March',4:'April',5:'May',6:'June',7:'July',8:'August',9:'September',10:'October',11:'November',12:'December'};
    //Change month to string value
    tempData.monthlyVariance.forEach((entry)=>{
        entry.month = monthsMap[entry.month];
    });
    console.log(tempData);
    //Extract base temperature
    const baseTemperature = tempData.baseTemperature;

    //Scales
    //get array of years and months
    //var years = [];
    //for(let i=0;i<tempData.monthlyVariance.length;i++){
    //    years.push(tempData.monthlyVariance[i].year);
    //}

    //return distinct values of years vector
    //function onlyUnique(value,index,array) {
     //   return array.indexOf(value) === index;
    //}

    //years = years.filter(onlyUnique);

    const yearExtent = d3.extent(tempData.monthlyVariance,(d)=>(d.year));
    
    var months = [];
    for(const [key,value] of Object.entries(monthsMap)){
        months.push(value);
    }
    console.log(months)
    
    let scaleX = d3.scaleLinear()
        .domain(yearExtent)    
        .range([0,width]);
       
    //derive dx
    const dx = scaleX(1762)-scaleX(1761);
    
    let scaleY = d3.scaleBand()
        .domain(months)
        .range([0,height]);

    //derive dy
    const dy = scaleY('February')-scaleY('January');
    

    const variationExtent = d3.extent(tempData.monthlyVariance,(d)=>(d.variance));
    
    const variationMin = d3.min(tempData.monthlyVariance,(d)=>d.variance);
    const variationMax = d3.max(tempData.monthlyVariance,(d)=>d.variance);

    //Create vector splitting th variance values into 6 parts
    var varianceCoarse = [];
    for(let i=0;i<6;i++){
        varianceCoarse.push(((i+1)/6)*(variationMax-variationMin)+variationMin);
    }


    const color = d3.scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain(variationExtent);

    //Create input to legend
    
    const z = d3.scaleLinear()
                .domain([0,200])
                .range(variationExtent)

    //Set properties of svg
    var svg = d3.select('svg')
        .attr("margin",margin)
        .attr("width",width+margin)
        .attr("height",height+margin+50);
    
    //Add Labels
    //Title
    svg.append("text")
        .attr("x",width/2+100)
        .attr("y",50)
        .attr("id","title")
        .attr("text-anchor","middle")
        .style("font-size",30)
        .text("Monthly Temperature Variation")
    
    svg.append("text")
        .attr("x",width/2+100)
        .attr("y",75)
        .attr("id","title")
        .attr("text-anchor","middle")
        .style("font-size",20)
        .text("Base Temperature: "+baseTemperature+"°C")

    
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
        .text("Month")
        
    
    //Creates a group element where we will render our plot with 100 margin
    var g = svg.append("g")
            .attr("id","plot")
            .attr("transform","translate(100,100)")    

    //Create bottom axis
   g.append("g")
        .attr("id","x-axis")
        .attr("class","axis")
        .attr("transform","translate(0,"+height+")")
        .style("font-size","14px")
        .call(d3.axisBottom(scaleX).tickFormat((d)=>(d)))
    
    //Create left axis
    g.append("g")
        .attr("id","y-axis")
        .attr("class","axis")
        .style("font-size","14px")
        .call(d3.axisLeft(scaleY));
    
    const rectWidth = 50;
    //Create Legend
    svg.selectAll('rect')
                .data(varianceCoarse)
                .enter()
                .append('rect')
                .attr('y',height+130)
                .attr('x',(d,i)=>i*rectWidth+100)
                .attr('height',rectWidth)
                .attr('width',rectWidth)
                .attr('stroke','black')
                .attr('fill',(d)=>color(d));
    //Add text labels 
    svg.selectAll('.legend-label')
                .data(varianceCoarse)
                .enter()
                .append('text')
                .text((d) => Math.round(d))
                .attr('y',height+200)
                .attr('x',(d,i)=>(i+1)*rectWidth+100)
                .attr("text-anchor","middle")
                .style("font-size",20);
    //Add minimum text label with minimum value
    svg.append('text')
        .attr('class','legend-label')
        .text(Math.round(variationMin))
        .attr('y',height+200)
        .attr('x',100)
        .attr('text-anchor','middle')
        .style('font-size',20);

    //Add horizontal line under the legend
    svg.append('line')
    .style('stroke','black')
    .attr('x1',100)
    .attr('x2',8*rectWidth)
    .attr('y1',height+210)
    .attr('y2',height+210)

    //Add vertical ticks to the legend line
    svg.selectAll('.legend-ticks')
        .data(varianceCoarse)
        .enter()
        .append('line')
        .style('stroke','black')
        .attr('x1',(d,i)=>(i+1)*rectWidth+100)
        .attr('x2',(d,i)=>(i+1)*rectWidth+100)
        .attr('y1',height+210)
        .attr('y2',height+203)

    //append line on first legend point
    svg.append('line')
        .attr('class','.legend-ticks')
        .style('stroke','black')
        .attr('x1',100)
        .attr('x2',100)
        .attr('y1',height+210)
        .attr('y2',height+203)
    
    //Append Legend Title
    svg.append('text')
        .attr('class','legend-title')
        .text('Temperature Variance')
        .attr('y',height+235)
        .attr('x',3*rectWidth+100)
        .attr('text-anchor','middle')
        .style('font-size',25);


    //Create tooltip
    var tooltip = 
        d3.select("body").append("div")
        .attr("class","tooltip")
        .style("opacity",0)
        .style("z-index",100)
    
    
    //Create squares
    var rect = g.selectAll("rect")
        .data(tempData.monthlyVariance)
        .enter()
        .append("rect")
        .attr("class","square")
        .attr("stroke","black")
        
  
    //Plot squares
    rect.on("mouseover",function (d){
        tooltip.style("opacity",1)
            .html("Year: " + d.year + "<br/>" + "Month: " + d.month + "<br/>" + "Variance: " + d.variance)
            .style("left",(d3.event.pageX-25) + "px")
            .style("top",(d3.event.pageY-75) + "px");
        }) 
        .on("mouseout",function (d){
            tooltip.style("opacity",0);
        })
        .attr("x",(d)=>scaleX(d.year))
        .attr("y",(d)=>scaleY(d.month))
        .attr("width",dx)
        .attr("height",dy)
        .attr("fill",(d)=>color(d.variance));

}

getData();







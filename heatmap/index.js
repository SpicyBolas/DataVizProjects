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
        .attr("height",height+margin);
    
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
    

    //Create Legend
    //Temperature Scale
    var legend = svg.selectAll(".legend")
    .data(color.ticks())
    .enter()
    .append("g")
    .attr({
            "class":"legend",
            "transform":function(d,i) {
                return "translate(-10," + (height + margin-40)+")";
            }
        });

    /*legend.append("rect")
    .attr({
        "width": 40,
        "height": 20,
        "fill": function (d){
            return color()
    })*/


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







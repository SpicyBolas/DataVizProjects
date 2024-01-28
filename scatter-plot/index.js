//Initialise the plot element
const plot = document.getElementById("plot");

//Request data form the server

async function getData(){
    const requestURL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
    const request = new Request(requestURL);

    const response = await fetch(request);
    const cyclistDataText = await response.text();
    const cyclistData = JSON.parse(cyclistDataText);

    /*dopeArr = [];
    //Determine unique "Doping Values"
    for(let i=0;i<cyclistData.length;i++){
        dopeArr.push(cyclistData[i].Doping);
    }
    
    function onlyUnique(value, index, array) {
        return array.indexOf(value) === index;
    }

    const uniqueDoping = dopeArr.filter(onlyUnique);
    console.log(uniqueDoping);

    //Non Doping:
    //'1994 Failed test for salbutemol, not a banned drug at that time'
    //'Made payments to Ferrari, but no charges filed'
    //"Implicated in Giardini Margherita Raid in 1998 as a 'victim' "
    //'Associated with Mantova investigation, charges dropped'
    //''
    */

    const nonDopingArr = ['1994 Failed test for salbutemol, not a banned drug at that time','Made payments to Ferrari, but no charges filed',
    'Made payments to Ferrari, but no charges filed',"Implicated in Giardini Margherita Raid in 1998 as a 'victim' ",
    'Associated with Mantova investigation, charges dropped',''];


    //Convert Time data into minutes and determine if Doped cyclist
    //Create regex to extract minutes and seconds
    const regex_mins = /^[0-9]+/g;
    const regex_sec = /[0-9]+$/g;


    for(let i=0;i<cyclistData.length;i++){
        cyclistData[i].TimeMins = Number(cyclistData[i].Time.match(regex_mins)[0]) + Number(cyclistData[i].Time.match(regex_sec)[0])/60;
        cyclistData[i].DopingFlag = nonDopingArr.includes(cyclistData[i].Doping) ? 0 : 1; 
    }

    const height = 700;
    const width = 700;
    const margin = 200;

    //Scales
    let yearExtent = d3.extent(cyclistData,(d)=>d.Year);
    let minsExtent = d3.extent(cyclistData,(d)=>d.TimeMins);

    let scaleX = d3.scaleLinear()
        .domain([1993,2016])    
        .range([0,width]);
        
    let scaleY = d3.scaleLinear()
        .domain([40.0,36.0])
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
        .text("Year vs Cyclist Time")

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
        .text("Time (mins:sec)")
        
    
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
        .call(d3.axisBottom(scaleX).tickFormat((d)=>d.toString()))

    //Create left axis
    g.append("g")
        .attr("id","y-axis")
        .attr("class","axis")
        .style("font-size","14px")
        .call(d3.axisLeft(scaleY).tickFormat(function (d){
            let minsStr = Math.floor(d).toString() ;
            let secs = (Math.floor(((d-Math.floor(d))*60))).toString(); 
            let secsStr = secs.length === 1 ? '0' + secs : secs;
            return minsStr + ':' + secsStr;
        }).ticks(10));
    
    /*****************/
    //Create Legend
    //No Doping
    g.append("rect")
        .attr("x",scaleX(2011))
        .attr("y",scaleY(37))
        .attr("height",30)
        .attr("width",30)
        .attr("fill","blue")
    
    g.append("text")
        .attr("x",scaleX(2011)+35)
        .attr("y",scaleY(37)+20)
        .text('Not involved in doping scandal')

    //Doping
    g.append("rect")
        .attr("x",scaleX(2011))
        .attr("y",scaleY(37)+35)
        .attr("height",30)
        .attr("width",30)
        .attr("fill","orange")
    
    g.append("text")
        .attr("x",scaleX(2011)+35)
        .attr("y",scaleY(37)+20+35)
        .text('Involved in doping scandal')


    /*****************/
    //Create tooltip
    var tooltip = 
        d3.select("body").append("div")
        .attr("class","tooltip")
        .style("opacity",0)
        .style("z-index",100)
    
    
    //Create dots
    var dot = g.selectAll("circle")
        .data(cyclistData)
        .enter()
        .append("circle")
        .attr("class","dot")
        .attr("r",10)
        .style("stroke","black")
        .style("fill",(d)=>d.DopingFlag===0 ? "blue" : "orange");

    //Plot dots
    dot.on("mouseover",function (d){
        tooltip.style("opacity",1)
            .html("Name: " + d.Name + "<br/>" + "Time: " + d.Time + "<br/>" + "Year: " + d.Year + '<br/>' + '<br/>' + d.Doping)
            .style("left",(d3.event.pageX-25) + "px")
            .style("top",(d3.event.pageY-75) + "px");
        }) 
        .on("mouseout",function (d){
            tooltip.style("opacity",0);
        })
        .attr("cx",(d)=>scaleX(d.Year))
        .attr("cy",(d)=>scaleY(d.TimeMins))
}

getData();







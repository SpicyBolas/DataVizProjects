//Initialise the plot element
const plot = document.getElementById("plot");

//Request data form the server
async function getData(){
    
    var requestURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
    var request = new Request(requestURL);

    var response = await fetch(request);
    const gameDataText = await response.text();
    const gameData = JSON.parse(gameDataText);
    
    
    const consoleList = ['2600','Wii','NES','GB','DS','X360','PS3',
    'PS2','SNES','GBA','PS4','3DS','N64',
    'PS','XB','PC','PSP','XOne'];

    const color = d3.scaleOrdinal([...d3.schemePiYG[11],...d3.schemeSet1]).domain(consoleList);

    //Set the width and height of the svg
    const width = 1500;
    const height = 700;
    const margin = 200;


    //Compute Layout
    var root = d3.hierarchy(gameData).sum((d)=>d.value)

    //Compute element positions
    d3.treemap()
        .size([width-margin,height-margin/2])
        .padding(2)
        (root);

    //Add the rectangles
    var svg = d3.select('svg')
    .attr('width',width)
    .attr('height',height);

    //Add title
    svg.append('text')
        .attr('x',width/2)
        .attr('y',50)
        .attr('text-anchor','middle')
        .attr('font-size',30)
        .text('Console Games by Sales Amount')

    var g = svg.append('g')
    .attr('transform','translate(10,100)');

    //Add the rectangles
    const rect = g.selectAll('rect')
    .data(root.leaves())
    .enter()
    .append('rect')
        .attr('x',(d)=>d.x0-10)
        .attr('y',(d)=>d.y0-10)
        .attr('width',(d)=>d.x1-d.x0)
        .attr('height',(d)=>d.y1-d.y0)
        
        
    rect.style("stroke","black")
        .style('fill',(d)=>color(d.data.category));
    
     //Add the clip path to prevent text overflow
     g.selectAll('clipPath')
        .data(root.leaves())
        .enter()
        .append('clipPath')
        .attr('id',(d,i)=>`clip${i}`)
        .append('rect')
        .attr('x',(d)=>d.x0-10)
        .attr('y',(d)=>d.y0-10)
        .attr('width',(d)=>d.x1-d.x0)
        .attr('height',(d)=>d.y1-d.y0)
    
    
    //Add the text
    g.selectAll('text')
    .data(root.leaves())
    .enter()
    .append('text')
        .attr('clip-path',(d,i)=>`url(#clip${i})`)
        .attr('x',(d)=>d.x0-10)
        .attr('y',(d)=>d.y0)
        .text((d)=>d.data.name)
        .attr('font-size','12px')
        .attr("fill","black");

    //Add the legend
    svg.selectAll('.legend-rect')
        .data(consoleList)
        .enter()
        .append('rect')
        .attr('x',1325)
        .attr('y',(d,i)=>200+25*i)
        .attr('height',20)
        .attr('width',20)
        .attr('stroke','black')
        .attr('fill',(d)=>color(d))
    
    //Legend title
    svg.append('text')
        .attr('id','legend-title')
        .attr('x',1400)
        .attr('y',180)
        .attr('text-anchor','middle')
        .attr('font-size',20)
        .text('Gaming Console')
    
    //Add the legend labels
    svg.selectAll('.legend-labels')
        .data(consoleList)
        .enter()
        .append('text')
        .attr('x',1350)
        .attr('y',(d,i)=>215+25*i)
        .attr('font-size','15px')
        .text((d)=>d)


    //Make tooltip
    const tooltip = d3.select('body').append('div')
                        .attr('class','tooltip')
                        .style('opacity',0)
                        .style('z-index',150)


    rect.on('mousemove',function(d) {
        console.log(d3.event.pageX)
        tooltip.html('Title: ' + d.data.name + '<br/>' + 'Console: ' + d.data.category + '<br/>' + 'Value: ' + d.data.value)
            .style('left',d3.event.pageX+10+'px')
            .style('top',d3.event.pageY-70+'px')
            .style('opacity',1);
    })
    .on('mouseout',function(d){
        tooltip.style('opacity',0);
    });
    
}

getData();







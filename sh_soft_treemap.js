class TreemapChart {
    constructor(container, data, option) {
        this.container = container;
        if(!container.id){
            this.container.id = `treemapchart-${Math.floor(Math.random() * 1000000)}`
        }
        this.width = option?.width ? option.width : d3.select(this.container)._groups[0][0].clientWidth > 0 ? d3.select(this.container)._groups[0][0].clientWidth : 1500 
        this.height = option?.height ? option.height : d3.select(this.container)._groups[0][0].clientHeight > 0 ? d3.select(this.container)._groups[0][0].clientHeight -30.5 : 500 -30.5
        this.data = data
        this.circleRadius = option?.circleRadius 
        this.textSize = option?.textSize ? option.textSize : 14
        this.animateTime = option?.animateTime ? option.animateTime : 1000
        console.log(this.width, this.height)
    }

    render() {
       const self = this;
       const hierarchy = d3.hierarchy(data)
        .sum(d => {
      // If the node has a child with the same name and size, return 0 for the size of the child
            if (d.children && d.children[0] && d.children[0].name === d.name && d.children[0].size === d.size) {
                return 0;
        }
        // Otherwise, return the size of the node
        else {
            return d.size;
        }
        })
        .sort((a, b) => b.size - a.size);
        const tile = (node, x0, y0, x1, y1) => {
            d3.treemapSquarify(node, 0, 0, this.width, this.height);
            for (const child of node.children) {
                child.x0 = x0 + child.x0 / this.width * (x1 - x0);
                child.x1 = x0 + child.x1 / this.width * (x1 - x0);
                child.y0 = y0 + child.y0 / this.height * (y1 - y0);
                child.y1 = y0 + child.y1 / this.height * (y1 - y0);
            }
        };
        const root = d3.treemap().tile(tile)(hierarchy);
        const x = d3.scaleLinear().rangeRound([0, this.width]);
        const y = d3.scaleLinear().rangeRound([0, this.height]);
        
        // Formatting utilities.
        const format = d3.format(",d");
      
        const name = d => d.ancestors().reverse().map(d => d.data.name).join("/");
        let clickTimeout;
        const svg = d3.select(`#${this.container.id}`).append("svg")
            .attr("viewBox", [0.5, -30.5, this.width, this.height + 30])
            // .attr("viewBox", [0, -30.5, this.width, this.height + 30])
            .attr("width", this.width)
            .attr("height", this.height + 30)
            .attr("style", "max-width: 100%; height: auto;")
            .style("font", "10px sans-serif");
            d3.select(`#${this.container.id}`).style('position','relative')
        const detailBoard = d3.select(`#${this.container.id}`).append('div').attr('id', 'detailBoard')
.style('opacity', '0').style('position', 'absolute').style('top', '0px').style('left', `0px`).style('width', `${this.width*.95}px`).style('height', `${this.height*.75}px`).style('scale', '0').style('background-color', '#272b30').style('min-height', '270px').style('min-width', '1500px').style('border-radius', '5px').html(()=>{
  let temp = `<div style="height:100%; display: flex; flex-direction: column;">
                      <div style="display: flex; align-items:center; justify-content: space-between; padding: 5px 15px">
                          <h2 style="margin: 0; color: #a5a7ab">[]</h3>
                          <button style="color: red; cursor: pointer" value="close" class="close">X</button>    
                          </div>
                      <div style="display:flex; align-items:center; flex-grow:1">
                          <div style="width: 70%; display: flex; align-items:center; height:100%">
                            
                                  <div style="width: 18%; text-align: center;height:100%; display: flex; align-items:center; justify-content:center">
                                      <div>
                                      <svg id="liquidGauge" width="130" height="130"></svg>

                                      <p id="totalValue" style="color: #8a8d93; opacity: 0">Total: <span></span></p>
                                  </div>
                                  

                                  </div>
                                  <div style="width: 82%; height:100%; display:flex; align-items:center; justify-content: center">
                                      <div style="width: 100%">
                                      <div id="detailInfo" style="display: flex; align-items: center; gap: 10px
                                      ; font-size: 12px">
                                      <div id="pageView" style="opacity: 0;width: 23%; height: 90px; display: flex; align-items: center; padding: 16px 15px 0 15px; background-color: rgba(255, 255, 255, 0.01); border-radius: 6px; border-top: solid 2px rgba(180, 180, 180, 0.05); border-right: solid 2px rgba(180, 180, 180, 0.05); box-shadow: 2px 2px 25px 0px rgba(0,0,0,.15)">
                                          <div style="width: 45; height: 45">
                                              <img style="width: 45px;height: 45px" src="./img/pageviews.png">
                                          </div>
                                          <div style="width: 70%; padding-left: 5%">
                                                  <h3 style="margin: 5px 0; color: white; font-size: 20px"></h3>
                                                  <p style="margin: 0; color: #8A8D93">PAGEVIEWS</p>
                                          </div>
                                          </div>
                                      <div id="avgTime" style="opacity: 0;width: 23%; height: 90px; display: flex; align-items: center; padding: 16px 15px 0 15px; background-color: rgba(255, 255, 255, 0.01); border-radius: 6px; border-top: solid 2px rgba(180, 180, 180, 0.05); border-right: solid 2px rgba(180, 180, 180, 0.05); box-shadow: 2px 2px 25px 0px rgba(0,0,0,.15)">
                                          <div style="width: 45; height: 45">
                                              <img style="width: 45px;height: 45px" src="./img/avg_time_on_page.png">
                                          </div>
                                          <div style="width: 70%; padding-left: 5%">
                                                  <h3 style="margin: 5px 0; color: white; font-size: 20px"></h3>
                                                  <p style="margin: 0; color: #8A8D93">AVG. TIME ON PAGE</p>
                                          </div>
                                          </div>
                                      <div id="newVisitor" style="opacity: 0;width: 23%; height: 90px; display: flex; align-items: center; padding: 16px 15px 0 15px; background-color: rgba(255, 255, 255, 0.01); border-radius: 6px; border-top: solid 2px rgba(180, 180, 180, 0.05); border-right: solid 2px rgba(180, 180, 180, 0.05); box-shadow: 2px 2px 25px 0px rgba(0,0,0,.15)">
                                          <div style="width: 45; height: 45">
                                              <img style="width: 45px;height: 45px" src="./img/new_visitor.png">
                                          </div>
                                          <div style="width: 70%; padding-left: 5%">
                                                  <h3 style="margin: 5px 0; color: white; font-size: 20px"></h3>
                                                  <p style="margin: 0; color: #8A8D93">NEW VISITORS</p>
                                          </div>
                                          </div>
                                      <div id="uniqueRevisitor" style="opacity: 0;width: 23%; height: 90px; display: flex; align-items: center; padding: 16px 15px 0 15px; background-color: rgba(255, 255, 255, 0.01); border-radius: 6px; border-top: solid 2px rgba(180, 180, 180, 0.05); border-right: solid 2px rgba(180, 180, 180, 0.05); box-shadow: 2px 2px 25px 0px rgba(0,0,0,.15)">
                                          <div style="width: 45; height: 45">
                                              <img style="width: 45px;height: 45px" src="./img/return_visitor.png">
                                          </div>
                                          <div style="width: 70%; padding-left: 5%">
                                                  <h3 style="margin: 5px 0; color: white; font-size: 20px"></h3>
                                                  <p style="margin: 0; color: #8A8D93">UNIQUE REVISITOR</p>
                                          </div>
                                          </div>
                                     
                                      </div>
                                      <div id="deviceRatio" style="display: flex; align-items: center; height: 50px; gap: 5px; padding-top: 20px">
                                          <div style="width: 40px; height: 40px; display:flex; align-items: center; justify-content: center">
                                              <img style="width: 30px; height:30px; opacity: 0" src="./img/pc.png">
                                              </div>
                                          <div id="progressBar" style="opacity: 0;display: flex; align-items:center; height: 100%; flex: 1">
                                              <div id="pcRatio"  style="height:100%; border-top-left-radius: 3px; border-bottom-left-radius: 3px;">
                                                  <h5 style="text-align:center; height: 100%; color: white; font-size: 12px;margin-top: 7px"></h5>
                                                  </div>
                                              <div id="mobileRatio" style="height:100%; border-top-right-radius: 3px; border-bottom-right-radius: 3px">
                                                  <h5 style="text-align:center; height: 100%; color: white; font-size: 12px; margin-top: 7px"></h5>
                                                  </div>
                                          </div>
                                          <div style="width: 40px; height: 40px; display:flex; align-items: center; justify-content: center">
                                              <img style="width: 30px; height:30px; opacity: 0" src="./img/mobile.png">
                                              </div>
                                          </div>
                                 
                          </div>
                      </div>
                          </div>
                          <div style="width: 30%; height: 90%; padding: 10px 0">
                              <div id="wordcloud-container" style='width: 100%; height: 100%'>
                                  
                              </div>
                              </div>
                  </div>`
              return temp
  
}).on('click', function(event, d){
    
              if(event.target.value == 'close'){
                  let data =  d3.select(event.target.parentNode.parentNode.parentNode)._groups[0][0].data
                  var rootTopLeftX = x(data.x0) + (x(data.x1) - x(data.x0))/2;
                  var rootTopLeftY = y(data.y0) + (y(data.y1) - y(data.y0))/2;
                  d3.select(`#${self.container.id}`).selectAll('g').style('pointer-events', null)
                  detailBoard.transition().duration(self.animateTime).styleTween('opacity', function() {
                    return d3.interpolate('1', '0'); // interpolate opacity from 0 to 1
                })
                .styleTween('scale', function() {
                    return d3.interpolate('1', '0'); // interpolate scale from 0 to 1
                })
                
                .styleTween('width', function() {
                    return d3.interpolate(`${self.width*.95}px`,`${0}px` ); // interpolate width from x(root.x1) - x(root.x0) to self.width*.95
                })
                .styleTween('height', function() {
                    return d3.interpolate(`${self.height*.75}px`,`${0}px` ); // interpolate height from y(root.y1) - y(root.y0) to self.height*.9
                })
                .style('pointer-events', 'none')

                d3.select('#detailBoard').selectAll('h3').text('')
                d3.select('#detailBoard').select('h2').text('')
                d3.select('#detailBoard #detailInfo').selectAll('div').transition().duration(self.animateTime).styleTween('opacity', function(){
                    return d3.interpolate('1', '0')
                })
                d3.select('#detailBoard').selectAll('img').transition().duration(self.animateTime).styleTween('opacity', function(){
                    return d3.interpolate('1', '0')
                })
                d3.select('#detailBoard #progressBar').transition().duration(self.animateTime).styleTween('opacity', function(){
                    return d3.interpolate('1', '0')
                })
                d3.select('#detailBoard #totalValue').transition().duration(self.animateTime).styleTween('opacity', function(){
                    return d3.interpolate('1', '0')
                })
              }
          })
    
          const tooltip = d3.select(`#${this.container.id}`).append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('opacity', '0')
          .style('padding', '10px')
          .style('background-color', 'rgba(0,0,0,0.5)')
          .style('border-radius', '5px')
          .style('font-size', '14px')
          .style('color', 'black')
          .style('min-width', '150px')
          .style('top', '0')
          .style('left', '0')
          
          const arrowStyle = d3.select('head').append('style').attr('rel', 'stylesheet').attr('type', 'text/css').text(`
          .tooltip:after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -8px;
          border-width: 8px;
          border-style: solid;
          border-color: rgba(0,0,0,0.5) transparent transparent transparent;
          }`)
          
          let group = svg.append("g")
              .call(render, root);
          
          function render(group, root) {
          
          //   
            const node = group
              .selectAll("g")
              .data(root.children.concat(root))
            //   .data(root.children)
              .join("g");
          
            node.filter((d,index)=> index != root.children.concat(root).length-1)
                .attr("cursor", "pointer")
                .on("click", (event, d) => {
                if (clickTimeout) clearTimeout(clickTimeout);  // Clear the timeout if it exists
                clickTimeout = setTimeout(() => {
                    // Single click event
                    let svgPosition = svg.node().getBoundingClientRect();
                    x.domain([root.x0, root.x1]);
                    y.domain([root.y0, root.y1]);
                    node.style('pointer-events', 'none')
                    
                    d3.select('#liquidGauge').selectAll('g').remove()
                    d3.select('#wordcloud-container').selectAll('svg').remove()
                 
                    detailBoard.call(positionDetailBoard, d)
                    
                }, 250);  
            })
            .on("dblclick", (event, d) => {
                if (clickTimeout) clearTimeout(clickTimeout);  // Clear the timeout if it exists
                // Double click event
                if (d !== root && d.children) zoomin(d);
            })
            .on('mouseover', function(event, d) {
                let tooltipWidth = tooltip.node().getBoundingClientRect().width
                tooltip.interrupt();
                x.domain([root.x0, root.x1]);
                y.domain([root.y0, root.y1]);
                tooltip.html(`<p style="color: white; text-align: center; margin: 3px 0">${d.data.name}</p>
                        <p style="color: white; text-align: center; margin: 3px 0">${d.value}</p>
          `)
                let xPos = x(d.x0) + (x(d.x1)-x(d.x0))/2
          
                if(d.y1 >.95 && d.y1-d.y0 < .95){
                    
                    arrowStyle.text(`.tooltip:before {
          content: "";
          position: absolute;
          top: -21%;
          left: 50%;
          margin-left: -8px;
          border-width: 8px;
          border-style: solid;
          border-color: transparent transparent rgba(0,0,0,0.5) transparent ;
          }`)
              tooltip.style('top', `${( y(d.y1) + 68)}px`).style('left', `${xPos-tooltipWidth/2}px`)
              tooltip.transition().duration(1000).style('opacity', '1').style('top', `${(y(d.y1)+38)}px`)
                }
            else{
                arrowStyle.text(`
          .tooltip:after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -8px;
          border-width: 8px;
          border-style: solid;
          border-color: rgba(0,0,0,0.5) transparent transparent transparent;
          }`)
                tooltip.style('left', `${xPos - tooltipWidth/2}px`).style('top', `${y(d.y0)-78}px`)
                tooltip.transition().duration(1000).style('opacity', '1').style('top', `${ y(d.y0)-54}px`)
            }
            
          })

          .on('mouseout', function() {
          tooltip.transition().duration(200).style('opacity', '0')
          });
            node.append("title")
                .text(d => `${name(d)}\n${format(d.value)}`);
                
            let color = d3.scaleOrdinal(d3.schemeCategory10);

            function getRandomColor() {
                    return color(Math.floor(Math.random() * 10));
                }
            node.append("rect")
                .attr("id", d => (d.leafUid = d3.create("div").attr("id", "leaf").node().id))
                .attr("fill", d => d === root ? "#272b30" : d.data.color ? d.data.color : getRandomColor())
                .attr("stroke",d => d === root ? "#272b30" : "#fff")
                
          
            node.append("clipPath")
                .attr("id", d => (d.clipUid = d3.create("div").attr("id", "clip").node().id))
                .append("use")
                .attr("xlink:href", d => d.clipUid.href);
         
            let tempWidth = 0
            let tspanTotalHeight = 0
            node.append("text")
                .attr("clip-path", d => {
                    return d.clipUid})
                .attr("font-weight", d => d === root ? "bold" : null)
              .selectAll("tspan")
              .data((d, index) => {
                let nameParts;
                if (d === root) {
                    nameParts = name(d).split("/");
                    let partsWithSlash = [];
                    nameParts.forEach((part, i) => {
                        partsWithSlash.push(part);
                        if (i < nameParts.length - 1) {
                            partsWithSlash.push("/");
                        }
                    });
                    return partsWithSlash.concat(format(d.value)).map(part => ({ original: d, part: part }));
                } else if (typeof d.data.name === 'string') {
                    nameParts = d.data.name.split(/(?=[A-Z][^A-Z])/g);
                } else {
                    nameParts = []; // or some default value
                }
                return nameParts.concat(format(d.value)).map(part => ({ original: d, part: part }));
            })
          .join("tspan")
          .attr('fill',(d,i)=>{
            if(d.original === root){
                return '#fff'
            } else return 'black'})
          .attr('font-size', (d,i,nodes)=>{
            return d.original === root ? `${self.textSize*1.4}` :`${self.textSize}px`})
          .text(function(d, i, nodes) {

                return i==nodes.length-1 ? `(${d.part})` : d.part}
                )
          .attr("x", function(d, i, nodes) {
                    x.domain([root.x0, root.x1]);
                    y.domain([root.y0, root.y1]);
                    if(d.original === root){
                        let currentWidth = this.getComputedTextLength();
                        if(i == 0){
                            tempWidth = currentWidth;
                            return `0em`;
                        } else{
                            let previousWidth = tempWidth;
                            tempWidth += currentWidth + (i === nodes.length - 1 ? 5 : 20); // Add a smaller space for the second last tspan
                            return `${previousWidth + (i === nodes.length - 1 ? 5 : 20)}px`; // Use the smaller space for the second last tspan
                        }
                    } else {
                        return `${(x(d.original.x1)- x(d.original.x0))/2}`;    
                    }
                })
            .attr("y", (d, i, nodes) => {
                x.domain([root.x0, root.x1]);
                y.domain([root.y0, root.y1]);
                return d.original === root ? `1em` : `${(y(d.original.y1)- y(d.original.y0))/2 + i*15}`})
            .attr("text-anchor", d => d.original === root ? "start" : "middle")
            .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
            .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
            
            .attr('cursor', 'pointer')
            .on("mouseover", function(event, d) {
                let nodes = this.parentNode.childNodes;
                let i = Array.prototype.indexOf.call(nodes, this);
                
                if (d.original === root && i !== nodes.length - 1 && i !== nodes.length - 2) {
                    d3.select(this).transition().duration(self.animateTime).style("text-decoration", "underline") // Add underline on mouseover
                }
            })
            .on("mouseout", function(event, d) {
                let nodes = this.parentNode.childNodes;
                let i = Array.prototype.indexOf.call(nodes, this);
                if (d.original === root && i !== nodes.length - 1 && i !== nodes.length - 2) {
                    d3.select(this).transition().duration(self.animateTime).style("text-decoration", "none"); // Remove underline on mouseout
                }
            })
            .on('click', function(event,d){
                let result
                let temp = d;
                if(temp.original.data.name == d.part){
                    return 
                } else{
                    if(temp.original.parent.data.name == d.part){
                    result = temp.original.parent
                } else{
                   let temp1 = temp.original.parent
                   while(temp1?.parent?.data.name != d.part){
                       temp1 = temp1.parent
                   }
                   result = temp1.parent
                }
                zoomout(result)
                }
            })
            node.each(function(d) {
                if(d !== root){
                    let nodeWidth = x(d.x1) - x(d.x0);
                    let nodeHeight = y(d.y1) - y(d.y0);
                    
                
                    d3.select(this).selectAll("tspan")
                        .each(function() {
                            let tspan = d3.select(this);
                            let rect = this.getBoundingClientRect();
                            tspanTotalHeight += rect.height;
                          
                            if (rect.width > .85*nodeWidth) {
    
                                // Hide the tspan
                                tspan.attr("visibility", "hidden");
                            }
                        });
                    if (tspanTotalHeight >= .75*nodeHeight) {
                        // Hide all tspans in the node
                        d3.select(this).selectAll("tspan").attr("visibility", "hidden");
                    }
                }
               tspanTotalHeight = 0
            })
            const lastTspans = node.filter(d => d !== root).selectAll("tspan").filter(function(d, i){
                
                return i == this.parentNode.childNodes.length-1
            })
            lastTspans.transition()
  .duration(self.animateTime) // Adjust the duration as needed
  .tween("text", function (d) {
    if (d.part.includes('(')) {
      return null; // Skip the count-up tween for the final value in parentheses
    }
    const endValue = parseFloat(d.part.replace(/[^\d.-]/g, '')) || 0; // Extract the numeric part
    return countUpTween.bind(this)(endValue);
  });
            group.call(position, root);
          }
          
        function position(group, root) {
            group.selectAll("g")
                .attr("transform", d => d === root ? `translate(0,-30)` : `translate(${x(d.x0)},${y(d.y0)})`)
                .select("rect")
                .attr("width", d => {
                    return d === root ? self.width : x(d.x1) - x(d.x0)
                })
                .attr("height", d => d === root ? 30 : y(d.y1) - y(d.y0));
        }

        function positionDetailBoard(detailBoard, root) {
            var rootTopLeftX = x(root.x0) + (x(root.x1) - x(root.x0))/2;
            var rootTopLeftY = y(root.y0) + (y(root.y1) - y(root.y0))/2;

    d3.select('#detailBoard').property('data', root)
    detailBoard
        .style('transform-origin', `${rootTopLeftX}px ${rootTopLeftY}px`) // set transform origin to root top left corner
        .transition()
        .duration(self.animateTime/10)
        
        
        .styleTween('left', function() {
            return d3.interpolate(`${rootTopLeftX}px`, `${self.width*.025}px`); // interpolate left position from root top left to screen center
        })
        .styleTween('top', function() {
            return d3.interpolate(`${rootTopLeftY}px`, `${self.height*.125}px`); // interpolate top position from root top left to screen center
        })
       
        .style('pointer-events', 'unset')
        .on('end', function(){
            detailBoard.transition().duration(self.animateTime).styleTween('width', function() {
                var rootWidth = x(root.x1) - x(root.x0);
                return d3.interpolate(`${0}px`, `${self.width*.95}px`); // interpolate width from root width to screen width
            })
            .styleTween('height', function() {
                var rootHeight = y(root.y1) - y(root.y0);
                return d3.interpolate(`${0}px`, `${self.height*.75}px`); // interpolate height from root height to screen height
            })
            .styleTween('scale', function() {
            return d3.interpolate('0', '1'); // interpolate scale from 0 to 1
        }).styleTween('opacity', function() {
            return d3.interpolate('0', '1'); // interpolate opacity from 0 to 1
        })
            .on('end', function() {
                d3.select('#detailBoard #detailInfo').selectAll('div').transition().duration(self.animateTime).styleTween('opacity', function(){
                    return d3.interpolate('0', '1')
                })
                d3.select("#detailBoard h2")
                    .transition()
                    .duration(self.animateTime)
                    .styleTween('opacity', function() {
                        return d3.interpolate('0', '1'); // interpolate opacity from 0 to 1
                    })
                    .text(`[${root.data.name}]`); // Replace 'd.name' with the property you want to display

                d3.select("#detailBoard p span")
                    .transition()
                    .duration(self.animateTime)
                    .text(`${root.parent.value}`)
                    .style('color', 'white')
                    .style('font-size', '25px');

                d3.select("#detailBoard #pageView h3")
                    .transition()
                    .duration(self.animateTime)
                    .styleTween('opacity', function() {
                        return d3.interpolate('0', '1'); // interpolate opacity from 0 to 1
                    })
                    .text(`${root.value}`);

                d3.select("#detailBoard #avgTime h3")
                    .transition()
                    .duration(self.animateTime)
                    .styleTween('opacity', function() {
                        return d3.interpolate('0', '1'); // interpolate opacity from 0 to 1
                    })
                    .text(`0${root.data.avgTime.min}:${root.data.avgTime.sec > 10 ? root.data.avgTime.sec : `0${root.data.avgTime.sec}`}`);

                d3.select("#detailBoard #newVisitor h3")
                    .transition()
                    .duration(self.animateTime)
                    .styleTween('opacity', function() {
                        return d3.interpolate('0', '1'); // interpolate opacity from 0 to 1
                    })
                    .text(`${root.data.newVisitor}`);

                d3.select("#detailBoard #uniqueRevisitor h3")
                    .transition()
                    .duration(self.animateTime)
                    .styleTween('opacity', function() {
                        return d3.interpolate('0', '1'); // interpolate opacity from 0 to 1
                    })
                    .text(`${root.data.revisitor}`);
                d3.select('#detailBoard').selectAll('img').transition().duration(self.animateTime).styleTween('opacity', function(){
                    return d3.interpolate('0', '1')
                })
                d3.select('#detailBoard #progressBar').transition().duration(self.animateTime).styleTween('opacity', function(){
                    return d3.interpolate('0', '1')
                })
                d3.select('#detailBoard #totalValue').transition().duration(self.animateTime).styleTween('opacity', function(){
                    return d3.interpolate('0', '1')
                })
                d3.select('#detailBoard #pcRatio')
                    .transition()
                    .duration(self.animateTime)
                    .style('width', `${root.data.deviceRatio.desktop}%`)
                    .style('background-color', '#864DD9');

                d3.select('#detailBoard #pcRatio h5')
                    .transition()
                    .duration(self.animateTime)
                    .styleTween('opacity', function() {
                        return d3.interpolate('0', '1'); // interpolate opacity from 0 to 1
                    })
                    .text(`${root.data.deviceRatio.desktop}%`);

                d3.select('#detailBoard #mobileRatio')
                    .transition()
                    .duration(self.animateTime)
                    .style('width', `${root.data.deviceRatio.mobile}%`)
                    .style('background-color', '#E95F71');

                d3.select('#detailBoard #mobileRatio h5')
                    .transition()
                    .duration(self.animateTime)
                    .styleTween('opacity', function() {
                        return d3.interpolate('0', '1'); // interpolate opacity from 0 to 1
                    })
                    .text(`${root.data.deviceRatio.mobile}%`);
                let wordcloudData = [root.data.name, root.data.avgTime.min, root.data.avgTime.sec, root.data.newVisitor, root.data.revisitor]
                root.data.children?.forEach((child)=>{
                    wordcloudData.push(child.name)
                })
                let tempLength = wordcloudData.length
                if(wordcloudData.length < 15){
                    for(let i = 0; i < 15-tempLength; i++){
                        wordcloudData.push(wordcloudData[Math.floor(Math.random() * tempLength)])
                    }
                }
                new WordCloud(document.getElementById('wordcloud-container'),wordcloudData).renderNoMask()
                var config_default = liquidFillGaugeDefaultSettings();
                config_default.circleThickness = 0.2;
                config_default.textVertPosition = 0.3;
                config_default.waveAnimateTime = 5000;
                config_default.displayPercent = false;
                config_default.maxValue = 500;
                var config_danger = liquidFillGaugeDefaultSettings();
      
      
                config_danger.circleColor = "#4e31a5"
                config_danger.textColor = "#8A8D93"
                config_danger.waveTextColor = "#8A8D93"
                config_danger.waveColor = "#4e31a5"
                config_danger.dangerThreshold = .1;
                config_danger.waveCount = 5;
                config_danger.waveRiseTime = 15;
                config_danger.waveAnimateTime = 2400;
                config_danger.waveHeight = 0.15;
                let percentage = (root.value/root.parent.value)*100
      
      var gauge1 = loadLiquidFillGauge("liquidGauge", percentage, config_danger);
        d3.select('#liquidGauge').transition().duration(self.animateTime).styleTween('opacity', function(){
            return d3.interpolate('0', '1')
        })
        d3.select('#wordcloud-container').transition().duration(self.animateTime).styleTween('opacity', function(){
            return d3.interpolate('0', '1')
        })
            })
        })
        
           
                
        }
          
          
          // When zooming in, draw the new nodes on top, and fade them in.
          function zoomin(d) {
            const group0 = group.attr("pointer-events", "none");
            const group1 = group = svg.append("g").call(render, d);
            
            x.domain([d.x0, d.x1]);
            y.domain([d.y0, d.y1]);
            svg.transition()
                .duration(self.animateTime)
                .call(t => group0.transition(t).remove()
                  .call(position, d.parent))
                .call(t => group1.transition(t)
                  .attrTween("opacity", () => d3.interpolate(0, 1))
                  .call(position, d));
          }
          
          // When zooming out, draw the old nodes on top, and fade them out.
          function zoomout(d) {
            const group0 = group.attr("pointer-events", "none");
            const group1 = group = svg.insert("g", "*").call(render, d);
          
            x.domain([d.x0, d.x1]);
            y.domain([d.y0, d.y1]);
          
            svg.transition()
                .duration(self.animateTime)
                .call(t => group0.transition(t).remove()
                  .attrTween("opacity", () => d3.interpolate(1, 0))
                  .call(position, d))
                .call(t => group1.transition(t)
                  .call(position, d));
          
          
          return svg.node();

    }
}
}

function liquidFillGaugeDefaultSettings() {
  return {
      minValue: 0, // The gauge minimum value.
      maxValue: 100, // The gauge maximum value.

      circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
      // The size of the gap between the outer circle and wave circle as a percentage of
      // the outer circles radius.
      circleFillGap: 0.05,
      circleColor: "#178BCA", // The color of the outer circle.
      
      waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
      waveCount: 1, // The number of full waves per width of the wave circle.
      waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
      waveAnimateTime: 18000, // The amount of time in milliseconds for a full wave to enter the wave circle.

      // Control if the wave should rise from 0 to it's full height, or start at it's full height.
      waveRise: true, 

      // Controls wave size scaling at low and high fill percentages.
      // When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill.
      // This helps to prevent the wave from making the wave circle from appear totally full or empty
      // when near it's minimum or maximum fill.
      waveHeightScaling: true, 
      waveAnimate: true, // Controls if the wave scrolls or is static.
      waveColor: "#178BCA", // The color of the fill wave.
      waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.

      // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
      textVertPosition: .5,
      textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%

      // If true, the displayed value counts up from 0 to it's final value upon loading.
      // If false, the final value is displayed.
      valueCountUp: true,
      displayPercent: true, // If true, a % symbol is displayed after the value.
      textColor: "#045681", // The color of the value text when the wave does not overlap it.
      waveTextColor: "#A4DBf8" // The color of the value text when the wave overlaps it.
  };
}

function loadLiquidFillGauge(elementId, value, config) {
  if (config == null) config = liquidFillGaugeDefaultSettings();

  const gauge = d3.select("#" + elementId);
  const radius = Math.min(Number(gauge.style("width").split('p')[0]),Number(gauge.style("height").split('p')[0])) / 2;
  
  const locationX = parseInt(gauge.style("width").split('p')[0]) / 2 - radius;
  const locationY = parseInt(gauge.style("width").split('p')[0]) / 2 - radius;
  const fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value)) / config.maxValue;
  let waveHeightScale = null;
  if (config.waveHeightScaling) {
      waveHeightScale = d3.scaleLinear()
          .range([0, config.waveHeight, 0])
          .domain([0, 50, 100]);
  } else {
      waveHeightScale = d3.scaleLinear()
          .range([config.waveHeight, config.waveHeight])
          .domain([0, 100]);
  }

  // const textPixels = (config.textSize * radius / 2);
  const textPixels = 20
  const textFinalValue = parseFloat(value).toFixed(2);
  const textStartValue = config.valueCountUp ? config.minValue : textFinalValue;
  const percentText = config.displayPercent ? "%" : "";
  const circleThickness = config.circleThickness * radius*3;
  const circleFillGap = config.circleFillGap * radius*2;
  const fillCircleMargin = circleThickness + circleFillGap;
  const fillCircleRadius = radius - fillCircleMargin;
  // const waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);
  const waveHeight = 5

  const waveLength = fillCircleRadius * 2 / config.waveCount;
  const waveClipCount = 1 + config.waveCount;
  const waveClipWidth = waveLength * waveClipCount;

  // Rounding functions so that the correct number of decimal places is always displayed
  // as the value counts up.
  const format = d3.format(".2f");

  // Data for building the clip wave area.
  const data = [];
  for (let i = 0; i <= 40 * waveClipCount; i++) {
      data.push({x: i / (40 * waveClipCount), y: (i / (40))});
  }
  // Scales for drawing the outer circle.
  const gaugeCircleX = d3.scaleLinear().range([0, 2 * Math.PI]).domain([0, 1]);
  const gaugeCircleY = d3.scaleLinear().range([0, radius]).domain([0, radius]);

  // Scales for controlling the size of the clipping path.
  const waveScaleX = d3.scaleLinear().range([0, waveClipWidth]).domain([0, 1]);
  const waveScaleY = d3.scaleLinear().range([0, waveHeight]).domain([0, 1]);

  // Scales for controlling the position of the clipping path.
  const waveRiseScale = d3.scaleLinear()
      // The clipping area size is the height of the fill circle + the wave height,
      // so we position the clip wave such that the it will overlap the fill circle
      // at all when at 0%, and will totally cover the fill circle at 100%.
      .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
      .domain([0, 1]);

  const waveAnimateScale = d3.scaleLinear()
      .range([0, waveClipWidth - fillCircleRadius * 2]) // Push the clip area one full wave then snap back.
      .domain([0, 1]);

  // Scale for controlling the position of the text within the gauge.
  const textRiseScaleY = d3.scaleLinear()
      .range([fillCircleMargin + fillCircleRadius * 2,(fillCircleMargin + textPixels * 0.7)])
      .domain([0, 0.7]);

  // Center the gauge within the parent SVG.
  const gaugeGroup = gauge.append("g")
      .attr('transform','translate(' + locationX + ',' + locationY + ')');

  // Draw the outer circle.
  const gaugeCircleArc = d3.arc()
      .startAngle(gaugeCircleX(0))
      .endAngle(gaugeCircleX(1))
      .outerRadius(gaugeCircleY(radius))
      .innerRadius(gaugeCircleY(radius - circleThickness));

  gaugeGroup.append("path")
      .attr("d", gaugeCircleArc)
      .style("fill", config.circleColor)
      .attr('transform','translate(' + radius + ',' + radius + ')');

  // Text where the wave does not overlap.
  gaugeGroup.append("text")
      .text(format(textStartValue) + percentText)
      .attr("class", "liquidFillGaugeText")
      .attr("text-anchor", "middle")
      .attr("font-size", textPixels + "px")
      .style("fill", config.textColor)
      .attr('transform','translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')');
  // The clipping wave area.
  const clipArea = d3.area()
      .x(function(d) { return waveScaleX(d.x); })
      .y0(function(d) { return waveScaleY(Math.sin(Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI));})
      .y1(function(d) { return (fillCircleRadius *2 + waveHeight); });
  const waveGroup = gaugeGroup.append("defs")
      .append("clipPath")
      .attr("id", "clipWave" + elementId);
  const wave = waveGroup.append("path")
      .datum(data)
      .attr("d", clipArea)
      .attr("T", 0);

  // The inner circle with the clipping wave attached.
  const fillCircleGroup = gaugeGroup.append("g")
      .attr("clip-path", "url(" + location.href + "#clipWave" + elementId + ")");
  
  fillCircleGroup.append("circle")
      .attr("cx", radius)
      .attr("cy", radius)
      .attr("r", fillCircleRadius)
      .style("fill", config.waveColor);

  // Text where the wave does overlap.
  fillCircleGroup.append("text")
      .text(format(textStartValue))
      .attr("class", "liquidFillGaugeText")
      .attr("text-anchor", "middle")
      .attr("font-size", textPixels + "px")
      .style("fill", config.waveTextColor)
      .attr('transform','translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')');

  // Make the value count up.
  if (config.valueCountUp) {
      gaugeGroup.selectAll("text.liquidFillGaugeText").transition()
          .duration(config.waveRiseTime)
          .tween("text", function(d) {
              var that = d3.select(this)
              var i = d3.interpolateNumber(that.text().replace("%", ""), textFinalValue);
              return function(t) { that.text(format(i(t)) + percentText); };
          });
  }

  // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement
  // can be controlled independently.
  const waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth;

  if (config.waveRise) {
      waveGroup.attr('transform','translate(' + waveGroupXPosition + ',' + waveRiseScale(0) + ')')
          .transition()
          .duration(config.waveRiseTime)
          .attr('transform','translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')')
          .on("start", function() { wave.attr('transform','translate(1,0)'); });
          // This transform is necessary to get the clip wave positioned correctly when
          // waveRise=true and waveAnimate=false. The wave will not position correctly without
          // this, but it's not clear why this is actually necessary.
  } else {
      waveGroup.attr('transform','translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')');
  }

  if(config.waveAnimate) animateWave();

  function animateWave() {
      wave.attr('transform','translate(' + waveAnimateScale(wave.attr('T')) + ',0)');
      wave.transition()
          .duration(config.waveAnimateTime * (1 - wave.attr('T')))
          .ease(d3.easeLinear)
          .attr('transform','translate(' + waveAnimateScale(1) + ',0)')
          .attr('T', 1)
          .on('end', function() {
              wave.attr('T', 0);
              if (config.waveAnimate) animateWave(config.waveAnimateTime);
          });
  }

  function GaugeUpdater() {
      this.setWaveAnimate = function(value) {
          // Note: must call update after setting value
          config.waveAnimate = value;
      }
      this.update = function(value) {
          gaugeGroup.selectAll("text.liquidFillGaugeText").transition()
              .duration(config.waveRiseTime)
              .tween("text", function(d) {
                  var that = d3.select(this)
                  var i = d3.interpolateNumber(that.text().replace("%", ""), value);
                  return function(t) { that.text(format(i(t)) + percentText); };
              });

          var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value)) / config.maxValue;
          var waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);
          var waveRiseScale = d3.scaleLinear()
              // The clipping area size is the height of the fill circle + the wave height, so we position
              // the clip wave such that the it will overlap the fill circle at all when at 0%, and will
              // totally cover the fill circle at 100%.
              .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
              .domain([0,1]);
          var newHeight = waveRiseScale(fillPercent);
          var waveScaleX = d3.scaleLinear().range([0, waveClipWidth]).domain([0, 1]);
          var waveScaleY = d3.scaleLinear().range([0, waveHeight]).domain([0, 1]);
          var newClipArea;

          if (config.waveHeightScaling) {
              newClipArea = d3.area()
                  .x(function(d) { return waveScaleX(d.x); } )
                  .y0(function(d) {
                      return waveScaleY(Math.sin(
                          Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI));
                  })
                  .y1(function(d) { return (fillCircleRadius * 2 + waveHeight); });
          } else {
              newClipArea = clipArea;
          }

          var newWavePosition = config.waveAnimate ? waveAnimateScale(1) : 0;
          wave.transition()
              .duration(0)
              .transition()
              .duration(config.waveAnimate ? (config.waveAnimateTime * (1 - wave.attr('T'))) : config.waveRiseTime)
              .ease(d3.easeLinear)
              .attr('d', newClipArea)
              .attr('transform','translate(' + newWavePosition + ',0)')
              .attr('T','1')
              .on("end", function() {
                  if (config.waveAnimate) {
                      wave.attr('transform','translate(' + waveAnimateScale(0) + ',0)');
                      animateWave(config.waveAnimateTime);
                  }
              });

          waveGroup.transition()
              .duration(config.waveRiseTime)
              .attr('transform','translate(' + waveGroupXPosition + ',' + newHeight + ')')
      }
  }

  return new GaugeUpdater();
}

function countUpTween(endValue) {
    const node = d3.select(this);
    const interpolator = d3.interpolateNumber(1, endValue);
  
    return function (time) {
      node.text(`(${Math.round(interpolator(time))})`);
    };
  }
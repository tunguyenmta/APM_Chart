
class APMChart {
    constructor(container,options) {
        this.socket = null;
        this.container = container
        this.width = options?.width ? options.width : d3.select(`#${this.container}`)._groups[0][0].clientWidth > 0 ? d3.select(`#${this.container}`)._groups[0][0].clientWidth : 1500 
        this.height = options?.height ? options.height : d3.select(`#${this.container}`)._groups[0][0].clientHeight > 0 ? d3.select(`#${this.container}`)._groups[0][0].clientHeight : 380 
        this.options = options ? options : {};
        this.serviceList = [];
        this.fatal_services = [];
        this.remove_services = [];
        this.pending_services = [];
        this.slotGroup = Array.from({ length: 20 }, () => ({ list: [] }));
        this.pending_time = this.options.pending_time ? this.options.pending_time : 7000;
        this.fatal_time = this.options.fatal_time ? this.options.fatal_time : 10000;
        this.updatingServices = []
        this.equalizerChild = [];
        this.equalizerChild1 = []
        this.currentValue = 33;
        this.currentValue1 = 33;
        this.stateAnimation = false;
        this.stopTime
        this.activeServices = [];
        this.overriddenServices = [];
        this.isTestMode = options?.isTestMode ? options.isTestMode : false; 
        this.overriddenServices1 = []
    }
    resetChart(){
                this.slotGroup.forEach((slot, index) => {
                    slot.list = []
                    slot.service = ''
                })
                d3.select(`#${this.container}`).selectAll('*').interrupt()
                d3.select('#slot-group').selectAll('.slot-rect').selectAll('g').remove()
                d3.select('#space-ship-g').selectAll('.space-ship-animation').remove()
                d3.selectAll('.left-hole').attr('opacity', '0')
                d3.selectAll('.right-hole').attr('opacity', '0')   
                this.startGeneratingServices([])
                this.updateServiceResponse([])
    }

    setSocket(socket){
        if(this.isTestMode){
            this.socket = socket;
        }
        
    }

    stopAnimation(){

        this.stateAnimation = true;

        this.stopTime = new Date().getTime();
        
    }
    startAnimation(){

        if(this.stopTime > 0){

            if(new Date().getTime() - this.stopTime > 2000){
                this.slotGroup.forEach((slot, index) => {
                    slot.list = []
                    slot.service = ''
                })
                d3.select(`#${this.container}`).selectAll('*').interrupt()
                d3.select('#slot-group').selectAll('.slot-rect').selectAll('g').remove()
                d3.select('#space-ship-g').selectAll('.space-ship-animation').remove()
                d3.selectAll('.left-hole').attr('opacity', '0')
                d3.selectAll('.right-hole').attr('opacity', '0')   
                this.startGeneratingServices([])
                this.updateServiceResponse([])
               
            }
        }
        setTimeout(()=>{
            this.stateAnimation = false;
        }, 500)
    }
    render() {

       if(this.height < 380){
        this.height = 380
       }
        const self = this;
        const svgns = "http://www.w3.org/2000/svg"; // SVG namespace
        const svg = d3.select(`#${this.container}`)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .style('background', "url('./img-db/apm_bg.png')")
            .style('background-size', 'cover')
            .style('background-position', 'center')

        function createSlots(svgContainer, numSlots, slotWidth, slotHeight) {
            

            const slots = [];
            for (let i = 0; i < numSlots; i++) {
                const x = (i % 5) * (slotWidth + 25.7); // Update for actual x position
                let y = Math.floor(i / 5) * (slotHeight + 17); // Update for actual y position
               
                const slotsGroup = document.createElementNS(svgns, 'g');
                slotsGroup.setAttribute('class', 'slot-rect')
                svgContainer.appendChild(slotsGroup);
                const rect = document.createElementNS(svgns, 'rect');
                rect.setAttribute('x', x + self.width - 1020);
                if(Math.floor(i/5) == 0){
                    rect.setAttribute('y', y + 73);
                } else{
                    rect.setAttribute('y', y + 71);
                }
               
                rect.setAttribute('rx', 5);
                rect.setAttribute('ry', 5);
                rect.setAttribute('width', slotWidth);
                rect.setAttribute('height', slotHeight);
                rect.setAttribute('fill', 'transparent');
                rect.setAttribute('opacity', '1');
                if(i % 5 == 2){
                    self.slotGroup[i].x = x + self.width - 1023.7;    
                } 
                else if(i % 5 == 3){
                    self.slotGroup[i].x = x + self.width - 1023;    
                } else if(i % 5 == 4){
                    self.slotGroup[i].x = x + self.width - 1022;
                } else if(i%5 == 0){
                    self.slotGroup[i].x = x + self.width - 1023.5;
                }
                else {
                    self.slotGroup[i].x = x + self.width - 1023;
                }
                if(Math.floor(i/5) == 0){
                    self.slotGroup[i].y = y + 73;
                } else if(Math.floor(i/5) == 1){
                    self.slotGroup[i].y = y + 72.5;
                }
                else if(Math.floor(i/5) == 2){
                    self.slotGroup[i].y = y + 72.3;
                }
                 else{
                    self.slotGroup[i].y = y + 72.7;
                }
                
                self.slotGroup[i].index = i
                self.slotGroup[i].service = '';
                slotsGroup.appendChild(rect);

                slots.push(slotsGroup);
            }
            return slots;
        }
        svg.append('g').attr('class','web-container').append('image')
            .attr('xlink:href', './img-db/WAS_new_1.png')
            .attr('x', this.width - 1100)
            .attr('y', 0)
            .attr('width', 1100)
            .attr('height', this.height);
        // create 20 slots of 200x60 size
        const gSlot = svg.append('g').attr('id', 'slot-group');
        const slots = createSlots(gSlot.node(), 20, 157, 43.5);


        const defs23 = svg.append("defs");
        const filter23 = defs23
            .append("filter")
            .attr("id", 'shadowFilter1')
            .attr("width", '500')
            .attr("height", '500')
            .attr("x", -500 / 2)
            .attr("y", -500 / 2);
        filter23
            .append("feOffset")
            .attr("in", "SourceAlpha")
            .attr("dx", 0)
            .attr("dy", 0);
        filter23
            .append("feGaussianBlur")
            .attr("result", "blurOut")
            .attr("in", "offOut")
            .attr("stdDeviation", 0.5);
        filter23
            .append("feColorMatrix")
            .attr("type", "matrix")
            .attr("values", "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0")
            .attr("in", "blurOut")
            .attr("result", "goo");
        filter23
            .append("feBlend")
            .attr("in", "SourceGraphic")
            .attr("in2", "goo")
            .attr("mode", "normal");
    
            const defs24 = svg.append("defs");
        const gradient24 = defs24
            .append("radialGradient")
            .attr("id", 'radial_orange')
            .attr("cx", '30%')
            .attr("cy", '30%')
            .attr("r", '50%');
        const stop24 = gradient24.append("stop");
        const stop25 = gradient24.append("stop");
        stop24.attr("offset", "0").attr("stop-color", "orange");
        stop25.attr("offset", "1").attr("stop-color", d3.color('orange').darker(0.5));

        const defs20 = svg.append("defs");
        const gradient20 = defs20
            .append("radialGradient")
            .attr("id", 'radial_green')
            .attr("cx", '30%')
            .attr("cy", '30%')
            .attr("r", '50%');
        const stop20 = gradient20.append("stop");
        const stop21 = gradient20.append("stop");
        stop20.attr("offset", "0").attr("stop-color", "#46B29D");
        stop21.attr("offset", "1").attr("stop-color", 'rgb(59, 149, 131)');
      
        const defs21 = svg.append("defs");
        const gradient21 = defs21
            .append("radialGradient")
            .attr("id", 'radial_sky')
            .attr("cx", '30%')
            .attr("cy", '30%')
            .attr("r", '50%');
        const stop22 = gradient21.append("stop");
        const stop23 = gradient21.append("stop");
        stop22.attr("offset", "0").attr("stop-color", "#5CD1E5");
        stop23.attr("offset", "1").attr("stop-color", 'rgb(77, 175, 192)');



const defs12 = svg.append("defs");
        const gradient2 = defs12
            .append("linearGradient")
            .attr("id", "white_blue_gradient")
            .attr("x2", "90%")
            .attr("y2", "10%")
            .attr("gradientTransform", `rotate(${1})`);
        const stop5 = gradient2.append("stop");
        const stop6 = gradient2.append("stop");
        stop5.attr("offset", "0").attr("stop-color", "white");
        stop6.attr("offset", "1").attr("stop-color", d3.color("#526dce").darker(0.5));

const defs16 = svg.append("defs");
        const gradient16 = defs16
            .append("linearGradient")
            .attr("id", "white_orange_gradient")
            .attr("x2", "90%")
            .attr("y2", "10%")
            .attr("gradientTransform", `rotate(${1})`);
        const stop11 = gradient16.append("stop");
        const stop12 = gradient16.append("stop");
        stop11.attr("offset", "0").attr("stop-color", 'white');
        stop12.attr("offset", "1").attr("stop-color", d3.color("#ff8b24").darker(0.5));
        
        const defs17 = svg.append("defs");
        const gradient17 = defs17
            .append("linearGradient")
            .attr("id", "white_red_gradient")
            .attr("x2", "90%")
            .attr("y2", "10%")
            .attr("gradientTransform", `rotate(${1})`);
        const stop13 = gradient17.append("stop");
        const stop14 = gradient17.append("stop");
        stop13.attr("offset", "0").attr("stop-color", 'white');
        stop14.attr("offset", "1").attr("stop-color", d3.color("#d85741").darker(0.5));

        const defs14 = svg.append("defs");
        const gradient14 = defs14
            .append("linearGradient")
            .attr("id", "orangeGradient")
            .attr("x2", "90%")
            .attr("y2", "10%")
            .attr("gradientTransform", `rotate(${10})`);
        const stop7 = gradient14.append("stop");
        const stop8 = gradient14.append("stop");
        stop7.attr("offset", "0").attr("stop-color", d3.color("#ff8b24").brighter(0.5));
        stop8.attr("offset", "1").attr("stop-color", d3.color("#ff8b24").darker(0.5));
      
        const defs15 = svg.append("defs");
        const gradient15 = defs15
            .append("linearGradient")
            .attr("id", "redGradient")
            .attr("x2", "90%")
            .attr("y2", "10%")
            .attr("gradientTransform", `rotate(${10})`);
        const stop9 = gradient15.append("stop");
        const stop10 = gradient15.append("stop");
        stop9.attr("offset", "0").attr("stop-color", "#d85741");
        stop10.attr("offset", "1").attr("stop-color", d3.color("#d85741").darker(0.5));
      


        const defs11 = svg.append("defs");
        const gradient1 = defs11
            .append("linearGradient")
            .attr("id", "blueGradient")
            .attr("x2", "90%")
            .attr("y2", "10%")
            .attr("gradientTransform", `rotate(${10})`);
        const stop3 = gradient1.append("stop");
        const stop4 = gradient1.append("stop");
        stop3.attr("offset", "0").attr("stop-color", "#526dce");
        stop4.attr("offset", "1").attr("stop-color", d3.color("#526dce").darker(0.5));
    
        const defs = svg.append("defs");
        const filter = defs
            .append("filter")
            .attr("id", 'circleBackFilter')
            .attr("width", 500)
            .attr("height", 500)
            .attr("x", -500 / 2)
            .attr("y", -500 / 2);
        const feGaussianBlur = filter
            .append("feGaussianBlur")
            .attr("in", "SourceGraphic")
            .attr("stdDeviation", 3);
            
        const defs1 = svg.append("defs");
        const filter1 = defs1
            .append("filter")
            .attr("id", 'blur1')
            .attr("width", 50)
            .attr("height", 50)
            .attr("x", -50 / 2)
            .attr("y", -50 / 2);
        const feGaussianBlur1 = filter1
            .append("feGaussianBlur")
            .attr("in", "SourceGraphic")
            .attr("stdDeviation", 1);


            const defs13 = svg.append("defs");
        const filter13 = defs13
            .append("filter")
            .attr("id", 'blur3')
            .attr("width", 50)
            .attr("height", 50)
            .attr("x", -50 / 2)
            .attr("y", -50 / 2);
        const feGaussianBlur3 = filter13
            .append("feGaussianBlur")
            .attr("in", "SourceGraphic")
            .attr("stdDeviation", 3);


            const defs10 = svg.append("defs");
        const filter10 = defs10
            .append("filter")
            .attr("id", 'borderBlur')
            .attr("width", 50)
            .attr("height", 50)
            .attr("x", -50 / 2)
            .attr("y", -50 / 2);
        const feGaussianBlur10 = filter10
            .append("feGaussianBlur")
            .attr("in", "SourceGraphic")
            .attr("stdDeviation", 1);

        const defs2 = svg.append("defs");
        const filter2 = defs2
        .append("filter")
            .attr("id", "transferFilter")
            .attr("filterUnits", "userSpaceOnUse")
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", 100)
            .attr("height", 100);
        filter2
            .append("feGaussianBlur")
            .attr("in", "SourceGraphic")
            .attr("stdDeviation", 3);
        const transfer2 = filter2
            .append("feComponentTransfer")
            .attr("result", "cutoff");
        transfer2
            .append("feFuncA")
            .attr("type", "linear")
            .attr("slope", 10)
            .attr("intercept", -5);

           
        const defs3 = svg.append("defs");
        const filter3 = defs3
            .append("filter")
            .attr("id", 'shadowBlackFilter')
            .attr("width", 500)
            .attr("height", 500)
            .attr("x", -500 / 2)
            .attr("y", -500 / 2);
        filter3
            .append("feOffset")
            .attr("in", "SourceAlpha")
            .attr("dx", 1)
            .attr("dy", 1);
        filter3
            .append("feGaussianBlur")
            .attr("result", "blurOut")
            .attr("in", "offOut")
            .attr("stdDeviation", 4);
        filter3
            .append("feBlend")
            .attr("in", "SourceGraphic")
            .attr("in2", "goo")
            .attr("mode", "normal");
     
    
      
        const defs4 = svg.append("defs");
        const filter4 = defs4
            .append("filter")
            .attr("id", 'blackBlur')
            .attr("width", 50)
            .attr("height", 50)
            .attr("x", -50 / 2)
            .attr("y", -50 / 2);
        filter4
            .append("feGaussianBlur")
            .attr("in", "SourceGraphic")
            .attr("stdDeviation", 4);

        const defs5 = svg.append("defs");
        const gradient = defs5
            .append("linearGradient")
            .attr("id", 'black_transparent_gradient')
            .attr("x2", '90%')
            .attr("y2", '10%')
            .attr("gradientTransform", `rotate(${1})`);
        const stop1 = gradient.append("stop");
        const stop2 = gradient.append("stop");
        stop1.attr("offset", "0").attr("stop-color", 'transparent');
        stop2.attr("offset", "1").attr("stop-color", 'black');
       

        const defs6 = svg.append("defs");
        const clipPath = defs6.append("clipPath").attr("id", 'halfClip');
        clipPath
            .append("rect")
            .attr("x", '0')
            .attr("y", '0')
            .attr("width", 500)
            .attr("height", 30)
            .attr("rx", '0')
            .attr("ry", '0');

            
        const defs7 = svg.append("defs");
        const clipPath1 = defs7.append("clipPath").attr("id", 'borderClip');
        clipPath1
            .append("rect")
            .attr("x", '0')
            .attr("y", '0')
            .attr("width", 147)
            .attr("height", 43)
            .attr("rx", '5')
            .attr("ry", '5');

            
        const defs8 = svg.append("defs");
        const filter8 = defs8
            .append("filter")
            .attr("id", 'centerBlur')
            .attr("width", 50)
            .attr("height", 50)
            .attr("x", -50 / 2)
            .attr("y", -50 / 2);
        filter8
            .append("feGaussianBlur")
            .attr("in", "SourceGraphic")
            .attr("stdDeviation", 0.1);
     
        const defs9 = svg.append("defs");
        const filter9 = defs9
            .append("filter")
            .attr("id", 'activeBlur')
            .attr("width", 50)
            .attr("height", 50)
            .attr("x", -50 / 2)
            .attr("y", -50 / 2);
        filter9
            .append("feGaussianBlur")
            .attr("in", "SourceGraphic")
            .attr("stdDeviation", 0.5);

      
        const gSpaceShip = svg.append('g').attr('id', 'space-ship-g').attr('width', '420').attr('height', '350');
for (let i = 0; i < 320 / (26 + 30); i++) {
         const gGroup = gSpaceShip.append('g')
        .attr('transform', `translate(0, ${60 + i * (26 + 15)})`)
        .attr('class', 'space-ship-group')
        let groups = `<g transform="translate(0, 0)" style="opacity: 0">
  <g transform="translate(5, 10)" class="left-hole" opacity="0">
    <g transform="translate(5, 10)" style="transform: rotateY(70deg);">
      <g transform="translate(0, 0)">
        <circle r="13" fill="#5CD1E5" filter="url(#circleBackFilter)" transform="translate(0, 0)"></circle>
      </g>
      <circle r="7" fill="#161616" filter="url(#blur1)" transform="translate(0, 0)"></circle>
    </g>
  </g>
  <g transform="translate(${this.width-1095}, 10)" class="right-hole" opacity="0">
    <g transform="translate(${this.width-1095}, 10)" style="transform: rotateY(70deg);">
      <g transform="translate(0, 0)">
        <circle r="13" fill="#5CD1E5" filter="url(#circleBackFilter)" transform="translate(0, 0)"></circle>
      </g>
      <circle r="7" fill="#161616" filter="url(#blur1)" transform="translate(0, 0)"></circle>
    </g>
  </g>
</g>`;
gGroup.html(groups);

}

        this.createEqualizer()
        this.updateProgressBar()
        return this
    }

    createAnimate(entity, value) {
        const item = entity
            .append("animate")
            .attr("attributeName", value.attributeName)
            .attr("values", value.values)
            .attr("keyTimes", value.keyTimes)
            .attr("dur", value.dur)
            .attr("repeatCount", value.repeatCount)
            .attr("begin", value.begin);
        return item;
    }
    createSVG(entity, values) {
        const item = entity
            .append(values.type)
            .attr("id", values.id)
            .attr("class", values.class)
            .attr("xlink:href", values.href)
            .attr("d", values.geometry)
            .attr("x", values.x)
            .attr("x1", values.x1)
            .attr("x2", values.x2)
            .attr("y", values.y)
            .attr("y1", values.y1)
            .attr("y2", values.y2)
            .attr("cx", values.cx)
            .attr("cy", values.cy)
            .attr("r", values.r)
            .attr("rx", values.rx)
            .attr("ry", values.ry)
            .attr("width", values.width)
            .attr("height", values.height)
            .attr("fill", values.fill)
            .attr("filter", values.filter)
            .attr("clip-path", values.clipPath)
            .attr("stroke", values.stroke)
            .attr("stroke-dasharray", values.strokeDasharray)
            .attr("stroke-width", values.strokeWidth)
            .attr("stroke-linecap", values.strokeLinecap)
            .attr("stroke-linejoin", values.strokeLinejoin)
            .attr("stroke-miterlimit", values.strokeMiterlimit)
            .attr("font-size", values.fontSize)
            .attr("font-weight", values.fontWeight)
            .attr("opacity", values.opacity)
            .attr("fill-opacity", values.fillOpacity)
            .attr("transform", `translate(${values.translate ? values.translate.x : 0}, ${values.translate ? values.translate.y : 0})`);
        if (values.type === "text") {
            item.text(values.text);
        }
        return item;
    }
    getRandomNumber = function (max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

asyncAnimationTransform(entity, x, y, time = 200, service, callback = () => { }) {

                if (!entity)
                    return;
                let transition = entity
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(
                        time
                    )
                    .attr("transform", `translate(${x},${y})`)
                    .on('start', ()=>{
                        if(service.state == 'response'){
                            this.removeSlotService(service)
                            d3.select(entity.node().parentNode).select('g').select('.right-hole').transition().duration(50).attr('opacity','1')
                        } else {
                            d3.select(entity.node().parentNode).select('g').select('.left-hole').transition().duration(50).attr('opacity','1')
                        }
                        
                    })
                    .on("end", () => {
                        d3.select(entity.node().parentNode).select('g').select('.left-hole').transition().duration(50).attr('opacity','0')
                        d3.select(entity.node().parentNode).select('g').select('.right-hole').transition().duration(50).attr('opacity','0')
                        entity.transition().duration(10).remove();
                      
                        if(service.state == 'response'){

                        } else{
                            this.performAction(service)
                        }
                        
                    });
                    transition.tween('progress', function(){
                        return function(t){
                            if(service.state == 'response'){
                                if(t >= .3){
                                    d3.select(entity.node().parentNode).select('g').select('.left-hole').transition().duration(50).attr('opacity','1')
                                } 
                                if(t >= .5){
                                    if(d3.select(entity.node().parentNode).selectAll('g').size() < 10){
                                        d3.select(entity.node().parentNode).select('g').select('.right-hole').transition().duration(50).attr('opacity','0')
                                    }
                                }
                            } else{
                                if(t >= .3){
                                    d3.select(entity.node().parentNode).select('g').select('.right-hole').transition().duration(50).attr('opacity','1')
                                }
                                if(t >= .5){
                                    if(d3.select(entity.node().parentNode).selectAll('g').size() < 10){
                                        d3.select(entity.node().parentNode).select('g').select('.left-hole').transition().duration(50).attr('opacity','0')
                                    }
                                }
                            }
                            
                        }
                    })

         
    }

    animationCraft(service, group) {
const resultX = service.state === 'response'
    ? -50
    : this.width - 1075;
this.asyncAnimationTransform(group, resultX, 5, service.state == 'response' ? service.clientRecievedAt- service.serverCreatedAt : service.serverCreatedAt-service.createdAt, service, () => {

    
    
});
}
    createCraft(service) {
        const resultX = service.state == 'response'
            ? this.width - 1075
            : -50;
        const titleX = service.state == 'response' ? 35 : -45;
        let length = d3.select('#space-ship-g').selectAll('.space-ship-group').size();
        let randomIndex = Math.floor(Math.random() * length);
        let groupsChosen = d3.select('#space-ship-g').selectAll('.space-ship-group').filter((d, i) => i == randomIndex)  
        groupsChosen.select('g').transition().duration(200).style('opacity', '1')
        this.slowAction(groupsChosen, service);
        
   
    }
    slowAction(group, service) {
        service.state === 'response'
            ? this.createTransactionAnimationToLeft(group, {
                x: this.width - 1075,
                y: 5,
            }, service)
            : this.createTransactionAnimationToRight(group, {
                x: -50,
                y: 5,
            }, service);
    
    }

    createTransactionAnimationToRight(group, position, service) {
        
        const titleX = service.state == 'response' ? 5 : -5;
        const animationGroup = this.createGroup(group, position).attr('class', 'space-ship-animation')
      
            const title = this.createSVG(animationGroup, {
                type: 'text',
                text: service.name,
                fill: 'white',
                fontSize: 9,
                opacity: 0.7,
                translate: { x: titleX, y: 0 },
            });
            this.setIcon(animationGroup, './img-db/img_spaceship_br.png', { x: 50, y: -8 }, 20, 20);
            const group1 = this.createGroup(animationGroup).attr("filter", "url(#transferFilter)")
            this.animationCraft(service, animationGroup);
            for (let index = 0; index < 10; index++) {
                const startTime = index / 10;
                this.setAnimateCircle(group1, "#46B29D", 45, 5, 4, startTime, startTime, this.getRandomNumber(-80, -40), 2, 0);
            }
            for (let index = 0; index < 10; index++) {
                const startTime = index / 10;
                this.setAnimateCircle(group1, "#4374D9", 45, 5, 4, startTime, startTime, this.getRandomNumber(0, -60), 2, 0);
            }
            for (let index = 0; index < 10; index++) {
                const startTime = index / 10;
                this.setAnimateCircle(group1, d3.color("#4374D9").brighter(3), 48, 5, 4, startTime, 0.7, 40, 2, 2);
            }
         
       
    }
    createTransactionAnimationToLeft(group, position, service) {
        const titleX = service.state == 'response' ? 25 : -5;
        const animationGroup = this.createGroup(group, position).attr('class', 'space-ship-animation')
        const title = this.createSVG(animationGroup, {
            type: 'text',
            text: service.name,
            fill: 'white',
            fontSize: 9,
            opacity: 0.7,
            translate: { x: titleX, y: 0 },
        });
        this.setIcon(animationGroup, './img-db/img_spaceship_gl.png', { x: 0, y: -8 }, 20, 20);
        const group1 = this.createGroup(animationGroup).attr("filter", "url(#transferFilter)")
        this.animationCraft(service, animationGroup);
        for (let index = 0; index < 10; index++) {
            const startTime = index / 10;
            this.setAnimateCircle(group1,"#4374D9", 23, 5, 4, startTime, startTime, this.getRandomNumber(80, 100), 2, 0);
        }
        for (let index = 0; index < 10; index++) {
            const startTime = index / 10;
            this.setAnimateCircle(group1, "#46B29D", 23, 5, 4, startTime, startTime, this.getRandomNumber(60, 80), 2, 0);
        }
        for (let index = 0; index < 10; index++) {
            const startTime = index / 10;
            this.setAnimateCircle(group1, d3.color("#46B29D").brighter(3), 23, 5, 4, startTime, 0.7, this.getRandomNumber(25, 40), 2, 2);
        }
    }

    setAnimateCircle(group1, color, cx, cy, r, cxBegin, rEnd, cxEnd, r2, r3) {
        const circle = this.createSVG(group1, {
            type: "circle",
            cx: cx,
            cy: cy,
            r: r,
            fill: color,
        })
        this.createAnimate(circle, {
            attributeName: "cx",
            values: `${cx};${cxEnd}`,
            keyTimes: "0;1",
            dur: "1s",
            repeatCount: "indefinite",
            begin: cxBegin,
        });
        this.createAnimate(circle, {
            attributeName: "r",
            values: `${r};${r2};${r3}`,
            keyTimes: `0;${rEnd};1`,
            dur: "1s",
            repeatCount: "indefinite",
            begin: cxBegin,
        });
    }

    setIcon(canvas, address, position = { x: 0, y: 0 }, width = 25, height = 25) {
        if (address == null)
            return;
        return this.createSVG(canvas, {
            type: "image",
            href: address,
            width: width,
            height: height,
            x: position.x,
            y: position.y,
        });
    }

     createFeTransfer(entity, name, width = 100, height = 100, stdDeviation = 3) {
        const defs = entity.append("defs");
        const filter = defs
            .append("filter")
            .attr("id", name)
            .attr("filterUnits", "userSpaceOnUse")
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", width)
            .attr("height", height);
        filter
            .append("feGaussianBlur")
            .attr("in", "SourceGraphic")
            .attr("stdDeviation", stdDeviation);
        const transfer = filter
            .append("feComponentTransfer")
            .attr("result", "cutoff");
        transfer
            .append("feFuncA")
            .attr("type", "linear")
            .attr("slope", 10)
            .attr("intercept", -5);
    }

    createGroup(entity, position = { x: 0, y: 0 }, name) {
        const group = entity
            .append("g")
            .attr("transform", `translate(${position.x}, ${position.y})`);
        group.attr("id", name);
        return group;
    }
    getGeometry(width, height) {
        return `M0 0 L${width} 0 L${width / 2} ${height} Z`;
    }
    crateLight(group, width, height, x, y, rotate, filter = "centerBlur") {
        const item = this.createSVG(group, {
            type: 'path',
            geometry: this.getGeometry(width, height),
            fill: 'white',
            filter: `url(#${filter})`,
        });
        item.attr("transform", `translate(${x} ${y}) rotate(${rotate})`);
        return item;
    }
    createPin(group, width, height) {
        const pinData = [
            { x: 4, y: 3 },
            { x: width - 4, y: 3 },
            { x: 4, y: height - 3 },
            { x: width - 4, y: height - 3 },
        ];
        pinData.forEach((d) => {
            this.createSVG(group, {
                type: 'circle',
                r: 0.5,
                fill: "#EAEAEA",
                translate: { x: d.x, y: d.y },
            });
        });
    }
    setTextShadow(entity) {
        entity.style("text-shadow", "3px 3px 5px black");
    }

    animationAttr1(entity, key, value, time = 200, ease = d3.easeLinear) {
        if (!entity)
            return;
        entity.transition().ease(ease).duration(time).attr(key, value);
       
    }

    animationAttr2(entity, key, value, time = 200, ease = d3.easeLinear, type, service) {
        if (!entity)
            return;
            if(service[0]){
                if(value == 0){
                
                        entity.transition().ease(ease).duration(time).attr(key, value).on('end', ()=>{
                            d3.select(entity.node().parentNode).selectAll('g').remove()
                            d3.select(entity.node().parentNode).selectAll('.remove-animation').remove()
                    })
                
                    
                } else{
                    if(entity.node()){ 

                        // d3.select(entity.node().parentNode).interrupt()
                        entity.transition().ease(ease).duration(time).attr(key, value)
                    }
                    
                
                }
            } else{
                if(entity.node()){ 
                    // d3.select(entity.node().parentNode).interrupt()
                    entity.transition().ease(ease).duration(time).attr(key, value).on('end', ()=>{
                    
                    })    
                }
            }
     
    }

 

    // animationAttr(entity, key, value, time = 200, ease = d3.easeLinear, type, service) {
    //     if (!entity)
    //         return;
    //     if(service.state == 'response'){
            
    //             entity.transition().ease(ease).duration(time).attr(key, value).on('interrupt', ()=>{
    //                 if(!this.overriddenServices.find(item=>item.requestID == service.requestID)){
    //                     this.overriddenServices.push(service)
    //                 }
    //             })
                
    //     } else if(service.state == 'new'){
    //             entity.transition().ease(ease).duration(time).attr(key, value).on('interrupt', ()=>{
    //             })
    //     }
    //     if(!Array.isArray(service)){
    //         if(type == 'remove' && value == '0'){
    //             entity.transition().ease(ease).duration(time).attr(key, value).on('end', ()=>{
                    
    //             if(this.slotGroup.find(slot => slot.service == service.name)){
    //                 this.slotGroup.find(slot => slot.service == service.name).list = this.slotGroup.find(slot => slot.service == service.name).list.filter(item => item.id !== service.requestID);
    //                 if(this.overriddenServices.length > 0){
    //                     this.overriddenServices.forEach((d,i)=>{
    //                         this.slotGroup.find(slot => slot.service == service.name).list =this.slotGroup.find(slot => slot.service == service.name).list.filter(item => item.id !== d.requestID);
    //                     })
                        
    //                     this.overriddenServices = []
    //                 }
                    
                 
                  
    //                 if(this.slotGroup.find(slot => slot.service == service.name).list.length <= 0){
    //                     if(d3.select(entity.node().parentNode).attr('class') == 'counter'){
    //                         d3.select(entity.node().parentNode.parentNode).selectAll('g').remove()
    //                     } else{
    //                         d3.select(entity.node().parentNode).selectAll('g').remove()
    //                     }
                        
    //                     this.slotGroup.find(slot => slot.service == service.name).service = ''
    //                 } else if(this.slotGroup.find(slot => slot.service == service.name).list.length < 2){
    //                     if(d3.select(entity.node().parentNode).attr('class') == 'counter'){
    //                         d3.select(entity.node().parentNode.remove())
    //                     } else{
    //                         d3.select(entity.node().parentNode).select('.counter').remove()
    //                     }
                        
    //                 } else {
    //                     if( d3.select(entity.node().parentNode).attr('class') =='counter'){
    //                         d3.select(entity.node().parentNode).select('text').text(this.slotGroup.find(slot => slot.service == service.name).list.length)
    //                     } 
                        
                        
    //                 }
    //              this.updatingServices = this.updatingServices.filter(item => item.requestID != service.requestID);
    //              if(this.isTestMode){
    //                 this.socket?.send(JSON.stringify({
    //                     data: this.slotGroup.flatMap(slot => slot.list),   
    //                     updatingServices: this.updatingServices
    //                 }))
    //              }
                    
    //             } else{
    //                 return
    //             }

             
                  
    //         })
          
    //     }  
    //     else if(type != 'none'  && value == '0') {
    //         entity.transition().ease(ease).duration(time).attr(key, value).on('end', ()=>{
    //           if(this.isTestMode){
    //             this.socket?.send(JSON.stringify({
    //                 data: this.slotGroup.flatMap(slot => slot.list),   
    //                 updatingServices: this.updatingServices
    //             }))
    //           }
                
                
    //         })
            
    //     } 
    //     else{

    //         entity.transition().ease(ease).duration(time).attr(key, value).on('end',()=>{
    //               d3.select(entity.node().parentNode).selectAll('.remove-animation').remove()
    //             if(this.overriddenServices.length > 0){
    //                 this.overriddenServices.forEach((d,i)=>{
    //                     if(this.slotGroup.find(slot => slot.service == service.name)){
    //                         this.slotGroup.find(slot => slot.service == service.name).list =this.slotGroup.find(slot => slot.service == service.name)?.list.filter(item => item.id !== d.requestID);
    //                     }
                        
    //                 })
    //                 this.overriddenServices = []
    //             }
                
    //             if(entity.node().parentNode && d3.select(entity.node().parentNode).attr('class') == 'counter' && this.slotGroup.find(slot => slot.service == service.name)?.list.length > 1){
    //                 d3.select(entity.node().parentNode).select('text').text(this.slotGroup.find(slot => slot.service == service.name)?.list.length)
    //             }

    //             // d3.select(entity.node().parentNode).select('.counter').select('text').text(this.slotGroup.find(slot => slot.service == service.name)?.list.length)
    //             if(this.isTestMode){
    //                 this.socket?.send(JSON.stringify({
    //                     data: this.slotGroup.flatMap(slot => slot.list),
    //                     updatingServices: this.updatingServices
    //                 }))
    //             }
                
    //         })
    //     }
    //     }    
    // }
    animationAttr(entity, key, value, time = 200, ease = d3.easeLinear, type, service) {
        if(!entity)
            return;
        entity.transition().ease(ease).duration(time).attr(key, value)
    }
    animationAttr3(entity, key, value, time = 200, ease = d3.easeLinear, type, service) {
        if (!entity)
            return;
        if(service.state == 'response'){
                entity.transition().ease(ease).duration(time).attr(key, value).on('interrupt', ()=>{
                    if(!this.overriddenServices.find(item=>item.requestID == service.requestID)){
                        this.overriddenServices.push(service)
                    }
                })
        } 
        if(!Array.isArray(service)){
            if(type == 'remove' && value == 1){
                entity.transition().ease(ease).duration(time).attr(key, value).on('start', ()=>{
                    if(this.overriddenServices.length>0){
                        this.overriddenServices.forEach((d,i)=>{
                            this.pending_services = this.pending_services.filter(item => item.id !== d.requestID);
                            this.fatal_services = this.fatal_services.filter(item => item.id !== d.requestID);
                            this.remove_services = this.remove_services.filter(item => item.id !== d.requestID);
                            if(this.slotGroup.find(slot => slot.service == service.name)){
                                this.slotGroup.find(slot => slot.service == service.name).list =this.slotGroup.find(slot => slot.service == service.name).list.filter(item => item.id !== d.requestID);
                                
                            }
                        })
                        this.overriddenServices = this.overriddenServices.filter(item => {
        
                            return item.name != service.name}) 

                    }
                    let count = this.slotGroup.find(slot => slot.service == service.name).list.length
                    this.slotGroup.find(slot => slot.service == service.name).list = this.slotGroup.find(slot => slot.service == service.name).list.filter(item => item.id != service.requestID)
                    this.pending_services = this.pending_services.filter(item => item.id !== service.requestID);
                    this.fatal_services = this.fatal_services.filter(item => item.id !== service.requestID);
                    this.remove_services = this.remove_services.filter(item => item.id !== service.requestID);
                    if(count == 0){
                        let temp = d3.select(d3.selectAll('.name-rect').filter(function(d,i){
                            return d3.select(this).text() == service.name   
                        }).node().parentNode.parentNode)
                        let matchingSlot = this.slotGroup.find(slot => slot.service == service.name)
                        let groupX = matchingSlot.x
                        let groupY = matchingSlot.y

                        let activeGroup = d3.select(d3.selectAll('.name-rect').filter(function(d,i){
                            return d3.select(this).text() == service.name   
                        }).node().parentNode.parentNode).select('.active-group')
                        d3.select(d3.selectAll('.name-rect').filter(function(d,i){
                            return d3.select(this).text() == service.name   
                        }).node().parentNode.parentNode).select('.groupDrawing').attr('on-removing', 1)
                        const animationGroup = this.createGroup(temp).attr('class', 'remove-animation');
                        this.activeAnimation(animationGroup, { x: groupX + 32, y:groupY + 10 });
                        this.activeAnimation(animationGroup, { x: groupX + 120,y:groupY + 44 });

                        activeGroup.attr('opacity', 0)
                        animationGroup.attr('opacity', 0)
                        activeGroup.transition().ease(d3.easeLinear).duration(500).attr('opacity', 1)
                        animationGroup.transition().ease(d3.easeLinear).duration(500).attr('opacity', 1)
                        temp.select('.groupDrawing').attr('on-removing', 0)
                        if(temp.select('.counter').size()){
                            temp.select('.counter').select('g').transition().duration(500).attr('opacity', 0)
                        }
                 
                        temp.select('.groupDrawing').transition().duration(500).attr('opacity', 0)
                        // setTimeout(()=>{
                        //     temp.selectAll('g').remove()
                        //     this.slotGroup.find(slot => slot.service == service.name).service = ''
                        // }, 500)
                        this.slotGroup.find(slot => slot.service == service.name).service = ''
                        temp.selectAll('g').remove()
                        this.updatingServices = this.updatingServices.filter(item => item.requestID != service.requestID);
             
                    } 
                    else if(count == 1 ){
                        d3.select(entity.node().parentNode).select('g').attr('opacity', 0)  
                        setTimeout(()=>{
                            d3.select(entity.node().parentNode).remove()
                        }, 1000)

                    }
                    else if(count > 1){
                        if( d3.select(entity.node().parentNode).attr('class') == 'counter'){
                            d3.select(entity.node().parentNode).select('text').text(this.slotGroup.find(slot => slot.service == service.name).list.length)
                        }
                    }
                    this.updatingServices = this.updatingServices.filter(item => item.requestID != service.requestID);
                    this.updateStateColor(this.pending_services, this.fatal_services, this.remove_services, [...this.slotGroup])
                    if(this.isTestMode){
                        this.socket?.send(JSON.stringify({
                            data: this.slotGroup.flatMap(slot => slot.list),
                            updatingServices: this.updatingServices
                        }))
                    }
                    
                })
               
            } 
            else if(type == 'delete' && value == '0'){
                
                entity.transition().ease(ease).duration(time).attr(key, value).on('start', ()=>{
                    if(d3.select(entity.node().parentNode).select('.counting-animation').size()){
                        if(d3.select(entity.node().parentNode).attr('class') == 'counter'){
                            d3.select(entity.node().parentNode).attr('opacity', 0)
                        }
                        d3.select(entity.node().parentNode).select('.counting-animation').attr('opacity', 0)
                        d3.select(entity.node().parentNode).select('.counting-animation').interrupt()
                    }
                }).on('end', ()=>{
                    if(d3.select(entity.node().parentNode).select('.counting-animation').size()){
                        if(d3.select(entity.node().parentNode).attr('class') == 'counter'){
                            d3.select(entity.node().parentNode).attr('opacity', 0)
                        }
                        d3.select(entity.node().parentNode).select('.counting-animation').attr('opacity', 0).remove()
                        d3.select(entity.node().parentNode).select('.counting-animation').interrupt()
                        let tempArr = this.slotGroup.find(slot => slot.service == service.name).list.filter(item=>{
                            return item.id != service.requestID
                        })
                        // console.log('1', entity.node().parentNode, service.name)
                        d3.select(entity.node().parentNode).selectAll('g').remove()
                        d3.select(entity.node().parentNode).selectAll('.remove-animation').remove()
                        this.slotGroup.find(slot => slot.service == service.name).list = []
                        this.slotGroup.find(slot => slot.service == service.name).service = ''
                        if(tempArr.length > 0){
                            tempArr.forEach((d,i)=>{
                                this.performAction(d)
                            })
                        }
                        
                    }
                    else {
                        // console.log('2', entity.node(), service.name)
                        d3.select(entity.node().parentNode).selectAll('g').remove()
                        d3.select(entity.node().parentNode).selectAll('.remove-animation').remove()
                        if(this.slotGroup.find(slot => slot.service == service.name)){
                            this.slotGroup.find(slot => slot.service == service.name).list = []
                            this.slotGroup.find(slot => slot.service == service.name).service = ''
                        } else {
                            // console.log('3', service.name, service.requestID)
                            this.slotGroup.flatMap(slot=>slot.list).filter(item => item.name != service.name)
                            this.slotGroup.filter(slot => slot.service != service.name)
                        }
                    }
                   
                    this.updatingServices = this.updatingServices.filter(item => item.requestID != service.requestID);
                    this.pending_services = this.pending_services.filter(item => item.id !== service.requestID);
                    this.fatal_services = this.fatal_services.filter(item => item.id !== service.requestID);
                    this.remove_services = this.remove_services.filter(item => item.id !== service.requestID);
                    this.updateStateColor(this.pending_services, this.fatal_services, this.remove_services, [...this.slotGroup])

                    if(this.isTestMode){
                        this.socket?.send(JSON.stringify({
                            data: this.slotGroup.flatMap(slot => slot.list),
                            updatingServices: this.updatingServices
                        }))
                    }
                    
                })
          
            } 
           

    }
}


    startGeneratingServices = function(data)  {
        // Generate new services by the client at a regular interval
        this.serviceList.push(...data)
        d3.select('.web-container').raise()
        d3.select('#slot-group').raise()
        if(!this.stateAnimation){
            for (let i = 0; i < data.length; i++) {
             
                this.createService(data[i]);
            }
            return this
        }
       
      
       
    }

    createService = function(service) {
        this.createCraft(service)
        
    }

    updateStateInterval(dataPending, dataError, dataRemove) {
            this.pending_services = dataPending
            this.fatal_services = dataError
            this.remove_services = dataRemove
            if(dataRemove?.length > 0){
                this.remove_services = dataRemove
            }
            if(!this.stateAnimation){
                this.updateStateColor(this.pending_services, this.fatal_services, this.remove_services, [...this.slotGroup])
   
            } else{
                if(new Date().getTime() - this.stopTime > this.fatal_time){
                    d3.select('#space-ship-g').selectAll('.space-ship-group').selectAll('.space-ship-animation').remove()
                    this.serviceList = []
                    this.updatingServices = []
                    this.slotGroup.forEach((slot,i)=>{
                        slot.list = []
                        slot.service = ''
                    })
                    d3.select('#slot-group').selectAll('.slot-rect').each(function(d,i){
                        
                        if(d3.select(this).selectAll('g').size() > 0){
                            d3.select(this).selectAll('g').remove()
                        }
                        
                    })
                }
            }
        //  });
        
    }

    updateStateColor(dataPending, dataError, dataRemove, slotGroup){

        slotGroup.forEach((slot,i)=>{
            if(slot.service != ''){
                 if(!(dataPending?.find(service=>{
                    return service.name == slot.service
                })) && !(dataError?.find(service=>{
                    return service.name == slot.service
                })) && !(dataRemove?.find(service=>{
                    return service.name == slot.service
                }))){
                    
                    if(d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    })?.select('.groupDrawing')?.selectAll('rect').filter((d,i)=> i == 0).size() > 0 && d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    })?.select('.groupDrawing')?.selectAll('rect').filter((d,i)=> i == 0)?.attr('fill') == "url('#white_red_gradient')"){
                        return
                    }
                     let rectChosen = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.groupDrawing').selectAll('rect').filter((d,i)=> i == 0)
                    this.animationAttr1(rectChosen, 'fill', 'url("#white_blue_gradient")', 200)
                    let rectBackground = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.groupDrawing').selectAll('rect').filter((d,i)=> i == 1)
                    this.animationAttr1(rectBackground, 'fill', 'url("#blueGradient")', 200)
                    let rectBackgroundBlur = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.groupDrawing').selectAll('rect').filter((d,i)=> i == 2)
                    this.animationAttr1(rectBackgroundBlur, 'fill', d3.color('#526dce').darker(1), 200)
                    if(d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.counter').size()>0){
                        let rect = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                            return ind == i
                        }).select('.counter').selectAll('rect').filter((d,i)=> i == 2)
                        let rectNotiLayout = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                            return ind == i
                        }).select('.counter').selectAll('rect').filter((d,i)=> i == 1)
                        this.animationAttr1(rect, 'fill', d3.color('#4374D9').darker(1), 200)
                        this.animationAttr1(rectNotiLayout, 'fill', d3.color('#4374D9').darker(2), 200)
                    }
                } 
                else if((dataPending?.find(service=>{
                    return service.name == slot.service
                })) && !(dataError?.find(service=>{
                    return service.name == slot.service
                })) && !(dataRemove?.find(service=>{
                    return service.name == slot.service
                }))){
                    if(d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    })?.select('.groupDrawing')?.selectAll('rect').filter((d,i)=> i == 0).size() > 0 && d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    })?.select('.groupDrawing')?.selectAll('rect').filter((d,i)=> i == 0)?.attr('fill') == "url('#white_red_gradient')"){
                        return
                    }
                    let rectChosen = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.groupDrawing').selectAll('rect').filter((d,i)=> i == 0)
                    
                    this.animationAttr1(rectChosen, 'fill', 'url("#white_orange_gradient")', 200)
                    let rectBackground = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.groupDrawing').selectAll('rect').filter((d,i)=> i == 1)

                    this.animationAttr1(rectBackground, 'fill', 'url("#orangeGradient")', 200)
                    let rectBackgroundBlur = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.groupDrawing').selectAll('rect').filter((d,i)=> i == 2)
                    this.animationAttr1(rectBackgroundBlur, 'fill', d3.color('#ff8b24').darker(1), 200)
                    if(d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.counter').size()>0){
                        let rect = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                            return ind == i
                        }).select('.counter').selectAll('rect').filter((d,i)=> i == 2)
                        let rectNotiLayout = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                            return ind == i
                        }).select('.counter').selectAll('rect').filter((d,i)=> i == 1)
                        this.animationAttr1(rect, 'fill', d3.color('#ff8b24').darker(1), 200)
                        this.animationAttr1(rectNotiLayout, 'fill', d3.color('#ff8b24').darker(2), 200)
                    }

                } 
                else if((dataError?.find(service=>{
                    return service.name == slot.service
                })) && !(dataRemove?.find(service=>{
                    return service.name == slot.service
                }))){
                    this.fatal_services.push([...slot.list.filter(item=>{
                        return new Date().getTime() - item.serverCreatedAt > this.fatal_time
                    })])
                
                    let rectChosen =  d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.groupDrawing').selectAll('rect').filter((d,i)=> i == 0) 
                    this.animationAttr1(rectChosen, 'fill', 'url("#white_red_gradient")', 200)
                    let rectBackground = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.groupDrawing').selectAll('rect').filter((d,i)=> i == 1)
                      
                    this.animationAttr1(rectBackground, 'fill', 'url("#redGradient")', 200)
                 
                    let rectBackgroundBlur =  d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.groupDrawing').selectAll('rect').filter((d,i)=> i == 2)
                    this.animationAttr1(rectBackgroundBlur, 'fill', d3.color('#d85741').darker(1), 200)
                    if(d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.counter').size()>0){
                        let rect = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                            return ind == i
                        }).select('.counter').selectAll('rect').filter((d,i)=> i == 2)
                        let rectNotiLayout = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                            return ind == i
                        }).select('.counter').selectAll('rect').filter((d,i)=> i == 1)
                        this.animationAttr1(rect, 'fill', d3.color('#d85741').darker(1), 200)
                        this.animationAttr1(rectNotiLayout, 'fill', d3.color('#d85741').darker(2), 200)
                    }
                } 
                else if(dataRemove?.find(service=>{
                    return service.name == slot.service
                }))
                {  
                    let rectChosen =  d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.groupDrawing').selectAll('rect').filter((d,i)=> i == 0) 
                    this.animationAttr1(rectChosen, 'fill', 'url("#white_red_gradient")', 200)
                    let rectBackground = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.groupDrawing').selectAll('rect').filter((d,i)=> i == 1)
                      
                    this.animationAttr1(rectBackground, 'fill', 'url("#redGradient")', 200)
                 
                    let rectBackgroundBlur =  d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.groupDrawing').selectAll('rect').filter((d,i)=> i == 2)
                    this.animationAttr1(rectBackgroundBlur, 'fill', d3.color('#d85741').darker(1), 200)
                    if(d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).attr('class').split(' ').length > 1){
                        d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                            return ind == i
                        }).select('.active-group').interrupt()
                        return
                    }
                    let textChosen =  d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.groupDrawing').select('text')
                    this.animationAttr1(textChosen, 'fill', 'url("#redGradient")', 200)
                    let counterChosen =  d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.counter').selectAll('rect')
                    this.animationAttr1(counterChosen, 'fill', 'url("#redGradient")', 200)
                    let temp = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    })
                    let gGroupChosen = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                        return ind == i
                    }).select('.active-group')
                        
                    const animationGroup = this.createGroup(temp).attr('class', 'remove-animation');   
        
                this.showActive1(gGroupChosen, animationGroup, 'delete', []);
                let fatalSlot = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                    return ind == i
                }).select('.groupDrawing')
         
                d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                    return ind == i
                }).attr('class', 'slot-rect isFatalAnimating')
                let fatalCounter = d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                    return ind == i
                }).select('.counter')
        
               
                
                
                this.updatingServices = this.updatingServices.filter(item => item.name != slot.list[0]?.name);
            
                    let groupAnimation =  d3.select('#space-ship-g').selectAll('.space-ship-animation')
                    // groupAnimation.interrupt();
                    groupAnimation.each(function(d,i){
                        if(d3.select(this).select('text').text() == slot.list[0]?.name){
                            d3.select(d3.select(this).node().parentNode).select('.left-hole').interrupt().attr('opacity', 0)
                            d3.select(d3.select(this).node().parentNode).select('.right-hole').interrupt().attr('opacity', 0)
                       
                            d3.select(this).interrupt().remove()

                        }
                    })
                    this.remove_services = this.remove_services.filter(item => {
                        return item.name != slot.list[0]?.name})
            
                   
                    setTimeout(() =>{
    
                        d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                            return ind == i
                        }).selectAll('g').remove()
                        d3.select('#slot-group').selectAll('.slot-rect').filter((d,ind)=>{
                            return ind == i
                        }).attr('class', 'slot-rect')
                        this.remove_services = this.remove_services.filter(item => item.name != slot.list[0]?.name)
                        this.slotGroup.find((slot,ind) => ind == i).list = []
                        this.slotGroup.find((slot,ind) => ind == i).service = ''
                        if(this.isTestMode){
                            this.socket?.send(JSON.stringify({
                                data: this.slotGroup.flatMap(slot => slot.list),
                                updatingServices: this.updatingServices
                            }))
                        }
                       
                    }, 1000)
                    
                
        }}

    })
    }

    updateServiceResponse = function(data) {
        if(!this.stateAnimation){
            this.updateSlotGroupStates(data);
        }
        return this
    }

    updateSlotGroupStates(data) {
    data.forEach(service => {
        this.returnService(service)
      
    });


}

returnService(service) {    
        this.createCraft(service)
        this.updatingServices.push(service)
        if(this.isTestMode){
            this.socket?.send(JSON.stringify({
                data: this.slotGroup.flatMap(slot => slot.list),
                updatingServices: this.updatingServices
            }))
        }
        

}
    removeSlotService(service) {
        let index = -1
        const matchingSlot = this.slotGroup.find((slot,i) =>{

            index = i
            return slot.service == service.name});
        if(!matchingSlot){
            return
        }

        const groupX = matchingSlot?.x;
        const groupY = matchingSlot?.y;
        let temp = d3.select('#slot-group').selectAll(`.slot-rect`).filter(function(d,i){ return i == index})

        let gGroupChosen = d3.select('#slot-group').selectAll(`.slot-rect`).filter(function(d,i){ return i == index}).select('.active-group')
        if(gGroupChosen.node() && d3.select(gGroupChosen.node().parentNode)){
            if(this.slotGroup.find(slot => slot.service == service.name).list.length <= 1){
                d3.select(gGroupChosen.node().parentNode).select('.groupDrawing').attr('on-removing', 1)
                const animationGroup = this.createGroup(temp).attr('class', 'remove-animation');
            // if(d3.select(gGroupChosen.node().parentNode).attr('class').split(' ').length < 2){
                this.activeAnimation(animationGroup, { x: groupX + 32, y:groupY + 10 });
                this.activeAnimation(animationGroup, { x: groupX + 120,y:groupY + 44 });
            // }
            
            gGroupChosen.attr("opacity", 0);
            animationGroup.attr("opacity", 0);    
            this.showActive3(gGroupChosen, animationGroup, 'delete', service);
            } 
            else{ 
                const headerAnimationGroup = temp.select('.counting-animation')
                if(d3.select(headerAnimationGroup.node()).attr('class') == 'counting-animation'){

                    this.activeAnimation(headerAnimationGroup, { x: 2, y: 2 });
                    this.activeAnimation(headerAnimationGroup, { x: 25, y: 15 });
                    this.playHeaderAnimation1(headerAnimationGroup, service);
                }
               
            }         
        }
    }

    showActive3(activeGroup, animationGroup, type, service) {
          this.animationAttr3(activeGroup, "opacity", 1, 500,d3.easeLinear,type, service);
          this.animationAttr3(animationGroup, "opacity", 1, 500, d3.easeLinear,'none', service);
          d3.select(activeGroup.node().parentNode).select('.groupDrawing').transition().duration(500).attr('opacity', 0)
      rxjs.timer(500).subscribe((d) => {
          this.animationAttr3(activeGroup, "opacity", 0, 500, d3.easeLinear,type, service);
          this.animationAttr3(animationGroup, "opacity", 0, 500, d3.easeLinear,'none', service);
      });

  }

    playHeaderAnimation1(animationGroup, service) {
        d3.select(animationGroup.node().parentNode).select('text').attr('opacity', 0)
        // animationGroup.attr("opacity", 0);
        this.animationAttr3(animationGroup, 'opacity', 1, 500, d3.easeLinear, 'remove',service);
        
        rxjs.timer(500).subscribe(d => {
            d3.select(animationGroup.node().parentNode).select('text').transition().duration(500).attr('opacity', 1)
            this.animationAttr3(animationGroup, 'opacity', 0, 500,  d3.easeLinear, 'remove', service);
           
        });
    }

    performAction(service) {
        let index = 0
        let matchingSlot = this.slotGroup.find((slot,i) =>{
            if(slot.service == service.name){ index = i}
            return slot.service == service.name}
        );
        let gSlotGroup = d3.select('#slot-group').selectAll(`.slot-rect`)
      
        
        let gGroupChosen
        let groupX = 0, groupY = 0;
        if(matchingSlot){
            groupX = matchingSlot.x;
            groupY = matchingSlot.y;
            gGroupChosen = gSlotGroup.filter(function(d,i){
                return i == index
            })
            matchingSlot.list.push({...service,
                ['serverCreatedAt']: new Date().getTime()
            });
        
        } else {
            matchingSlot = this.slotGroup.find((slot, i) => {
                if(slot.list.length == 0) {
                    index = i
                    slot.service = service.name
                }
                return slot.list.length == 0
            })
            gGroupChosen = gSlotGroup.filter(function(d,i){ return i == index})
            groupX = matchingSlot.x;
            groupY = matchingSlot.y;
            matchingSlot.list.push({...service,
                ['serverCreatedAt']: new Date().getTime()
            }); 
        }
       

        // Check if g chosen has already added groupDrawing
        const isGroupDrawingAdded = gGroupChosen.select('.groupDrawing').size() > 0;
        if( d3.select(gGroupChosen.node()).attr('class').split(' ').includes('isFatalAnimating')){
            return
        }
        if (isGroupDrawingAdded) {
            if(gGroupChosen.select('.counter').size() > 0){
                gGroupChosen.select('.counter').remove();
            }
            let groupDrawing
            // if(gGroupChosen.select('.groupDrawing').node().getAttribute('on-removing')){
                if(gGroupChosen.select('.groupDrawing').node().getAttribute('on-removing')){
                     groupDrawing = this.createGroup(gGroupChosen, {x: groupX +5, y: groupY+5}).attr('class', 'counter')
                    groupDrawing.attr('opacity', 0)

                } else {
                    groupDrawing = this.createGroup(gGroupChosen, {x: groupX +5, y: groupY+5}).attr('class', 'counter')

                }
            
            this.createNotification(service, groupDrawing);
            
        } 
        else {
            const groupDrawing = this.createGroup(gGroupChosen, {x: groupX +5, y: groupY+5}).attr('class', `groupDrawing`)
const backgroundGroup = this.createSVG(groupDrawing, {
    type: 'rect',
    width: 148,
    height: 43,
    fill: `url('#white_blue_gradient')`,
    filter: `url('#shadowBlackFilter')`,
    rx: 5,
    ry: 5,
});
const svgLayout = this.createSVG(groupDrawing, {
    type: 'rect',
    width: 148,
    height: 43,
    fill: `url('#blueGradient')`,
    rx: 5,
    ry: 5,
    translate: { x:.3, y:0.5 },
});
const svgLayoutBlur = this.createSVG(groupDrawing, {
    type: 'rect',
    width: 131.5,
    height: 30,
    filter: `url('#blackBlur')`,
    fill: d3
        .color("#526dce")
        .darker(1),
    opacity: 0.5,
    x: 5,
    y: 10,
    rx: 5,
    ry: 5,
    translate: { x: 0.3, y: 0.5 },
});

const activeGroup = this.createGroup(gGroupChosen, { x: groupX + 5, y: groupY + 5 }).attr('class', 'active-group');
this.createSVG(activeGroup, {
    type: 'rect',
    width: 148,
    height: 43 + 1,
    fill: 'transparent',
    filter: `url(#borderBlur)`,
    clipPath: "url(#borderClip)",
    stroke: 'white',
    strokeWidth: 5,
    rx: 6,
    ry: 5,
})
const activeClip = this.createSVG(activeGroup, {
    type: 'rect',
    width: 121.5,
    height: 12,
    filter: `url(#borderBlur)`,
    fill: 'white',
    clipPath: "url(#halfClip)",
    x:  10,
    y:  -7,
    rx: 6,
    ry: 6,
})
const defaultClip = this.createSVG(groupDrawing, {
    type: 'rect',
    width: 147 - 20,
    height: 12,
    fill: `url('#white_blue_gradient')`,
    clipPath: "url(#halfClip)",
    x: 10,
    y:  -7,
    rx: 6,
    ry: 6,
});
const clientColor = this.createSVG(groupDrawing, {
    type: 'rect',
    width: 147 - 20 - 1,
    height: 12,
    fill: "#46B29D",
    clipPath: "url(#halfClip)",
    x: 10 + 0.5,
    y:  - 7.5,
    rx: 6,
    ry: 6,
});
const title = this.createSVG(groupDrawing, {
    type: 'text',
    text: service.name,
    fill: "#EAEAEA",
    fontSize: 13,
    x: 16,
    y: 27,
}).attr('class', 'name-rect')
this.setTextShadow(title);
this.createNotification(service, groupDrawing);
this.createPin(groupDrawing, 147, 43);
const animationGroup = this.createGroup(gGroupChosen);
if(d3.select(gGroupChosen.node().parentNode)){
    if(d3.select(animationGroup.node().parentNode).attr('class').split(' ').length < 2){
        this.activeAnimation(animationGroup, { x: groupX + 32, y:groupY + 10 });
        this.activeAnimation(animationGroup, { x: groupX + 120,y:groupY + 44 });
    } else{
        return
    }
    
}

activeGroup.attr("opacity", 0);
animationGroup.attr("opacity", 0);
groupDrawing.attr("opacity", 0);
this.showActive(activeGroup, animationGroup, '',service);
        }

    }
  
    showActive(activeGroup, animationGroup, type, service) {
        
          this.animationAttr(activeGroup, "opacity", 1, 500,d3.easeLinear,type, service);
            this.animationAttr(animationGroup, "opacity", 1, 500, d3.easeLinear,'none', service);
        rxjs.timer(500).subscribe((d) => {
            if(d3.select(activeGroup.node().parentNode).select('.groupDrawing').node()){
                if(!d3.select(activeGroup.node().parentNode).select('.groupDrawing')?.attr('on-removing')){
                    d3.select(activeGroup.node().parentNode).select('.groupDrawing').transition().duration(500).attr('opacity', 1)
                    this.animationAttr(activeGroup, "opacity", 0, 500, d3.easeLinear,type, service);
                    this.animationAttr(animationGroup, "opacity", 0, 500, d3.easeLinear,'none', service);
                }
            } else{
                d3.select(activeGroup.node().parentNode).select('.groupDrawing').transition().duration(500).attr('opacity', 1)
                this.animationAttr(activeGroup, "opacity", 0, 500, d3.easeLinear,type, service);
                this.animationAttr(animationGroup, "opacity", 0, 500, d3.easeLinear,'none', service);
            }
           
        });

        
    }

    
    showActive1(activeGroup, animationGroup, type, service) {
            this.animationAttr2(activeGroup, "opacity", 1, 500,d3.easeLinear,type, service);
            this.animationAttr2(animationGroup, "opacity", 1, 500, d3.easeLinear,'none', service);
            if(d3.select(activeGroup.node().parentNode).select('.counter')){
               
                d3.select(activeGroup.node().parentNode).select('.counter').selectAll('rect').transition().duration(1000).attr('opacity', 0)
                d3.select(activeGroup.node().parentNode).select('.counter').selectAll('text').transition().duration(1000).attr('opacity', '0')
            }
            d3.select(activeGroup.node().parentNode).selectAll('g').filter((d, i)=>{
                return i == 0
            }).transition().duration(1000).attr('opacity', 0)
            
        rxjs.timer(1000).subscribe((d) => {
            this.animationAttr2(activeGroup, "opacity", 0, 500, d3.easeLinear,type, service);
            this.animationAttr2(animationGroup, "opacity", 0, 500, d3.easeLinear,'none', service);
        });
    }


    createNotification(service, groupDrawing) {
     
        let count = this.slotGroup.find(slot => slot.list[0]?.name == service.name).list.length;
        let classList = d3.select(groupDrawing.node().parentNode).attr('class').split(' ');

        if (count < 2) return; 

        
        let rectNotiLayoutBack = d3.color("#4374D9").darker(2), rectNotiLayout = d3.color("#4374D9").darker(1)
        if(d3.select(groupDrawing.node().parentNode).select('.groupDrawing').selectAll('rect').filter((d,i)=> i == 1).attr('fill') == 'url("#blueGradient")'){
            rectNotiLayoutBack = d3.color("#4374D9").darker(2)
            rectNotiLayout = d3.color("#4374D9").darker(1)
        } else if(d3.select(groupDrawing.node().parentNode).select('.groupDrawing').selectAll('rect').filter((d,i)=> i == 1).attr('fill') == 'url("#orangeGradient")'){
            rectNotiLayoutBack =  d3.color("#ff8b24").darker(2)
            rectNotiLayout = d3.color("#ff8b24").darker(1)
        } else if(d3.select(groupDrawing.node().parentNode).select('.groupDrawing').selectAll('rect').filter((d,i)=> i == 1).attr('fill') == 'url("#redGradient")'){
            rectNotiLayoutBack =  d3.color("#d85741").darker(2)
            rectNotiLayout = d3.color("#d85741").darker(1)
        }
        const headerGroup = this.createGroup(groupDrawing, {
            x: 100,
            y: 15,
        }).attr('class', `counting-${service.name}`)
        const background = this.createSVG(headerGroup, {
            type: 'rect',
            width: 28.6,
            height: 16,
            fill: "#EAEAEA",
            opacity: 0.5,
            x: -0.3,
            rx: 3,
            ry: 3,
            opacity: count > 2 ? 1 : 0
        });
        const svgNotiLayoutBack = this.createSVG(headerGroup, {
            type: 'rect',
            width: 28,
            height: 16,
            fill: rectNotiLayoutBack,
            rx: 3,
            ry: 3,
            opacity: count > 2 ? 1 : 0
        });
        const svgNotiLayout = this.createSVG(headerGroup, {
            type: 'rect',
            width: 25,
            height: 13,
            x: 2,
            y: 2,
            fill: rectNotiLayout,
            filter: `url('#blur3')`,
            opacity: count > 2 ? 1 : 0
        });
        const countText = this.createSVG(headerGroup, {
            type: 'text',
            text: count,
            fontSize: 10,
            fontWeight: "bold",
            x: 11,
            y: 11.5,
            fill: 'white',
            opacity: 0,
        });
       
        const headerAnimationGroup = this.createGroup(groupDrawing, {
            x: 100,
            y: 15,
        }).attr('class', 'counting-animation')
        this.createSVG(headerAnimationGroup, {
            type: 'rect',
            width: 28.6,
            height: 16,
            fill: 'none',
            stroke: 'white',
            strokeWidth: 1,
            rx: 3,
            ry: 3,
        });
        if(classList.length < 2){
            this.activeAnimation(headerAnimationGroup, { x: 2, y: 2 });
            this.activeAnimation(headerAnimationGroup, { x: 25, y: 15 });
            this.playHeaderAnimation(headerAnimationGroup, service);
        }
        
        
       
    }
    playHeaderAnimation(animationGroup, service) {
        animationGroup.attr("opacity", 0);
        this.animationAttr(animationGroup, 'opacity', 1, 500, d3.easeLinear, 'none',service);
        rxjs.timer(500).subscribe(d => {
            if(this.slotGroup.find(slot => slot.service == service.name)){
                if(this.slotGroup.find(slot => slot.service == service.name).list.length == 1){
                    d3.select(animationGroup.node().parentNode).selectAll('rect').filter((d,i)=> i != 0).transition().duration(500).attr('opacity', 1)
                } else{
                    d3.select(animationGroup.node().parentNode).selectAll('rect').filter((d,i)=> i != 0).attr('opacity', 1)
                }
            }
            
            d3.select(animationGroup.node().parentNode).select('text').transition().duration(500).attr('opacity', 1)
            this.animationAttr(animationGroup, 'opacity', 0, 500,  d3.easeLinear, '', service);
           
        });
    }
   
    activeAnimation(group, position) {
        const activeGroup = this.createGroup(group, position);
       
        const activeNode = this.createSVG(activeGroup, {
            type: 'ellipse',
            cx: 0,
            cy: 0,
            fill: 'white',
            rx: 4,
            ry: 3,
            filter: `url(#activeBlur)`,
        });
        const mainCircle = this.createSVG(activeGroup, {
            type: 'circle',
            r: 1,
            fill: 'white',
            filter: `url(#centerBlur)`,
        });
        this.crateLight(activeGroup, 1, 8, -0.2, -0.1, 30);
        this.crateLight(activeGroup, 1, 8, 0.2, 0.1, 30 + 180);
        this.crateLight(activeGroup, 1, 8, 0.1, -0.2, 130);
        this.crateLight(activeGroup, 1, 8, -0.1, 0.2, 130 + 180);
    }
       
    
    
    /* progressbar */
    

    updateProgressBar = function(ramUsage, cpuUsage) {
        this.actionDelegate('change',ramUsage, true)
        this.actionDelegate('change',cpuUsage, false)
        return this
    
    }
     
    colorGradient(fadeFraction, rgbColor1, rgbColor2, rgbColor3) {
        let color1 = rgbColor1;
        let color2 = rgbColor2;
        let fade = fadeFraction;
        if (rgbColor3) {
            fade = fade * 2;
            if (fade >= 1) {
                fade -= 1;
                color1 = rgbColor2;
                color2 = rgbColor3;
            }
        }
        const diffRed = color2.red - color1.red;
        const diffGreen = color2.green - color1.green;
        const diffBlue = color2.blue - color1.blue;
        const gradient = {
            red: parseInt(Math.floor(color1.red + diffRed * fade).toString(), 10),
            green: parseInt(Math.floor(color1.green + diffGreen * fade).toString(), 10),
            blue: parseInt(Math.floor(color1.blue + diffBlue * fade).toString(), 10),
        };
        return ("rgb(" + gradient.red + "," + gradient.green + "," + gradient.blue + ")");
    }
    createEqualizer() {
        let group = d3.select('.web-container')
        const titleGroup = this.createGroup(group, {
            x: this.width -1080,
            y: 160
        })
        titleGroup.append('text').text('WEB').attr('x', '-25').attr('y', '15').attr('fill', 'white').attr('font-size', '18').attr('font-weight', '800').attr('dx', '0.3em').attr('transform', 'rotate(-90)').attr('text-anchor', 'middle')
        
        const bodyGroup1 = this.createGroup(group, {
            x: this.width - 990,
            y: 320,
        });
        titleGroup.append('circle').attr('class', 'green_circle').attr('cx', '10').attr('cy', '-100').attr('r', 5).attr('filter', 'url("#shadowFilter1")').attr('fill', 'url("#radial_green")').style('cursor', 'pointer')
        titleGroup.append('circle').attr('class', 'sky_circle').attr('cx', '10').attr('cy', '-85').attr('r', 5).attr('filter', 'url("#shadowFilter1")').attr('fill', 'url("#radial_sky")').style('cursor', 'pointer')
        titleGroup.append('circle').attr('class', 'orange_circle').attr('cx', '10').attr('cy', '-70').attr('r', 5).attr('filter', 'url("#shadowFilter1")').attr('fill', 'url("#radial_orange")').style('cursor', 'pointer')
       
        const bodyGroup = this.createGroup(group, {
            x: this.width - 990,
            y: 56,
        });
        const color1 = {
            red: 19,
            green: 233,
            blue: 19,
        };
        const color3 = {
            red: 255,
            green: 0,
            blue: 0,
        };
        const color2 = {
            red: 255,
            green: 255,
            blue: 0,
        };
        const width = 30;
        for (let index = 0; index < 100 / 3.3; index++) {
            let gradient = Math.round(((index + 1) * 100) / 100) * 3;
         
            if (gradient < 10) {
                gradient = "0" + gradient;
            }
            gradient = +gradient === 100 ? 1 : +("0." + gradient);

            const gradientColor = this.colorGradient(gradient, color1, color2, color3);
            const x = d3.select('.web-container').attr('width') + index * width;
          
            this.equalizerChild1.push({
                index: index,
                x: x,
                node: this.createSVG(bodyGroup1, {
                    type: 'rect',
                    fill: gradientColor,
                    height: 4,
                    width: width,
                    rx: 2,
                    ry: 2,
                    x: x,
                    opacity: 1,
                }),
            });
        }
        let gapIndex1 = 0;
        let currentValue1 = 100
        this.equalizerChild1.forEach((item) => {
            if (currentValue1 > item.index) {
                item.node.attr("opacity", item.index < 7 ? 0.7 : item.index * 0.1 );
                const gapValue = gapIndex1 * 1.5;
                gapIndex1++; 
                item.node.attr('transform', `translate(${gapValue},0)`);
            }
        });
        for (let index = 0; index < 100 / 3.3; index++) {
            let gradient = Math.round(((index + 1) * 100) / 100) * 3;
         
            if (gradient < 10) {
                gradient = "0" + gradient;
            }
            gradient = +gradient === 100 ? 1 : +("0." + gradient);

            const gradientColor = this.colorGradient(gradient, color1, color2, color3);
            const x = d3.select('.web-container').attr('width') + index * width;
          
            this.equalizerChild.push({
                index: index,
                x: x,
                node: this.createSVG(bodyGroup, {
                    type: 'rect',
                    fill: gradientColor,
                    height: 4,
                    width: width,
                    rx: 2,
                    ry: 2,
                    x: x,
                    opacity: 1,
                }),
            });
        }
        let gapIndex = 0;
        let currentValue = 100
        this.equalizerChild.forEach((item) => {
            if (currentValue > item.index) {
                item.node.attr("opacity", item.index < 7 ?  0.7 : item.index * 0.1);
                const gapValue = gapIndex * 1.5;
                gapIndex++;
                item.node.attr('transform', `translate(${gapValue},0)`);
            }
        });
    }

    actionDelegate = function(type, data, isUpper) {
        switch (type) {
            case 'change':
                this.setEqulizerValue(data, isUpper);
                break;
         
        }
        return this
    }
    setEqulizerValue(value, isUpper) {
        this.equlizerAnimation(value / 3, isUpper);
        if(isUpper){
            this.currentValue = value / 3;
        } else{
            this.currentValue1 = value/3
        }
        
         
    }
    equlizerAnimation(next, isUpper) {
        if(isUpper){
            this.currentValue < next ? this.upEqulizer(next, isUpper) : this.downEqulizer(next, isUpper);
        } else{
            this.currentValue1 < next ? this.upEqulizer(next, isUpper) : this.downEqulizer(next, isUpper);
        }
        
    }
    upEqulizer(next, isUpper) {
        const copyValue = isUpper ? this.currentValue : this.currentValue1
        
        if(isUpper){
            let itemCount = 0;
            this.equalizerChild.forEach((item) => {
            if (copyValue <= item.index && item.index <= next) {
                itemCount++;
                const time = itemCount * 50;
                this.animationAttr1(item.node, 'opacity', 0.8, time);
            }
        });
        } else{
            let itemCount = 0;
            this.equalizerChild1.forEach((item) => {
            if (copyValue <= item.index && item.index <= next) {
                itemCount++;
                const time = itemCount * 50;
                this.animationAttr1(item.node, 'opacity', 0.8, time);
            }
        });
        }
        
        
    }
    downEqulizer(next, isUpper) {
        
        if(isUpper){
            let itemCount = 0;
            this.equalizerChild.reverse().forEach((item) => {
            if (item.index > next) {
                const time = itemCount * 50;
                itemCount++;
                this.animationAttr1(item.node, 'opacity', 0, time);
            }
        });
        this.equalizerChild.reverse();
        } 
        else{
            let itemCount = 0;
            this.equalizerChild1.reverse().forEach((item) => {
            if (item.index > next) {
                 itemCount++;
                const time = itemCount * 50;
                this.animationAttr1(item.node, 'opacity', 0.0, time);
            }
        });
        }
        
    }

}
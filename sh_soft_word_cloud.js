const RADIANS = Math.PI / 180;

const SPIRALS = {
  archimedean: archimedeanSpiral,
  rectangular: rectangularSpiral
};
function archimedeanSpiral(size) {
    var e = size[0] / size[1];
    
    return function(t) {
      // console.log([e * (t *= .1) * Math.cos(t), t * Math.sin(t)])
      return [e * (t *= .1) * Math.cos(t), t * Math.sin(t)];
    };
  }
  
  function rectangularSpiral(size) {
    var dy = 4,
        dx = dy * size[0] / size[1],
        x = 0,
        y = 0;
    return function(t) {
      var sign = t < 0 ? -1 : 1;
      // See triangular numbers: T_n = n * (n + 1) / 2.
      switch ((Math.sqrt(1 + 4 * sign * t) - sign) & 3) {
        case 0:  x += dx; break;
        case 1:  y += dy; break;
        case 2:  x -= dx; break;
        default: y -= dy; break;
      }
      return [x, y];
    };
  }
const cw = 1 << 11 >> 5;
const ch = 1 << 11 ;
const random = Math.random;
let timerID = null
let timer
class WordCloud{
    constructor(container, data, option){
        this.container = container
        if(!this.container.id){
          this.container.id = `word-cloud-${Math.floor(Math.random()*100000)}`
        }
        this.data = data
        this.svgWidth = option?.width ? option.width : (d3.select(this.container)._groups[0][0].clientWidth > 0 ? d3.select(this.container)._groups[0][0].clientWidth : 300)  
        this.svgHeight = option?.height ? option.height : (d3.select(this.container)._groups[0][0].clientHeight > 0 ? d3.select(this.container)._groups[0][0].clientHeight : 400)
     
        this.waving = option?.waving ? true : false
        this.spiralHighlight = option?.highlight ? true : false
        this.sliding = option?.sliding ? true : false
        this.slidingFlag = false
        this.highlighFlag = false
        this.font = option?.font ? option.font : 'Noto Sans KR'
        this.fontWeight = option?.fontWeight ? option.fontWeight : 500
        this.slidingTime = option?.slidingTime ? option.slidingTime : 2000
        this.wavingTime = option?.wavingTime ? option.wavingTime : 1000
        this.highlightTime = option?.highlightTime ? option.highlightTime : 1000
        this.textSlidingTime = option?.textSlidingTime ? option.textSlidingTime : 1000
        this.padding = option?.padding ? option.padding : 0
        this.waveScale = option?.waveScale ? option.waveScale : 20
        this.layout = function(){
            var size = [256, 256],
                text = cloudText,
                font = cloudFont,
                fontSize = cloudFontSize,
                fontStyle = cloudFontNormal,
                fontWeight = cloudFontNormal,
                rotate = cloudRotate,
                padding = cloudPadding,
                spiral = archimedeanSpiral,
                words = [],
                timeInterval = Infinity,
                event = d3.dispatch("word", "end"),
                timer = null,
                random = Math.random,
                cloud = {},
                canvas = cloudCanvas,
                mask = false,
                maskBoard = null;
          
            cloud.canvas = function(_) {
              return arguments.length ? (canvas = functor(_), cloud) : canvas;
            };
          
            cloud.start = function() {
               
              var contextAndRatio = getContext(canvas()),
                  
                  board = mask ? maskBoard : zeroArray((size[0] >> 5) * size[1]),
                  bounds = null,
                  n = words.length,
                  i = -1,
                  tags = [],
                  
                  data = words.map(function(d, i) {
                    d.text = text.call(this, d, i);
                    d.font = font.call(this, d, i);
                    d.style = fontStyle.call(this, d, i);
                    d.weight = fontWeight.call(this, d, i);
                    d.rotate = rotate.call(this, d, i);
                    d.size = ~~fontSize.call(this, d, i);
                    d.padding = padding.call(this, d, i);
                    return d;
                  }).sort(function(a, b) { return b.size - a.size; });
              if (timer) clearInterval(timer);
              timer = setInterval(step, 0);
              step();
              return cloud;
          
              function step() {
                var start = Date.now();
                while (Date.now() - start < timeInterval && ++i < n && timer) {
                  var d = data[i];
                  d.x = size[0]/2
                  d.y = size[1]/2
                  cloudSprite(contextAndRatio, d, data, i);
                  if (d.hasText && place(board, d, bounds)) {
                    tags.push(d);
                    event.call("word", cloud, d);
                    if (bounds) cloudBounds(bounds, d);
                    else bounds = [{x: d.x + d.x0, y: d.y + d.y0}, {x: d.x + d.x1, y: d.y + d.y1}];
                    // Temporary hack
                    d.x -= size[0] >> 1;
                    d.y -= size[1] >> 1;
                  }
                }
                if (i >= n) {
                  cloud.stop();
                  event.call("end", cloud, tags, bounds);
                }
              }
            }
          
            cloud.stop = function() {
              if (timer) {
                clearInterval(timer);
                timer = null;
              }
              for (const d of words) {
                delete d.sprite;
              }
              return cloud;
            };
          
            function getContext(canvas) {
              const context = canvas.getContext("2d", {willReadFrequently: true});
          
              canvas.width = canvas.height = 1;
              const ratio = Math.sqrt(context.getImageData(0, 0, 1, 1).data.length >> 2);
              canvas.width = (cw << 5) / ratio;
              canvas.height = ch / ratio;
          
              context.fillStyle = context.strokeStyle = "red";
          
              return {context, ratio};
            }
          
            function place(board, tag, bounds) {
              var perimeter = [{x: 0, y: 0}, {x: size[0], y: size[1]}],
                  startX = tag.x,
                  startY = tag.y,
                  maxDelta = Math.sqrt(size[0] * size[0] + size[1] * size[1]),
                  s = spiral(size),
                  dt = random() < .5 ? 1 : -1,
                  t = -dt,
                  dxdy,
                  dx,
                  dy;
          
              while (dxdy = s(t += dt)) {
                dx = ~~dxdy[0];
                dy = ~~dxdy[1];
          
                if (Math.min(Math.abs(dx), Math.abs(dy)) >= maxDelta) break;
          
                tag.x = startX + dx;
                tag.y = startY + dy;
          
                if (tag.x + tag.x0 < 0 || tag.y + tag.y0 < 0 ||
                    tag.x + tag.x1 > size[0] || tag.y + tag.y1 > size[1]) continue;
                // TODO only check for collisions within current bounds.
                if (!bounds || collideRects(tag, bounds)) {
                  if (!cloudCollide(tag, board, size[0])) {
                    var sprite = tag.sprite,
                        w = tag.width >> 5,
                        sw = size[0] >> 5,
                        lx = tag.x - (w << 4),
                        sx = lx & 0x7f,
                        msx = 32 - sx,
                        h = tag.y1 - tag.y0,
                        x = (tag.y + tag.y0) * sw + (lx >> 5),
                        last;
                    for (var j = 0; j < h; j++) {
                      last = 0;
                      for (var i = 0; i <= w; i++) {
                        board[x + i] |= (last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0);
                      }
                      x += sw;
                    }
                    return true;
                  }
                }
              }
              return false;
            }
          
            cloud.timeInterval = function(_) {
              return arguments.length ? (timeInterval = _ == null ? Infinity : _, cloud) : timeInterval;
            };
          
            cloud.mask = function(_){
              if(arguments.length){
                mask = _
                maskBoard = createMaskBoard(_,size[0],size[1])
                return cloud
              }else{
                return mask
              } 
            };

            cloud.wavingMask = function(_){
              if(arguments.length){
                mask = _
                maskBoard = createWavingMaskBoard(_,size[0],size[1])
              return cloud
            } else{
              return mask
            }
            }
          
            cloud.words = function(_) {
              return arguments.length ? (words = _, cloud) : words;
            };
          
            cloud.size = function(_) {
              return arguments.length ? (size = [+_[0], +_[1]], cloud) : size;
            };
          
            cloud.font = function(_) {
              return arguments.length ? (font = functor(_), cloud) : font;
            };
          
            cloud.fontStyle = function(_) {
              return arguments.length ? (fontStyle = functor(_), cloud) : fontStyle;
            };
          
            cloud.fontWeight = function(_) {
              return arguments.length ? (fontWeight = functor(_), cloud) : fontWeight;
            };
          
            cloud.rotate = function(_) {
              return arguments.length ? (rotate = functor(_), cloud) : rotate;
            };
          
            cloud.text = function(_) {
              return arguments.length ? (text = functor(_), cloud) : text;
            };
          
            cloud.spiral = function(_) {
              return arguments.length ? (spiral = SPIRALS[_] || _, cloud) : spiral;
            };
          
            cloud.fontSize = function(_) {
              return arguments.length ? (fontSize = functor(_), cloud) : fontSize;
            };
          
            cloud.padding = function(_) {
              return arguments.length ? (padding = functor(_), cloud) : padding;
            };
          
            cloud.random = function(_) {
              return arguments.length ? (random = _, cloud) : random;
            };
          
            cloud.on = function() {
              var value = event.on.apply(event, arguments);
       
              return value === event ? cloud : value;
            };
          
            return cloud;
          };
          
          function cloudText(d) {
            return d.text;
          }
          
          function cloudFont() {
            return "serif";
          }
          
          function cloudFontNormal() {
            return "normal";
          }
          
          function cloudFontSize(d) {
            return Math.sqrt(d.value);
          }
          
          function cloudRotate() {
            return (~~(random() * 2)) * 90;
          }
          
          function cloudPadding() {
            return 1;
          }
          
          // Fetches a monochrome sprite bitmap for the specified text.
          // Load in batches for speed.
          function cloudSprite(contextAndRatio, d, data, di) {
            if (d.sprite) return;
            var c = contextAndRatio.context,
                ratio = contextAndRatio.ratio;
          
            c.clearRect(0, 0, (cw << 5) / ratio, ch / ratio);
            var x = 0,
                y = 0,
                maxh = 0,
                n = data.length;
            --di;
            while (++di < n) {
              d = data[di];
              c.save();
              c.font = d.style + " " + d.weight + " " + ~~((d.size + 1) / ratio) + "px " + d.font;
              const metrics = c.measureText(d.text);
              const anchor = -Math.floor(metrics.width / 2);
              let w = (metrics.width + 1) * ratio;
              let h = d.size << 1;
              if (d.rotate) {
                var sr = Math.sin(d.rotate * RADIANS),
                    cr = Math.cos(d.rotate * RADIANS),
                    wcr = w * cr,
                    wsr = w * sr,
                    hcr = h * cr,
                    hsr = h * sr;
                w = (Math.max(Math.abs(wcr + hsr), Math.abs(wcr - hsr)) + 0x1f) >> 5 << 5;
                h = ~~Math.max(Math.abs(wsr + hcr), Math.abs(wsr - hcr));
              } else {
                w = (w + 0x1f) >> 5 << 5;
              }
              if (h > maxh) maxh = h;
              if (x + w >= (cw << 5)) {
                x = 0;
                y += maxh;
                maxh = 0;
              }
              if (y + h >= ch) break;
              c.translate((x + (w >> 1)) / ratio, (y + (h >> 1)) / ratio);
              if (d.rotate) c.rotate(d.rotate * RADIANS);
              c.fillText(d.text, anchor, 0);
              if (d.padding) c.lineWidth = 2 * d.padding, c.strokeText(d.text, anchor, 0);
              c.restore();
              d.width = w;
              d.height = h;
              d.xoff = x;
              d.yoff = y;
              d.x1 = w >> 1;
              d.y1 = h >> 1;
              d.x0 = -d.x1;
              d.y0 = -d.y1;
              d.hasText = true;
              x += w;
            }
            var pixels = c.getImageData(0, 0, (cw << 5) / ratio, ch / ratio).data,
                sprite = [];
            while (--di >= 0) {
              d = data[di];
              if (!d.hasText) continue;
              var w = d.width,
                  w32 = w >> 5,
                  h = d.y1 - d.y0;
              // Zero the buffer
              for (var i = 0; i < h * w32; i++) sprite[i] = 0;
              x = d.xoff;
              if (x == null) return;
              y = d.yoff;
              var seen = 0,
                  seenRow = -1;
              for (var j = 0; j < h; j++) {
                for (var i = 0; i < w; i++) {
                  var k = w32 * j + (i >> 5),
                      m = pixels[((y + j) * (cw << 5) + (x + i)) << 2] ? 1 << (31 - (i % 32)) : 0;
                  sprite[k] |= m;
                  seen |= m;
                }
                if (seen) seenRow = j;
                else {
                  d.y0++;
                  h--;
                  j--;
                  y++;
                }
              }
              d.y1 = d.y0 + seenRow;
              d.sprite = sprite.slice(0, (d.y1 - d.y0) * w32);
            }
          }
          
          // Use mask-based collision detection.
          function cloudCollide(tag, board, sw) {
            sw >>= 5;
            var sprite = tag.sprite,
                w = tag.width >> 5,
                lx = tag.x - (w << 4),
                sx = lx & 0x7f,
                msx = 32 - sx,
                h = tag.y1 - tag.y0,
                x = (tag.y + tag.y0) * sw + (lx >> 5),
                last;
            for (var j = 0; j < h; j++) {
              last = 0;
              for (var i = 0; i <= w; i++) {
                if (((last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0))
                    & board[x + i]) return true;
              }
              x += sw;
            }
            return false;
          }
          
          function cloudBounds(bounds, d) {
            var b0 = bounds[0],
                b1 = bounds[1];
            if (d.x + d.x0 < b0.x) b0.x = d.x + d.x0;
            if (d.y + d.y0 < b0.y) b0.y = d.y + d.y0;
            if (d.x + d.x1 > b1.x) b1.x = d.x + d.x1;
            if (d.y + d.y1 > b1.y) b1.y = d.y + d.y1;
          }
          
          function collideRects(a, b) {
            return a.x + a.x1 > b[0].x && a.x + a.x0 < b[1].x && a.y + a.y1 > b[0].y && a.y + a.y0 < b[1].y;
          }
          
    
          
          // TODO reuse arrays?
          function zeroArray(n) {
            var a = [],
                i = -1;
            while (++i < n) a[i] = 0;
            return a;
          }
          
          function cloudCanvas() {
            return document.createElement("canvas");
          }
          
          function functor(d) {
            return typeof d === "function" ? d : function() { return d; };
          }

         
          function get_mask_pixels(mask,w,h){
            var canvas = document.createElement('canvas')
            canvas.width = w
            canvas.height = h;
           
            var ctx = canvas.getContext("2d", { willReadFrequently: true });
            
            ctx.drawImage(mask, 0, 0, w, h)
    
            return ctx.getImageData(0, 0, w, h).data
          }
          
          function create_mask_board_from_pixels(mask_pixels, w,h){
   
            var w32 = w >> 5 //divedes by 32
            var sprite = []
            const sprite1 = []
            
            // Zero the buffer
            
            if(h-w>50){
              for (var i = 0; i < h * w32; i++){
                sprite1[i] = 0
            }
            for (var j = 0; j < h; j++) {
              for (var i = 0; i < w; i++) {
                var k = w32 * j + (i >> 5);
                var  m = mask_pixels[(j * w + (i)) << 2] ? 1 << (31 - (i % 32)) : 0;
                sprite1[k] |= m;
              }
            }
           
            return sprite1.slice(0, h * w32)
            } else{
              for (var i = 0; i < h * w32; i++){
                sprite[i] = 0
            }
            for (var j = 0; j < h; j++) {
              for (var i = 0; i < w; i++) {
                var k = w32 * j + (i >> 5);
                var  m = mask_pixels[(j * w + (i)) << 2] ? 1 << (31 - (i % 32)) : 0;
                sprite[k] |= m;
              }
            }
            return sprite.slice(0, w * w32)
            }
           
       
            
          }          
          function createMaskBoard(mask,w,h){
            var pixels = get_mask_pixels(mask,w,h)
            var board = create_mask_board_from_pixels(pixels,w,h)
     
            return board
          }
          function createWavingMaskBoard(mask,w,h){
            
            var board = create_mask_board_from_pixels(mask,w,h)
     
            return board
          }
          
          }
    render(){
      let timeOutID
      let timeOutID1
      let intervalID
      let intervalID1
     let intervalID2
     let intervalID3
     let intervalID4
     let intervalID5
     let intervalID6
     let intervalID7
     let intervalID8
     let intervalID9
     let intervalID10
     let intervalID11
     let intervalID12
     let intervalID13
     let slidingEffectIntervalID
     let part=1
      let done = false
      let slidingDone = false
      let slidingInterval
      let slidingTimeout
      const self = this
      let angle,x,y
      let index
      let iCount
      let countIntervals = 1
      let color = ['#ff128e','#ef11ff', '#ff5cf9','#ad4bff' ,'#985cff','#8585ff','#724aff', '#4a5cff','#4a7aff','#5c89ff','#85abff','#4bb4ff','#0fd5ff','#4affd5']
        var count = this.data.length

        var scale = d3.scaleLinear().range([1, Math.min(self.svgWidth, self.svgHeight) / 4]).domain([0, count])
        var words = d3.range(0, count).map((d, index) => {
        return {
          text: self.data[index].text ? self.data[index].text : self.data[index],
          size: self.data[index].size ? self.data[index].size : scale(d),
          color: self.data[index].color ? self.data[index].color : color[Math.floor(Math.random()*(color.length-1))]
        };
      });
        let images = ['./img/mask-circle.png', './img/mask-heart.png', './img/mask-triangle.png', './img/mask-star.png', './img/mask-rhombus.png']
        const img = new Image()
        img.src = images[Math.floor(Math.random()*(images.length-1))]
        img.onload = function(){
          const layout = self.layout()
          .size([self.svgWidth, self.svgHeight])
          .words(words)
          .mask(img)
          .padding(self.padding)
          .font("Noto Sans KR, 'sans-serif'")
          .fontSize(function (d) {
            return d.size;
            }).on("end", function draw(words) {
            d3.select(self.container)
            .append('svg')
            .attr('id', `${self.container.id}-chart`)
            .attr("width", self.svgWidth).attr("height", self.svgHeight)
            .attr('viewBox',[0,0,self.svgWidth, self.svgHeight])
            .append("g")
            .attr(
            "transform",
            "translate(" +
            layout.size()[0] / 2 +
            "," +
            layout.size()[1] / 2 +
            ")"
            )
            .selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-size", function (d) {
            return d.size + "px";
            })
            .style("font-family", self.font)
            .style('font-weight', self.fontWeight)
            .attr('fill', d=>d.color)
            .attr("text-anchor", "middle")
            .text(function (d) {
              return d.text;
              })
            .style('opacity', '1')
           
            const textNode = d3.select(self.container).select('svg').select('g').selectAll('text')
            textNode.each(function(d,i){
                let gNode = d3.select(self.container).select('svg').select('g').append('g')
                for(let index = 0; index<d.text.length; index++){
                    if(d.rotate == 0){
                        if(index < Math.floor(d.text.length/2)){
                            gNode.append('text').text(d.text[index]).style('font-weight', self.fontWeight).style('font-size',`${d.size}px`).attr('fill', d.color).attr('transform', `translate(${[d.x - (d.width*(index+1)/d.text.length), d.y]})rotate(${d.rotate})`)
                        } else if(index == Math.floor(d.text.length/2)){
                            gNode.append('text').text(d.text[index]).style('font-weight', self.fontWeight).style('font-size',`${d.size}px`).attr('fill', d.color).attr('transform', `translate(${[d.x, d.y]})rotate(${d.rotate})`)
                        } else{
                            gNode.append('text').text(d.text[index]).style('font-weight', self.fontWeight).style('font-size',`${d.size}px`).attr('fill', d.color).attr('transform', `translate(${[d.x + (d.width*(index-Math.floor(d.text.length/2))/d.text.length), d.y]})rotate(${d.rotate})`)
                        }
                    } else{
                        if(index < Math.floor(d.text.length/2)){
                            gNode.append('text').text(d.text[index]).style('font-weight', self.fontWeight).style('font-size',`${d.size}px`).attr('fill', d.color).attr('transform', `translate(${[d.x , d.y- (d.width*(index+1)/d.text.length)]})rotate(${d.rotate})`)
                        } else if(index == Math.floor(d.text.length/2)){
                            gNode.append('text').text(d.text[index]).style('font-weight', self.fontWeight).style('font-size',`${d.size}px`).attr('fill', d.color).attr('transform', `translate(${[d.x, d.y]})rotate(${d.rotate})`)
                        } else{
                            gNode.append('text').text(d.text[index]).style('font-weight', self.fontWeight).style('font-size',`${d.size}px`).attr('fill', d.color).attr('transform', `translate(${[d.x , d.y+ (d.width*(index-Math.floor(d.text.length/2))/d.text.length)]})rotate(${d.rotate})`)
                        }
                    }
                    
                }
               d3.select(this).remove()
            })
            // if(!self.sliding){
            //   textNode
            //   .attr("transform", function (d) {
            //   return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            //   })
            // }
            //  else{
              textNode
              .transition()
              .duration(self.sliding ? self.slidingTime : 1000)
              .attr("transform", function (d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
              })
            // }
            if(self.waving){
                let textPart
                let gNode = d3.select(self.container).select('svg').select('g').selectAll('g')
                let maxTextNode = 0
                gNode.each(function(d,i){
                    if(maxTextNode<d3.select(this)._groups[0][0].childNodes.length){
                        maxTextNode = d3.select(this)._groups[0][0].childNodes.length
                    }
                })
                if(intervalID8){
                    clearInterval(intervalID8)
                }
                intervalID8 = setInterval(()=>{
                    textPart = 1
                    if(intervalID9){
                        clearInterval(intervalID9)
                    }
                    intervalID9 = setInterval(()=>{
                        if(textPart == 1){
                        
                            gNode.each(function(d,index){
                                let node = d3.select(this).selectAll('text').filter(function(d, ind){   
                                    return ind == textPart
                                })
                                // console.log(node._groups[0][0].attributes.transform.nodeValue)
                                if(node._groups[0][0].attributes.transform.nodeValue.includes('rotate(0)')){
                                    let x = +node._groups[0][0].attributes.transform.nodeValue.split('(')[1].split(',')[0]
                                    let y = +node._groups[0][0].attributes.transform.nodeValue.split('(')[1].split(',')[1].split(')')[0]
                                    console.log(x, y)
                                    node.attr('transform', `translate(${x}, ${y-10})rotate(0)`)
                                } else{
                                    let x = +node._groups[0][0].attributes.transform.nodeValue.split('(')[1].split(',')[0]
                                    let y = +node._groups[0][0].attributes.transform.nodeValue.split('(')[1].split(',')[1].split(')')[0]
                                    console.log(x, y)
                                    node.attr('transform', `translate(${x+10}, ${y})rotate(90)`)
                                }
                                console.log(node)
                                // .attr('transform', function(b){

                                //     return 'translate(0,0)'})
                            })
                        } 
                        else if(textPart == 2){

                        }
                        else if(textPart == 3){

                        } 
                        else if(textPart==4){

                        }
                        textPart++
                    }, (self.wavingTime*2/(maxTextNode+1)))
                },self.wavingTime*2)
            }
           
            if(self.sliding && !self.spiralHighlight){
         
              if(slidingTimeout){
                clearTimeout(slidingTimeout)
              }
              slidingTimeout = setTimeout(()=>{
           
                let i 
                if(slidingInterval){
                  clearInterval(slidingInterval)
                }
                  slidingInterval = setInterval(()=>{
                  slidingDone = !slidingDone
                  if(slidingDone){
                    i= d3.selectAll('text')._groups[0].length-1
                  } else{
                    i = 0
                  }
                  if(intervalID){
                    clearInterval(intervalID)
                  }
                  intervalID = setInterval(()=>{
                    if(slidingDone){
                      textNode.filter(function(d,index){return index == i}).transition().duration(self.textSlidingTime).tween('text-transform', function(d){
                        let interpolate
                    if(d.rotate>0){
                      if(d.y<0){
                        interpolate = d3.interpolateNumber(d.y, d.y-self.svgHeight)
                      } else{
                        interpolate = d3.interpolateNumber(d.y,d.y+self.svgHeight)
                      }
                      
                      return function(t){
                        d3.select(this).attr('transform', `translate(${d.x}, ${interpolate(t)})rotate(${d.rotate})`)
                      }
                    } else{
                      if(d.x<0){
                        interpolate = d3.interpolateNumber(d.x,d.x - self.svgWidth)
                      } else{
                        interpolate = d3.interpolateNumber(d.x,d.x+self.svgWidth)
                      }
                      return function(t){
                        d3.select(this).attr('transform', `translate(${interpolate(t)}, ${d.y})rotate(${d.rotate})`)
                      }
                    } 
                      })
                      if(i>-1){
                        i--
                      } 
                    } else{
                      textNode.filter(function(d,index){return index == i}).transition().duration(self.textSlidingTime).tween('text-transform', function(d){
                        let interpolate

                    if(d.rotate>0){
                      if(d.y<0){
                        interpolate = d3.interpolateNumber(d.y-self.svgHeight, d.y)
                      } else{
                        interpolate = d3.interpolateNumber(d.y+self.svgHeight,d.y)
                      }
                      return function(t){
                        d3.select(this).attr('transform', `translate(${d.x}, ${interpolate(t)})rotate(${d.rotate})`)
                      }
                    } else{
                      if(d.x<0){
                        interpolate = d3.interpolateNumber(d.x-self.svgWidth,d.x )
                      } else{
                        interpolate = d3.interpolateNumber(d.x+self.svgWidth,d.x)
                      }
                      return function(t){
                        d3.select(this).attr('transform', `translate(${interpolate(t)}, ${d.y})rotate(${d.rotate})`)
                      }
                    } 
                      })
                      if(i<d3.selectAll('text')._groups[0].length){
                        i++
                      }
                    }
                  }, 1)
                  }, self.slidingTime)
                  
                
              }, 0)
            }
         
            else if(self.sliding && self.spiralHighlight){

              if(intervalID2){
                clearInterval(intervalID2)
              }
              let arrIndex = []
              intervalID2 = setInterval(()=>{
                countIntervals++
                part = 1
                clearInterval(intervalID7)
                arrIndex = []
                let randomIndex 
                for(let i=0; i<3; i++){
                  if(textNode._groups[0].length>10){
                    randomIndex = Math.floor(Math.random()*10)
                  } else{
                    randomIndex = Math.floor(Math.random()*textNode._groups[0].length)
                  }
                  
                  if(arrIndex.includes(randomIndex)){
                    i--
                  } else{
                    arrIndex.push(randomIndex)
                  }
                }
                if(intervalID3){
                  clearInterval(intervalID3)
                }
                intervalID3 = setInterval(()=>{
                  if(part == 1){
                    if(intervalID5){
                      clearTimeout(intervalID5)
                    }
                    intervalID5 = setTimeout(()=>{
                 
                textNode.filter(function(d,i){
                  return arrIndex.includes(i)
                }).property('changed', true).transition().duration(self.highlightTime/2).tween('textShadow', function(){
                    const interpolate = d3.interpolateNumber(0,self.svgWidth*.01)
                    const interpolateColor = d3.interpolateNumber(0,255)
                    const interpolateFontWeight = d3.interpolateNumber(self.fontWeight, self.fontWeight+200)
                    return function(t){              
                        d3.select(this).style('text-shadow', `${interpolate(t)}px ${interpolate(t)}px ${interpolate(t)}px rgb(${interpolateColor(t)},0,0)`).style('font-weight', interpolateFontWeight(t))}
                })
                    }, self.highlightTime/2)
                  }
                  else if(part == 2){
                    clearTimeout(intervalID5)
                    if(intervalID6){
                      clearTimeout(intervalID6)
                    }
                    intervalID6 = setTimeout(()=>{
                     
                      textNode.filter(function(d,i){
                        return d3.select(this)._groups[0][0].changed
                      }).property('changed', false).transition().duration(self.highlightTime/2).tween('textShadow', function(){
                        const interpolate = d3.interpolateNumber(self.svgWidth*.01,0)
                        const interpolateColor = d3.interpolateNumber(255,0)
                        const interpolateFontWeight = d3.interpolateNumber(self.fontWeight+200, self.fontWeight)
                        return function(t){              
                            d3.select(this).style('text-shadow', `${interpolate(t)}px ${interpolate(t)}px ${interpolate(t)}px rgb(${interpolateColor(t)},0,0)`).style('font-weight', interpolateFontWeight(t))}
                    })
                    }, self.highlightTime/2)
                  } 
                  else if(part ==3){
                    clearTimeout(intervalID6)
                    iCount = textNode._groups[0].length
                    if(intervalID4){
                      clearInterval(intervalID4)
                    } 
                    intervalID4 = setInterval(()=>{
                      textNode.filter(function(d,index){return index == iCount}).transition().duration(self.textSlidingTime).tween('text-transform', function(d){
                        let interpolate
                    if(d.rotate>0){
                      if(d.y<0){
                        interpolate = d3.interpolateNumber(d.y, d.y-self.svgHeight)
                      } else{
                        interpolate = d3.interpolateNumber(d.y,d.y+self.svgHeight)
                      }
                      
                      return function(t){
                        d3.select(this).attr('transform', `translate(${d.x}, ${interpolate(t)})rotate(${d.rotate})`)
                      }
                    } else{
                      if(d.x<0){
                        interpolate = d3.interpolateNumber(d.x,d.x - self.svgWidth)
                      } else{
                        interpolate = d3.interpolateNumber(d.x,d.x+self.svgWidth)
                      }
                      return function(t){
                        d3.select(this).attr('transform', `translate(${interpolate(t)}, ${d.y})rotate(${d.rotate})`)
                      }
                    } 
                      })
                      
                      if(iCount>-1){
                        iCount--
                      } 
                    },1)
                  } 
                  else if(part == 4){
                    
                    clearInterval(intervalID4)
                    if(intervalID7){
                      clearInterval(intervalID7)
                    }
                    intervalID7 = setInterval(()=>{
                      textNode.filter(function(d,index){return index == iCount}).transition().duration(self.textSlidingTime).tween('text-transform', function(d){
                        let interpolate
                    if(d.rotate>0){
                      if(d.y<0){
                        interpolate = d3.interpolateNumber(d.y-self.svgHeight, d.y)
                      } else{
                        interpolate = d3.interpolateNumber(d.y+self.svgHeight,d.y)
                      }
                      
                      return function(t){
                        d3.select(this).attr('transform', `translate(${d.x}, ${interpolate(t)})rotate(${d.rotate})`)
                      }
                    } else{
                      if(d.x<0){
                        interpolate = d3.interpolateNumber(d.x - self.svgWidth,d.x )
                      } else{
                        interpolate = d3.interpolateNumber(d.x +self.svgWidth,d.x)
                      }
                      return function(t){
                        d3.select(this).attr('transform', `translate(${interpolate(t)}, ${d.y})rotate(${d.rotate})`)
                      }
                    } 
                      })
                      if(iCount<=textNode._groups[0].length){
                        iCount++
                      } 
                    },1)
                 
                  }
                  part++
                }, self.waving ? (self.highlightTime+self.slidingTime +self.wavingTime)/5 : (self.highlightTime+self.slidingTime)/5)
              }, (self.waving ? self.highlightTime+self.slidingTime +self.wavingTime : self.highlightTime+self.slidingTime))
            }

            else if(!self.sliding && self.spiralHighlight){
              if(timer){
                clearInterval(timer)
              }
              timer = setInterval(()=>{
                let arrIndex = []
                let randomIndex 
                for(let i=0; i<3; i++){
                  randomIndex = Math.floor(Math.random()*10)
                  if(arrIndex.includes(randomIndex)){
                    i--
                  } else{
                    arrIndex.push(randomIndex)
                  }
                }

                textNode.filter(function(d,i){
                  return d3.select(this)._groups[0][0].changed
                }).property('changed', false).transition().duration(self.highlightTime/2).tween('textShadow', function(){
                  const interpolate = d3.interpolateNumber(self.svgWidth*.01,0)
                  const interpolateColor = d3.interpolateNumber(255,0)
                  const interpolateFontWeight = d3.interpolateNumber(self.fontWeight+200, self.fontWeight)
                  return function(t){              
                      d3.select(this).style('text-shadow', `${interpolate(t)}px ${interpolate(t)}px ${interpolate(t)}px rgb(${interpolateColor(t)},0,0)`).style('font-weight', interpolateFontWeight(t))}
              })
                textNode.filter(function(d,i){
                  return arrIndex.includes(i)
                }).property('changed', true).transition().duration(self.highlightTime/2).tween('textShadow', function(){
                    const interpolate = d3.interpolateNumber(0,self.svgWidth*.01)
                    const interpolateColor = d3.interpolateNumber(0,255)
                    const interpolateFontWeight = d3.interpolateNumber(self.fontWeight, self.fontWeight+200)
                    return function(t){              
                        d3.select(this).style('text-shadow', `${interpolate(t)}px ${interpolate(t)}px ${interpolate(t)}px rgb(${interpolateColor(t)},0,0)`).style('font-weight', interpolateFontWeight(t))}
                })
              }, self.highlightTime)
            }

            // if(self.waving){
            // //   if(self.sliding && self.spiralHighlight){
            // //     if(timeOutID1){
            // //       clearTimeout(timeOutID1)
            // //     } 
            // //     timeOutID1 = setTimeout(()=>{
            // //       const filter = d3.select(self.container).select('svg').append('defs').append('filter').attr('width','2').attr('id', 'pattern')
            // //     filter.append('feTurbulence').attr('numOctaves', '2').attr('seed', '0').attr('baseFrequency', '0.001').attr('stitchTiles', 'stitch').attr('width', self.svgWidth).attr('height', self.svgHeight)
            // //     filter.append('feTile').attr('width', self.svgWidth*2).attr('height', self.svgHeight)
            // //     filter.append('feOffset').append('animate').attr('attributeName', 'dx').attr('from', -self.svgWidth).attr('to', 0).attr('begin', '0s').attr('dur', `${(self.wavingTime)/1000}s`).attr('repeatCount', 'indefinite')
            // //     filter.append('feDisplacementMap').attr('in', 'SourceGraphic').attr('in2', 'TURBULENCE').attr('scale', `${self.waveScale}`).attr('result', 'dist')
            // //     d3.select(self.container).select('svg').style('filter', 'url(#pattern)').attr('filter', 'url(#pattern)')
            // //     }, 0)
                
            // //   } else{
            // //     const filter = d3.select(self.container).select('svg').append('defs').append('filter').attr('width','2').attr('id', 'pattern')
            // //     filter.append('feTurbulence').attr('numOctaves', '2').attr('seed', '0').attr('baseFrequency', '0.001').attr('stitchTiles', 'stitch').attr('width', self.svgWidth).attr('height', self.svgHeight)
            // //     filter.append('feTile').attr('width', self.svgWidth*2).attr('height', self.svgHeight)
            // //     filter.append('feOffset').append('animate').attr('attributeName', 'dx').attr('from', -self.svgWidth).attr('to', 0).attr('begin', '0s').attr('dur', `${self.wavingTime*2/1000}s`).attr('repeatCount', 'indefinite')
            // //     filter.append('feDisplacementMap').attr('in', 'SourceGraphic').attr('in2', 'TURBULENCE').attr('scale', `${self.waveScale}`).attr('result', 'dist')
            // //     d3.select(self.container).select('svg').style('filter', 'url(#pattern)').attr('filter', 'url(#pattern)')
              
            // //   }
                
            //   }
            
            });
            layout.start()
          }
       
                }
    renderNoMask(){
      const self = this
  
      let color = ['#ff128e','#ef11ff', '#ff5cf9','#ad4bff' ,'#985cff','#8585ff','#724aff', '#4a5cff','#4a7aff','#5c89ff','#85abff','#4bb4ff','#0fd5ff','#4affd5']
        var count = this.data.length

        var scale = d3.scaleLinear().range([1, Math.min(self.svgWidth, self.svgHeight) / 4]).domain([0, count])
        var words = d3.range(0, count).map((d, index) => {
        return {
          text: self.data[index].text ? self.data[index].text : self.data[index],
          size: self.data[index].size ? self.data[index].size : scale(d),
          color: self.data[index].color ? self.data[index].color : color[Math.floor(Math.random()*(color.length-1))]
        };
      });
      const layout = self.layout()
          .size([self.svgWidth, self.svgHeight])
          .words(words)
          .padding(self.padding)
          .font("Noto Sans KR, 'sans-serif'")
          .fontSize(function (d) {
            return d.size;
            }).on("end", function draw(words) {
            d3.select(self.container)
            .append('svg')
            .attr('id', `${self.container.id}-chart`)
            .attr("width", self.svgWidth).attr("height", self.svgHeight)
            .attr('viewBox',[0,0,self.svgWidth, self.svgHeight])
            .append("g")
            .attr(
            "transform",
            "translate(" +
            layout.size()[0] / 2 +
            "," +
            layout.size()[1] / 2 +
            ")"
            )
            .selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-size", function (d) {
            return d.size + "px";
            })
            .style("font-family", self.font)
            .style('font-weight', self.fontWeight)
            .attr('fill', d=>d.color)
            .attr("text-anchor", "middle")
            .text(function (d) {
              return d.text;
              })
            .style('opacity', '1')
            .attr("transform", function (d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
    })
    layout.start()
}
}
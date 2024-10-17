
var dotify = function(image, options, canvas) {

    width = canvas.width;
    height = canvas.height;
    
    image = black_and_white(image);

    
    let [dots_size, spread, sensitivity, mode] = options; 
    let patch_size = Math.floor(dots_size+spread);
    console.log(patch_size);
    
    if (!mode) {
        image = invert(image);
        sensitivity *= -1;
    }

    for (var x=0; x< Math.ceil(width/patch_size); x++) {
        for (var y=0; y< Math.ceil(height/patch_size); y++) {
            if (x*patch_size+patch_size/1.1 < width &&
                y*patch_size+patch_size/1.1 < height) {
                
                let mean = 0;
                for (var dx=0; dx<patch_size; dx++) {
                    for (var dy=0; dy<patch_size; dy++) {
                        idx = (x*patch_size+dx)*4 + (y*patch_size+dy)*4*width;
                        mean += image[idx]  ;
                        mean += image[idx+1];
                        mean += image[idx+2];
                    }
                }   

                mean /= patch_size*patch_size*3;
                mean = mean**0.5**sensitivity;
                mean = Math.min(1, mean);

                let cx = x+patch_size/2; 
                let cy = y+patch_size/2;
                for (var dx=0; dx<patch_size; dx++) {
                    for (var dy=0; dy<patch_size; dy++) {
                        let dist = mean - (Math.sqrt((x+dx-cx)**2 + (y+dy-cy)**2) + spread/2)/(patch_size/2) ;
                        
                        idx = (x*patch_size+dx)*4 + (y*patch_size+dy)*4*width;

                        if (dist>1) { 
                            image[idx]   = 1;
                            image[idx+1] = 1;
                            image[idx+2] = 1;

                        } else if (dist > 0.001) {
                            image[idx]   = dist;
                            image[idx+1] = dist;
                            image[idx+2] = dist;
                        }
                        else {
                            image[idx]   = 0;
                            image[idx+1] = 0;
                            image[idx+2] = 0;
                        }
                        
                    }
                }


            } else {
                for (var dx=0; dx<patch_size; dx++) {
                    for (var dy=0; dy<patch_size; dy++){
                        if (x*patch_size+dx < width && y*patch_size+dy < height){
                            idx = (x*patch_size+dx)*4 + (y*patch_size+dy)*4*width;
                            if (idx +2 < image.length) {
                                image[idx]   = 0;
                                image[idx+1] = 0;
                                image[idx+2] = 0;
                            }
                        }
                    }
                }  
            }
        }
    }

    if (!mode) {
        image = invert(image);
    }

    return image;
}

var black_and_white = function(image, args) {
    for (var i = 0; i < image.length/4; i++) {
        image[i*4]   = 0.299*image[i*4] + 0.587*image[i*4+1] + 0.144*image[i*4+2];
        image[i*4+1] = image[i*4];
        image[i*4+2] = image[i*4];
    }
    return image;
}

var invert = function (image, args) {
    for (var i = 0; i <image.length; i++) {
        image[i] = 1-image[i];
        if (i%4==3){
            image[i] = 1;
        }
    }
    return image;
}

var color_correction = function (image, args) {
    
    for (var i = 0; i <image.length; i++) {
        image[i] = image[i]**.5**(args[i%4]);

        if (i%4==3){
            image[i] = 1;   
        }
    }
    return image;
}

var color_filter = function (image, args) {
    
    for (var i = 0; i <image.length; i++) {
        image[i] *= args[i%4]/255;

        if (i%4==3){
            image[i] = 1;   
        }
    }
    return image;
}

var blend_with_original = function (image, args, base) {
    
    for (var i = 0; i <image.length; i++) {
        
        if (args[0] == 0) {
            image[i] *= base[i];
        
        } else if (args[0] == 1) {
            image[i] =  image[i]+base[i];
        
        } else if (args[0] == 2) {
            image[i] = (1-args[1])*image[i] + args[1]*base[i];
        
        }

        if (i%4==3){

            image[i] *= 1;   
        }
    }
    return image;
}


var extract_canvas = function(){
    var canvas = document.getElementById('canvas');

    let array = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
    let array_ = [];
    for (var i = 0; i < array.length; i++) {
        array_.push(array[i]/255);
    }
    return array_;
}

var write_canvas = function(array){
    
    img_data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    

    for (var i = 0; i < array.length; i++) {
        img_data.data[i] = array[i]*255.0;
    
    }
    canvas.getContext('2d').putImageData(img_data, 0, 0);
    
}

var inp_file;
var cache = [];
var base = null;
var width, height;
var filters = [];
var args = [];
var reduction;

var add_filter_base_btn_html = '<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_filter();" > + </div>';
var add_filters_list_btn_html = `<div>Available filters:</div>
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_black_white();" > black & white </div>   
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_blend_with_original();" > blend with original </div>   
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_color_correction();" > color correction </div>
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_color_filter();" > color filter </div>
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_dotify();" > dotify </div>   
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_invert();" > invert </div>
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_none();" > 🞨 </div>

`;

var dl_image = function() {
    if (!inp_file) {
        return;
    }
    document.getElementById("dl").innerHTML = `<div class="btn" style="cursor: pointer; float:left;"" >rendering image...`;

    setTimeout(function() {

         // Create a hidden canvas element
         var canvas = document.createElement('canvas');
         canvas.width = inp_file.width;
         canvas.height = inp_file.height;

         var ctx = canvas.getContext('2d');
         ctx.drawImage(inp_file, 0,0, canvas.width, canvas.height);    

         // render the image
         let array_ = ctx.getImageData(0, 0, canvas.width, canvas.height).data
         let array = [];
         for (var i = 0; i < array_.length; i++) {
             array.push(array_[i]/255);
         }
     
        let base_ = structuredClone(array);

         for (var i = 0; i<filters.length; i++) {
            if (filters[i] == blend_with_original) {
                array = filters[i](array, args[i], base_);
            } else {
                array = filters[i](array, args[i], canvas);
            }
       }
     
         img_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
     
         for (var i = 0; i < array.length; i++) {
             img_data.data[i] = array[i]*255.0;

         }
         canvas.getContext('2d').putImageData(img_data, 0, 0);
     
         document.getElementById("dl").innerHTML = `<div class="btn" style="cursor: pointer; float:left;" onclick="dl_image();" > save image </div>`; 
     
         // dl
         var a = document.createElement("a");
         document.body.appendChild(a);
         a.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
         a.download = "edited_img.png";
         a.click();    

    }, 0);
}


var loadFile = function(event) {
    image = document.getElementById('output');
    cache = [];
    file = event.target.files[0]
    

    if (! file.type.startsWith("image/") || file.type.endsWith("gif")) {
        return;
    }

    const img = new Image();
    img.onload = draw;
    img.src = URL.createObjectURL(file);
    
    function draw() {
        var canvas = document.getElementById('canvas');

        console.log(this);
        inp_file = this.cloneNode(true);


        ratio = this.width / this.height;
        h = Math.min(this.height, 720);
        w = Math.min(this.width, 1280);
        console.log(this.width/w, this.height/w, w/this.width);

        if (this.width/w > this.height/h) { 
            h = this.height * (w/this.width);
            console.log(h);
        }

        canvas.width = ratio*h;
        canvas.height = h;
        reduction = h / this.height;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(this, 0,0, h*ratio, h);
        update_canvas();
    }

    base = null;
}


var update_canvas = function(id) {
    
    var canvas = document.getElementById('canvas');
    if (typeof id === 'undefined' || cache.length == 0|| id<0) {
        cache = [];
        if (base === null) {
            array = extract_canvas();
            base = structuredClone(array);
        } else {
            var array = structuredClone(base);
        }
        console.log(array);
    
        for (var i = 0; i < filters.length; i++) {
            if (filters[i] == dotify) {
                array = filters[i](array, [args[i][0]*reduction, args[i][1]*reduction, args[i][2], args[i][3]], canvas); 
            } else if (filters[i] == blend_with_original) {
                array = filters[i](array, args[i], base);
            } else{
                array = filters[i](array, args[i], canvas);
            }



            cache.push(structuredClone(array));
        }   
    } else {
        array = structuredClone(cache[id]);
        cache = cache.splice(0, id+1);
        console.log(cache, id);

        for (var i = id+1; i < filters.length; i++) {
            if (filters[i] == dotify) {
                array = filters[i](array, [args[i][0]*reduction, args[i][1]*reduction, args[i][2], args[i][3]], canvas); 
            } else if (filters[i] == blend_with_original) {
                array = filters[i](array, args[i], base);
            } else{
                array = filters[i](array, args[i]);
            }

            cache.push(structuredClone(array));
        }   
    }  
    console.log(array);
    write_canvas(array);
}


var rerender_filters  = function(id) {
    var block = document.getElementById('filters-list');
    block.innerHTML = '';

    for (var i=0; i<filters.length; i++) {
        if (filters[i] == invert){
            block.innerHTML += `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">\
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 55%; float: left" > invert </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${i});" > ↑ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${i});" > ↓ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${i});" > 🞨 </div>
            </div></div>`;

        } else if (filters[i] == color_correction) {
            block.innerHTML += `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">\
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 55%; float: left" > color correction </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${i});" > ↑ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${i});" > ↓ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${i});" > 🞨 </div></div><br>
            <div >
                r: <input class="inp-nb" id="cc-r-${i}" value=${args[i][0]} type="text" inputmode="decimal" onchange="update_color_correct(${i}, 0)">
                g: <input class="inp-nb" id="cc-g-${i}" value=${args[i][1]} type="text" inputmode="decimal" onchange="update_color_correct(${i}, 1)">
                b: <input class="inp-nb" id="cc-b-${i}" value=${args[i][2]} type="text" inputmode="decimal" onchange="update_color_correct(${i}, 2)">
            </div></div>`;        

        }else if (filters[i] == color_filter) {
            block.innerHTML += `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">\
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 55%; float: left" > color filter </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${i});" > ↑ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${i});" > ↓ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${i});" > 🞨 </div></div><br>
            <div >
                r: <input class="inp-nb" id="cf-r-${i}" value=${args[i][0]} type="text" inputmode="decimal" onchange="update_color_filter(${i}, 0)">
                g: <input class="inp-nb" id="cf-g-${i}" value=${args[i][1]} type="text" inputmode="decimal" onchange="update_color_filter(${i}, 1)">
                b: <input class="inp-nb" id="cf-b-${i}" value=${args[i][2]} type="text" inputmode="decimal" onchange="update_color_filter(${i}, 2)">
            </div></div>`;        
        } 
        else if (filters[i] == black_and_white){
            block.innerHTML += `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">\
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 55%; float: left" > black & white </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${i});" > ↑ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${i});" > ↓ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${i});" > 🞨 </div>
            </div></div>`;
        
        }  else if (filters[i] == dotify){
            block.innerHTML += `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">\
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 55%; float: left" > dotify </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${i});" > ↑ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${i});" > ↓ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${i});" > 🞨 </div></div><br>
            <div>
                <div style="margin:1px; float:right">
                    mode: <label class="btn" style=" width:30%; cursor: pointer; text-align: center;" onclick="toggle_dotify_mode(${i});" > ${(args[i][3])? "white dots": "balck dots"} </label>
                </div>
                dot size   : <input class="inp-nb" id="dt0-${i}" value=${args[i][0]} type="text" style="margin-bottom:5px" inputmode="decimal" onchange="update_dotify(${i}, 0)"><br>
                spread     : <input class="inp-nb" id="dt1-${i}" value=${args[i][1]} type="text" style="margin-bottom:5px" inputmode="decimal"  onchange="update_dotify(${i}, 1)"><br>
                sensitivity: <input class="inp-nb" id="dt2-${i}" value=${args[i][2]} type="text" style="margin-bottom:5px" inputmode="decimal"  onchange="update_dotify(${i}, 2)">
            </div>
            </div></div>`;
        
        } else if (filters[i] == blend_with_original){

            var mode;
            var slider = "";

            if (args[i][0] == 0) {
                mode = "multiply";
            } else if (args[i][0] == 1) {
                mode = "add";
            } else if (args[i][0] == 2) {
                mode = "alpha";
                slider = `value: <input class="inp-nb" id="alpha-blend-value-${i}" value=${args[i][1]} type="text" style="margin-bottom:5px" inputmode="decimal" onchange="update_blend_alpha_val(${i})"
                            <div style="margin-top:10px">
                            <input type="range" min="0" max="1000" value="${args[i][1]*1000}" class="slider" id="alpha-blend-${i}" onchange="update_blend_alpha(${i})">  
                            </div>
                            `;
            }



            block.innerHTML += `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">\
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 55%; float: left" > blend with original </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${i});" > ↑ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${i});" > ↓ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${i});" > 🞨 </div></div><br>
            
                <div>
                <div >
                    mode: <label class="btn" style=" width:30%; cursor: pointer; text-align: center; margin-right:15px" onclick="toggle_blend_mode(${i});" > ${mode} </label>
                    ${slider}
                </div>
            </div>`;

        }
    }

    update_canvas(id);
}


var add_filter = function() {
    var block = document.getElementById('add-filter-container');
    block.innerHTML = add_filters_list_btn_html;
};



var add_black_white = function() {
    var block = document.getElementById('add-filter-container');
    block.innerHTML = add_filter_base_btn_html;
    filters.push(black_and_white);
    args.push(null);

    rerender_filters(filters.length-2);
}


var add_invert = function() {
    var block = document.getElementById('add-filter-container');
    block.innerHTML = add_filter_base_btn_html;
    filters.push(invert);
    args.push(null);

    rerender_filters(filters.length-2);
}

var add_color_filter = function() {
    
    var block = document.getElementById('add-filter-container');
    block.innerHTML = add_filter_base_btn_html;
    filters.push(color_filter);
    args.push([255, 255, 255]);
    
    
    rerender_filters(filters.length-2);
}


var update_color_filter = function(i, id) {
    if(id == 0){    
        correction = document.getElementById(`cf-r-${i}`).value;
    } else if(id == 1){ 
        correction = document.getElementById(`cf-g-${i}`).value;
    } else if(id == 2){
        correction = document.getElementById(`cf-b-${i}`).value;
    }

    if (isNaN(+(correction)))  {
        if(id == 0){    
            document.getElementById(`cf-r-${i}`).value = 0;
        } else if(id == 1){ 
            document.getElementById(`cf-g-${i}`).value = 0;
        } else if(id == 2){
            document.getElementById(`cf-b-${i}`).value = 0;
        }
        return;        
    }
    console.log(+(correction));

    if(id == 0 && +correction<0){    
        document.getElementById(`cf-r-${i}`).value = 0;
        correction = 0;
    
    } else if(id == 1 && +correction<0) { 
        document.getElementById(`cf-g-${i}`).value = 0;
        correction = 0;

    } else if(id == 2&& +correction<0) {
        document.getElementById(`cf-b-${i}`).value = 0;
        correction = 0;
    }

    if(id == 0 && +correction>255){    
        document.getElementById(`cf-r-${i}`).value = 255;
        correction = 255;
    
    } else if(id == 1 && +correction>255) { 
        document.getElementById(`cf-g-${i}`).value = 255;
        correction = 255;

    } else if(id == 2&& +correction>255) {
        document.getElementById(`cf-b-${i}`).value = 255;
        correction = 255;
    }
    


    args[i][id] = +(correction); 
    update_canvas(i-1);
}



var add_color_correction = function() {
    
    var block = document.getElementById('add-filter-container');
    block.innerHTML = add_filter_base_btn_html;
    filters.push(color_correction);
    args.push([0, 0, 0]);
    
    
    rerender_filters(filters.length-2);
}


var add_blend_with_original = function() {
    var block = document.getElementById('add-filter-container');
    block.innerHTML = add_filter_base_btn_html;
    filters.push(blend_with_original);
    args.push([0, 0.5]);

    rerender_filters(filters.length-2);
}

var toggle_blend_mode = function(i){
    args[i][0] = (args[i][0]+1)%3;
    rerender_filters(i-1);
}


var update_blend_alpha = function(i) {
    args[i][1] = document.getElementById(`alpha-blend-${i}`).value/1000;
    rerender_filters(i-1);
}

var update_blend_alpha_val = function(i) {
    var val = document.getElementById(`alpha-blend-value-${i}`).value;
    
    if (isNaN(+val)) {
        rerender_filters(i-1);
        return;

    } else if( +val < 0) {
        args[i][1] = 0;
        rerender_filters(i-1);
        return;

    } else if( +val > 1) {
        args[i][1] = 1;
        rerender_filters(i-1);
        return;
    }
    
    args[i][1] = +val;  
    rerender_filters(i-1);
}


var update_color_correct = function(i, id) {
    if(id == 0){    
        correction = document.getElementById(`cc-r-${i}`).value;
    } else if(id == 1){ 
        correction = document.getElementById(`cc-g-${i}`).value;
    } else if(id == 2){
        correction = document.getElementById(`cc-b-${i}`).value;
    }

    if (isNaN(+(correction)))  {
        if(id == 0){    
            document.getElementById(`cc-r-${i}`).value = 0;
        } else if(id == 1){ 
            document.getElementById(`cc-g-${i}`).value = 0;
        } else if(id == 2){
            document.getElementById(`cc-b-${i}`).value = 0;
        }
        return;        
    }
    console.log(+(correction));


    args[i][id] = +(correction); 
    update_canvas(i-1);
}

var add_dotify = function() {
    var block = document.getElementById('add-filter-container');
    block.innerHTML = add_filter_base_btn_html;
    filters.push(dotify);
    args.push([10, 0.5, 0, true]);

    rerender_filters(filters.length-2);
}

var add_none = function() {
    var block = document.getElementById('add-filter-container');
    block.innerHTML = add_filter_base_btn_html;
}

var update_dotify = function(i, id) {
    if(id == 0){    
        correction = document.getElementById(`dt0-${i}`).value;
    } else if(id == 1){ 
        correction = document.getElementById(`dt1-${i}`).value;
    }  else if(id == 2){ 
        correction = document.getElementById(`dt2-${i}`).value;
    } 

    if (isNaN(+(correction)))  {
        if(id == 0){    
            document.getElementById(`dt0-${i}`).value = 10;
        } else if(id == 1){ 
            document.getElementById(`dt1-${i}`).value = 0.5;
        } else if(id == 1){ 
            document.getElementById(`dt2-${i}`).value = 0;
        }
        return;        
    }

    if(id == 0 && +correction<1){    
        document.getElementById(`dt0-${i}`).value = 1;
        correction = 1;
    } 
    
    if(id == 1 && +correction<0){    
        document.getElementById(`dt1-${i}`).value = 0;
        correction = 0;
    } 


    args[i][id] = +(correction); 
    update_canvas(i-1);
}

var toggle_dotify_mode = function(i) {
    args[i][3] =!args[i][3];
    rerender_filters(i-1);
}


var remove_filter = function(i) {
    filters.splice(i, 1);
    args.splice(i, 1);
    rerender_filters(i-1);
}

var up_filter = function(i) {
    if (i > 0) {
        var temp = filters[i];
        filters[i] = filters[i - 1];
        filters[i - 1] = temp;

        temp = args[i];
        args[i] = args[i - 1];
        args[i - 1] = temp;
    }
    rerender_filters(i-2);
}

var down_filter = function(i) {
    if (i < filters.length - 1) {
        var temp = filters[i];
        filters[i] = filters[i + 1];
        filters[i + 1] = temp;

        temp = args[i];
        args[i] = args[i + 1];
        args[i + 1] = temp;
    }
    rerender_filters(i-1);
}
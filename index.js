
var dotify = function(image, options) {

    
    var canvas = document.getElementById('canvas');
    width = canvas.width;
    height = canvas.height;
    
    
    image = black_and_white(image);

    
    let [dots_size, spread, sensitivity] = options; 
    let patch_size = Math.floor(dots_size+spread);
    console.log(patch_size);
    

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
                mean = mean**0.9**sensitivity;
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
        image[i] = image[i]**.85**(args[i%4]);

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


var cache = [];
var base = null;
var width, height;
var filters = [];
var args = [];

var add_filter_base_btn_html = '<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_filter();" > + </div>';
var add_filters_list_btn_html = `<div>Available filters:</div>
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_black_white();" > black & white </div>   
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_color_correction();" > color correction </div>
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_color_filter();" > color filter </div>
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_dotify();" > dotify </div>   
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_invert();" > invert </div>
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_none();" > x </div>

`;

var dl_image = function() {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    a.download = "edited_img.png";
    a.click();
}

var loadFile = function(event) {
    image = document.getElementById('output');
    cache = [];
    file = event.target.files[0]
    console.log(file);



    if (! file.type.startsWith("image/") || file.type.endsWith("gif")) {
        return;
    }

    const img = new Image();
    img.onload = draw;
    img.src = URL.createObjectURL(file);
    
    function draw() {
        var canvas = document.getElementById('canvas');
        
        width = canvas.width;
        height = canvas.height;

        canvas.width = this.width;
        canvas.height = this.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(this, 0,0);
        update_canvas();
    }

    base = null;
}


var update_canvas = function(id) {
    
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
            array = filters[i](array, args[i]); 
            cache.push(structuredClone(array));
        }   
    } else {
        array = structuredClone(cache[id]);
        cache = cache.splice(0, id+1);
        console.log(cache, id);
        console.log("cached");

        for (var i = id+1; i < filters.length; i++) {
            array = filters[i](array, args[i]); 
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
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${i});" > x </div>
            </div></div>`;

        } else if (filters[i] == color_correction) {
            block.innerHTML += `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">\
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 55%; float: left" > color correction </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${i});" > ↑ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${i});" > ↓ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${i});" > x </div></div><br>
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
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${i});" > x </div></div><br>
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
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${i});" > x </div>
            </div></div>`;
        }  else if (filters[i] == dotify){
            block.innerHTML += `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">\
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 55%; float: left" > dotify </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${i});" > ↑ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${i});" > ↓ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${i});" > x </div></div><br>
            <div>
                dot size   : <input class="inp-nb" id="dt0-${i}" value=${args[i][0]} type="text" style="margin-bottom:5px" inputmode="decimal" onchange="update_dotify(${i}, 0)"><br>
                spread     : <input class="inp-nb" id="dt1-${i}" value=${args[i][1]} type="text" style="margin-bottom:5px" inputmode="decimal"  onchange="update_dotify(${i}, 1)"><br>
                sensitivity: <input class="inp-nb" id="dt2-${i}" value=${args[i][2]} type="text" style="margin-bottom:5px" inputmode="decimal"  onchange="update_dotify(${i}, 2)">
            </div>
            </div></div>`;
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

add_dotify = function() {
    var block = document.getElementById('add-filter-container');
    block.innerHTML = add_filter_base_btn_html;
    filters.push(dotify);
    args.push([10, 0.5, 0]);

    rerender_filters(filters.length-2);
}

add_none = function() {
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
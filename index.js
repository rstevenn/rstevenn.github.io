

class Dither {
    filters = [[[0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]],
            
           [[0, 0, 0],
            [0, 1, 0],
            [0, 0, 0]],

           [[0, 0, 0],
            [1, 0, 1],
            [0, 0, 0]],

           [[1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]],
            
           [[1, 0, 1],
            [0, 0, 0],
            [1, 0, 1],],
           
           [[1, 0, 1],
            [0, 1, 0],
            [1, 0, 1],],
            
           [[1, 1, 0],
            [1, 0, 1],
            [0, 1, 1]],

           [[1, 0, 1],
            [1, 0, 1],
            [1, 0, 1]],


           [[1, 1, 1],
            [0, 1, 0],
            [1, 1, 1]],

           [[1, 1, 1],
            [1, 0, 1],
            [1, 1, 1],],
           
           [[1, 1, 1],
            [1, 1, 1],
            [1, 1, 1],],
    ]
    
    constructor() {
        this.patch_size = 10;
        this.nb_colors = 2;
        this.sensitivity = 0;
        this.monochrome = true;
    }

    apply(image, canvas, ratio) {
        
        patch_size = Math.ceil(this.patch_size*ratio);
        width = canvas.width;
        height = canvas.height;

        for (var x=0; x< Math.ceil(width/patch_size); x++) {
            for (var y=0; y< Math.ceil(height/patch_size); y++) {
                
                
                    
                let mean = 0;
                let r=0, g=0, b = 0;
                for (var dx=0; dx<patch_size; dx++) {
                    for (var dy=0; dy<patch_size; dy++) {
                        idx = (x*patch_size+dx)*4 + (y*patch_size+dy)*4*width;
                        
                        if (x*patch_size+dx+2 <width && y*patch_size+dy+2 <height){
                            if (this.monochrome) {
                                mean += 0.299*image[idx]  ;
                                mean += 0.587*image[idx+1];
                                mean += 0.144*image[idx+2];
                            } else {
                                r += image[idx]  ;
                                g += image[idx+1];
                                b += image[idx+2];
                            }
                        }
                    }
                }   
               
                mean /= patch_size*patch_size;
                mean = mean**0.5**sensitivity;
                mean = Math.min(1, mean);
                
                r /= patch_size*patch_size;
                r = r**0.5**sensitivity;
                r = Math.min(1, r);
                
                g /= patch_size*patch_size;
                g = g**0.5**sensitivity;
                g = Math.min(1, g);
                
                b /= patch_size*patch_size;
                b = b**0.5**sensitivity;
                b = Math.min(1, b);
                
                
                for (var dx=0; dx<patch_size; dx++) {
                    for (var dy=0; dy<patch_size; dy++) {
                        if (this.monochrome) {
                        
                            let color_id  = Math.floor(mean*(nb_colors-1));
                            let max_color = (color_id+1) / (nb_colors-1);
                            let min_color = color_id     / (nb_colors-1);
    
                            let interval_val = (mean-min_color) / (max_color-min_color);
    
                            let idx = Math.floor(interval_val*(filters.length-1));        
                            let filter = filters[idx];
                            //if (!filter) continue;
    
                            let u = Math.floor(3*dx/patch_size);
                            let v = Math.floor(3*dy/patch_size);
    
                            idx = (x*patch_size+dx)*4 + (y*patch_size+dy)*4*width;
    
                            if (x*patch_size+dx <width && y*patch_size+dy <height) {
                            
                                image[idx]   = filter[u][v]     * max_color +
                                               (1-filter[u][v]) * min_color;
    
                                image[idx+1] = filter[u][v]     * max_color +
                                               (1-filter[u][v]) * min_color;
    
                                image[idx+2] = filter[u][v]     * max_color +
                                               (1-filter[u][v]) * min_color;
    
                                image[idx+3] = 1;
                            }
    
                        } else {
                            let rcolor_id = Math.floor(r*(nb_colors-1));
                            let rmax_color = (rcolor_id+1) / (nb_colors-1);
                            let rmin_color = rcolor_id     / (nb_colors-1);
    
                            let gcolor_id = Math.floor(g*(nb_colors-1));
                            let gmax_color = (gcolor_id+1) / (nb_colors-1);
                            let gmin_color = gcolor_id     / (nb_colors-1);
    
                            
                            let bcolor_id = Math.floor(b*(nb_colors-1));
                            let bmax_color = (bcolor_id+1) / (nb_colors-1);
                            let bmin_color = bcolor_id     / (nb_colors-1);
    
                            let rinterval_val = (r-rmin_color) / (rmax_color-rmin_color);
                            let ginterval_val = (g-gmin_color) / (gmax_color-gmin_color);
                            let binterval_val = (b-bmin_color) / (bmax_color-bmin_color);
    
                            let ridx = Math.floor(rinterval_val*(filters.length-1)); 
                            let gidx = Math.floor(ginterval_val*(filters.length-1));
                            let bidx = Math.floor(binterval_val*(filters.length-1));
    
                            let rfilter = filters[ridx];
                            let gfilter = filters[gidx];
                            let bfilter = filters[bidx];
    
                            let u = Math.floor(3*dx/patch_size);
                            let v = Math.floor(3*dy/patch_size);
    
                            let idx = (x*patch_size+dx)*4 + (y*patch_size+dy)*4*width;
    
                            if (x*patch_size+dx <width && y*patch_size+dy <height) {
                            
                                image[idx]   = rfilter[u][v]     * rmax_color +
                                               (1-rfilter[u][v]) * rmin_color;
    
                                image[idx+1] = gfilter[u][v]     * gmax_color +
                                               (1-gfilter[u][v]) * gmin_color;
    
                                image[idx+2] = bfilter[u][v]     * bmax_color +
                                               (1-bfilter[u][v]) * bmin_color;
    
                                image[idx+3] = 1;
                            }
    
                        }
    
                    }
                }
                    
            }
        }

        return image;
    }

    get_add_html() {
        return `<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_filter(new Dither());" > ditherify </div>`
    }

    toggle_color(i) {
        this.monochrome =!this.monochrome;
        rerender_filters(i-2);
    }

    update_patch_size(i) {
        let update = Document.getElementById(`dth-patch-size-${i}`).value;

        if (isNaN(+update)) {
            Document.getElementById(`dth-patch-size-${i}`).value = this.patch_size;
            rerender_filters(i-2);
            return;
        }

        if (+update < 3) {
            Document.getElementById(`dth-patch-size-${i}`).value = 3;
            this.patch_size = 3;
        }

        this.patch_size = +update;
        rerender_filters(i-2);
    }

    update_nb_colors(i) {
        let update = Document.getElementById(`dth-nb-colors-${i}`).value;

        if (isNaN(+update)) {
            Document.getElementById(`dth-nb-colors-${i}`).value = this.nb_colors;
            rerender_filters(i-2);
            return;
        }

        if (+update < 2) {
            Document.getElementById(`dth-nb-colors-${i}`).value = 2;
            this.nb_colors = 2;
        }

        this.nb_colors = +update;
        rerender_filters(i-2);
    }

    update_sensitivity(i) {
        let update = Document.getElementById(`dth-sensitivity-${i}`).value;

        if (isNaN(+update)) {
            Document.getElementById(`dth-sensitivity-${i}`).value = this.sensitivity;
            rerender_filters(i-2);
            return;
        }

        this.sensitivity = +update;
        rerender_filters(i-2);
    }

    get_filter_html(i) {
        return `<div class="filter-el">
        <div style="padding-top: 5px; padding-bottom: 25px;">\
            <div class="btn" id="filter-${i}" style="cursor: pointer; width: 55%; float: left" > ditherify </div>
            <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${i});" > ↑ </div>
            <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${i});" > ↓ </div>
            <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${i});" > 🞨 </div></div><br>
            <div>
                <div style="margin:1px; float:right">
                mode: <label class="btn" style=" width:30%; cursor: pointer; text-align: center;" onclick="filters[${i}].toggle_color(${i});" > ${this.monochrome? "monochrome": "colored"} </label>
            </div>
            patch size : <input class="inp-nb" id="dth-patch-size-${i}" value=${this.patch_size} type="text" style="margin-bottom:5px" inputmode="decimal"  onchange="filters[${i}].update_patch_size(${i});"><br>
            nb colors  : <input class="inp-nb" id="dth-nb-colors-${i}" value=${this.nb_colors}   type="text" style="margin-bottom:5px" inputmode="decimal"  onchange="filters[${i}].update_nb_colors(${i});"><br>
            sensitivity: <input class="inp-nb" id="dth-sensitivity${i}" value=${this.sensitivity} type="text" style="margin-bottom:5px" inputmode="decimal" onchange="filters[${i}].update_sensitivity(${i});">
        </div>
        </div></div>`;
    }
}


class Dotify {
    
    constructor () {
        this.dots_size = 10;
        this.spread = 0.5;
        this.sensitivity = 0;
        this.blck_dots = true;
        this.monochrome = true;
    }
}


// impl


var dithering = function (image, args, canvas) {
    var filters = [[[0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]],
            
           [[0, 0, 0],
            [0, 1, 0],
            [0, 0, 0]],

           [[0, 0, 0],
            [1, 0, 1],
            [0, 0, 0]],

           [[1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]],
            
           [[1, 0, 1],
            [0, 0, 0],
            [1, 0, 1],],
           
           [[1, 0, 1],
            [0, 1, 0],
            [1, 0, 1],],
            
           [[1, 1, 0],
            [1, 0, 1],
            [0, 1, 1]],

           [[1, 0, 1],
            [1, 0, 1],
            [1, 0, 1]],


           [[1, 1, 1],
            [0, 1, 0],
            [1, 1, 1]],

           [[1, 1, 1],
            [1, 0, 1],
            [1, 1, 1],],
           
           [[1, 1, 1],
            [1, 1, 1],
            [1, 1, 1],],
    ]


    
    var [patch_size, nb_colors, sensitivity, black_white] = args;
    patch_size = Math.ceil(patch_size);
    console.log(patch_size, nb_colors, sensitivity);
    width = canvas.width;
    height = canvas.height;
    console.log(width, height);


    

    for (var x=0; x< Math.ceil(width/patch_size); x++) {
        for (var y=0; y< Math.ceil(height/patch_size); y++) {
            
            
                
            let mean = 0;
            let r=0, g=0, b = 0;
            for (var dx=0; dx<patch_size; dx++) {
                for (var dy=0; dy<patch_size; dy++) {
                    idx = (x*patch_size+dx)*4 + (y*patch_size+dy)*4*width;
                    
                    if (x*patch_size+dx+2 <width && y*patch_size+dy+2 <height){
                        if (black_white) {
                            mean += 0.299*image[idx]  ;
                            mean += 0.587*image[idx+1];
                            mean += 0.144*image[idx+2];
                        } else {
                            r += image[idx]  ;
                            g += image[idx+1];
                            b += image[idx+2];
                        }
                    }
                }
            }   
           
            mean /= patch_size*patch_size;
            mean = mean**0.5**sensitivity;
            mean = Math.min(1, mean);
            
            r /= patch_size*patch_size;
            r = r**0.5**sensitivity;
            r = Math.min(1, r);
            
            g /= patch_size*patch_size;
            g = g**0.5**sensitivity;
            g = Math.min(1, g);
            
            b /= patch_size*patch_size;
            b = b**0.5**sensitivity;
            b = Math.min(1, b);
            
            
            for (var dx=0; dx<patch_size; dx++) {
                for (var dy=0; dy<patch_size; dy++) {
                    if (black_white) {
                    
                        let color_id  = Math.floor(mean*(nb_colors-1));
                        let max_color = (color_id+1) / (nb_colors-1);
                        let min_color = color_id     / (nb_colors-1);

                        let interval_val = (mean-min_color) / (max_color-min_color);

                        let idx = Math.floor(interval_val*(filters.length-1));        
                        let filter = filters[idx];
                        //if (!filter) continue;

                        let u = Math.floor(3*dx/patch_size);
                        let v = Math.floor(3*dy/patch_size);

                        idx = (x*patch_size+dx)*4 + (y*patch_size+dy)*4*width;

                        if (x*patch_size+dx <width && y*patch_size+dy <height) {
                        
                            image[idx]   = filter[u][v]     * max_color +
                                           (1-filter[u][v]) * min_color;

                            image[idx+1] = filter[u][v]     * max_color +
                                           (1-filter[u][v]) * min_color;

                            image[idx+2] = filter[u][v]     * max_color +
                                           (1-filter[u][v]) * min_color;

                            image[idx+3] = 1;
                        }

                    } else {
                        let rcolor_id = Math.floor(r*(nb_colors-1));
                        let rmax_color = (rcolor_id+1) / (nb_colors-1);
                        let rmin_color = rcolor_id     / (nb_colors-1);

                        let gcolor_id = Math.floor(g*(nb_colors-1));
                        let gmax_color = (gcolor_id+1) / (nb_colors-1);
                        let gmin_color = gcolor_id     / (nb_colors-1);

                        
                        let bcolor_id = Math.floor(b*(nb_colors-1));
                        let bmax_color = (bcolor_id+1) / (nb_colors-1);
                        let bmin_color = bcolor_id     / (nb_colors-1);

                        let rinterval_val = (r-rmin_color) / (rmax_color-rmin_color);
                        let ginterval_val = (g-gmin_color) / (gmax_color-gmin_color);
                        let binterval_val = (b-bmin_color) / (bmax_color-bmin_color);

                        let ridx = Math.floor(rinterval_val*(filters.length-1)); 
                        let gidx = Math.floor(ginterval_val*(filters.length-1));
                        let bidx = Math.floor(binterval_val*(filters.length-1));

                        let rfilter = filters[ridx];
                        let gfilter = filters[gidx];
                        let bfilter = filters[bidx];

                        let u = Math.floor(3*dx/patch_size);
                        let v = Math.floor(3*dy/patch_size);

                        let idx = (x*patch_size+dx)*4 + (y*patch_size+dy)*4*width;

                        if (x*patch_size+dx <width && y*patch_size+dy <height) {
                        
                            image[idx]   = rfilter[u][v]     * rmax_color +
                                           (1-rfilter[u][v]) * rmin_color;

                            image[idx+1] = gfilter[u][v]     * gmax_color +
                                           (1-gfilter[u][v]) * gmin_color;

                            image[idx+2] = bfilter[u][v]     * bmax_color +
                                           (1-bfilter[u][v]) * bmin_color;

                            image[idx+3] = 1;
                        }

                    }

                }
            }
                
        }
    }
    


    return image;
}





var dotify = function(image, options, canvas) {

    width = canvas.width;
    height = canvas.height;
    

    
    let [dots_size, spread, sensitivity, mode, monochrome] = options; 
    let patch_size = Math.max(Math.floor(dots_size+spread), 1);
    console.log(patch_size, options);
    
    if (!mode) {
        image = invert(image);
        sensitivity *= -1;
    }

    for (var x=0; x< Math.ceil(width/patch_size); x++) {
        for (var y=0; y< Math.ceil(height/patch_size); y++) {
            if (x*patch_size+patch_size/1.1 < width &&
                y*patch_size+patch_size/1.1 < height) {
                
                let mean = 0;
                let r = 0;
                let g = 0;
                let b = 0;

                for (var dx=0; dx<patch_size; dx++) {
                    for (var dy=0; dy<patch_size; dy++) {
                        idx = (x*patch_size+dx)*4 + (y*patch_size+dy)*4*width;
                        mean += 0.299*image[idx]  ;
                        mean += 0.587*image[idx+1];
                        mean += 0.144*image[idx+2];

                        r += image[idx]  ;
                        g += image[idx+1];
                        b += image[idx+2];
                    }
                }   

                mean /= patch_size*patch_size;
                mean = mean**0.5**sensitivity;
                mean = Math.min(1, mean);

                r /= patch_size*patch_size;
                r = r**0.5**sensitivity;
                r = Math.min(1, r);

                g /= patch_size*patch_size;
                g = g**0.5**sensitivity;
                g = Math.min(1, g);

                b /= patch_size*patch_size;
                b = b**0.5**sensitivity;
                b = Math.min(1, b);


                if (monochrome) {
                    r = 1;
                    g = 1;
                    b = 1;
                }

                let cx = x+patch_size/2; 
                let cy = y+patch_size/2;
                for (var dx=0; dx<patch_size; dx++) {
                    for (var dy=0; dy<patch_size; dy++) {
                        let dist = mean - (Math.sqrt((x+dx-cx)**2 + (y+dy-cy)**2) + spread/2)/(patch_size/2) ;
                        
                        idx = (x*patch_size+dx)*4 + (y*patch_size+dy)*4*width;

                        if (dist>1) { 
                            image[idx]   = r;
                            image[idx+1] = g;
                            image[idx+2] = b;

                        } else if (dist > 0.001) {
                            image[idx]   = dist*r;
                            image[idx+1] = dist*g;
                            image[idx+2] = dist*b;
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


var exposure = function (image, args) {
    for (var i=0; i<image.length; i++) {
        if (i%4 != 3) {
            image[i] = image[i]**0.5**args;
        }
    }
    return image;
}

var saturation = function (image, args) {
    for (var i=0; i<image.length/4; i++) {
        
        let mean = 0;
        mean += 0.299*image[i*4]  ;
        mean += 0.587*image[i*4+1];
        mean += 0.144*image[i*4+2];
    
        image[i*4]   = (1-args) * mean + (args) * image[i*4];
        image[i*4+1] = (1-args) * mean + (args) * image[i*4+1];
        image[i*4+2] = (1-args) * mean + (args) * image[i*4+2];
    }
    return image;
}

var normalize = function (image, args) {
    
    let max =  image.reduce(function(a, b) {
        return Math.max(a, b);
      });
    let min = image.reduce(function(a, b) {
        return Math.min(a, b);
    });

    for (var i=0; i<image.length/4; i++) {
        image[i*4]   = (image[i*4]-min)/(max-min);
        image[i*4+1] = (image[i*4+1]-min)/(max-min);
        image[i*4+2] = (image[i*4+2]-min)/(max-min);
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
            image[i] =  Math.min(image[i]+base[i], 1);
        
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
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_ditherify();" > ditherify </div>
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_exposure();" > exposure </div>
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_invert();" > invert </div>
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_normalize();" > normalize </div>
<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_saturation();" > saturation </div>
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
         loadFile();         

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
    console.log(reduction);
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
                array = filters[i](array, [args[i][0]*reduction, args[i][1]*reduction, args[i][2], args[i][3], args[i][4]], canvas); 
            } else if (filters[i] == dithering) {
                array = filters[i](array, [args[i][0]*reduction, args[i][1], args[i][2], args[i][3]], canvas); 
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
                array = filters[i](array, [args[i][0]*reduction, args[i][1]*reduction, args[i][2], args[i][3], args[i][4]], canvas); 
            } else if (filters[i] == dithering) {
                array = filters[i](array, [args[i][0]*reduction, args[i][1], args[i][2], args[i][3]], canvas); 
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

        } else if (filters[i] == color_filter) {
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
        
        } else if (filters[i] == normalize){
            block.innerHTML += `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">\
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 55%; float: left" > normalize </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${i});" > ↑ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${i});" > ↓ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${i});" > 🞨 </div>
            </div></div>`;
        
        } else if (filters[i] == exposure){
            block.innerHTML += `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">\
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 55%; float: left" > exposure </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${i});" > ↑ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${i});" > ↓ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${i});" > 🞨 </div></div><br>


                <div >
                    value: <input class="inp-nb" id="exp-${i}" value=${args[i]} type="text" inputmode="decimal" onchange="update_exposure(${i})">
                </div>
            </div>`;

        
        } else if (filters[i] == saturation){
            block.innerHTML += `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">\
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 55%; float: left" > saturation </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${i});" > ↑ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${i});" > ↓ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${i});" > 🞨 </div></div><br>


                <div >
                    value: <input class="inp-nb" id="sat-${i}" value=${args[i]} type="text" inputmode="decimal" onchange="update_saturation(${i})">
                </div>
            </div>`;

        
        } else if (filters[i] == dotify){
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
                
                <div style="margin:1px; float:right">
                    color mode: <label class="btn" style=" width:30%; cursor: pointer; text-align: center;" onclick="toggle_dotify_cmode(${i});" > ${(args[i][4])? "balck & white": "colored"} </label>
                </div>
                spread     : <input class="inp-nb" id="dt1-${i}" value=${args[i][1]} type="text" style="margin-bottom:5px" inputmode="decimal"  onchange="update_dotify(${i}, 1)"><br>
                sensitivity: <input class="inp-nb" id="dt2-${i}" value=${args[i][2]} type="text" style="margin-bottom:5px" inputmode="decimal"  onchange="update_dotify(${i}, 2)">
            </div>
            </div></div>`;
        
        } else if (filters[i] == dithering){
            block.innerHTML += `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">\
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 55%; float: left" > ditherify </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${i});" > ↑ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${i});" > ↓ </div>
                <div class="btn" id="filter-${i}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${i});" > 🞨 </div></div><br>
                <div>
                    <div style="margin:1px; float:right">
                    mode: <label class="btn" style=" width:30%; cursor: pointer; text-align: center;" onclick="toggle_dither_color(${i});" > ${(args[i][3])? "black & white": "colored"} </label>
                </div>
                patch size : <input class="inp-nb" id="dth0-${i}" value=${args[i][0]} type="text" style="margin-bottom:5px" inputmode="decimal" onchange="update_ditherify(${i}, 0)"><br>
                nb colors  : <input class="inp-nb" id="dth1-${i}" value=${args[i][1]} type="text" style="margin-bottom:5px" inputmode="decimal"  onchange="update_ditherify(${i}, 1)"><br>
                sensitivity: <input class="inp-nb" id="dth2-${i}" value=${args[i][2]} type="text" style="margin-bottom:5px" inputmode="decimal"  onchange="update_ditherify(${i}, 2)">
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

var add_saturation = function() {
    var block = document.getElementById('add-filter-container');
    block.innerHTML = add_filter_base_btn_html;
    filters.push(saturation);
    args.push(1);
    
    rerender_filters(filters.length-2);
}

var update_saturation = function(i) {
    var val = document.getElementById(`sat-${i}`).value;
    if (isNaN(+val)) {
        document.getElementById(`sat-${i}`).value = args[i];
        return;
    }
    
    if (+val < 0) {
        document.getElementById(`sat-${i}`).value = 0;
        args[i] = 0;
    }


    args[i] = val;
    
    rerender_filters(i-1);
}

var add_exposure = function() {
    var block = document.getElementById('add-filter-container');
    block.innerHTML = add_filter_base_btn_html;
    filters.push(exposure);
    args.push(0);
    
    rerender_filters(filters.length-2);
}

var update_exposure = function(i) {
    var val = document.getElementById(`exp-${i}`).value;
    if (isNaN(+val)) {
        document.getElementById(`exp-${i}`).value = args[i];
        return;
    }
    
    args[i] = val;
    
    rerender_filters(i-1);
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

var add_ditherify = function() {
    var block = document.getElementById('add-filter-container');
    block.innerHTML = add_filter_base_btn_html;
    filters.push(dithering);
    args.push([10, 2, 0, true]);

    rerender_filters(filters.length-2);
}

var update_ditherify = function(i, id) {
    if(id == 0){    
        correction = document.getElementById(`dth0-${i}`).value;
    } else if(id == 1){ 
        correction = document.getElementById(`dth1-${i}`).value;
    }  else if(id == 2){ 
        correction = document.getElementById(`dth2-${i}`).value;
    } 

    if (isNaN(+(correction)))  {
        if(id == 0){    
            document.getElementById(`dth0-${i}`).value = 10;
        } else if(id == 1){ 
            document.getElementById(`dth1-${i}`).value = 2;
        } else if(id == 1){ 
            document.getElementById(`dth2-${i}`).value = 0;
        }
        return;        
    }

    if(id == 0 && +correction<1) {    
        document.getElementById(`dth0-${i}`).value = 1;
        correction = 1;
    } 
    
    if(id == 1 && +correction<2){    
        document.getElementById(`dth1-${i}`).value = 2;
        correction = 0;
    } 


    args[i][id] = +(correction); 
    update_canvas(i-1);
}

var toggle_dither_color = function(i) {
    args[i][3] =!args[i][3];
    rerender_filters(i-2);
}


var add_dotify = function() {
    var block = document.getElementById('add-filter-container');
    block.innerHTML = add_filter_base_btn_html;
    filters.push(dotify);
    args.push([10, 0.5, 0, true, true]);

    rerender_filters(filters.length-2);
}

var add_normalize = function() {
    var block = document.getElementById('add-filter-container');
    block.innerHTML = add_filter_base_btn_html;
    filters.push(normalize);
    args.push(null);

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

var toggle_dotify_cmode = function(i) {
    args[i][4] =!args[i][4];
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
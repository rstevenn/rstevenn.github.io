
// global vars
var inp_file;
var base = null;
var width, height;
var filters = [];
var reduction;



// export wasm functions
var core_init;
var core_invert;
var core_color_filter;
var core_color_correction;
var core_exposure;
var core_saturation;
var core_contrast;
var core_black_and_white;
var core_normalize;
var core_blend_add;
var core_blend_mult;
var core_blend_linear;
var core_dotify;
var core_ditherify;
var core_limit_color_palette;
var core_pixellize;


Module['onRuntimeInitialized'] = ((_) => {

    core_init = Module.cwrap("main",
        null,
        null);
    

    core_invert = Module.cwrap("invert",
        null,
        ["number", "number"]);


    core_color_filter = Module.cwrap("color_filter",
        null,
        ["number", "number", "number", "number"]);


    core_color_correction = Module.cwrap("color_correction",
            null,
            ["number", "number", "number", "number"]);
    

    core_exposure = Module.cwrap("exposure",
        null,
        ["number", "number", "number"]);


    core_saturation = Module.cwrap("saturation",
        null,
        ["number", "number", "number"]);

    
    core_contrast = Module.cwrap("contrast",
        null,
        ["number", "number", "number"]);

    
    core_black_and_white = Module.cwrap("black_and_white",
        null,
        ["number", "number"]);


    core_normalize = Module.cwrap("normalize",
        null,
        ["number", "number"]);

    
    core_blend_add = Module.cwrap("blend_add",
        null,
        ["number", "number", "number"]);

    core_blend_mult = Module.cwrap("blend_mult",
        null,
        ["number", "number", "number"]);

        core_blend_linear = Module.cwrap("blend_alpha",
        null,
        ["number", "number", "number", "number"]);


    core_dotify = Module.cwrap("dotify",
        null,
        ["number", "number", "number", "number", "number",
         "number", "number", "number", "number"
        ]);


    core_ditherify = Module.cwrap("dithering",
        null,
        ["number", "number", "number", "number", "number",
         "number", "number", "number", 
        ]);


    core_limit_color_palette = Module.cwrap("limit_color_palette",
        null,
        ["number", "number", "number"]);


    core_pixellize = Module.cwrap("pixellize",
        null,
        ["number", "number", "number", "number",
         "number", "number",   
        ]);


    var result = core_init();
    console.log(result);
});




// Filters wrapers
class Invert {

    constructor() {
        this.active = true;
    }

    apply(image_ptr, imge_length) {
        if (!this.active)
            return;

        core_invert(image_ptr, imge_length);
    }

    static get_add_html() {
        return `<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_new_filter( Invert )" > invert </div>`;
    }
    
    get_filter_html(id) {
        return `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">\
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 55%; float: left; ${(this.active ? "" : "background-color: #888;")}" onclick="filters[${id}].toggle_acive()"> 
                    invert ${(this.active)? "": "(disable)"} 
                </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${id});" > ↑ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${id});" > ↓ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${id});" > 🞨 </div>
            </div></div>`;
    }
    
    toggle_acive() {
        this.active =!this.active;
        rerender_filters();
    }
}


class ColorFilter {
    constructor() {
        this.active = true;
        this.red = 255;
        this.green = 255;
        this.blue = 255;
    }

    apply(image_ptr, image_length) {
        if (!this.active)
            return;
        core_color_filter(image_ptr, image_length, this.red, this.green, this.blue);
    }

    static get_add_html() {
        return `<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_new_filter( ColorFilter )" > color filter </div>`;
    }

    get_filter_html(id) {
        return `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 55%; float: left; ${(this.active ? "" : "background-color: #888;")}" onclick="filters[${id}].toggle_acive()"> 
                    color filter ${(this.active)? "": "(disable)"} 
                </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${id});" > ↑ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${id});" > ↓ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${id});" > 🞨 </div></div><br>
            <div >
                r: <input class="inp-nb" id="cf-r-${id}" value=${this.red}   type="text" inputmode="decimal" onchange="filters[${id}].update_red(${id})">
                g: <input class="inp-nb" id="cf-g-${id}" value=${this.green} type="text" inputmode="decimal" onchange="filters[${id}].update_green(${id})">
                b: <input class="inp-nb" id="cf-b-${id}" value=${this.blue}  type="text" inputmode="decimal" onchange="filters[${id}].update_blue(${id})">
            </div></div>`;   
    }

    update_red(id) {
        var tmp = parseInt(document.getElementById(`cf-r-${id}`).value);
        
        if (isNaN(tmp)) {
            document.getElementById(`cf-r-${id}`).value = this.red;
            return;
        }

        if (tmp < 0) {
            tmp = 0;
        } else if (tmp > 255) {
            tmp = 255;
        }
        document.getElementById(`cf-r-${id}`).value = tmp;


        this.red = tmp;
        rerender_filters(id);
    }

    update_green(id) {
        var tmp = parseInt(document.getElementById(`cf-g-${id}`).value);
        
        if (isNaN(tmp)) {
            document.getElementById(`cf-g-${id}`).value = this.red;
            return;
        }

        if (tmp < 0) {
            tmp = 0;
        } else if (tmp > 255) {
            tmp = 255;
        }
        document.getElementById(`cf-g-${id}`).value = tmp;


        this.green = tmp;
        rerender_filters(id);
    }

    update_blue(id) {
        var tmp = parseInt(document.getElementById(`cf-b-${id}`).value);
        
        if (isNaN(tmp)) {
            document.getElementById(`cf-b-${id}`).value = this.red;
            return;
        }

        if (tmp < 0) {
            tmp = 0;
        } else if (tmp > 255) {
            tmp = 255;
        }
        document.getElementById(`cf-b-${id}`).value = tmp;


        this.blue = tmp;
        rerender_filters(id);
    }

    toggle_acive() {
        this.active =!this.active;
        rerender_filters();
    }
}


class ColorCorrection {
    constructor() {
        this.active = true;
        
        this.red =   0;
        this.green = 0;
        this.blue =  0;

    }

    apply(image_ptr, image_length) {
        if (!this.active)
            return;

        core_color_correction(image_ptr, image_length, this.red, this.green, this.blue);
    }

    static get_add_html() {
        return `<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_new_filter( ColorCorrection )" > color correction </div>`;
    }

    get_filter_html(id) {
        return `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 55%; float: left; ${(this.active ? "" : "background-color: #888;")}" onclick="filters[${id}].toggle_acive()"> 
                    color correction ${(this.active)? "": "(disable)"} 
                </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${id});" > ↑ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${id});" > ↓ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${id});" > 🞨 </div></div><br>
            <div >
                r: <input class="inp-nb" id="cc-r-${id}" value=${this.red}   type="text" inputmode="decimal" onchange="filters[${id}].update_red(${id})">
                g: <input class="inp-nb" id="cc-g-${id}" value=${this.green} type="text" inputmode="decimal" onchange="filters[${id}].update_green(${id})">
                b: <input class="inp-nb" id="cc-b-${id}" value=${this.blue}  type="text" inputmode="decimal" onchange="filters[${id}].update_blue(${id})">
            </div></div>`;   
    }

    update_red(id) {
        var tmp = parseFloat(document.getElementById(`cc-r-${id}`).value);
        
        if (isNaN(tmp)) {
            document.getElementById(`cc-r-${id}`).value = this.red;
            return;
        }

        this.red = tmp;
        rerender_filters(id);
    }

    update_green(id) {
        var tmp = parseFloat(document.getElementById(`cc-g-${id}`).value);
        
        if (isNaN(tmp)) {
            document.getElementById(`cc-g-${id}`).value = this.red;
            return;
        }

        this.green = tmp;
        rerender_filters(id);
    }

    update_blue(id) {
        var tmp = parseFloat(document.getElementById(`cc-b-${id}`).value);
        
        if (isNaN(tmp)) {
            document.getElementById(`cc-b-${id}`).value = this.red;
            return;
        }

        this.blue = tmp;
        rerender_filters(id);
    }
    
    toggle_acive() {
        this.active =!this.active;
        rerender_filters();
    }
}


class Exposure {
    constructor() {
        this.value = 0;
        this.active = true;
    }
    
    apply(image_ptr, image_length) {
        if (!this.active)
            return;

        core_exposure(image_ptr, image_length, this.value);
    }

    static get_add_html() {
        return `<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_new_filter( Exposure )" > exposure </div>`;
    }

    get_filter_html(id) {
        return `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 55%; float: left; ${(this.active ? "" : "background-color: #888;")}" onclick="filters[${id}].toggle_acive()"> 
                    exposure ${(this.active)? "": "(disable)"} 
                </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${id});" > ↑ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${id});" > ↓ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${id});" > 🞨 </div></div><br>
            <div >
                val: <input class="inp-nb" id="exp-${id}" value=${this.value}   type="text" inputmode="decimal" onchange="filters[${id}].update_exposure(${id})">
            </div></div>`;   
    }

    update_exposure(id) {
        var tmp = parseFloat(document.getElementById(`exp-${id}`).value);
        
        if (isNaN(tmp)) {
            document.getElementById(`exp-${id}`).value = this.value;
            return;
        }

        this.value = tmp;
        rerender_filters(id);
    }

    toggle_acive() {
        this.active =!this.active;
        rerender_filters();
    }
}


class Saturation {
    constructor() {
        this.active = true;
        this.value = 1;
    }

    apply(image_ptr, image_length) {
        if (!this.active)
            return;

        core_saturation(image_ptr, image_length, this.value);
    }

    static get_add_html() {
        return `<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_new_filter( Saturation )" > saturation </div>`;
    }

    get_filter_html(id) {
        return  `<div class="filter-el">
        <div style="padding-top: 5px; padding-bottom: 25px;">
            <div class="btn" id="filter-${id}" style="cursor: pointer; width: 55%; float: left; ${(this.active ? "" : "background-color: #888;")}" onclick="filters[${id}].toggle_acive()"> 
                    saturation ${(this.active)? "": "(disable)"} 
            </div>
            <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${id});" > ↑ </div>
            <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${id});" > ↓ </div>
            <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${id});" > 🞨 </div></div><br>
        <div >
            val: <input class="inp-nb" id="exp-${id}" value=${this.value}   type="text" inputmode="decimal" onchange="filters[${id}].update_saturation(${id})">
        </div></div>`;   
    
    }


    update_saturation(id) {
        var tmp = parseFloat(document.getElementById(`exp-${id}`).value);
        
        if (isNaN(tmp)) {
            document.getElementById(`exp-${id}`).value = this.value;
            return;
        }

        this.value = tmp;
        rerender_filters(id);
    }
    
    toggle_acive() {
        this.active =!this.active;
        rerender_filters();
    }
}



class Contrast {
    constructor() {
        this.active = true;

        this.value = 1;
    }

    apply(image_ptr, image_length) {
        if (!this.active)
            return;

        core_contrast(image_ptr, image_length, this.value);
    }

    static get_add_html() {
        return `<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_new_filter( Contrast )" > contrast </div>`;
    }

    get_filter_html(id) {
        return  `<div class="filter-el">
        <div style="padding-top: 5px; padding-bottom: 25px;">
            <div class="btn" id="filter-${id}" style="cursor: pointer; width: 55%; float: left; ${(this.active ? "" : "background-color: #888;")}" onclick="filters[${id}].toggle_acive()"> 
                contrast ${(this.active)? "": "(disable)"} 
            </div>
            <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${id});" > ↑ </div>
            <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${id});" > ↓ </div>
            <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${id});" > 🞨 </div></div><br>
        <div >
            val: <input class="inp-nb" id="exp-${id}" value=${this.value}   type="text" inputmode="decimal" onchange="filters[${id}].update_contrast(${id})">
        </div></div>`;   
    
    }


    update_contrast(id) {
        var tmp = parseFloat(document.getElementById(`exp-${id}`).value);
        
        if (isNaN(tmp)) {
            document.getElementById(`exp-${id}`).value = this.value;
            return;
        }

        this.value = tmp;
        rerender_filters(id);
    }

    toggle_acive() {
        this.active =!this.active;
        rerender_filters();
    }
}


class BlackAndWhite {

    constructor() {
        this.active = true;
    }

    apply(image_ptr, imge_length) {
        if (!this.active)
            return;

        core_black_and_white(image_ptr, imge_length);
    }

    static get_add_html() {
        return `<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_new_filter( BlackAndWhite )" > black & white </div>`;
    }
    
    get_filter_html(id) {
        return `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 55%; float: left; ${(this.active ? "" : "background-color: #888;")}" onclick="filters[${id}].toggle_acive()"> 
                    black & white ${(this.active)? "": "(disable)"} 
                </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${id});" > ↑ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${id});" > ↓ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${id});" > 🞨 </div>
            </div></div>`;
    }
    
    toggle_acive() {
        this.active =!this.active;
        rerender_filters();
    }
}


class Normalize {
    constructor() {
        this.active = true;
    }
    
    apply(image_ptr, image_length) {
        if (!this.active)
            return;

        core_normalize(image_ptr, image_length);
    }
    
    static get_add_html() {
        return `<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_new_filter( Normalize )" > normalize </div>`;
    }

    get_filter_html(id) { 
        return `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 55%; float: left; ${(this.active ? "" : "background-color: #888;")}" onclick="filters[${id}].toggle_acive()"> 
                    normalize ${(this.active)? "": "(disable)"} 
                </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${id});" > ↑ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${id});" > ↓ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${id});" >🞨 </div>
            </div></div>`;
    }
    
    toggle_acive() {
        this.active =!this.active;
        rerender_filters();
    }
}


class BlendWithOriginal {
    constructor() { 
        this.active = true;
        this.mode = 0;
        this.alpha = 0.5;
    }

    apply(image, size, _a, _b, original) {
        if (!this.active)
            return;

        if (this.mode == 0) {
            core_blend_mult(image, original, size);
        } else if (this.mode == 1) {
            core_blend_add(image, original, size);
        } else if (this.mode == 2) {
            core_blend_linear(image, original, size, this.alpha);
        }
    }

    static get_add_html() {
        return `<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_new_filter( BlendWithOriginal )" > blend with original </div>`;
    }

    get_filter_html(id) {
        var str_mode;
        var slider = "";

        if (this.mode == 0) {
            str_mode = "multiply";
        } else if (this.mode == 1) {
            str_mode = "add";
        } else if (this.mode == 2) {
            str_mode = "linear";
            slider = `value: <input class="inp-nb" id="alpha-blend-value-${id}" value=${this.alpha} type="text" style="margin-bottom:5px" inputmode="decimal" onchange="filters[${id}].update_alpha_val(${id})"
                        <div style="margin-top:10px">
                        <input type="range" min="0" max="1000" value="${this.alpha*1000}" class="slider" id="alpha-blend-${id}" onchange="filters[${id}].update_alpha(${id})">  
                        </div>
                        `;
        }



        return `<div class="filter-el">
        <div style="padding-top: 5px; padding-bottom: 25px;">
            <div class="btn" id="filter-${id}" style="cursor: pointer; width: 55%; float: left; ${(this.active ? "" : "background-color: #888;")}" onclick="filters[${id}].toggle_acive()"> 
                blend with original ${(this.active)? "": "(disable)"} 
            </div>
                
            <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${id});" > ↑ </div>
            <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${id});" > ↓ </div>
            <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${id});" > 🞨 </div></div><br>
        
            <div>
            <div >
                mode: <label class="btn" style=" width:30%; cursor: pointer; text-align: center; margin-right:15px" onclick="filters[${id}].toggle_mode(${id});" > ${str_mode} </label>
                ${slider}
            </div>
        </div>`;
    }

    toggle_mode(id) {
        this.mode = (this.mode + 1) % 3;
        rerender_filters(id);
    }

    update_alpha(id) {
        var tmp = parseFloat(document.getElementById(`alpha-blend-${id}`).value);
    
        if (isNaN(tmp)) {
            document.getElementById(`alpha-blend-${id}`).value = this.alpha*1000;
            return;
        }
        
        this.alpha = tmp / 1000;
        document.getElementById(`alpha-blend-value-${id}`).value = this.alpha;
        rerender_filters(id);
    }

    update_alpha_val(id) {
        var tmp = parseFloat(document.getElementById(`alpha-blend-value-${id}`).value);
        
        if (isNaN(tmp)) {
            document.getElementById(`alpha-blend-value-${id}`).value = this.alpha;
            return;
        }
        
        this.alpha = tmp;
        document.getElementById(`alpha-blend-${id}`).value = this.alpha*1000;
        rerender_filters(id);
    }

    toggle_acive() {
        this.active =!this.active;
        rerender_filters();
    }
}


class Dotify {
    constructor() {
        this.active = true;
        this.dots_size = 10;
        this.spread = 0.5;
        this.sensitivity = 0;
        this.mode = 0;
        this.monochrome = 1; 
    }

    apply(image, size, canvas, reduction) {

        if (!this.active)
            return;

        width = canvas.width;
        height = canvas.height;

        core_dotify(image, size, width, height, this.dots_size*reduction, this.spread*reduction,
                    this.sensitivity, this.mode, this.monochrome);

    }

    static get_add_html() {
        return `<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_new_filter( Dotify )" > dotify </div>`;
    }

    get_filter_html(id) {
        return `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 55%; float: left; ${(this.active ? "" : "background-color: #888;")}" onclick="filters[${id}].toggle_acive()"> 
                    dotify ${(this.active)? "": "(disable)"} 
                </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${id});" > ↑ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${id});" > ↓ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${id});" > 🞨 </div></div><br>
            <div>
                <div style="margin:1px; float:right">
                    mode: <label class="btn" style=" width:30%; cursor: pointer; text-align: center;" onclick="filters[${id}].toggle_mode(${id});" > ${(this.mode==0)? "white dots": "balck dots"} </label>
                </div>
                
                dot size   : <input class="inp-nb" id="dt0-${id}" value=${this.dots_size} type="text" style="margin-bottom:5px" inputmode="decimal" onchange="filters[${id}].update_dot_size(${id})"><br>
                
                <div style="margin:1px; float:right">
                    color mode: <label class="btn" style=" width:30%; cursor: pointer; text-align: center;" onclick="filters[${id}].toggle_colored(${id});" > ${(this.monochrome == 1)? "balck & white": "colored"} </label>
                </div>
                spread     : <input class="inp-nb" id="dt1-${id}" value=${this.spread} type="text" style="margin-bottom:5px" inputmode="decimal"       onchange="filters[${id}].update_spread(${id})"><br>
                sensitivity: <input class="inp-nb" id="dt2-${id}" value=${this.sensitivity} type="text" style="margin-bottom:5px" inputmode="decimal"  onchange="filters[${id}].update_sens(${id})">
            </div>
            </div></div>`;
    }

    toggle_mode(id) {
        this.mode = (this.mode + 1) % 2;
        rerender_filters(id);
    }

    toggle_colored(id) {
        this.monochrome = (this.monochrome + 1) % 2;
        rerender_filters(id);
    }
    
    update_dot_size(id) {
        var tmp = parseInt(document.getElementById(`dt0-${id}`).value);
        
        if (isNaN(tmp)) {
            document.getElementById(`dt0-${id}`).value = this.dots_size;
            return;
        }
        
        if (tmp < 1) {
            document.getElementById(`dt0-${id}`).value = 1;
            tmp = 1;
        }

        this.dots_size = tmp;
        rerender_filters(id);
    }
    
    update_spread(id) {
        var tmp = parseFloat(document.getElementById(`dt1-${id}`).value);
        
        if (isNaN(tmp)) {
            document.getElementById(`dt1-${id}`).value = this.spread;
            return;
        }
        
        if (tmp < 0) {
            document.getElementById(`dt1-${id}`).value = 0;
            tmp = 0;
        }

        this.spread = tmp;
        rerender_filters(id);
    }

    update_sens(id) {
        var tmp = parseFloat(document.getElementById(`dt2-${id}`).value);
        
        if (isNaN(tmp)) {
            document.getElementById(`dt2-${id}`).value = this.sensitivity;
            return;
        }
        
        this.sensitivity = tmp;
        rerender_filters(id);
    }

    toggle_acive() {
        this.active =!this.active;
        rerender_filters();
    }
}


class Ditherify {
    constructor() {
        this.active = true;

        this.kernel_size = 10;
        this.nb_colors   = 3;
        this.sensitivity = 0;
        this.monochrome  = 1;
    }

    apply(image, size, canvas, reduction) {
        if (!this.active)
            return;

        width = canvas.width;
        height = canvas.height;
    
        core_ditherify(image, size, width, height, this.kernel_size*reduction, this.nb_colors, this.sensitivity, this.monochrome);
    }

    static get_add_html() {
        return `<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_new_filter(Ditherify )" > ditherify </div>`;
    }

    get_filter_html(id) {
        return  `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">\
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 55%; float: left; ${(this.active ? "" : "background-color: #888;")}" onclick="filters[${id}].toggle_acive()"> 
                    ditherify ${(this.active)? "": "(disable)"} 
                </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${id});" > ↑ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${id});" > ↓ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${id});" > 🞨 </div></div><br>
                <div>
                    <div style="margin:1px; float:right">
                    mode: <label class="btn" style=" width:30%; cursor: pointer; text-align: center;" onclick="filters[${id}].toggle_color(${id});" > ${(this.monochrome == 1)? "monochrome": "colored"} </label>
                </div>
                patch size : <input class="inp-nb" id="dth0-${id}" value=${this.kernel_size} type="text" style="margin-bottom:5px" inputmode="decimal" onchange="filters[${id}].update_kernel_size(${id})"><br>
                nb colors  : <input class="inp-nb" id="dth1-${id}" value=${this.nb_colors}   type="text" style="margin-bottom:5px" inputmode="decimal" onchange="filters[${id}].update_nb_colors(${id})"><br>
                sensitivity: <input class="inp-nb" id="dth2-${id}" value=${this.sensitivity} type="text" style="margin-bottom:5px" inputmode="decimal" onchange="filters[${id}].update_sensitivity(${id})">
            </div>
            </div></div>`;
    }
    
    toggle_color(id) {
        this.monochrome = (this.monochrome + 1) % 2;
        rerender_filters(id);
    }

    update_kernel_size(id) {
        var tmp = parseInt(document.getElementById(`dth0-${id}`).value);
        
        if (isNaN(tmp)) {
            document.getElementById(`dth0-${id}`).value = this.kernel_size;
            return;
        }
        
        if (tmp < 3) {
            document.getElementById(`dth0-${id}`).value = 3;
            tmp = 3;
        }
        
        this.kernel_size = tmp;
        rerender_filters(id);
    }

    update_nb_colors(id) {
        var tmp = parseInt(document.getElementById(`dth1-${id}`).value);
        
        if (isNaN(tmp)) {
            document.getElementById(`dth1-${id}`).value = this.nb_colors;
            return;
        }
        
        if (tmp < 2) {
            document.getElementById(`dth1-${id}`).value = 2;
            tmp = 2;
        }

        if (tmp > 255) {
            document.getElementById(`dth1-${id}`).value = 255;
            tmp = 255;
        }
     
        
        this.nb_colors = tmp;
        rerender_filters(id);
    }

    update_sensitivity(id) {
        var tmp = parseFloat(document.getElementById(`dth2-${id}`).value);
        
        if (isNaN(tmp)) {
            document.getElementById(`dth2-${id}`).value = this.sensitivity;
            return;
        }
        
        this.sensitivity = tmp;
        rerender_filters(id);
    }

    toggle_acive() {
        this.active =!this.active;
        rerender_filters();
    }

}


class LimitColorPalette {
    constructor() {
        this.nb_color  = 2;
        this.active = true;
    }
    
    apply(image_ptr, image_length) {
        if (!this.active)
            return;

        core_limit_color_palette(image_ptr, image_length, this.nb_color);
    }

    static get_add_html() {
        return `<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_new_filter( LimitColorPalette )" > limit color palette </div>`;
    }

    get_filter_html(id) {
        return `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 55%; float: left; ${(this.active ? "" : "background-color: #888;")}" onclick="filters[${id}].toggle_acive()"> 
                    limit color palette ${(this.active)? "": "(disable)"} 
                </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${id});" > ↑ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${id});" > ↓ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${id});" > 🞨 </div></div><br>
            <div >
                nb_colors: <input class="inp-nb" id="exp-${id}" value=${this.nb_color}   type="text" inputmode="decimal" onchange="filters[${id}].update_nb_color(${id})">
            </div></div>`;   
    }

    update_nb_color(id) {
        var tmp = parseInt(document.getElementById(`exp-${id}`).value);
        
        if (isNaN(tmp)) {
            document.getElementById(`exp-${id}`).value = this.value;
            return;
        }

        if (tmp < 2) {
            document.getElementById(`exp-${id}`).value = 2;
            tmp = 2;
        }

        this.nb_color = tmp;
        rerender_filters(id);
    }

    toggle_acive() {
        this.active =!this.active;
        rerender_filters();
    }
}


class Pixelize {
    constructor() {
        this.mode = 0;
        this.pixel_size = 5;
        this.active = true;
    }
    
    apply(image_ptr, image_length,  canvas, reduction) {
        if (!this.active)
            return;

        width = canvas.width;
        height = canvas.height;

        core_pixellize(image_ptr, image_length, width, height,
                       this.pixel_size*reduction, this.mode
        );
    }

    static get_add_html() {
        return `<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_new_filter( Pixelize )" > pixelize </div>`;
    }

    get_filter_html(id) {
        return `<div class="filter-el">
            <div style="padding-top: 5px; padding-bottom: 25px;">
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 55%; float: left; ${(this.active ? "" : "background-color: #888;")}" onclick="filters[${id}].toggle_acive()"> 
                    pixelize ${(this.active)? "": "(disable)"} 
                </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="up_filter(${id});" > ↑ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="down_filter(${id});" > ↓ </div>
                <div class="btn" id="filter-${id}" style="cursor: pointer; width: 5%; text-align: center; float: left" onclick="remove_filter(${id});" > 🞨 </div></div><br>
            <div >
                <div style="padding-bottom:10px">
                    mode: <label class="btn" style=" width:30%; cursor: pointer; text-align: center;" onclick="filters[${id}].toggle_mode(${id});" > ${["mean", "max", "min"][this.mode]} </label>
                </div>
                pixel size: <input class="inp-nb" id="pxl-${id}" value=${this.pixel_size}   type="text" inputmode="decimal" onchange="filters[${id}].update_pixel_size(${id})">
            </div></div>`;   
    }

    update_pixel_size(id) {
        var tmp = parseInt(document.getElementById(`pxl-${id}`).value);
        console.log(tmp, id);
        if (isNaN(tmp)) {
            document.getElementById(`pxl-${id}`).value = this.pixel_size;
            return;
        }

        if (tmp < 1) {
            document.getElementById(`pxl-${id}`).value = 1;
            tmp = 1;
        }

        this.pixel_size = tmp;
        rerender_filters(id);
    }

    toggle_mode() {
        this.mode = (this.mode + 1) % 3;
        rerender_filters();
    }

    toggle_acive() {
        this.active =!this.active;
        rerender_filters();
    }
}



var availableFilers = [BlackAndWhite,
                       BlendWithOriginal,
                       ColorCorrection,
                       ColorFilter, 
                       Contrast,
                       Dotify,
                       Ditherify,
                       Exposure,
                       Invert,
                       LimitColorPalette,
                       Normalize,
                       Pixelize,
                       Saturation];




// functions
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

        let btypedArray = new Float32Array(base_);
    
        let bpointer = Module._malloc(
              btypedArray.length * btypedArray.BYTES_PER_ELEMENT
        );
    
        Module.HEAPF32.set(
            btypedArray, bpointer/btypedArray.BYTES_PER_ELEMENT                                                                                   
        );



        let typedArray = new Float32Array(array);
        console.log(typedArray);
         
        let pointer = Module._malloc(
              typedArray.length * typedArray.BYTES_PER_ELEMENT
        );

        Module.HEAPF32.set(
            typedArray, pointer/typedArray.BYTES_PER_ELEMENT                                                                                   
        );

        for (var i = 0; i < filters.length; i++)
            filters[i].apply(pointer, typedArray.length, canvas, 1, bpointer);

        typedArray = Module.HEAPF32.subarray(
            pointer / typedArray.BYTES_PER_ELEMENT,
            pointer / typedArray.BYTES_PER_ELEMENT + typedArray.length
        );

        Module._free(pointer);
        Module._free(bpointer);
        console.log(typedArray);

        array = Array.from(typedArray);
        
     
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



// global var
var add_filter_base_btn_html = '<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_filter();" > + </div>';
var add_filters_list_btn_html = `<div>Available filters:</div>`;

for (var i=0; i<availableFilers.length; i++) {
    add_filters_list_btn_html += availableFilers[i].get_add_html();
}

add_filters_list_btn_html += `<div class="btn" id="add-filter" style="cursor: pointer;" onclick="add_none();" > 🞨 </div>`;



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

    if (base === null) {
        var array = extract_canvas();
        base = structuredClone(array);
    } else {
        var array = structuredClone(base);
    }

    var canvas = document.getElementById('canvas');
    
    let btypedArray = new Float32Array(array);
    
    let bpointer = Module._malloc(
          btypedArray.length * btypedArray.BYTES_PER_ELEMENT
    );

    Module.HEAPF32.set(
        btypedArray, bpointer/btypedArray.BYTES_PER_ELEMENT                                                                                   
    );


    let typedArray = new Float32Array(array);
    console.log(typedArray);
    
    let pointer = Module._malloc(
          typedArray.length * typedArray.BYTES_PER_ELEMENT
    );

    Module.HEAPF32.set(
        typedArray, pointer/typedArray.BYTES_PER_ELEMENT                                                                                   
    );

    for (var i = 0; i < filters.length; i++)
        filters[i].apply(pointer, typedArray.length, canvas, reduction, bpointer);
        
    typedArray = Module.HEAPF32.subarray(
        pointer / typedArray.BYTES_PER_ELEMENT,
        pointer / typedArray.BYTES_PER_ELEMENT + typedArray.length
    );

    Module._free(pointer);
    Module._free(bpointer);
    console.log(typedArray);

    write_canvas(Array.from(typedArray));

}



var rerender_filters  = function(id) {
    var block = document.getElementById('filters-list');
    block.innerHTML = '';

    for (var i=0; i<filters.length; i++) {
        block.innerHTML += filters[i].get_filter_html(i);
        console.log(i, filters[i]);
    }

    update_canvas(id);
}



var add_filter = function() {
    var block = document.getElementById('add-filter-container');
    block.innerHTML = add_filters_list_btn_html;
};



var add_new_filter = function(filter) {
    var block = document.getElementById('add-filter-container');
    block.innerHTML = add_filter_base_btn_html;
    console.log(filter);
    filters.push(new filter());
    
    rerender_filters(filters.length-2);
}

var add_none = function() {
    var block = document.getElementById('add-filter-container');
    block.innerHTML = add_filter_base_btn_html;
}

var remove_filter = function(i) {
    filters.splice(i, 1);
    rerender_filters(i-1);
}

var up_filter = function(i) {
    if (i > 0) {
        var temp = filters[i];
        filters[i] = filters[i - 1];
        filters[i - 1] = temp;

    }
    rerender_filters(i-2);
}

var down_filter = function(i) {
    if (i < filters.length - 1) {
        var temp = filters[i];
        filters[i] = filters[i + 1];
        filters[i + 1] = temp;

    }
    rerender_filters(i-1);
}
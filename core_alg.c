#include <stdio.h>
#include <stdlib.h>
#include <math.h>


#include <emscripten.h>


EMSCRIPTEN_KEEPALIVE
int main() {
    printf("core wasm alg loaded\n");
    return 0;
}


EMSCRIPTEN_KEEPALIVE
void invert(float* a, size_t n) {
    for (size_t i = 0; i < n; i++) {
        if (i%4 != 3) a[i] = 1.0f - a[i];
    }
}


EMSCRIPTEN_KEEPALIVE
void color_filter(float* a, size_t n, int r, int g, int b) {
    for (size_t i = 0; i < n; i++) {
        if (i%4 == 0) {
            a[i] = (a[i] * r) / 255.0f;
        
        } else if (i%4 == 1) { 
            a[i] = (a[i] * g) / 255.0f;
        
        } else if (i%4 == 2) {
            a[i] = (a[i] * b) / 255.0f;
        }
    }
}


EMSCRIPTEN_KEEPALIVE
void color_correction(float* a, size_t n, float r, float g, float b) {
    for (size_t i = 0; i < n; i++) {
        if (i%4 == 0) {
            a[i] = powf(a[i], powf(0.5f, r));
        
        } else if (i%4 == 1) { 
            a[i] = powf(a[i], powf(0.5f, g));
        
        } else if (i%4 == 2) {
            a[i] = powf(a[i], powf(0.5f, b));
        }
    }
}


EMSCRIPTEN_KEEPALIVE
void exposure(float* a, size_t n, float val) {
    for (size_t i = 0; i < n; i++) {
        if (i%4 != 3) {
            a[i] = powf(a[i], powf(0.5f, val));
        
        } 
    }
}


EMSCRIPTEN_KEEPALIVE
void saturation(float* a, size_t n, float val) {
    for (size_t i = 0; i < n/4; i++) {
        
        float mean = 0.299*a[i*4];
        mean += 0.587*a[i*4+1];
        mean += 0.114*a[i*4+2];

        a[i*4]   = (1-val) * mean + val*a[i*4];
        a[i*4+1] = (1-val) * mean + val*a[i*4+1];
        a[i*4+2] = (1-val) * mean + val*a[i*4+2];
    }
}


EMSCRIPTEN_KEEPALIVE
void contrast(float* a, size_t n, float val) {

    float mean = 0;
    for (size_t i = 0; i < n/4; i++) {
        mean += 0.299*a[i*4]   / ((float)(n)/4);
        mean += 0.587*a[i*4+1] / ((float)(n)/4);
        mean += 0.114*a[i*4+2] / ((float)(n)/4);
    }


    for (size_t i = 0; i < n/4; i++) {
        a[i*4]   = (1-val) * mean + val*a[i*4];
        a[i*4+1] = (1-val) * mean + val*a[i*4+1];
        a[i*4+2] = (1-val) * mean + val*a[i*4+2];
    }
}


EMSCRIPTEN_KEEPALIVE
void normalize(float* a, size_t n) {

    float max = -1;
    float min = 2;

    for (size_t i = 0; i < n; i++) {
        if (i%4 != 3) {
            if (a[i] > max) max = a[i];
            if (a[i] < min) min = a[i];
        }
    }

    for (size_t i = 0; i < n/4; i++) {

        a[i*4]   = (a[i*4]   - min) / (max - min);
        a[i*4+1] = (a[i*4+1] - min) / (max - min);
        a[i*4+2] = (a[i*4+2] - min) / (max - min);
    }
}

EMSCRIPTEN_KEEPALIVE
void black_and_white(float* a, size_t n) {
    for (size_t i = 0; i < n/4; i++) {
        
        float mean = 0.299*a[i*4];
        mean += 0.587*a[i*4+1];
        mean += 0.114*a[i*4+2];

        a[i*4]   = mean ;
        a[i*4+1] = mean ;
        a[i*4+2] = mean ;
    }

}




EMSCRIPTEN_KEEPALIVE
void blend_add(float* a, float* b, size_t n) {
   
    for (size_t i = 0; i < n; i++) {
        if (i%4!= 3) {
            a[i] += b[i];
        }
    }
}

EMSCRIPTEN_KEEPALIVE
void blend_mult(float* a, float* b, size_t n) {
    for (size_t i = 0; i < n; i++) {
        if (i%4!= 3) {
            a[i] *=  b[i];
        }
    }
}

EMSCRIPTEN_KEEPALIVE
void blend_alpha(float* a, float* b, size_t n, float alpha) {
    for (size_t i = 0; i < n; i++) {
        if (i%4!= 3) {
            a[i] = a[i] * (1 - alpha) + b[i] * alpha;
        }
    }
}


EMSCRIPTEN_KEEPALIVE
void dotify(float* a, size_t n, size_t width, size_t height, float dots_size, 
            float spread, float sensitivity, char mode, char monochrome) {

    float patch_size = ceilf(fmax(dots_size+spread/2, 1 ));

    for (size_t  x=0; x<ceilf(width/patch_size); x++) {
        for (size_t  y=0; y<ceilf(height/patch_size); y++) {
        
            if (x*patch_size+patch_size-spread/2 < width && 
                y*patch_size+patch_size-spread/2 < height) { 
                
                float r = 0;
                float g = 0;
                float b = 0;

                for (size_t  i=0; i<patch_size; i++) {
                    for (size_t  j=0; j<patch_size; j++) {

                        unsigned long idx =(x*patch_size+i)*4 + (y*patch_size+j)*4*width;

                        r += a[idx];
                        g += a[idx+1];
                        b += a[idx+2];
                    }
                }

                r /= patch_size*patch_size;
                r = powf(r, powf(0.5, sensitivity));
                r = fmin(1, r);
                

                g /= patch_size*patch_size;
                g = powf(g, powf(0.5, sensitivity));
                g = fmin(1, g);


                b /= patch_size*patch_size;
                b = powf(b, powf(0.5, sensitivity));
                b = fmin(1, b);



                float mean = 0.299*r + 0.587*g + 0.144*b;
                if (mode == 1) {
                    mean = 1-mean;
                }


                if (monochrome) {

                    r = 1;
                    g = 1;
                    b = 1;

                    if (mode == 1) {
                        r = 0;
                        g = 0;
                        b = 0;
                    }
                }

                float cx = x+patch_size/2;
                float cy = y+patch_size/2;

                for (size_t dx=0; dx<patch_size; dx++) {
                    for (size_t dy=0; dy<patch_size; dy++) {
                        float dist = sqrtf((x+dx-cx)*(x+dx-cx) + (y+dy-cy)*(y+dy-cy)) /(patch_size/2);
                        dist += spread / (patch_size);
                        float val = (mean - dist);


                        size_t idx = (x*patch_size+dx)*4 + (y*patch_size+dy)*4*width;


                        if (val>1) { 
                            a[idx]   = r;
                            a[idx+1] = g;
                            a[idx+2] = b;

                        } else if (val > 0.01) {
                            if (mode == 1) {
                                a[idx]   = 1-(val)*(1-r);
                                a[idx+1] = 1-(val)*(1-g);
                                a[idx+2] = 1-(val)*(1-b);
                            
                            } else {
                                a[idx]   = val*r;
                                a[idx+1] = val*g;
                                a[idx+2] = val*b;
                            }
                        }
                        else {
                            if (mode == 1) {
                                a[idx]   = 1;
                                a[idx+1] = 1;
                                a[idx+2] = 1;
                            } else {
                                a[idx]   = 0;
                                a[idx+1] = 0;
                                a[idx+2] = 0;
                            }
                        }
                    }
                }        
            } else {
                
                for (float dx=0; dx<patch_size; dx++) {
                    for (float dy=0; dy<patch_size; dy++){
                
                        if (x*patch_size+dx < width && y*patch_size+dy < height){
                            size_t idx = (x*patch_size+dx)*4 + (y*patch_size+dy)*4*width;
                
                            if (idx +2 < n) {
                            
                                if (mode == 1) {
                                    a[idx]   = 1;
                                    a[idx+1] = 1;
                                    a[idx+2] = 1;
                                
                                } else {
                                    a[idx]   = 0;
                                    a[idx+1] = 0;
                                    a[idx+2] = 0;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

#define NB_COLORS 11
float filters[][3][3] = {{{0.0f, 0.0f, 0.0f}, {0.0f, 0.0f, 0.0f}, {0.0f, 0.0f, 0.0f}},
                         {{0.0f, 0.0f, 0.0f}, {0.0f, 1.0f, 0.0f}, {0.0f, 0.0f, 0.0f}},
                         {{0.0f, 0.0f, 0.0f}, {1.0f, 0.0f, 1.0f}, {0.0f, 0.0f, 0.0f}},
                         {{1.0f, 0.0f, 0.0f}, {0.0f, 1.0f, 0.0f}, {0.0f, 0.0f, 1.0f}},
                         {{1.0f, 0.0f, 1.0f}, {0.0f, 0.0f, 0.0f}, {1.0f, 0.0f, 1.0f}},
                         {{1.0f, 0.0f, 1.0f}, {0.0f, 1.0f, 0.0f}, {1.0f, 0.0f, 1.0f}},
                         {{1.0f, 1.0f, 0.0f}, {1.0f, 0.0f, 1.0f}, {0.0f, 1.0f, 1.0f}},
                         {{1.0f, 0.0f, 1.0f}, {1.0f, 0.0f, 1.0f}, {1.0f, 0.0f, 1.0f}},
                         {{1.0f, 1.0f, 1.0f}, {0.0f, 1.0f, 0.0f}, {1.0f, 1.0f, 1.0f}},
                         {{1.0f, 1.0f, 1.0f}, {1.0f, 0.0f, 1.0f}, {1.0f, 1.0f, 1.0f}},
                         {{1.0f, 1.0f, 1.0f}, {1.0f, 1.0f, 1.0f}, {1.0f, 1.0f, 1.0f}},
                        };

EMSCRIPTEN_KEEPALIVE
void dithering(float* a, size_t n, size_t width, size_t height, float kernel_size,
               int nb_colors, float sensitivity, int monochrome) {

    kernel_size = ceilf(kernel_size);

    for (size_t x=0; x<ceilf(width/kernel_size); x++) {
        for (size_t y=0; y<ceilf(height/kernel_size); y++) {

            float r = 0;
            float g = 0;
            float b = 0;

            for (size_t  i=0; i<kernel_size; i++) {
                for (size_t  j=0; j<kernel_size; j++) {

                    unsigned long idx =(x*kernel_size+i)*4 + (y*kernel_size+j)*4*width;

                    r += a[idx];
                    g += a[idx+1];
                    b += a[idx+2];
                }
            }

            // get mean color
            r /= kernel_size*kernel_size;
            r = powf(r, powf(0.5, sensitivity));
            r = fmin(1, r);
            
            g /= kernel_size*kernel_size;
            g = powf(g, powf(0.5, sensitivity));
            g = fmin(1, g);

            b /= kernel_size*kernel_size;
            b = powf(b, powf(0.5, sensitivity));
            b = fmin(1, b);

            float mean = 0.299*r + 0.587*g + 0.144*b;

            // get filters_id
            float color_id  = floorf(mean*(nb_colors-1));
            float max_color = (color_id+1) / (nb_colors-1);
            float min_color = color_id     / (nb_colors-1);
            float interval  = (mean-min_color) / (max_color-min_color);

            size_t  filter_id   = floorf(interval * (NB_COLORS-1));


            float rcolor_id  = floorf(r*(nb_colors-1));
            float rmax_color = (rcolor_id+1) / (nb_colors-1);
            float rmin_color = rcolor_id     / (nb_colors-1);
            float rinterval  = (r-rmin_color) / (rmax_color-rmin_color);

            size_t  rfilter_id   = floorf(rinterval * (NB_COLORS-1));


            float gcolor_id  = floorf(g*(nb_colors-1));
            float gmax_color = (gcolor_id+1) / (nb_colors-1);
            float gmin_color = gcolor_id     / (nb_colors-1);
            float ginterval  = (g-gmin_color) / (gmax_color-gmin_color);

            size_t  gfilter_id   = floorf(ginterval * (NB_COLORS-1));


            float bcolor_id  = floorf(b*(nb_colors-1));
            float bmax_color = (bcolor_id+1) / (nb_colors-1);
            float bmin_color = bcolor_id     / (nb_colors-1);
            float binterval  = (b-bmin_color) / (bmax_color-bmin_color);

            size_t  bfilter_id   = floorf(binterval * (NB_COLORS-1));

            printf("\n%.2f %.2f %.2f %.2f\n", max_color, rmax_color, gmax_color, bmax_color);
            printf("%.2f %.2f %.2f %.2f\n",   min_color, rmin_color, gmin_color, bmin_color);


            for (size_t  i=0; i<kernel_size; i++) {
                for (size_t  j=0; j<kernel_size; j++) {

                    unsigned long idx =(x*kernel_size+i)*4 + (y*kernel_size+j)*4*width;

                    int u = floorf(3*i/kernel_size);
                    int v = floorf(3*j/kernel_size);

                    if (x*kernel_size+i <width && y*kernel_size+j <height) {
                        if (monochrome == 1) {

                            a[idx]   = filters[filter_id][u][v]*max_color + (1 - filters[filter_id][u][v])*min_color;
                            a[idx+1] = filters[filter_id][u][v]*max_color + (1 - filters[filter_id][u][v])*min_color;
                            a[idx+2] = filters[filter_id][u][v]*max_color + (1 - filters[filter_id][u][v])*min_color;

                        } else {

                            a[idx]   = filters[rfilter_id][u][v]*rmax_color + (1 - filters[rfilter_id][u][v])*rmin_color;
                            a[idx+1] = filters[gfilter_id][u][v]*gmax_color + (1 - filters[gfilter_id][u][v])*gmin_color;
                            a[idx+2] = filters[bfilter_id][u][v]*bmax_color + (1 - filters[bfilter_id][u][v])*bmin_color;

                        }

                    }
                }
            }
        }
    }
}
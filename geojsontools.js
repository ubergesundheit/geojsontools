/*
 * TODO: write geoJSON validator
 *          incorporate formatter into validator
 *       build reversing function
 */

var GeoJSONTools = (function () {
    "use strict";
    var _geoJSONTemplate = function (features) {
            return {"type": "FeatureCollection", "features": features};
        };
    var _lineStringTemplate = function (coordinates, properties) {
        return {"type":"Feature", "geometry":{"type":"LineString", "coordinates":coordinates}, "properties":properties};
    };
    var _pointsTemplate = function (coordinates, properties) {
        return {"type":"Feature", "geometry":{"type":"Point", "coordinates":coordinates}, "properties":properties};
    };
    var _createNullArray = function (length) {
        var arr = [], i = length;
        while (i !== 0) {
            i = i - 1;
            arr[i] = null;
        }
        return arr;
    };
    var _findAdditionalProperties = function (a, b) {
        var keysA = Object.keys(a),
            out = [],
            key;

        for (key in b) {
            if (b.hasOwnProperty(key)) {
                if (keysA.indexOf(key) === -1) {
                    out.push(key);
                }
            }
        }
        return out;
    };
    var _createLineString = function (coordinates, properties) { //assemble a LineString
        return _geoJSONTemplate(_lineStringTemplate(coordinates, properties));
    };
    var _reverseArray = function (array) {
        var out = array,
            left = null,
            right = null,
            temporary;
        for (left = 0, right = out.length - 1; left < right; left += 1, right -= 1) {
            temporary = out[left];
            out[left] = out[right];
            out[right] = temporary;
        }
        return out;
    };
    var ptToLsOptions = {
        ignoreProperties:false
    };
    var public_gjt = {
        parse:function (geojson) {
            var input = jsonlint.parse(geojson),
                checkGeoJSONObject = function(geoJSON){
                    
                },
                //test an array if it contains two valid coordinates
                //assumes parameter point to be an array.
                testPointCoordinate = function (point) {
                    if(point.length === 2){
                        if(isNaN(parseFloat(point[0])) || isNaN(parseFloat(point[1]))){
                            //throw error: point coordinates not float
                        }
                    } else {
                        //throw error: invalid coordinate count
                    }
                },                
                //test if the contents of an array 
                checkMultiPointLineString = function (coords) {
                    for(var i = 0; i< key.length; i++){
                        if(Array.isArray(key[i])){
                            testPointCoordinate(key[i]);
                        }else{
                            //throw error: invalid coordinates
                        }
                    }
                },
                testGeometry = function (geometry) {
                            if(input.hasOwnProperty('coordinates')){
                                if(Array.isArray(input.coordinates)){
                                    switch (key) {
                                        case "Point":
                                            testPointCoordinate(key);
                                            break;
                                        case "MultiPoint":
                                            checkMultiPointLineString(key);
                                            break;
                                        case "LineString":
                                            checkMultiPointLineString(key);
                                            break;
                                        case "MultiLineString":

                                            break;
                                        case "Polygon":

                                            break;
                                        case "MultiPolygon":

                                            break;
                                        default:

                                            break;
                                    }
                                }else{
                                    //throw error: property 'coordinates' not of type Array
                                }
                            }else{
                                //throw error: missing property 'coordinates'
                            }
                };

            for (var key in input) {
                if (input.hasOwnProperty(key)) {
                    if (key === "type") {
                        if (key === "Point" || key === "MultiPoint" || key === "LineString" || key === "MultiLineString" || key === "Polygon" || key === "MultiPolygon") {
                            if(input.hasOwnProperty('geometry')){
                                
                            }else{
                                //throw error: missing property 'geometry'
                            }
                        } else if (key === "Feature" || key === "FeatureCollection") {
                            
                        } else {
                            //throw error: invalid value in property 'type'
                        }
                    } else {
                        //throw error: missing property 'type'
                    }
                }
            }


        },
        /* converts a GeoJson FeatureCollection consisting of points to
         * a FeatureCollection containing one Linestring
         * params: geojson: a valid GeoJSON Object
         *         options: a Object containing options regarding the conversion
         *               ignoreProperties: tells the converter to ignore the properties of the input
         */
        points_to_lineString:function (geojson, options) {
            var input = jsonlint.parse(geojson), //use jsonlint to check for valid JSON
                output_coordinates = [],
                output_properties = {},
                ct_properties = 0,
                i,
                j,
                key,
                additional_props;

            if (options === undefined) {
                options = ptToLsOptions;
            }

            //iterate over the input
            for (i = 0; i < input.features.length; i = i + 1) {
                if (options.hasOwnProperty("ignoreProperties") && options.ignoreProperties !== true) {
                    //has the current feature the same properties as its predecessor?
                    additional_props = _findAdditionalProperties(output_properties, input.features[i].properties);
                    if (i !== 0 && additional_props.length !== 0) {
                        //add the additional properties to the output_properties with null values
                        for (j = 0; j < additional_props.length; j = j + 1) {
                            Object.defineProperty(output_properties, additional_props[j], {value:_createNullArray(i), writable:true, enumerable:true, configurable:true});
                        }
                    }
                    //save the current count of properties
                    ct_properties = Object.keys(input.features[i].properties).length;

                    //create the properties in the output_properties
                    for (key in input.features[i].properties) {
                        if (input.features[i].properties.hasOwnProperty(key)) {
                            if (!output_properties.hasOwnProperty(key)) { //if the output dont have the property,.
                                Object.defineProperty(output_properties, key, {value:[], writable:true, enumerable:true, configurable:true});//create an array with the property name.
                            }
                        }
                    }

                    //input the properties to the output arrays
                    for (key in output_properties) {
                        if (output_properties.hasOwnProperty(key)) {
                            if (input.features[i].properties.hasOwnProperty(key)) {
                                output_properties[key].push(input.features[i].properties[key]); //add value to array
                            } else { // if there is no value for the current property
                                output_properties[key].push(null); //add null
                            }
                        }
                    }
                }
                //append the coordinates
                output_coordinates.push(input.features[i].geometry.coordinates);
            }

            return _createLineString(output_coordinates, output_properties);
        },
        reverse:function (geojson) {
            var input = jsonlint.parse(geojson);

            //determine the type of the input
            for (var i = 0; i < input.features.length; i = i + 1) {
                //cont when geojsonlint is ready
                console.log('not ready');
            }
        }
    };
    return public_gjt;
}());

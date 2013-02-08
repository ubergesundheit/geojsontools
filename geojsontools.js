var GeoJSONTools = (function () {
    "use strict";
    var _geoJSONTemplate = function (features) {
            return {"type": "FeatureCollection", "features": features};
        },
        _lineStringTemplate = function (coordinates, properties) {
            return {"type": "Feature", "geometry": {"type": "LineString", "coordinates": coordinates}, "properties": properties};
        },
        _pointsTemplate = function (coordinates, properties) {
            return {"type": "Feature", "geometry": {"type": "Point", "coordinates": coordinates}, "properties": properties};
        },
        _createNullArray = function (length) {
            var arr = [], i = length;
            while (i !== 0) {
                i = i - 1;
                arr[i] = null;
            }
            return arr;
        },
        _findAdditionalProperties = function (a, b) {
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
        },
        _createLineString = function (coordinates, properties) { //assemble a LineString
            return _geoJSONTemplate(_lineStringTemplate(coordinates,properties));
        },
        ptToLsOptions = {
            ignoreProperties: false
        },
        public_gjt = {
            /* converts a GeoJson FeatureCollection consisting of points to 
             * a FeatureCollection containing one Linestring */
            points_to_lineString: function (geojson) {
                //var input = JSON.parse(geojson),
                var input = jsonlint.parse(geojson),//use jsonlint to check for valid JSON
                    output_coordinates = [],
                    output_properties = {},
                    ct_properties = 0,
                    output,
                    i,
                    j,
                    key,
                    additional_props;

                //iterate over the input
                for (i = 0; i < input.features.length; i = i + 1) {

                    //has the current feature the same properties as its predecessor?
                    additional_props = _findAdditionalProperties(output_properties, input.features[i].properties);
                    if (i !== 0 && additional_props.length !== 0) {
                        //add the additional properties to the output_properties with null values
                        for (j = 0; j < additional_props.length; j = j + 1) {
                            Object.defineProperty(output_properties, additional_props[j], {value : _createNullArray(i), writable : true, enumerable : true, configurable : true});
                        }
                    }
                    //save the current count of properties
                    ct_properties = Object.keys(input.features[i].properties).length;

                    //create the properties in the output_properties
                    for (key in input.features[i].properties) {
                        if (input.features[i].properties.hasOwnProperty(key)) {
                            if (!output_properties.hasOwnProperty(key)) { //if the output dont have the property,.
                                Object.defineProperty(output_properties, key, {value : [], writable : true, enumerable : true, configurable : true});//create an array with the property name.
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
                    //append the coordinates
                    output_coordinates.push(input.features[i].geometry.coordinates);
                }

                return _createLineString(output_coordinates, output_properties);
        }
    };
    return public_gjt;
}());

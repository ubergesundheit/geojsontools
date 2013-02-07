var testPoints = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"timestamp":"2013-02-06T12:58:22"},"geometry":{"type":"Point","coordinates":[7.6102587,51.9414473,0]}},{"type":"Feature","properties":{"hazardId":"27"},"geometry":{"type":"Point","coordinates":[7.614268,51.942944,0]}},{"type":"Feature","properties":{"description":null},"geometry":{"type":"Point","coordinates":[7.614486,51.942403,0]}},{"type":"Feature","properties":{"hazardId":"25","timestamp":"2013-02-06T11:08:47","description":null},"geometry":{"type":"Point","coordinates":[7.61356,51.941266,0]}},{"type":"Feature","properties":{"hazardId":"11","timestamp":"2013-02-04T16:03:38","description":"evaluation hazards"},"geometry":{"type":"Point","coordinates":[7.616154,51.962964,0]}},{"type":"Feature","properties":{"hazardId":"10","timestamp":"2013-02-04T16:03:15","description":"evaluation hazards"},"geometry":{"type":"Point","coordinates":[7.616261,51.964518,0]}}]};
var GeoJSONTools = {};

(function () {
    "use strict";
    var lineStringTemplate = {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "LineString", "coordinates": []}, "properties": {}}]},
        pointsTemplate = {},

        gjtutil = {
            _createNullArray: function (length) {
                var arr = [], i = length;
                while (i !== 0) {
                    i = i - 1;
                    arr[i] = null;
                }
                return arr;
            },
            _findAdditionalProperties: function (a, b) {
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
            }
        },
        ptToLsOptions = {
			ignoreProperties: false,
			
		};
    GeoJSONTools = {

        /* converts a GeoJson FeatureCollection consisting of points to 
         * a FeatureCollection containing one Linestring */
        points_to_lineString: function (geojson) {
            var input = JSON.parse(geojson),
                output_coordinates = [],
                output_properties = {},
                ct_properties = 0,
                output = lineStringTemplate,
                i,
                j,
                key,
                additional_props;

            //iterate over the input
            for (i = 0; i < input.features.length; i = i + 1) {

                //has the current feature the same properties as its predecessor?
                additional_props = gjtutil._findAdditionalProperties(output_properties, input.features[i].properties);
                if (i !== 0 && additional_props.length !== 0) {
                    //add the additional properties to the output_properties with null values
                    for (j = 0; j < additional_props.length; j = j + 1) {
                        Object.defineProperty(output_properties, additional_props[j], {value : gjtutil._createNullArray(i), writable : true, enumerable : true, configurable : true});
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

            //finally assemble the output
            output.features[0].geometry.coordinates = output_coordinates;
            output.features[0].properties = output_properties;
            return output;
        }
    };
}());

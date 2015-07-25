var appRoot = "../../app/";
var should = require('should');
var Layer = require(appRoot + "core/layer");
var Feature = require(appRoot + "core/feature");
var Device = require(appRoot + "core/device");
var Parameters = require(appRoot + "core/parameters");
var Features = require(appRoot + "core/features");

var FloatValue = Parameters.FloatValue;
var BooleanValue = Parameters.BooleanValue;
var StringValue = Parameters.StringValue;
var IntegerValue = Parameters.IntegerValue;
var PointValue = Parameters.PointValue;

var Channel = Features.Channel;
var CircleValve = Features.CircleValve;

var dev;
var lay1;
var lay2;
var feat1;
var feat2;

var initDevice = function() {
    dev = new Device({
        "width": 50, 
        "height": 60
    }, "dev1");
    lay1 = new Layer({
        "z_offset": 0,
        "flip": false
    }, "layer1");
    lay2 = new Layer({
        "z_offset": 1.2,
        "flip": true
    }, "layer2");
    feat1 = new Channel({
        "start": [0,0],
        "end": [2,2]
    });
    feat2 = new CircleValve({
        "position": [3,5]
    });
}

describe("Device", function() {
    describe("#init", function() {
        beforeEach(function initialize() {
            initDevice();
        });
        it("should start with no layers", function() {
            dev.layers.length.should.equal(0);
        });
        it("should start with the correct width, height, and name", function() {
            dev.name.value.should.equal("dev1");
            dev.params.getValue("width").should.equal(50);
            dev.params.getValue("height").should.equal(60);
        });
        it("should be able to be constructed without a name", function() {
            (function() {
                let dev2 = new Device({
                    "width": 50,
                    "height": 70
                });
            }).should.not.throwError();
        });
    });

    describe("#addLayer", function() {
        beforeEach(function initialize() {
            initDevice();
        });
        it("should let the user add a layer", function() {
            dev.addLayer(lay1);
            dev.layers.length.should.equal(1);
        });
        it("should let the user add multiple layers", function() {
            dev.addLayer(lay1);
            dev.addLayer(lay2);
            dev.layers.length.should.equal(2);
        });
        it("should place layers into the correct order", function() {
            dev.addLayer(lay2);
            dev.addLayer(lay1);
            dev.layers[0].should.be.exactly(lay1);
            dev.layers[1].should.be.exactly(lay2);
        });
    });

    describe("#toJSON", function() {
        beforeEach(function initialize() {
            initDevice();
        });
        it("can output JSON with no layers or groups", function() {
            dev.toJSON();
        });
        it("can output JSON with one layer, no groups", function() {
            dev.addLayer(lay1);
            dev.toJSON();
        });
        it("can output JSON with two layers, no groups", function() {
            dev.addLayer(lay1);
            dev.addLayer(lay2);
            dev.toJSON();
        });
        it("can output JSON with layers and groups");
        it("can output JSON with layers which contain features", function() {
            dev.addLayer(lay1);
            lay1.addFeature(feat1);
            dev.addLayer(lay2);
            lay2.addFeature(feat2);
            dev.toJSON();
        });
    });

    describe("#fromJSON", function() {
        beforeEach(function initialize() {
            initDevice();
        });
        it("can load a device from valid JSON", function() {
            lay1.addFeature(feat1);
            lay2.addFeature(feat2);
            let json = {
                "params": {
                    "width": 59,
                    "height": 23.5
                },
                "name": "myDevice",
                "groups": [],
                "defaults": {},
                "layers": {
                    "lay1": lay1.toJSON(),
                    "lay2": lay2.toJSON()
                }
            };
            let dev2 = Device.fromJSON(json);
        });
        it("can load a Device from the output of toJSON", function() {
            dev.addLayer(lay1);
            dev.addLayer(lay2);
            lay1.addFeature(feat1);
            lay2.addFeature(feat2);
            let json = dev.toJSON();
            let dev2 = Device.fromJSON(json);
        });
        it("cannot load a device from malformed JSON", function() {
            let json = {
                "params": {
                    "height": {
                        "type": FloatValue.typeString(),
                        "value": 23.5
                    }
                },
                "name": {
                    "type": StringValue.typeString(),
                    "value": "myDevice"
                },
                "layers": {
                    "lay1": lay1.toJSON(),
                    "lay2": lay2.toJSON()
                }
            }
            let dev2;
            (function() {
                dev2 = Device.fromJSON(json)
            }).should.throwError();
        });
    });
});

describe("Feature", function() {
    describe("#init", function() {
        it("should be given a unique ID on initialization", function() {
            feat1.id.should.not.equal(feat2.id);
        });
    });

    describe("#toJSON", function() {
        it("can produce JSON when containing multiple parameters", function() {
            feat1.toJSON();
            console.log(feat1.toJSON());
            feat2.toJSON();
        });
    });

    describe("#fromJSON", function() {
        it("can produce a Feature from valid JSON", function() {
            let json = {
                "id": "someValue",
                "type": "CircleValve",
                "params": {
                    "position": [0,0],
                    "height": 3
                },
                "name": "foobar"
            }
            let feat3 = Feature.fromJSON(json);
        });
        it("can produce a Feature from the output of toJSON", function() {
            let json = feat2.toJSON();
            let feat3 = Feature.fromJSON(json);
        });
        it("cannot produce a Feature from invalid JSON", function() {
            let json = {
                "params": {
                    "width": {
                        "type": FloatValue.typeString(),
                        "value": 5.1
                    },
                    "height": {
                        "type": IntegerValue.typeString(),
                        "value": 3
                    }
                }
            }
            let feat;
            (function() {
                feat = Feature.fromJSON(json)
            }).should.throwError();
        });
    });
});
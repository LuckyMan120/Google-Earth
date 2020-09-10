const router = require('express').Router();

var fs = require('fs'),
    path = require('path'),
    xmlReader = require('read-xml');

var papa = require('papaparse');
// get data from csv and kml
var csvFile = path.join(__dirname, './population.csv');
var convert = require('xml-js');
var firstKmlFile = path.join(__dirname, './firstKml.kml');
var secondKmlFile = path.join(__dirname, './secondKml.kml');
var stateKmlFile = path.join(__dirname, './us_states.kml');

// import models visitorDB
let db = require('../models');

let rad = function (x) {
    return x * Math.PI / 180;
};

router.route('/all').get((req, res) =>{

	xmlReader.readXML(fs.readFileSync(stateKmlFile), function(err, stateData) {
		if (err) {
	        console.error(err);
	    }

	    var stateXml = stateData.content;
	    var stateResult = JSON.parse(convert.xml2json(stateXml, {compact: true, spaces: 4}));

	    let data = {};
	    data['state'] = stateResult;
		
		// get data from DB
		db.countDB.find()
	    	.then(counts => {
	    		data['counts'] = counts;

	    		// get data from visitorDB
	    		db.visitorDB.find()
	    			.then(visitorData => {
	    				data['visitorData'] = visitorData;
	    				res.json(data);
	    			})
	    			.catch(err => console.log(err));
	    	})
	    	.catch(err => console.log(err));
	});

	// save display count
	db.countDB.find()
		.then(res => {
			db.countDB.updateOne(
				{ _id: res[0]._id},
				{ $set: 
					{
						"display_count" : parseInt(res[0].display_count) + 1
					}
				}
			).then(res => console.log("ok"))
			.catch(err => console.log('err', err))
		})
		.catch(err => console.log(err));
});

router.route('/search').post((req, res) => {
	console.log('search', req.body);
	// get all map data
	xmlReader.readXML(fs.readFileSync(firstKmlFile), function(err, firstData) {
	    if (err) {
	        console.error(err);
	    }

	    var firstXml = firstData.content;
	    var firstResult = JSON.parse(convert.xml2json(firstXml, {compact: true, spaces: 4}));

	    xmlReader.readXML(fs.readFileSync(secondKmlFile), function(error, secondData) {
	    	if (error) {
	    		console.log(error);
	    	}

	    	var secondXml = secondData.content;
	    	var secondResult = JSON.parse(convert.xml2json(secondXml, {compact: true, spaces: 4}));

	    	var totalData = [...firstResult.kml.Document.Folder.Placemark];
	    	totalData = [...totalData, ...secondResult.kml.Document.Folder.Placemark];

		    var csvs = papa.parse(fs.readFileSync(csvFile, {encoding:'utf-8'}).toString()).data;

		    var totalPoints = [];

		    // for(var i = 0; i < 100; i++){
		    for(var i = 0; i < totalData.length; i++){
		    	var points = {
	         		path: []
	         	};
		    	if (typeof totalData[i].MultiGeometry.Polygon.length !== "number") {
			        var results = totalData[i].MultiGeometry.Polygon.outerBoundaryIs.LinearRing.coordinates._text;

			        var coordinates = results.split(" ");
			        coordinates.forEach(item => {
			         	var coordinate = item.split(",");
			         	var pointPolys = {
			         		lat: parseFloat(coordinate[1]),
			         		lng: parseFloat(coordinate[0])
			         	};
			         	points.path.push(pointPolys);
			        });

			        // search geoID
			        for (let j = 1; j < csvs.length; j++) {
			        	if (csvs[j][0] == totalData[i].ExtendedData.SchemaData.SimpleData[0]._text) {
			        		points['countyname'] = totalData[i].ExtendedData.SchemaData.SimpleData[2]._text;
				            points['geoid'] = totalData[i].ExtendedData.SchemaData.SimpleData[0]._text;
				            points['statename'] = totalData[i].ExtendedData.SchemaData.SimpleData[1]._text;
				            points['population'] = csvs[j][1];
				            points['single'] = csvs[j][4];
				            points['medium'] = csvs[j][5];
				            points['expand'] = csvs[j][6];
				            points['income'] = csvs[j][3];
				            points['degree'] = csvs[j][2];
				            break;
			        	}
			        }
			        points.path.pop();
	            	totalPoints.push(points);
		    	}
		    }

		    let data = [];
		    // search polygons by each state
		    totalPoints.forEach(point => {
	            if (req.body.name === point.statename) {
	            	data.push(point);
	            }
		    });

		    const newEarth = new db.earthDB({
		        state: req.body.name,
		        polygons: data
		    });

		    newEarth.save()
		        .then(success => console.log('Earth Ok!'))
		        .catch(err => console.log('Error', err));
		    // res.json(data);
	    });
	});
});

router.route('/save').post((req, res) => {
	console.log('-save-', req.body);
	// search IP , update visitor IP array and visitor number.
	db.countDB.find()
		.then(result => {
			// save IP
			if (result[0].IPs.length === 0) {
				db.countDB.updateOne(
					{ _id: result[0]._id},
					{ $push: 
						{
							"IPs" : req.body.IP
						},
					  $set: 
					  	{
					  		"visitor_count" : 1
					  	}
					}
				).then(res => console.log("ok"))
				.catch(err => console.log('err', err));
			} else {
				if (result[0].IPs.indexOf(req.body.IP) === -1) {
					db.countDB.updateOne(
						{ _id: result[0]._id},
						{ $push:
							{
								"IPs" : req.body.IP
							},
						  $set:
						  	{
						  		"visitor_count" : parseInt(result[0].visitor_count) + 1
						  	}
						}
					).then(res => console.log("ok"))
					.catch(err => console.log('err', err));
				}
			}

			// save current visitor IP as previous visitor IP
			db.countDB.updateOne(
				{ _id: result[0]._id},
				{ $set: 
				  	{
				  		"previous_visitor" : req.body.IP
				  	}
				}
			).then(res => console.log("ok"))
			.catch(err => console.log('err', err));
		})
		.catch(err => console.log(err));
	
	// save the visitor's details
	db.visitorDB.find()
		.then(result => {
			// console.log(result);
			if (result.length === 0) {
				const newVisitor = new db.visitorDB({
			        IP_address: req.body.IP,
			        session: req.body.session,
			        polygons: req.body.polygons,
			        visited_at: req.body.visit_at
			    });

			    newVisitor.save()
			        .then(success => console.log('Ok'))
			        .catch(err => console.log('Error', err));
			} else {
				var newVisitorFlag = false;
				var newVisitorKey = 0;
				result.forEach((item, index) => {
					if (item["IP_address"] == req.body.IP && item["visited_at"] == req.body.visit_at) {
						newVisitorFlag = true;
						newVisitorKey = index;
					}
				});
				if (newVisitorFlag) {
					db.visitorDB.updateOne(
						{ _id : result[newVisitorKey]._id },
						{ $set:
							{
								"session" : req.body.session,
								"polygons" : req.body.polygons
							}
						},
						{multi : true}
					).then(res => console.log('--res', res))
					.catch(err => console.log('--err', err));
				} else {
					const newVisitor = new db.visitorDB({
				        IP_address: req.body.IP,
				        session: req.body.session,
				        polygons: req.body.polygons,
				        visited_at: req.body.visit_at
				    });

				    newVisitor.save()
				        .then(success => console.log('Ok'))
				        .catch(err => console.log('Error', err));
				}
			}
		})
		.catch(err => console.log(err));

	// save the tax info
	if (Object.keys(req.body).length > 4) {
		db.taxDB.find()
			.then(result => {
				// console.log(result);
				if (result.length === 0) {
					const newTax = new db.taxDB({
				        IP_address: req.body.IP,
				        visited_at: req.body.visit_at,
				        paid: req.body.paid,
				        sold: req.body.sold,
				        rate: req.body.rate,
				        period: req.body.period,
				        OZ: req.body.OZ,
				        notOZ: req.body.notOZ,
				        federal: req.body.federal,
				        state: req.body.state
				    });

				    newTax.save()
				        .then(success => console.log('Ok'))
				        .catch(err => console.log('Error', err));
				} else {
					var newTaxFlag = false;
					var newTaxkey = 0;
					result.forEach((item, index) => {
						if (item["IP_address"] == req.body.IP && item["visited_at"] == req.body.visit_at) {
							newTaxFlag = true;
							newTaxkey = index;
						}
					});
					if (newTaxFlag) {
						db.taxDB.updateOne(
							{ _id : result[newTaxkey]._id },
							{ $set:
								{
									paid: req.body.paid,
							        sold: req.body.sold,
							        rate: req.body.rate,
							        period: req.body.period,
							        OZ: req.body.OZ,
							        notOZ: req.body.notOZ,
							        federal: req.body.federal,
							        state: req.body.state
								}
							},
							{multi : true}
						).then(res => console.log('--res', res))
						.catch(err => console.log('--err', err));
					} else {
						const newTax = new db.taxDB({
					        IP_address: req.body.IP,
					        visited_at: req.body.visit_at,
					        paid: req.body.paid,
					        sold: req.body.sold,
					        rate: req.body.rate,
					        period: req.body.period,
					        OZ: req.body.OZ,
					        notOZ: req.body.notOZ,
					        federal: req.body.federal,
					        state: req.body.state
					    });

					    newTax.save()
					        .then(success => console.log('Ok'))
					        .catch(err => console.log('Error', err));
					}
				}
			})
			.catch(err => console.log(err));
	}
	
});

module.exports = router;
const router = require('express').Router();

var fs = require('fs'),
    path = require('path'),
    xmlReader = require('read-xml');

var papa = require('papaparse');
// get data from csv and kml
var csvFile = path.join(__dirname, './population.csv');
var convert = require('xml-js');
var kmlFile = path.join(__dirname, './file.kml');

// import models visitorDB
let db = require('../models');

router.route('/all').get((req, res) =>{
	// get all map data
	db.earthDB.find().limit(1000)
		.then(kmls => {
			console.log('kmls', kmls);
			var csvs = papa.parse(fs.readFileSync(csvFile, {encoding:'utf-8'}).toString()).data;
			var totalPoints = [];
			for(var i = 0; i < 100; i++){
		    // for(var i = 0; i < result.kml.Document.Folder.Placemark.length; i++){
		    	var points = {
	         		path: []
	         	};
		    	if (typeof kmls[i].data[0].MultiGeometry.Polygon.length !== "number") {
			        var results = kmls[i].data[0].MultiGeometry.Polygon.outerBoundaryIs.LinearRing.coordinates._text;

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
			        	if (csvs[j][0] == kmls[i].data[0].ExtendedData.SchemaData.SimpleData[0]._text) {
			        		points['countyname'] = kmls[i].data[0].ExtendedData.SchemaData.SimpleData[2]._text;
				            points['geoid'] = kmls[i].data[0].ExtendedData.SchemaData.SimpleData[0]._text;
				            points['statename'] = kmls[i].data[0].ExtendedData.SchemaData.SimpleData[1]._text;
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
		    console.log(totalPoints.length);
	        res.json(totalPoints);
		})
		.catch(err => {
			console.log('err', err);
			res.status(400).json(err);
		})
	// xmlReader.readXML(fs.readFileSync(kmlFile), function(err, data) {
	//     if (err) {
	//         console.error(err);
	//     }

	//     var xml = data.content;
	//     var result = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}));
	//     var csvs = papa.parse(fs.readFileSync(csvFile, {encoding:'utf-8'}).toString()).data;

	//     var totalPoints = [];

	//     for(var i = 0; i < 100; i++){
	//     // for(var i = 0; i < result.kml.Document.Folder.Placemark.length; i++){
	//     	var points = {
 //         		path: []
 //         	};
	//     	if (typeof result.kml.Document.Folder.Placemark[i].MultiGeometry.Polygon.length !== "number") {
	// 	        var results = result.kml.Document.Folder.Placemark[i].MultiGeometry.Polygon.outerBoundaryIs.LinearRing.coordinates._text;

	// 	        var coordinates = results.split(" ");
	// 	        coordinates.forEach(item => {
	// 	         	var coordinate = item.split(",");
	// 	         	var pointPolys = {
	// 	         		lat: parseFloat(coordinate[1]),
	// 	         		lng: parseFloat(coordinate[0])
	// 	         	};
	// 	         	points.path.push(pointPolys);
	// 	        });

	// 	        // search geoID
	// 	        for (let j = 1; j < csvs.length; j++) {
	// 	        	if (csvs[j][0] == result.kml.Document.Folder.Placemark[i].ExtendedData.SchemaData.SimpleData[0]._text) {
	// 	        		points['countyname'] = result.kml.Document.Folder.Placemark[i].ExtendedData.SchemaData.SimpleData[2]._text;
	// 		            points['geoid'] = result.kml.Document.Folder.Placemark[i].ExtendedData.SchemaData.SimpleData[0]._text;
	// 		            points['statename'] = result.kml.Document.Folder.Placemark[i].ExtendedData.SchemaData.SimpleData[1]._text;
	// 		            points['population'] = csvs[j][1];
	// 		            points['single'] = csvs[j][4];
	// 		            points['medium'] = csvs[j][5];
	// 		            points['expand'] = csvs[j][6];
	// 		            points['income'] = csvs[j][3];
	// 		            points['degree'] = csvs[j][2];
	// 		            break;
	// 	        	}
	// 	        }
	// 	        points.path.pop();
 //            	totalPoints.push(points);
	//     	}
	//     }
	//     console.log(totalPoints.length);
 //        res.json(totalPoints);
	// });

	// save display count
	// db.countDB.find()
	// 	.then(res => {
	// 		db.countDB.updateOne(
	// 			{ _id: res[0]._id},
	// 			{ $set: 
	// 				{
	// 					"display_count" : parseInt(res[0].display_count) + 1
	// 				}
	// 			}
	// 		).then(res => console.log("ok"))
	// 		.catch(err => console.log('err', err))
	// 	})
	// 	.catch(err => console.log(err));
});

router.route('/save').post((req, res) => {
	// search IP , update visitor IP array and visitor number.
	db.countDB.find()
		.then(result => {
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
			        visited_at: req.body.visit_at,
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
				        visited_at: req.body.visit_at,
				    });

				    newVisitor.save()
				        .then(success => console.log('Ok'))
				        .catch(err => console.log('Error', err));
				}
			}
		})
		.catch(err => console.log(err));

	// save the tax info
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
	
})

module.exports = router;
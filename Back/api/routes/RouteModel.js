const router = require('express').Router();

var fs = require('fs'),
    path = require('path'),
    xmlReader = require('read-xml');

var papa = require('papaparse');
var convert = require('xml-js');

// get data from csv and kml
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

	    				res.json(data)
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
	// get all map data
	db.testDB.find({ state: req.body.name })
		.then(mapData => {
			if (mapData.length !== 1) {
				let polyData = [...mapData[0].polygons];
				polyData = [...polyData, ...mapData[1].polygons];

				res.json(polyData);
			} else {
				res.json(mapData[0].polygons)
			}
		})
		.catch(err => console.log('Error', err));
});

router.route('/save').post((req, res) => {
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
			if (result.length === 0) {
				const newVisitor = new db.visitorDB({
			        IP_address: req.body.IP,
			        visited_at: req.body.visit_at,
			        session: req.body.session,
			        polygons: req.body.polygons,
			        schoolPins: req.body.schools,
			        companyPins: req.body.companies,
			        taxInfo: req.body.taxInfo,
			        businessInfo: req.body.businessInfo
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
								"session": req.body.session,
						        "polygons": req.body.polygons,
						        "schoolPins": req.body.schools,
						        "companyPins": req.body.companies,
						        "taxInfo": req.body.taxInfo,
						        "businessInfo": req.body.businessInfo
							}
						},
						{multi : true}
					).then(res => console.log('ok'))
					.catch(err => console.log('err'));
				} else {
					const newVisitor = new db.visitorDB({
				        IP_address: req.body.IP,
				        visited_at: req.body.visit_at,
				        session: req.body.session,
				        polygons: req.body.polygons,
				        schoolPins: req.body.schools,
				        companyPins: req.body.companies,
				        taxInfo: req.body.taxInfo,
				        businessInfo: req.body.businessInfo
				    });

				    newVisitor.save()
				        .then(success => console.log('Ok'))
				        .catch(err => console.log('Error', err));
				}
			}
		})
		.catch(err => console.log(err));
});

module.exports = router;
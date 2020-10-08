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

	    				// get data from pinDB
	    				db.pinDB.find()
	    					.then(pins => {
	    						data['pins'] = pins;

	    						// get data from businessDB
	    						db.businessDB.find()
	    							.then(business => {
	    								data['business'] = business

	    								// get data from the taxDB
	    								db.taxDB.find()
	    									.then(tax => {
	    										data['tax'] = tax

	    										res.json(data);
	    									})
	    									.catch(err => console.log(err))
	    							})
	    							.catch(err => console.log(err))
	    					})
	    					.catch(err => console.log(err))
	    			})
	    			.catch(err => console.log(err));
	    	})
	    	.catch(err => console.log(err));
	});

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
		if (req.body.taxInfo.tax !== null) {
			db.taxDB.find()
				.then(result => {
					// console.log(result);
					if (result.length === 0) {
						const newTax = new db.taxDB({
					        IP_address: req.body.IP,
					        visited_at: req.body.visit_at,
					        paid: req.body.taxInfo.tax.paid,
					        sold: req.body.taxInfo.tax.sold,
					        rate: req.body.taxInfo.tax.rate,
					        period: req.body.taxInfo.tax.period,
					        OZ: req.body.taxInfo.tax.second,
					        notOZ: req.body.taxInfo.tax.first,
					        federal: req.body.taxInfo.tax.federal
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
										paid: req.body.taxInfo.tax.paid,
								        sold: req.body.taxInfo.tax.sold,
								        rate: req.body.taxInfo.tax.rate,
								        period: req.body.taxInfo.tax.period,
								        OZ: req.body.taxInfo.tax.second,
								        notOZ: req.body.taxInfo.tax.first,
								        federal: req.body.taxInfo.tax.federal
									}
								},
								{multi : true}
							).then(res => console.log('--res', res))
							.catch(err => console.log('--err', err));
						} else {
							const newTax = new db.taxDB({
						        IP_address: req.body.IP,
						        visited_at: req.body.visit_at,
						        paid: req.body.taxInfo.tax.paid,
						        sold: req.body.taxInfo.tax.sold,
						        rate: req.body.taxInfo.tax.rate,
						        period: req.body.taxInfo.tax.period,
						        OZ: req.body.taxInfo.tax.second,
						        notOZ: req.body.taxInfo.tax.first,
						        federal: req.body.taxInfo.tax.federal
						    });

						    newTax.save()
						        .then(success => console.log('Ok'))
						        .catch(err => console.log('Error', err));
						}
					}
				})
				.catch(err => console.log(err));
		}

		// save business data
		if (req.body.taxInfo.business !== null) {
			db.businessDB.find()
				.then(result => {
					// console.log(result);
					if (result.length === 0) {
						const newBusiness = new db.businessDB({
					        IP_address: req.body.IP,
					        visited_at: req.body.visit_at,
					        initial: req.body.taxInfo.business.paid,
					        cash: req.body.taxInfo.business.sold,
					        sales: req.body.taxInfo.business.rate,
					        OZ: req.body.taxInfo.business.second,
					        notOZ: req.body.taxInfo.business.first,
					        federal: req.body.taxInfo.business.federal
					    });

					    newBusiness.save()
					        .then(success => console.log('Ok'))
					        .catch(err => console.log('Error', err));
					} else {
						var newBusinessFlag = false;
						var newBusinessKey = 0;
						result.forEach((item, index) => {
							if (item["IP_address"] == req.body.IP && item["visited_at"] == req.body.visit_at) {
								newBusinessFlag = true;
								newBusinessKey = index;
							}
						});
						if (newBusinessFlag) {
							db.businessDB.updateOne(
								{ _id : result[newBusinessKey]._id },
								{ $set:
									{
										initial: req.body.taxInfo.business.paid,
								        cash: req.body.taxInfo.business.sold,
								        sales: req.body.taxInfo.business.rate,
								        OZ: req.body.taxInfo.business.second,
								        notOZ: req.body.taxInfo.business.first,
								        federal: req.body.taxInfo.business.federal
									}
								},
								{multi : true}
							).then(res => console.log('--res', res))
							.catch(err => console.log('--err', err));
						} else {
							const newBusiness = new db.businessDB({
						        IP_address: req.body.IP,
						        visited_at: req.body.visit_at,
						        initial: req.body.taxInfo.business.paid,
						        cash: req.body.taxInfo.business.sold,
						        sales: req.body.taxInfo.business.rate,
						        OZ: req.body.taxInfo.business.second,
						        notOZ: req.body.taxInfo.business.first,
						        federal: req.body.taxInfo.business.federal
						    });

						    newBusiness.save()
						        .then(success => console.log('Ok'))
						        .catch(err => console.log('Error', err));
						}
					}
				})
				.catch(err => console.log(err));
		}

	// save the school and company pins data
	db.pinDB.find()
		.then(result => {
			if (result.length === 0) {
				const newPin = new db.pinDB({
			        IP_address: req.body.IP,
			        session: req.body.session,
			        visited_at: req.body.visit_at,
			        schools: req.body.schools,
			        companies: req.body.companies
			    });

			    newPin.save()
			        .then(success => console.log('Ok'))
			        .catch(err => console.log('Error', err));
			} else {
				var newPinFlag = false;
				var newPinKey = 0;
				result.forEach((item, index) => {
					if (item["IP_address"] == req.body.IP && item["visited_at"] == req.body.visit_at) {
						newPinFlag = true;
						newPinKey = index;
					}
				});
				if (newPinFlag) {
					db.visitorDB.updateOne(
						{ _id : result[newPinKey]._id },
						{ $set:
							{
								"session" : req.body.session,
								"schools" : req.body.schools,
								"companies" : req.body.companies
							}
						},
						{multi : true}
					).then(res => console.log('--res', res))
					.catch(err => console.log('--err', err));
				} else {
					const newPin = new db.pinDB({
				        IP_address: req.body.IP,
				        session: req.body.session,
				        visited_at: req.body.visit_at,
				        schools: req.body.schools,
				        companies: req.body.companies,
				    });

				    newPin.save()
				        .then(success => console.log('Ok'))
				        .catch(err => console.log('Error', err));
				}
			}
		})
		.catch(err => console.log(err))
});

module.exports = router;
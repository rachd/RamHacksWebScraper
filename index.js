const express = require('express');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const rp = require('request-promise');
const app = express();

app.use(bodyParser.json());

app.post('/', function(req, res){
	res.header("Access-Control-Allow-Origin", "*");
	const url = req.body.url;
	let questions = {};
	let categories = [];
	let promises = [];

	const options = {
	  uri: url,
	  transform: (body) => {
	    return cheerio.load(body);
	  }
	};

	rp(options)
	.then(($) => {
		$('h3').each(function(i, elem) {
			categories.push(url + "/" + $(this).children().first().attr('href'));
		});
		for (let category of categories) {
			promises.push(new Promise((resolve, reject) => {
				const newOptions = {
					uri: category,
					transform: (body) => {
						return cheerio.load(body);
					}
				};
				rp(newOptions)
				.then(($) => {
					let theseQuestions = {};
					$('h4').each(function(i, elem) {
						let current = $(this);
						const question = current.text();
						let answer = "";
						current = current.next();
						while(!current.hasClass("toplink")) {
							answer += current.text().replace(/[\n\t\r]/g,"");
							current = current.next();
						}
						theseQuestions[question] = answer;
						resolve(theseQuestions);
					});
				})
				.catch((err) => {
					console.log(err);
					reject();
				});
			}));
		}
		Promise.all(promises)
		.then(values => { 
			res.json(values.reduce((a, b) => {
					return Object.assign(a, b);
				})
			);
		})
		.catch(err => console.log(err));
	})
	.catch((err) => {
		console.log(err);
	});
});

app.listen(8080, () => console.log("listening on port 8080"));
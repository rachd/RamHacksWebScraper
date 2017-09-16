const express = require('express');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const rp = require('request-promise');
const app = express();

app.use(bodyParser.json());

app.post('/', function(req, res){
	const url = req.body.url;
	let questions = {};

	const options = {
	  uri: url,
	  transform: (body) => {
	    return cheerio.load(body);
	  }
	};

	rp(options)
	  .then(($) => {
	    $('h4').each(function(i, elem) {
	    	let current = $(this);
	    	const question = current.text();
	    	let answer = "";
	    	current = current.next();
	    	while(!current.hasClass("toplink")) {
	    		answer += current.text();
	    		current = current.next();
	    	}
	    	questions[question] = answer;
	    });
	    res.json(questions);
	  })
	  .catch((err) => {
	    console.log(err);
	  });

	// res.json(url);

});

app.listen(8080, () => console.log("listening on port 8080"));
while(document.readyState != "complete" && document.readyState != "interactive") {}
console.log(document.readyState)
routing = [];
domunits = {};

findQuestions(document.body.getElementsByClassName("pagedlist_item"))

chrome.extension.sendRequest({method: "marquora_hidesPlease", routs: routing}, function(response) {
	if(response.method == "marquora_hidesWelcome") {
		hideQuestions(response.routs)
	}
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.method == "hideQuestion") {
		hideQuestion(request.data);
	} 
	else if (request.method == "revealQuestion") {
		revealQuestion(request.data);
	}
	else if (request.method == "marquora_questionsPlease") {
		log("got to extension marquora_questionsPlease")
		var ques_href = findQuestions(document.body.getElementsByClassName("pagedlist_item"));
		sendResponse({method: "questions", quest: ques_href[0], hrefs: ques_href[1], routs:routing});
	} 
	else if (request.method == "marquora_hideThese") {
		hideQuestions(request.data);
	} else {
		sendResponse({data:"hmm"});
	}
});

function findQuestions(items) {
	clearData()
	href = [];
	questions = [];
	for(var item in items) {
		var domUnit = items[item]
		if(domUnit.getElementsByClassName) {
			var children = domUnit.getElementsByClassName("feed_item_question");
			if(children.length > 0) {
				var question_link = getQLink(domUnit);
				if(!(question_link == "fail")) {	
					rout = question_link.getAttribute('routing')
					if(!domunits[rout]) {			
						href.push(question_link.href);
						routing.push(rout);
						questions.push(question_link.text);
						domunits[rout] = domUnit;
					}
				}
			}
		}			
	}
	return [questions, href];
}

function clearData() {
	domunits = {}
	routing = []
}

function getQLink(domUnit) {
	question_link = domUnit.getElementsByClassName("question_link");
	if(question_link) {
		return question_link.item(0);
	}
	return "fail";
}

function hideQuestions(routs) {
	console.log("hiding questions");
	for(var i = 0; i < routs.length; i++) {
		hideQuestion(routs[i])
	}
	console.log("finished hiding questions")
}

function hideQuestion(rout) {
	domunit = domunits[rout]
	if(domunit) {
		console.log("hiding this dom " + rout)
		domunit.style.display = "none"
	}
	else {
		console.log("nothing here to hide .. rout: " + rout)
	}
}

function revealQuestion(rout) {
	domunit = domunits[rout]
	if(domunit && (domunit.style.display == "none")) {
		domunit.style.display = "block"
	}
	else {
		console.log("nothing to display here")
	}
}


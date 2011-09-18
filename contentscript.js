while(document.readyState != "complete" && document.readyState != "interactive") {}
console.log(document.readyState)
routing = [];
domunits = {};

findQuestions()

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
		var ques_href = findQuestions(request.url);
		sendResponse({method: "questions", quest: ques_href[0], hrefs: ques_href[1], routs:routing});
	} 
	else if (request.method == "marquora_hideThese") {
		hideQuestions(request.data);
	} else {
		sendResponse({data:"hmm"});
	}
});

function findQuestions(url) {
	clearData()
	href = [];
	questions = [];
	var rout = null;
	items = document.body.getElementsByClassName("pagedlist_item");
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
	if(url && items.length == 0) {
		items = document.body.getElementsByTagName("script");
		for(var item in items) {
			var domUnit = items[item]
			if(domUnit) {
				rout = findRoutInSinglePage(domUnit.innerHTML)
				if(checkRout(rout)) {
					domunits[rout] = domUnit;
					routing.push(rout);
					questions.push(getQuestionFromH1())
					href.push(url)
					break
				}
				else {
					rout = null
				}
			}
		}	
	}
	return [questions, href];
}

function getQuestionFromH1() {
	h1s = document.body.getElementsByTagName("h1");
	console.log(h1s.length + " is length " + h1s[0].innerHTML.split("span>")[1])
	return h1s[0].innerHTML.split("span>")[1]
}

function checkRout(rout) {
	console.log("checking rout: " + rout)
  var regex = /\d{6}/;
	if(regex.test(rout)) {
		console.log("checked out ok")
	  return true;
	}
	return false;
}

function findRoutInSinglePage(text) {
	if(text) {
		var index = text.indexOf("qid")
		if(index > -1) {
			return text.substring(index+7, index+13)
		}
	}
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
	for(var i = 0; i < routs.length; i++) {
		hideQuestion(routs[i])
	}
}

function hideQuestion(rout) {
	domunit = domunits[rout]
	if(domunit) {
		domunit.style.display = "none"
	}
	else {
	}
}

function revealQuestion(rout) {
	domunit = domunits[rout]
	if(domunit && (domunit.style.display == "none")) {
		domunit.style.display = "block"
	}
	else {
		// console.log("nothing to display here")
	}
}


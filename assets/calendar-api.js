// Google API console clientID and apiKey
var clientId = '341036193100-hfr6u5t739mltn8ci1mjm4644j84am3s.apps.googleusercontent.com';
var apiKey = 'AIzaSyDba4KE5Xcggj814q-NDlV2ApWOX3TdWM8';

// enter the scope of current project (this API must be turned on in the google console)
var scopes = 'https://www.googleapis.com/auth/calendar.events';

// Oauth2 functions
function handleClientLoad() {
	gapi.client.setApiKey(apiKey);
	window.setTimeout(checkAuth,1);
}

function checkAuth() {
	gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
}

// show/hide the 'authorize' button, depending on application state
function handleAuthResult(authResult) {
	var googleSignIn = document.getElementById('google_signin');
	var authorizeButton = document.getElementById('authorize-button');
	var resultPanel = document.getElementById('result-panel');
	var resultTitle = document.getElementById('result-title');

	if (authResult && !authResult.error) {						
		googleSignIn.style.display = 'none';			// if authorized, hide button
		resultPanel.className = resultPanel.className.replace( /(?:^|\s)panel-danger(?!\S)/g , '' )	// remove red class
		resultPanel.className += ' panel-success';				// add green class
		console.log('Application authorized.');
	} else {													// otherwise, show button
		googleSignIn.style.display = 'block';
		resultPanel.className += ' panel-danger';				// make panel red
		console.log('Application not authorized! Sign in required!');
		authorizeButton.onclick = handleAuthClick;				// setup function to handle button click
	}
}
			
// function triggered when user authorizes app
function handleAuthClick(event) {
	gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
	return false;
}

// function load the calendar api and make the api call
function makeApiCall() {
	gapi.client.load('calendar', 'v3', function() {					// load the calendar api (version 3)
		var title = localStorage.getItem("event_title");
		if (title == undefined) { title = "Work"; }
		title = prompt("Enter an event title:", title);
		while (title == "") {
			alert("Please enter a title for the event!");
			title = prompt("Enter an event title:", title);
		}
		if (title != null) {
			localStorage.setItem("event_title", title);
			var now = new Date();
			var start_shift = document.getElementById("start_shift").value;
			var end_shift = document.getElementById("end_shift").value;
			var start_hour = start_shift.split(":")[0];
			var start_minute = start_shift.split(":")[1];
			var end_hour = end_shift.split(":")[0];
			var end_minute = end_shift.split(":")[1];
			var startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), start_hour, start_minute);
			startDate = startDate.toISOString();
			var endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), end_hour, end_minute);
			endDate = endDate.toISOString();
			
			var breaks = new Array();
			var counter = sessionStorage.getItem("counter");
			var breaksString = "";
			for (var i = 1; i <= counter; i++) {
				var start_id = "start_break" + i;
				var end_id = "end_break" + i;
				var start_break = document.getElementById(start_id).value;
				var end_break = document.getElementById(end_id).value;
				if (start_break != "" && end_break != "") {
					breaks[i-1] = "<em>On Break: " + convertTime(start_break) + "</em>\n";
					breaks[i] = "<em>Off Break: " + convertTime(end_break) + "</em>\n";
					breaksString += breaks[i-1];
					breaksString += breaks[i];
				}
			}
			
			var hours_worked = "<b>" + document.getElementById("hours_worked").innerHTML + "</b>";
			var total_breaks = "<b>" + document.getElementById("total_breaks").innerHTML + "</b>";
			var time_in = "<em>Time In: " + convertTime(start_shift) + "</em>";
			var time_out = "<em>Time Out: " + convertTime(end_shift) + "</em>";
			
			// setup event details
			var resource = {
				"summary": title,
				"description": hours_worked + "\n" + total_breaks + "\nShift Paid? N/A\n\n" + time_in + "\n" + breaksString + time_out,
				"reminders": {
					"useDefault": false,
				},
				"start": {
					"dateTime": startDate
				},
				"end": {
					"dateTime": endDate
				}
			};
			
			var request = gapi.client.calendar.events.insert({
				'calendarId':		'primary',	// calendar ID
				"resource":			resource	// pass event details with api call
			});
			
			// handle the response from our api call
			request.execute(function(resp) {
				if(resp.status=='confirmed') {
					document.getElementById('event-response').innerHTML = "'" + title + "' has been added successfully!<br>View it on <a href='" + resp.htmlLink + "' target='_blank'>Google Calendar</a>.";
					console.log("Added event to calendar.");
				} else {
					alert("Unfortunately, an error has occurred.<br>Please check the console for more details.");
				}
				console.log(resp);
			});
		}
	});
}
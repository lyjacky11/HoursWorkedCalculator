var counter = 1;

function checkDevice() {
	if (screen.width <= 768) {
		var times_list = document.getElementById("times_list");
		var shortcuts = document.getElementById("shortcuts");
		times_list.innerHTML = "";
		shortcuts.style.display = "none";
	}
}

function checkSettings() {
	var pay_rate = document.getElementById("pay_rate");
	var rate_x = document.getElementById("rate_x");
	if (localStorage.getItem("pay_rate") != null) {
		pay_rate.setAttribute("value", localStorage.getItem("pay_rate"));
	} else {
		pay_rate.setAttribute("placeholder", "14.00");
	}
	if (localStorage.getItem("rate_x") != null) {
		rate_x.setAttribute("value", localStorage.getItem("rate_x"));
	} else {
		rate_x.setAttribute("value", "1.0");
	}
}

function calculateHours() {
	var pay_rate = document.getElementById("pay_rate").value;
	var rate_x = document.getElementById("rate_x").value;
	var start_shift = document.getElementById("start_shift").value;
	var end_shift = document.getElementById("end_shift").value;
	var hours_worked = document.getElementById("hours_worked");
	var total_breaks = document.getElementById("total_breaks");
	var gross_pay = document.getElementById("gross_pay");
	//var addToCal = document.getElementById("addToCal");
	//var googleSignIn = document.getElementById('google_signin');
	var results = document.getElementById("results");
	
	localStorage.setItem("pay_rate", pay_rate);
	localStorage.setItem("rate_x", rate_x);

	if (start_shift != "" && end_shift != "") {

		// Shift Times
		var start_hour = start_shift.split(":")[0];
		var start_minute = start_shift.split(":")[1];
		var end_hour = end_shift.split(":")[0];
		var end_minute = end_shift.split(":")[1];

		// Calculate shift hours
		var net_start = Number(start_hour) + start_minute / 60;
		var net_end = Number(end_hour) + end_minute / 60;
		var total_shift_hours = net_end - net_start;
		var totalb_hours = 0;

		for (var i = 1; i <= counter; i++) {
			var start_id = "start_break" + i;
			var end_id = "end_break" + i;
			var start_break = document.getElementById(start_id).value;
			var end_break = document.getElementById(end_id).value;
			if (start_break != "" && end_break != "") {
				// Break Times
				var startb_hour = start_break.split(":")[0];
				var startb_minute = start_break.split(":")[1];
				var endb_hour = end_break.split(":")[0];
				var endb_minute = end_break.split(":")[1];

				// Calculate break hours
				var netb_start = Number(startb_hour) + startb_minute / 60;
				var netb_end = Number(endb_hour) + endb_minute / 60;
				if (netb_end < netb_start || netb_start < net_start || netb_end > net_end) {
					alert("Invalid break times!\nPlease check the information and try again!");
					return false;
				}
				var sum = netb_end - netb_start;
				totalb_hours += sum;
			}
		}

		// Calculate total hours
		var total_hours = total_shift_hours - totalb_hours;
		var total_amount = pay_rate * rate_x * total_hours;

		var hour_netdiff = Math.floor(total_hours);
		var minute_netdiff = Math.round((total_hours % 1) * 60);

		var hour_bdiff = Math.floor(totalb_hours);
		var minute_bdiff = Math.round((totalb_hours % 1) * 60);

		totalb_hours = totalb_hours.toFixed(2);
		total_hours = total_hours.toFixed(2);
		total_amount = total_amount.toFixed(2);

		if (total_hours < 0 || totalb_hours < 0 || net_end < net_start) {
			alert("Invalid shift/break times!\nPlease check the information and try again!");
			return false;
		}
		hours_worked.innerHTML = "Hours Worked: " + hour_netdiff + "h " + minute_netdiff + "m | " + total_hours + " hours";
		total_breaks.innerHTML = "Total Breaks: " + hour_bdiff + "h " + minute_bdiff + "m | " + totalb_hours + " hours";
		gross_pay.innerHTML = "Gross Pay: $" + total_amount;
		results.style.display = "block";
		/*
		if (googleSignIn.style.display == 'none') {
			addToCal.style.visibility = "visible";
		}
		*/
		sessionStorage.setItem("counter", counter);
		updateCalButton();
	}
}

function updateCalButton() {
	var calButton = document.getElementsByClassName("addeventatc")[0];
	var eventTitle = calButton.getElementsByClassName("title")[0];
	var description = calButton.getElementsByClassName("description")[0];
	var startTime = calButton.getElementsByClassName("start")[0];
	var endTime = calButton.getElementsByClassName("end")[0];
	var timeZone = calButton.getElementsByClassName("timezone")[0];
	var reminder = calButton.getElementsByClassName("alarm_reminder")[0];
	
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
	var total_breaks = "";
	for (var i = 1; i <= counter; i++) {
		var start_id = "start_break" + i;
		var end_id = "end_break" + i;
		var start_break = document.getElementById(start_id).value;
		var end_break = document.getElementById(end_id).value;
		if (start_break != "" && end_break != "") {
			total_breaks = "\n<b>" + document.getElementById("total_breaks").innerHTML + "</b>";
			breaks[i-1] = "<em>On Break: " + convertTime(start_break) + "</em>\n";
			breaks[i] = "<em>Off Break: " + convertTime(end_break) + "</em>\n";
			breaksString += breaks[i-1];
			breaksString += breaks[i];
		}
	}
	
	var hours_worked = "<b>" + document.getElementById("hours_worked").innerHTML + "</b>";
	var time_in = "<em>Time In: " + convertTime(start_shift) + "</em>";
	var time_out = "<em>Time Out: " + convertTime(end_shift) + "</em>";
	
	eventTitle.innerText = "Event Name";
	description.innerText = hours_worked + total_breaks + "<br>Shift Paid? N/A<br><br>" + time_in + "<br>" + breaksString + time_out;
	startTime.innerText = start_shift;
	endTime.innerText = end_shift;
	timeZone.innerText = "America/Toronto";
	reminder.innerText = "0";
}

/*
function setCalTitle() {
	var eventTitle = calButton.getElementsByClassName("title")[0];
	var title = localStorage.getItem("event_title");
	if (title == undefined) {
		title = "Event Name";
	}
	title = prompt("Event Title:", title);
	while (title == "") {
		alert("Please enter a title for the event!");
		title = prompt("Event Title:", title);
	}
	localStorage.setItem("event_title", title);
	eventTitle.innerText = title;
}
*/

function addBreak() {
	var breaks = document.getElementById("breaks");
	var currentID = "break" + counter;
	var break_num = document.getElementById(currentID);
	var removeButton = document.getElementById("removeButton");

	clone = break_num.cloneNode(true);
	counter++;
	var newID = "break" + counter;
	clone.id = newID;

	var start_break = clone.getElementsByTagName("input")[0];
	var end_break = clone.getElementsByTagName("input")[1];
	start_break.id = "start_break" + counter;
	end_break.id = "end_break" + counter;

	breaks.appendChild(clone);
	removeButton.style.visibility = "visible";
}

function removeBreak() {
	var removeButton = document.getElementById("removeButton");
	if (counter > 1) {
		var currentID = "break" + counter;
		var break_num = document.getElementById(currentID);
		break_num.remove();
		counter--;
		if (counter == 1) {
			removeButton.style.visibility = "hidden";
		}
	}
}

function clearForm() {
	var hours_worked = document.getElementById("hours_worked");
	var total_breaks = document.getElementById("total_breaks");
	var gross_pay = document.getElementById("gross_pay");
	var shift_times = document.getElementById("shift_times");
	//var addToCal = document.getElementById("addToCal");

	shift_times.reset();
	while (counter != 1) {
		removeBreak();
	}
	sessionStorage.setItem("counter", 1);
	//addToCal.style.visibility = "hidden";
	hours_worked.innerHTML = "Hours Worked: 0h 0m | 0.00 hours";
	total_breaks.innerHTML = "Total Breaks: 0h 0m | 0.00 hours";
	gross_pay.innerHTML = "Gross Pay: $0.00";
}

function convertTime(time24) {
	var ts = time24;
	var H = +ts.substr(0, 2);
	var h = (H % 12) || 12;
	//h = (h < 10)?("0"+h):h;  // leading 0 at the left for 1 digit hours
	var ampm = H < 12 ? " am" : " pm";
	ts = h + ts.substr(2, 3) + ampm;
	return ts;
}

document.onkeydown = function (evt) {
	var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
	if (keyCode == 13) {
		// For Enter Key
		document.getElementById('calculateBtn').click();
		return false;
	} else if (keyCode == 27) {
		// For Escape
		document.getElementById('resetBtn').click();
		return false;
	} else if (keyCode == 187 || keyCode == 107) {
		// For Equal/Add
		document.getElementById('addButton').click();
		return false;
	} else if (keyCode == 189 || keyCode == 109) {
		// For Minus/Underscore
		document.getElementById('removeButton').click();
		return false;
	} else {
		return true;
	}
};
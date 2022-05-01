//import firebase from "./src/Utils/FirebaseAdmin.js";
const { serviceAccount } = require("./src/Utils/FirebaseAdmin");
const admin = require("firebase-admin");
const { getIdList, getClassName, deepCopy } = require("./src/Utils/AlertDataUtils");
const schedule = require("node-schedule");
//const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
//const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://rpag-b8590.firebaseio.com"
});

//const firestore = getFirestore();

//console.log(firestore);

const getAlertList = async function () {
	const firestore = admin.firestore();
	//console.log("Adquiring full list of alerts");

	var alertRef = firestore.collection("Alerts");
	var jsonList = [];

	//console.log("1. Getting list");

	await alertRef.get().then((querySnapshot) => {
		//console.log("2. List adquired");
		querySnapshot.forEach((doc) => {
			//console.log(doc.id, " => ", doc.data());
			var d = doc.data();

			jsonList.push({
				id: d.id,
				userId: d.userId,
				classId: d.classId,
				date: d.date.toDate(),
				timestamp: d.date.toDate().getTime(),
				latitude: d.latitude,
				longitude: d.longitude,
				geohash: d.geohash
			});
		});

		//console.log("3. List saved");
	}).catch((error) => {
		console.log("Error getting documents: ", error);
		return null;
	});

	//console.log("4. List returning");
	return jsonList;
}

const classIdList = getIdList();
const BlankClassCounters = [];
classIdList.forEach(classID => {
	BlankClassCounters.push({
		classId: classID,
		className: getClassName(classID),
		counter: 0
	})
});

const createMonthSummary = function (monthData, alertList) {
	var classCounters = deepCopy(BlankClassCounters);
	var monthAlertData = [];
	var totalAlerts = 0;

	for (let i = 0; i < alertList.length; i++) {
		const alertTimestamp = alertList[i].date.getTime();
		if (alertTimestamp >= monthData.startDate.getTime() && alertTimestamp <= monthData.endDate.getTime()) {

			totalAlerts += 1;
			monthAlertData.push(alertList[i]);

			for (var j = 0; j < classCounters.length; j++) {
				if (alertList[i].classId == classCounters[j].classId) {
					classCounters[j].counter += 1;
					break;
				}
			}
		}
	}

	monthData.totalAlerts = totalAlerts;
	monthData.counts = JSON.stringify(classCounters);
	monthData.monthAlertData = JSON.stringify(monthAlertData);

	return monthData;
}

const storeMonthSummary = async function (monthData) {
	const firestore = admin.firestore();
	var AlertArchivesRef = firestore.collection("Archived").doc("alerts").collection("Summaries");
	console.log("Storing", monthData);

	var res = false;

	await AlertArchivesRef.doc(monthData.id).set(monthData).then(
		(response) => {
			console.log("Summary", monthData.id, "saved to firestore", response._writeTime.toDate());
			res = true;
		},
		() => { console.log("Failed to save", monthData.id, "to firestore (promise fulfilled)"); }
	).catch(
		(error) => { console.log("Error saving document:", error) }
	)


	return true;
}

const removeMonthAlerts = function (monthData) {
	const firestore = admin.firestore();
	var alertRef = firestore.collection("Alerts");

	const alertsToRemove = JSON.parse(monthData.monthAlertData);
	for (let i = 0; i < alertsToRemove.length; i++) {
		console.log("Removing ", alertsToRemove[i].id);
		
		alertRef.doc(alertsToRemove[i].id).delete().then(
			() => { console.log("Removal success:", alertsToRemove[i].id) },
			() => { console.log("Removal failure:", alertsToRemove[i].id) }
		).catch(
			(error) => { console.log("Error removing document:", error, "-", alertsToRemove[i].id) }
		)
		
	}
}

const getOldestAlertDate = function (alertList) {

	var oldest = new Date().getTime();

	for (let i = 0; i < alertList.length; i++) {
		if (alertList[i].date.getTime() < oldest) {
			oldest = alertList[i].date.getTime();
		}
	}
	console.log("oldest date:", new Date(oldest))
	return oldest;
}

const getMonthsToArchive = function (oldestTimestamp, monthsNotToArchive) {
	var startDate = new Date(oldestTimestamp);
	startDate.setHours(0, 0, 0, 0);
	startDate.setDate(1);

	console.log("startDate:", startDate);

	var finalDate = new Date();
	finalDate.setHours(0, 0, 0, 0);
	finalDate.setDate(1);
	finalDate.setMonth(finalDate.getMonth() - monthsNotToArchive);

	var monthsToArchive = [];

	var monthStartDate = new Date(startDate);

	while (true) {
		monthEndDate = new Date(monthStartDate);
		monthEndDate.setMonth(monthEndDate.getMonth() + 1, 1);
		monthEndDate.setHours(0, 0, 0, -1);
		//monthEndDate.setTime(monthEndDate.getTime() - 1);

		if (monthEndDate.getTime() < finalDate.getTime()) {
			monthsToArchive.push({
				id: monthStartDate.getFullYear() + "-" + (monthStartDate.getMonth() + 1),
				startDate: new Date(monthStartDate),
				endDate: new Date(monthEndDate),
				counts: null,
				totalAlerts: null,
				monthAlertData: null
			});

			monthStartDate.setMonth(monthStartDate.getMonth() + 1, 1);
		} else {
			break;
		}
	}

	return monthsToArchive;
}
/*
var testDate = new Date();
testDate.setFullYear(2020, 11, 23);
testDate.setHours(14, 20, 45, 0);

console.log(getMonthsToArchive(testDate.getTime(), 3));
*/

const archiveOldAlerts = async function (numberOfMonthsNotToArchive) {
	console.log("Beginning archive process -", new Date())
	const alertList = await getAlertList();
	//console.log("5. List returned", alertList.length);

	const oldestTimestamp = getOldestAlertDate(alertList);

	var monthsToArchive = getMonthsToArchive(oldestTimestamp, numberOfMonthsNotToArchive);

	for (let i = 0; i < monthsToArchive.length; i++) {
		monthsToArchive[i] = createMonthSummary(monthsToArchive[i], alertList);
		var stored = await storeMonthSummary(monthsToArchive[i]);
		if (stored) {
			removeMonthAlerts(monthsToArchive[i]);
		}
	}

	//console.log("monthsToArchive", monthsToArchive);
}

const monthsToKeep = 3;
archiveOldAlerts(monthsToKeep);

const job = schedule.scheduleJob({ date: 1, hour: 1, minute: 30 }, () => {
	archiveOldAlerts(monthsToKeep);
})
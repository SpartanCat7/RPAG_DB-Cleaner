const schedule = require("node-schedule");
const job = schedule.scheduleJob({ second: 1 }, () => {
	console.log(new Date());
})
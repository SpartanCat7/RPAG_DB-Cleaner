//const admin = require("firebase-admin");
//const { getFirestore, Timestamp, FieldValue } = require("firebase-admin/firestore");

var serviceAccount = require("../Credentials/rpag-b8590-firebase-adminsdk-i8kn2-39fbc15076.json");
/*
//export default admin;
module.exports.initializeApp = function() {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://rpag-b8590.firebaseio.com"
    });
};

module.exports.getFirestore = function() {
    return getFirestore();
}
*/
module.exports.serviceAccount = serviceAccount;
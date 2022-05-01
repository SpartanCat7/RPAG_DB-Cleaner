const classList = [
    { classId: 1, name: "Accidente", icon: "accident.png", color: "rgba(239, 87, 119,1.0)" },
    { classId: 2, name: "Incendio", icon: "fire.png", color: "rgba(87, 95, 207,1.0)" },
    { classId: 3, name: "Persona Herida", icon: "wounded.png", color: "rgba(75, 207, 250,1.0)" },
    { classId: 4, name: "Bloqueo", icon: "blocked.png", color: "rgba(52, 231, 228,1.0)" },
    { classId: 5, name: "Trafico", icon: "traffic.png", color: "rgba(11, 232, 129,1.0)" },
    { classId: 6, name: "Manifestaciones", icon: "marching.png", color: "rgba(255, 192, 72,1.0)" },
    { classId: 7, name: "Calle Dañada", icon: "street_damage.png", color: "rgba(255, 221, 89,1.0)" },
    { classId: 8, name: "Corte Electrico", icon: "power_cut.png", color: "rgba(255, 94, 87,1.0)" }
]

/*
const getClassIcon = function (classId) {
    for (var i = 0; i < classList.length; i++) {
        if (classList[i].classId == classId) {
            return classList[i].icon;
        }
    }
}
*/

const getClassName = function (classId) {
    for (var i = 0; i < classList.length; i++) {
        if (classList[i].classId == classId) {
            return classList[i].name;
        }
    }
}

const getClassColor = function (classId) {
    for (var i = 0; i < classList.length; i++) {
        if (classList[i].classId == classId) {
            return classList[i].color;
        }
    }
}

const getClassCount = () => {
    return classList.length;
}

const getIdList = () => {
    var indexList = [];
    classList.forEach(element => {
        indexList.push(element.classId)
    });
    return indexList;
}

// copied from https://learnersbucket.com/examples/array/how-to-copy-array-in-javascript/
const deepCopy = (aObject) => {
    //If not a object then return
    if (!aObject) {
        return aObject;
    }

    let v;

    //Check the type of the input
    let bObject = Array.isArray(aObject) ? [] : {};

    //Copy each element
    for (const k in aObject) {
        v = aObject[k];

        //If type of element is object 
        //Then recursively call the same function and create  a copy
        bObject[k] = (typeof v === "object") ? deepCopy(v) : v;
    }

    return bObject;
}

module.exports = {
    //getClassIcon: getClassIcon,
    getClassName: getClassName,
    getClassColor: getClassColor,
    getClassCount: getClassCount,
    getIdList: getIdList,
    deepCopy: deepCopy
}
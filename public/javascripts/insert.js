// Date formatting function
function formatDate(datetime) {
    const date = datetime.split("T")[0];
    const splitDate = date.split("-");
    var year = splitDate[0];
    var month = splitDate[1];
    var day = splitDate[2];
    return day + "/" + month + "/" + year;
}

// Time formatting function
function formatTime(datetime) {
    return datetime.split("T")[1];
}


// const addNewPlantButtonEventListener = () => {
//     openSyncPlantsIDB().then((db) => {
//         const dateTime = document.getElementById('date_time').value.toString();
//
//         const sunRadios = document.querySelectorAll('input[name="sun"]');
//         const idRadios = document.querySelectorAll('input[name="identification"]');
//
//         let sunValue;
//         let idValue;
//
//         sunRadios.forEach(radio => {
//             if (radio.checked) {
//                 sunValue = radio.value;
//             }
//         });
//
//         idRadios.forEach(radio => {
//             if (radio.checked) {
//                 idValue = radio.value;
//             }
//         });
//         // Create an object representing the plant data
//         const plantData = {
//             date: formatDate(dateTime),
//             time: formatTime(dateTime),
//             height: document.getElementById('height').value,
//             spread: document.getElementById('spread').value,
//             flowers: document.getElementById('flowers').checked,
//             flower_colour: document.getElementById('flower_colour').value,
//             leaves: document.getElementById('leaves').checked,
//             fruit: document.getElementById('fruit').checked,
//             seeds: document.getElementById('seeds').checked,
//             sun: sunValue,
//             name: document.getElementById('name').value,
//             identification: idValue,
//             dbpedia: document.getElementById('dbpedia').value,
//             photo: document.getElementById('filePath').value,
//             uname: document.getElementById('uname').value,
//             chatId: null,
//             comments: null,
//             longitude: document.getElementById('longitude').value,
//             latitude: document.getElementById('latitude').value
//         };
//
//         // Add the plant data to IndexedDB
//         addNewPlantToIDB(db, plantData);
//     });
//
//     // navigator.serviceWorker.ready
//     //   .then(function (serviceWorkerRegistration) {
//     //       serviceWorkerRegistration.showNotification("Todo App",
//     //         {body: "Plant added! - " + name})
//     //         .then(r =>
//     //           console.log(r)
//     //         );
//     //   });
// }
//
// // window.onload = function () {
// //     // Add event listeners to buttons
// //     const add_btn = document.getElementById("add_btn");
// //     add_btn.addEventListener("click", addNewPlantButtonEventListener);
// // }
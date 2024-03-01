/*const Client = require("@replit/database");
const client = new Client();
await client.set("key", "value");
let key = await client.get("key");
console.log(key);*/

changeBar('add');

document.getElementById("view-only").checked=true;

function test() {
  //alert("help");
  let text = document.getElementById("inputBox");
  //document.getElementById("output-div").innerHTML = "go";
  let str = text.value;
  document.getElementById("output-div").innerHTML = str;

}

let store = {};
let index = 0;

function changeBar(btn) {
  document.getElementById("add-task").hidden = true;
  document.getElementById("edit-task").hidden = true;
  document.getElementById("show-task").hidden = true;
  document.getElementById("delete-task").hidden = true;
  document.getElementById("change-background").hidden = true;
  switch (btn) {
    case 'add':
      document.getElementById("add-task").hidden = false;
      break;
    case 'edit':
      document.getElementById("edit-task").hidden = false;
      break;
    case 'show-task':
      document.getElementById("show-task").hidden = false;
      document.getElementById("show-task-name").innerHTML = "Task Info";
      break;
    case 'delete':
      const cb = document.querySelector('#view-only');
      console.log(cb.checked);
      if (!cb.checked) {
        document.getElementById("show-task").hidden = false;
        document.getElementById("delete-task").hidden = false;
        document.getElementById("show-task-name").innerHTML = "Delete Task";
      }
      else {
        changeBar('show-task');
      }
      break;
    case 'bg':
      document.getElementById("change-background").hidden = false;
      break;

  }

}

function viewOnly() {
  const cb = document.querySelector('#view-only');
  changeBar('add');
  console.log(cb.checked);
  if (cb.checked) {
    document.getElementById("delete-task").hidden = true;
    document.getElementById("show-task-name").innerHTML = "Task Info";
  }
  else {
    document.getElementById("delete-task").hidden = false;
    document.getElementById("show-task-name").innerHTML = "Delete Task";
  }
}

function addTask() {

  let name = document.getElementById("task-name");
  let nameData = name.value;
  addName(nameData);
  //addName()
}

function editTask() {
  let name = document.getElementById("task-name-edit");
  let nameData = name.innerHTML;

  let desc = document.getElementById("task-description-edit");
  let descValue = desc.value;
  editDescription(nameData, descValue);

  let startDate = getDate("task-start-date-edit");
  let endDate = getDate("task-end-date-edit");
  if (isDateValid("task-start-date-edit") && isDateValid("task-end-date-edit")) {
    if (startDate < endDate) {
      console.log(startDate + " " + endDate)
      editStartDate(nameData, startDate);
      editEndDate(nameData, endDate);
      document.getElementById("task-start-date-output-edit").hidden = true;
      document.getElementById("task-end-date-output-edit").hidden = true;
    }//if
    else {
      document.getElementById("task-end-date-output-edit").innerHTML = "End date must be greater than start date";
      document.getElementById("task-end-date-output-edit").hidden = false;
      document.getElementById("task-start-date-output-edit").hidden = true;
    }//else
  }//if
  else if (isDateValid("task-start-date-edit")) { //Only the start date is valid
    document.getElementById("task-start-date-output-edit").innerHTML = "Start date can only be assigned with a valid end date";
    document.getElementById("task-end-date-output-edit").innerHTML = "End date must be a valid date";
    document.getElementById("task-start-date-output-edit").hidden = false;
    document.getElementById("task-end-date-output-edit").hidden = false;

    let endDate = store[nameData]["endDate"].split("-");

    for (let i = 0; i < 3; i++) {
      if (endDate[i] == undefined) {
        endDate[i] = "";
      }
    }

    document.getElementById("task-end-date-edit-year").value = endDate[0];
    document.getElementById("task-end-date-edit-month").value = endDate[1];
    document.getElementById("task-end-date-edit-day").value = endDate[2];
  }//else if
  else if (isDateValid("task-end-date-edit")) { //Only the end date is valid
    editEndDate(nameData, endDate);
    document.getElementById("task-end-date-output-edit").hidden = true;
    document.getElementById("task-start-date-output-edit").hidden = true;

    let startDate = store[nameData]["startDate"].split("-");

    for (let i = 0; i < 3; i++) {
      if (startDate[i] == undefined) {
        startDate[i] = "";
      }
    }

    document.getElementById("task-start-date-edit-year").value = startDate[0];
    document.getElementById("task-start-date-edit-month").value = startDate[1];
    document.getElementById("task-start-date-edit-day").value = startDate[2];
  }//else if
  else { //Both are invalid
    let startDate = store[nameData]["startDate"].split("-");

    let endDate = store[nameData]["endDate"].split("-");
    for (let i = 0; i < 3; i++) {
      if (startDate[i] == undefined) {
        startDate[i] = "";
      }

      if (endDate[i] == undefined) {
        endDate[i] = "";
      }
    }

    document.getElementById("task-start-date-edit-year").value = startDate[0];
    document.getElementById("task-start-date-edit-month").value = startDate[1];
    document.getElementById("task-start-date-edit-day").value = startDate[2];

    document.getElementById("task-start-date-output-edit").hidden = true;
    document.getElementById("task-end-date-output-edit").innerHTML = "End date must be a valid date";
    document.getElementById("task-end-date-output-edit").hidden = false;



    document.getElementById("task-end-date-edit-year").value = endDate[0];
    document.getElementById("task-end-date-edit-month").value = endDate[1];
    document.getElementById("task-end-date-edit-day").value = endDate[2];
  }


}

function addName(name) { //index 1
  let div = document.getElementById("task-name-output");
  let end = document.getElementById("task-end-date");
  if (name == "") {
    div.innerHTML = "You must enter a name for your task";
    div.hidden = false;
    document.getElementById("task-end-date-output").hidden = true;
    return;
  }
  if (!isDateValid("task-end-date")) {
    document.getElementById("task-end-date-output").innerHTML = "You must enter a valid end date for your task";
    document.getElementById("task-end-date-output").hidden = false;
    return;
  }
  else if (isDateValid("task-start-date") && getDate("task-start-date") >= getDate("task-end-date")) {
    document.getElementById("task-end-date-output").innerHTML = "The end date must be after the start date";
    document.getElementById("task-end-date-output").hidden = false;
    return;
  }
  else if (store[name] == undefined) {
    store[name] = { "index": index, "name": name, "description": "", "startDate": "", "endDate": "" };
    index++;
    div.hidden = true;
    document.getElementById("task-end-date-output").hidden = true;

    let desc = document.getElementById("task-description");

    let descValue = desc.value;
    addDescription(name, descValue);
    if (isDateValid("task-start-date")) {
      addStartDate(name, getDate("task-start-date"));
    }
    addEndDate(name, getDate("task-end-date"));
    addTaskList(name);
    sortBy();
    return;
  }
  //Tell the user pick a new name
  div.innerHTML = "The name <b>" + name + "</b> is already taken";
  div.hidden = false;
  document.getElementById("task-end-date-output").hidden = true;

  //
}

function addDescription(name, description) { //index 2
  let div = document.getElementById("task-description-output");
  if (store[name]["description"] === "") {
    //alert("added desc");
    store[name]["description"] = description;
    return;
  }
  //suggest a description


  //

  //store[name]["description"] = description;
}

function isDateValid(date) {
  let dateValue = getDate(date)
  //alert("Date " + getDate(date));
  let year = document.getElementById(date + "-year").value;
  let month = document.getElementById(date + "-month").value;
  let day = document.getElementById(date + "-day").value;
  let d = new Date(dateValue);
  const e = new Date("2021-02-25");
  const f = new Date(dateValue);
  //alert("e " + e.getDate());
  //alert("f " + f.getDate());

  //alert("month " + d.getMonth());
  //alert("day " + d.getDate());
  switch (month) {
    case '4':
    case '6':
    case '9':
    case '11':
      //alert ("case 4 6 9 11");
      if (day > 30) {
        return false;
      }
      break;
    case '2':
      //alert("case 2");
      //alert("day " + d.getDate());
      if (day > 29) {
        return false;
      }
      if (day == 29 && (d.getYear() % 4 != 0)) {
        return false;
      }
      break;
  }
  if (d == "Invalid Date" || year.length != 4) {
    return false;
  }
  if (month.length == 0 || day.length == 0) {
    return false;
  }
  return true;
}

function getDate(date) {
  let year = document.getElementById(date + "-year").value;
  let month = document.getElementById(date + "-month").value;
  let day = document.getElementById(date + "-day").value;
  return (year + "-" + month + "-" + day);
}

function addStartDate(name, startDate) { //index 3
  if (store[name]["startDate"] === undefined) {
    return;
  }

  store[name]["startDate"] = startDate;
}

function addEndDate(name, endDate) { //index 4
  if (store[name]["endDate"] === undefined) {
    return;
  }

  //If the endDate is <= the startDate, prompt for a new endDate
  store[name]["endDate"] = endDate;
}

function editDescription(name, description) {
  let div = document.getElementById("task-description-output");
  //alert("added desc");
  store[name]["description"] = description;
  return;

  //suggest a description


  //
  //store[name]["description"] = description;
}

function editStartDate(name, startDate) {
  console.log("start date " + startDate)
  store[name]["startDate"] = startDate;
}

function editEndDate(name, endDate) {
  store[name]["endDate"] = endDate;
}

function deleteTask() {
  if (document.getElementById("task-name-show").innerHTML != "") {
    removeName(document.getElementById("task-name-show").innerHTML);

  }
}

function removeName(name) {
  for (let i in store[name]) {
    //store[name].pop(i);
    //delete store[name].i;
    delete (store[name][i]);
    //store[name].delete(i);
  }
  //store.delete(name);
  //delete store.name;
  delete (store[name]);
  sortBy();

  //need to fix


  //
}

function sortBy() {

  let b = document.getElementById("task-list");
  let lastElement = b.lastElementChild;

  while (lastElement && lastElement != b.firstElementChild) {
    b.removeChild(lastElement);
    lastElement = b.lastElementChild;
  }

  switch (changeVal) {
    case "priority":
      for (let name of sortByFront()) {
        console.log(name);
        addTaskList(name);
      }

      break;
    case "back-priority":
      for (let name of sortByBack()) {
        console.log(name);
        addTaskList(name);
      }

      break;
  }
}

function addTaskList(name) {
  document.getElementById('task-list').innerHTML += ('<li>' + name + '</li>');
}

function showTask() {
  var listItems = document.querySelectorAll("ul li"); // this returns an array of each li
  const cb = document.querySelector('#view-only');
  listItems.forEach(function(item) {

    item.onclick = function(e) {
      console.log(this.innerText); // this returns clicked li's value

      //alert(document.getElementById("edit-task").hidden);
      if (cb.checked) {
        changeBar('show-task');
        document.getElementById("task-name-show").innerHTML = store[this.innerText]["name"];
        document.getElementById("task-description-show").innerHTML = store[this.innerText]["description"];
        document.getElementById("task-start-date-show").innerHTML = store[this.innerText]["startDate"];
        document.getElementById("task-end-date-show").innerHTML = store[this.innerText]["endDate"];
      }
      else if (document.getElementById("delete-task").hidden == false) {
        document.getElementById("task-name-show").innerHTML = store[this.innerText]["name"];
        document.getElementById("task-description-show").innerHTML = store[this.innerText]["description"];
        document.getElementById("task-start-date-show").innerHTML = store[this.innerText]["startDate"];
        document.getElementById("task-end-date-show").innerHTML = store[this.innerText]["endDate"];
      }


      else if (document.getElementById("edit-task").hidden == false) {
        //alert("edit");
        document.getElementById("task-name-edit").innerHTML = store[this.innerText]["name"];
        document.getElementById("task-description-edit").value = store[this.innerText]["description"];

        let startDate = store[this.innerText]["startDate"].split("-");

        for (let i = 0; i < 3; i++) {
          if (startDate[i] == undefined) {
            startDate[i] = "";
          }
        }

        document.getElementById("task-start-date-edit-year").value = startDate[0];
        document.getElementById("task-start-date-edit-month").value = startDate[1];
        document.getElementById("task-start-date-edit-day").value = startDate[2];

        let endDate = store[this.innerText]["endDate"].split("-");

        document.getElementById("task-end-date-edit-year").value = endDate[0];
        document.getElementById("task-end-date-edit-month").value = endDate[1];
        document.getElementById("task-end-date-edit-day").value = endDate[2];
      }
    }


  });
}

let changeVal = "priority"

function flip() {
  /*
  let datetime1 = new Date().getTime();
  let datetime2 = datetime1+1000;// .1 second delay

  while(datetime1<datetime2) {
    datetime1 = new Date().getTime();
  }
  */
  //let select = document.getElementById("list-order");
  //console.log(select.value);
  if (changeVal == "priority") {
    //console.log("change to back");
    changeVal = "back-priority";
    document.getElementById("order-img").style.transform = "rotate(180deg)";
  }
  else {
    //console.log("change to front")
    changeVal = "priority";
    document.getElementById("order-img").style.transform = "rotate(0deg)";
  }
  let select = changeVal;
  //document.getElementById("list-order").value = changeVal;

  sortBy()
}

function sortByBack() {
  let arr = [];
  let arrName = [];
  for (let name in store) {
    arr.push(store[name]["endDate"]);
    arrName.push(name);
  }
  arr.sort();
  let arrNameReturn = [];

  for (let i = 0; i < arr.length; i++) {
    for (let x = 0; x < arrName.length; x++) {
      if (arr[i] == store[arrName[x]]["endDate"]) {
        arrNameReturn.push(arrName[x]);
        arrName.splice(x, 1);
      }
    }
  }

  arrNameReturn.reverse();
  return arrNameReturn;

}

function sortByFront() {
  let arr = [];
  let arrName = [];
  for (let name in store) {
    arr.push(store[name]["endDate"]);
    arrName.push(name);
  }
  arr.sort();
  let arrNameReturn = [];

  for (let i = 0; i < arr.length; i++) {
    for (let x = 0; x < arrName.length; x++) {
      if (arr[i] == store[arrName[x]]["endDate"]) {
        arrNameReturn.push(arrName[x]);
        arrName.splice(x, 1);
      }
    }
  }

  return arrNameReturn;

}

function changeBackground() {
  const backgroundInput = document.getElementById("background-input");
  const file = backgroundInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      // Set the background of the entire page.
      document.body.style.backgroundImage = `url(${e.target.result})`;
    };

    reader.readAsDataURL(file);
  }
}

function resetBackground() {
  document.body.style.backgroundImage = "none";
}




/*function addTime() {

}*/


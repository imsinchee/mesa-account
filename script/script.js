var config = {
  apiKey: "AIzaSyCXM3eVPdinynCUbU1RkGVq2V5LNzv6DpY",
  authDomain: "mainserver-c1560.firebaseapp.com",
  databaseURL: "https://mainserver-c1560.firebaseio.com",
  projectId: "mainserver-c1560",
  storageBucket: "mainserver-c1560.appspot.com",
  messagingSenderId: "107380399049",
  appId: "1:107380399049:web:0e2f8086f44986b940a618",
  measurementId: "G-SRTPSCM310",
};
var months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

var editor = "";
var year = "";
var month = "";
firebase.initializeApp(config);
var db = firebase.database();

function clearTable() {
  var table = document.getElementById("account-table");
  var tableRows = table.getElementsByTagName("tr");
  var rowCount = tableRows.length;

  for (var x = rowCount - 1; x > 0; x--) {
    table.deleteRow(x);
  }
}

function back() {
  clearTable();
  document.getElementById("login").style = "display: block";
  document.getElementById("account").style = "display: none";
}

//download as excel
function fnExcelReport() {
  var tab_text = "<table border='2px'><tr bgcolor='#87AFC6'>";
  var textRange;
  var j = 0;
  tab = document.getElementById("account-table");

  for (j = 0; j < tab.rows.length; j++) {
    tab_text = tab_text + tab.rows[j].innerHTML + "</tr>";
  }

  tab_text = tab_text + "</table>";

  var ua = window.navigator.userAgent;
  var msie = ua.indexOf("MSIE ");

  if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
    // If Internet Explorer
    txtArea1.document.open("txt/html", "replace");
    txtArea1.document.write(tab_text);
    txtArea1.document.close();
    txtArea1.focus();
    sa = txtArea1.document.execCommand(
      "SaveAs",
      true,
      "Say Thanks to Sumit.xls"
    );
  } //other browser not tested on IE 11
  else
    sa = window.open(
      "data:application/vnd.ms-excel," + encodeURIComponent(tab_text)
    );
  return sa;
}

console.log("ready");

function run() {
  var table = document.getElementById("account-table");
  document.getElementById("addNewUser").style = "display: none";
  // button to trigger to view account
  document.getElementById("next").onclick = function () {
    if (
      (document.getElementById("getUserName").value != "") &
      (document.getElementById("month").value != "notselected")
    ) {
      var pass = document.getElementById("password").value;
      editor = document.getElementById("getUserName").value;
      var auth = db.ref("USER/" + editor);
      auth.once("value", function (snapshot) {
        if (!snapshot.exists()) {
          alert("User not found");
        } else {
          var key = snapshot.val();
          if (pass != key.split(":")[0]) {
            alert("Incorrect Password");
          } else {
            editor = key.split(":")[1];
            month = document.getElementById("month").value;
            year = document.getElementById("getYear").value;
            document.getElementById("login").style = "display: none";
            document.getElementById("account").style = "display: block";
            console.log(month);
            getDataFromFirebase();
          }
        }
        document.getElementById("getUserName").value = "";
        document.getElementById("month").value = "";
        document.getElementById("getYear").value = "notselected";
        document.getElementById("password").value = "";
      });
    } else if (document.getElementById("getUserName").value == "") {
      alert("Please Enter Your Name");
    } else {
      alert("Please Enter the Month");
    }
  };

  //register new user
  document.getElementById("addUser").onclick = function () {
    document.getElementById("login").style = "display: none";
    document.getElementById("account").style = "display: none";
    document.getElementById("addNewUser").style = "display: block";
  };

  document.getElementById("registerNewUser").onclick = function () {
    var auth = false;
    var newName = document.getElementById("getNewName").value;
    var newUserName = document.getElementById("getNewUsername").value;
    var newPassword = document.getElementById("getNewPassword").value;
    var masterPassword = document.getElementById("masterPassword").value;
    var masterUsername = document.getElementById("masterUsername").value;
    var readMaster = db.ref("USER/" + masterUsername);
    readMaster
      .once("value", function (snapshot) {
        var get = snapshot.val();
        var pass = get.split(":")[0];
        if (pass == masterPassword) {
          auth = true;
        } else {
          alert("Wrong Master Authentication");
        }
      })
      .then(() => {
        if (auth) {
          var registerNew = db.ref("USER/" + newUserName);
          var data = newPassword + ":" + newName;
          registerNew.set(data);
        } else {
          return;
        }
      })
      .then(() => {
        alert(newName + " added to database");
        document.getElementById("getNewName").value = "";
        document.getElementById("getNewUsername").value = "";
        document.getElementById("getNewPassword").value = "";
        document.getElementById("masterPassword").value = "";
        document.getElementById("masterUsername").value = "";
        document.getElementById("login").style = "display: block";
        document.getElementById("account").style = "display: none";
        document.getElementById("addNewUser").style = "display: none";
      });
  };

  document.getElementById("back").onclick = function () {
    document.getElementById("login").style = "display: block";
    document.getElementById("account").style = "display: none";
    document.getElementById("addNewUser").style = "display: none";
  };

  //get data from firebase
  function getDataFromFirebase() {
    var temMonth = month;
    var endingBalance = 0;
    if (temMonth.includes("0")) {
      temMonth = temMonth.substring(1);
    }
    var d = new Date(year, temMonth, 0);
    document.getElementById("current-month").innerHTML =
      months[temMonth - 1] + " " + year;

    // edit forst row for begining balance
    var firstRow = table.insertRow(1);
    var firstDATE = firstRow.insertCell(0);
    var firstDESCRIPTION = firstRow.insertCell(1);
    var firstDEBIT = firstRow.insertCell(2);
    var firstCREDIT = firstRow.insertCell(3);
    var getBeginingBalance = db.ref(
      "ACCOUNT/BEGINING-BALANCE/" + months[temMonth - 1]
    );
    console.log("ACCOUNT/BEGINING-BALANCE/" + months[temMonth - 1]);
    getBeginingBalance.once("value", function (snapshot) {
      console.log(snapshot.val());
      firstDATE.innerHTML = year + "-" + month + "-01";
      firstDESCRIPTION.innerHTML = "Begining Balance";
      var beginingBalance = snapshot.val();
      if (beginingBalance.toString().includes("-")) {
        console.log("in if");
        beginingBalance = beginingBalance.substring(1);
        firstCREDIT.innerHTML = beginingBalance;
        firstDEBIT.innerHTML = "";
      } else {
        console.log("in else");
        firstDEBIT.innerHTML = beginingBalance;
        firstCREDIT.innerHTML = "";
      }
      console.log(snapshot.val());
      endingBalance = endingBalance + parseFloat(snapshot.val());
    });

    //edit every row afterwards
    var getAccount = db.ref("ACCOUNT/" + year + "-" + month);
    getAccount.once("value", function (snapshot) {
      var data = snapshot.val();
      var dataList = data.split(":");
      dataList = dataList.splice(1, dataList.length).sort();

      for (var i = 0; i < dataList.length; i++) {
        var datas = dataList[i].split("?");
        var date = datas[0];
        var description = datas[1];
        var amount = datas[2];
        console.log("from getDataFromFirebase: ");
        console.log(amount);
        endingBalance = parseFloat(endingBalance) + parseFloat(amount);
        var row = table.insertRow(i + 2);
        var DATE = row.insertCell(0);
        var DESCRIPTION = row.insertCell(1);
        var DEBIT = row.insertCell(2);
        var CREDIT = row.insertCell(3);
        if (amount.includes("-")) {
          DATE.innerHTML = date;
          DESCRIPTION.innerHTML = description;
          amount = amount.substring(1);
          CREDIT.innerHTML = amount;
          DEBIT.innerHTML = "";
        } else {
          DATE.innerHTML = date;
          DESCRIPTION.innerHTML = description;
          DEBIT.innerHTML = amount;
          CREDIT.innerHTML = "";
        }
      }
      var row = table.insertRow(dataList.length + 2);
      var DATE = row.insertCell(0);
      var DESCRIPTION = row.insertCell(1);
      var DEBIT = row.insertCell(2);
      var CREDIT = row.insertCell(3);
      d = d.toString().split(" ");
      day = d[2];
      DATE.innerHTML = year + "-" + month + "-" + day;
      DESCRIPTION.innerHTML = "Ending Balance";
      if (endingBalance > 0) {
        DEBIT.innerHTML = endingBalance;
        CREDIT.innerHTML = "";
      } else {
        DEBIT.innerHTML = "";
        CREDIT.innerHTML = endingBalance;
      }
      var beginingBalanceWrite = db.ref(
        "ACCOUNT/BEGINING-BALANCE/" + months[temMonth%12]
      );
      beginingBalanceWrite.set(endingBalance);
    });
  }

  document.getElementById("writeToFirebase").onclick = function () {
    var date = document.getElementById("dateWrite").value;
    var description = document.getElementById("descriptionWrite").value;
    var amount = document.getElementById("amountWrite").value;
    var data = ":" + date + "?" + description + "?" + amount;
    if (date == "") {
      alert("Enter date");
      document.getElementById("dateWrite").value = "";
      document.getElementById("descriptionWrite").value = "";
      document.getElementById("amountWrite").value = "";
      return;
    }
    if (description == "") {
      alert("Enter Description");
      document.getElementById("dateWrite").value = "";
      document.getElementById("descriptionWrite").value = "";
      document.getElementById("amountWrite").value = "";
      return;
    }
    if (isNaN(amount) || amount == "") {
      alert("Enter a valid amount");
      document.getElementById("dateWrite").value = "";
      document.getElementById("descriptionWrite").value = "";
      document.getElementById("amountWrite").value = "";
      return;
    }
    console.log(data);
    var currentMonth = date.split("-");
    currentMonth = currentMonth[0] + "-" + currentMonth[1];
    var cMonth = db.ref("ACCOUNT/" + currentMonth);
    cMonth.once("value", function (snapshot) {
      if (snapshot.exists()) {
        var previousData = snapshot.val();
        data = previousData + data;
        cMonth.set(data);
      } else {
        cMonth.set(data);
      }
    });
    document.getElementById("dateWrite").value = "";
    document.getElementById("descriptionWrite").value = "";
    document.getElementById("amountWrite").value = "";
    clearTable();
    sleep(1000).then(() => {
      getDataFromFirebase();
    });
  };

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  //delete data
  document.getElementById("deleteFirebase").onclick = function () {
    var getAccount = db.ref("ACCOUNT/" + year + "-" + month);
    var desDelete = document.getElementById("descriptionWrite").value;
    var date = [];
    var description = [];
    var amount = [];
    getAccount
      .once("value", function (snapshot) {
        var data = snapshot.val().split(":");
        data = data.splice(1, data.length).sort();
        for (var i = 0; i < data.length; i++) {
          var datas = data[i].split("?");
          date.push(datas[0]);
          description.push(datas[1]);
          amount.push(datas[2]);
        }
      })
      .then(() => {
        const toFind = (element) => element == desDelete;
        var position = description.findIndex(toFind);
        if (position == -1) {
          alert("Not Found");
          return;
        }
        date.pop(position);
        description.pop(position);
        amount.pop(position);
        var data = "";
        for (i = 0; i < date.length; i++) {
          data = data + ":" + date[i] + "?" + description[i] + "?" + amount[i];
        }
        document.getElementById("descriptionWrite").value = "";
        getAccount.set(data);
        clearTable();
        sleep(1000).then(() => {
          getDataFromFirebase();
        });
      });
  };
}

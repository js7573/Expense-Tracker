let app;
let db;
let auth;
let signedInUser = null;

document.addEventListener('DOMContentLoaded', function() {

    const loadEl = document.querySelector('#load');

    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
    // // The Firebase SDK is initialized and available here!
    //
    firebase.auth().onAuthStateChanged(user => { 
      if (user) {
        signedInUser = user;
      } else {
        signedInUser = null;
      }
      checkIfSignedIn();
    });
    // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
    // firebase.firestore().doc('/foo/bar').get().then(() => { });
    // firebase.functions().httpsCallable('yourFunction')().then(() => { });
    // firebase.messaging().requestPermission().then(() => { });
    // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
    // firebase.analytics(); // call to activate
    // firebase.analytics().logEvent('tutorial_completed');
    // firebase.performance(); // call to activate
    //
    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

    try {
      app = firebase.app();
      db = firebase.firestore();
      auth = firebase.auth();
    } 
    
    catch (e) {
      console.error(e);
      loadEl.textContent = 'Error loading the Firebase SDK, check the console.';
    }

});

async function addUser(){
  let firstName = document.getElementById("exampleFirstName").value;
  let lastName = document.getElementById("exampleLastName").value;
  let email = document.getElementById("exampleInputEmail").value;
  let password = document.getElementById("exampleInputPassword").value;
  let repeatPassword = document.getElementById("exampleRepeatPassword").value

  if(password === repeatPassword){
    const userData = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Password: password
    };

  let usersRef = db.collection("Users");

    // Add user to firebase authentication to allow login
    auth.createUserWithEmailAndPassword(email, password).then(credentials => {
      alert("User created:\n" + credentials.user.email);
    }).catch(error => {
      let er = document.getElementById("err");
      if(error.code === "auth/email-already-in-use" || error.code === "auth/invalid-email"){
        er.innerHTML = "Invalid email."
      }
      else if (error.code === "auth/weak-password"){
        er.innerHTML = "Weak password."
      }
      else{
        er.innerHTML = "Oops something went wrong. Please try again later."
      }
    });
    
    // Add a new document in collection "users" with email as ID
    let res = await db.collection('Users').doc(email).set(userData);

    categoryData = {
      Name: "Rent",
      Color: "#ff0000",
      Budget: null,
      Description: "",
      UserID: email,
    };

    res = await db.collection('Categories').doc().set(categoryData);

    categoryData = {
      Name: "Shopping",
      Color: "#ffff00",
      Budget: null,
      Description: "",
      UserID: email,
    };

    res = await db.collection('Categories').doc().set(categoryData);

    categoryData = {
      Name: "Subscriptions",
      Color: "#00ff00",
      Budget: null,
      Description: "",
      UserID: email,
    };

    res = await db.collection('Categories').doc().set(categoryData);

    categoryData = {
      Name: "Traffic",
      Color: "#0000ff",
      Budget: null,
      Description: "",
      UserID: email,
    };

    res = await db.collection('Categories').doc().set(categoryData);

    categoryData = {
      Name: "Vacation",
      Color: "#ff00ee",
      Budget: null,
      Description: "",
      UserID: email,
    };

    res = await db.collection('Categories').doc().set(categoryData);

    window.location.replace("/index.html");
  }
  else{
    document.getElementById("err").innerHTML = "Repeat password and password do not match."
  }
  
}

async function signIn(){
  console.log("signing");
  let email = document.getElementById("exampleInputEmail").value;
  let password = document.getElementById("exampleInputPassword").value;
  auth.signInWithEmailAndPassword(email, password).then(credentials => {
  // Signed in 
  user = credentials.user;
  window.location.replace("/dashboard.html");
  }).catch((error) => {
    let er = document.getElementById("err");
    console.log(error.code);
    if(error.code === "auth/wrong-password"){
      er.innerHTML = "Wrong password.";
    }
    else if(error.code === "auth/invalid-email" || error.code === "auth/user-disabled" || error.code === "auth/user-not-found"){
      er.innerHTML = "Wrong email.";
    }
    else{
      er.innerHTML = "Oops something went wrong. Please try again later."
    }
    //er.innerHTML = "The email address or password is incorrect.";
  });
}

async function signOut(){
  auth.signOut();
  window.location.replace("/index.html");
}

async function checkIfSignedIn(){
  if(signedInUser){
    let email = signedInUser.email;
    let user = db.collection('Users').doc(email);

    user.get().then(doc => {
      const data = doc.data();
      let firstName = data.FirstName;
      let lastName = data.LastName;
      let email = data.Email;
      let balance = data.Balance;
      document.getElementsByClassName("mr-2 d-none d-lg-inline text-gray-600 small")[0].textContent = firstName + " " + lastName;

      let currentSite = window.location.href.split("/");
      currentSite = currentSite[currentSite.length - 1];
      args = currentSite.split("?")[1];
      currentSite = currentSite.split("?")[0];
      switch(currentSite){
        case "dashboard.html":
          dashboardCode(balance);
          break;
        case "add-expense.html":
          addExpenseCode();
          break;
        case "expenses-overview.html":
          expensesOverviewCode();
          break;
        case "manage-categories.html":
          manageCategoriesCode();
          break;
        case "edit-category.html":
          editCategoryCode(args);
          break;
        case "analysis.html":
          generateBarChart();
          generatePieChart();
          break;
      }
    }); 
  }
  else{
    let currentFile = window.location.href.split("/").slice(-1)[0];
    if(currentFile !== "index.html" && currentFile !== "register.html" && currentFile !== "404.html")
      window.location.replace("/index.html");
  }
}

async function dashboardCode(){
  // Populate expenses table (show last 5 expenses by date)
  const expensesRef = db.collection('Expenses');

  let expenses = await expensesRef.where('UserID', '==', signedInUser.email).orderBy('Date', 'desc').limit(5).get();
  let allExpenses = await expensesRef.where('UserID', '==', signedInUser.email).get();

  let budgetsRef = db.collection('Budgets');
  let budgets = await budgetsRef.where('UserID', '==', signedInUser.email).get();

  let categoriesRef = db.collection('Categories');
  let categories = await categoriesRef.where('UserID', '==', signedInUser.email).get();

  let month = new Date().getMonth() + 1 + "";
  let expensesThisMonth = 0;

  let tableColors = [];

  $(document).ready(function() {
      let table = $('#dataTableDashboard').DataTable({searching: false, paging: false, info: false, order: [[ 2, "desc" ]]});
      let totalSpentByCategories = {};

      expenses.forEach(expense => {
        expenseData = expense.data();
        let categoryName = "";
        let categoryColor = "";
        
        categories.forEach(category => {
          if(expenseData.CategoryID === category.id){
            categoryName = category.data().Name;
            categoryColor = category.data().Color;
            tableColors.push(categoryColor);

            if(!totalSpentByCategories[category.id])
              totalSpentByCategories[category.id] = 0;

            totalSpentByCategories[category.id] += parseFloat(expenseData.Amount);
          }
        });

        let dateValues = expenseData.Date.split("-");

        table.row.add([
          expenseData.Name,
          expenseData.Amount + " €",
          dateValues[2] + "." + dateValues[1] + "." + dateValues[0],
          categoryName,
          expenseData.Description
        ]).draw().node();
      });

      let i = 0;
      table.rows().every(function(rowIdx, tableLoop, rowLoop){
        var node = this.node();
        node.childNodes[0].style.borderLeft = "5px solid " + tableColors[i];
        i++;
      })

      // Show money spent this month
      allExpenses.forEach(expense => {
        expenseData = expense.data();
        let expenseMonth = expenseData.Date.split("-")[1];
        if(expenseMonth === month)
          expensesThisMonth += parseFloat(expenseData.Amount);
      });
      const date = new Date(); 
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      document.getElementsByClassName("total-amount-spent")[0].innerHTML = "<h3 style=\"margin:0 auto;\">Total amount spent in " + monthNames[date.getMonth()] + " " + date.getFullYear() +"</h3><br/><h1 style=\"margin-left:3.75em;\">" + expensesThisMonth.toFixed(2) + " €</h1>";

      //Show percentages of defined budgets
      budgets.forEach(budget => {

        let budgetData = budget.data();

        if(budgetData.Budget !== ""){
          let budgetSpent = 0;

        let categoryColor = null;
        let categoryName = null;

        categories.forEach(category => {
          categoryData = category.data();
          if(budgetData.CategoryID === category.id){
            categoryColor = categoryData.Color;
            if(categoryData.Name)
              categoryName = categoryData.Name;
            else
              categoryName = category.id;
          }
        });

        allExpenses.forEach(expense => {
          expenseData = expense.data();
          if(expenseData.CategoryID === budgetData.CategoryID && budgetData.Budget !== "")
            budgetSpent += parseFloat(expenseData.Amount);
        });

        let percentage = 0;

        if(budgetSpent > 0){
          percentage = (budgetSpent * 100) / budgetData.Budget;
          percentage = percentage.toFixed(2);
        }

        let budgetCard = '' +
        '<div class="col-xl-3 col-md-6 mb-4">'+
            '<div class="card border-left-info shadow h-100 py-2" style="border-left:.25rem solid ' + categoryColor + '!important;>'+
                '<div class="card-body" style="background:' + categoryData.Color + ';>'+
                    '<div class="row no-gutters align-items-center">'+
                        '<div class="col mr-2">'+
                            '<div style="color:' + categoryColor + '!important;"class="text-xs font-weight-bold text-info text-uppercase mb-1">' + categoryName + '</div>'+
                            '<div class="row no-gutters align-items-center">'+
                                '<div class="col-auto">'+
                                    '<div class="h5 mb-0 mr-3 font-weight-bold text-gray-800">' + percentage + ' %</div>'+
                                '</div>'+
                                '<div class="col">'+
                                    '<div class="progress progress-sm mr-2">'+
                                        '<div class="progress-bar bg-info" role="progressbar"'+
                                            'style="width: '+ percentage + '%;background: ' + categoryColor + '!important;"  aria-valuenow="'+ percentage +'" aria-valuemin="0"'+
                                            'aria-valuemax="100"></div>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                        '<div class="col-auto">'+
                            '<i class="fas fa-clipboard-list fa-2x text-gray-300"></i>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>';
        document.getElementById("dashboardBudgets").innerHTML += budgetCard;
        }

        generateBarChartDashboard(totalSpentByCategories);
      });
  });
}

async function addExpenseCode(){
  listCategories();
}

async function expensesOverviewCode(){
  const expensesRef = db.collection('Expenses');
  const categoriesRef = db.collection('Categories');

  let expenses = await expensesRef.where('UserID', '==', signedInUser.email).orderBy('Date', 'desc').get();
  let categories = await categoriesRef.where('UserID', '==', signedInUser.email).get();

  let tableColors = [];
  $(document).ready(function() {
      let table = $('#dataTableOverview').DataTable({order: [[ 2, "desc" ]]});
      
      expenses.forEach(expense => {
        expenseData = expense.data();

        let categoryName = "";
        categories.forEach(category => {
          if(expenseData.CategoryID === category.id){
            categoryName = category.data().Name;
            categoryColor = category.data().Color;
            tableColors.push(categoryColor);
          }
        });

        let dateValues = expenseData.Date.split("-");

        table.row.add([
          expenseData.Name,
          expenseData.Amount + "€",
          dateValues[2] + "." + dateValues[1] + "." + dateValues[0],
          categoryName,
          expenseData.Description
        ]).draw(false);
      });

      let i = 0;
      table.rows().every(function(rowIdx, tableLoop, rowLoop){
        var node = this.node();
        node.childNodes[0].style.borderLeft = "5px solid " + tableColors[i];
        i++;
      })
  });
}

async function manageCategoriesCode(){
  showCategories();
}

async function editCategoryCode(categoryID){
  categoryID = categoryID.split("=")[1];
  let category = await db.collection('Categories').doc(categoryID).get();
  document.getElementById("editCategoryColor").value = category.data().Color;
  document.getElementById("editCategoryName").value = category.data().Name;
  document.getElementById("editCategoryBudget").value = category.data().Budget;
  document.getElementById("editCategoryDescription").value = category.data().Description;
  let a = 5;
}

async function addExpense(){
  let expenseName = document.getElementById("expenseName").value;
  let expenseAmount = document.getElementById("expenseAmount").value;
  let expenseDate = document.getElementById("expenseDate").value;
  let expenseCategory = document.getElementById("expenseCategories").value;
  let expenseDescription = document.getElementById("expenseDescription").value;
  const expenseData = {
    Name: expenseName,
    Amount: expenseAmount,
    Date: expenseDate,
    CategoryID: expenseCategory,
    Description: expenseDescription,
    UserID: signedInUser.email,
  };

  document.getElementById("expenseName").value = "";
  document.getElementById("expenseAmount").value = "";
  document.getElementById("expenseDate").value = "";
  document.getElementById("expenseCategories").value = "";
  document.getElementById("expenseDescription").value = "";

  const categoriesRef = db.collection('Categories');
  const customCategories = await categoriesRef.where('Name', '==', expenseCategory).get();

  categoryId = null;
  customCategories.forEach(category => {
    categoryId = category.id;
    expenseData.CategoryID = categoryId;
  });

  const res = await db.collection('Expenses').doc().set(expenseData);
}

async function addCategory(){
  let categoryColor = document.getElementById("categoryColor").value;
  let categoryName = document.getElementById("categoryName").value;
  let categoryDescription = document.getElementById("categoryDescription").value;
  let categoryBudget = document.getElementById("categoryBudget").value;

  const categoryData = {
    Name: categoryName,
    Color: categoryColor,
    Budget: categoryBudget,
    Description: categoryDescription,
    UserID: signedInUser.email,
  };

  document.getElementById("categoryColor").value = "";
  document.getElementById("categoryName").value = "";
  document.getElementById("categoryDescription").value = "";
  document.getElementById("categoryBudget").value = "";

  const res = await db.collection('Categories').doc().set(categoryData);
}

function editCategory(categoryId){
  window.location.replace("/edit-category.html?categoryId=" + categoryId);
}

async function updateCategory(){
  let currentSite = window.location.href.split("/");
  currentSite = currentSite[currentSite.length - 1];
  args = currentSite.split("?")[1];
  currentSite = currentSite.split("?")[0];
  categoryID = args.split("=")[1];

  let categoryColor = document.getElementById("editCategoryColor").value;
  let categoryName = document.getElementById("editCategoryName").value;
  let categoryDescription = document.getElementById("editCategoryDescription").value;
  let categoryBudget = document.getElementById("editCategoryBudget").value;

  const categoryData = {
    Name: categoryName,
    Color: categoryColor,
    Budget: categoryBudget,
    Description: categoryDescription,
    UserID: signedInUser.email,
  };

  document.getElementById("editCategoryColor").value = "";
  document.getElementById("editCategoryName").value = "";
  document.getElementById("editCategoryDescription").value = "";
  document.getElementById("editCategoryBudget").value = "";

  const res = await db.collection('Categories').doc(categoryID).set(categoryData);
}

async function deleteCategory(){
  let currentSite = window.location.href.split("/");
  currentSite = currentSite[currentSite.length - 1];
  args = currentSite.split("?")[1];
  currentSite = currentSite.split("?")[0];
  categoryID = args.split("=")[1];

  const res = await db.collection('Categories').doc(categoryID).delete();

  document.getElementById("editCategoryColor").value = "";
  document.getElementById("editCategoryName").value = "";
  document.getElementById("editCategoryDescription").value = "";
  document.getElementById("editCategoryBudget").value = "";

  window.location.replace("/manage-categories.html");
}

// Show correct categories in dropdown menus
async function listCategories(){
  let select = document.getElementById("expenseCategories");
  let options = [];

  const categoriesRef = db.collection('Categories');

  const categories = await categoriesRef.where('UserID', '==', signedInUser.email).get();

  categories.forEach(category => {
    options.push(category.data().Name);
  });

  for(var i = 0; i < options.length; i++) {
    var opt = options[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
  }
}

// Show correct categories on categories & budgets page
async function showCategories(){
  let categoriesRef = db.collection('Categories');
  let budgetsRef = db.collection('Budgets');

  let budgets = await budgetsRef.where('UserID', '==', signedInUser.email).get();
  let categories = await categoriesRef.where('UserID', '==', signedInUser.email).get();

  let categoriesDiv = document.getElementById("allCategories"); 

  categories.forEach(category => {
    let categoryId = category.id;
    let categoryData = category.data();

    let budgetForCategory = "Not set";

    budgets.forEach(budget => {
      if(budget.data().CategoryID === categoryId && budget.data().Budget !== "")
        budgetForCategory = budget.data().Budget + "€";
    });

    let categoryDiv = 
      '<div class="col-md-6 mb-4">' +
          '<div class="card border-left-primary shadow h-100 py-2" style="border-left:.25rem solid ' + categoryData.Color + '!important;>' + 
              '<div class="card-body" style="background:' + categoryData.Color + ';>' + 
                  '<div class="row no-gutters align-items-center">' + 
                      '<div class="col mr-2">' +
                          '<div class="text-xs font-weight-bold text-primary text-uppercase mb-1">' + categoryData.Name +'</div>' +
                          '<div class="h5 mb-0 font-weight-bold text-gray-800">' + 
                            'Budget: <input type="text" onfocusout="saveBudget(this)" id="editBudget' + categoryId + '" class="editBudget" value="' + budgetForCategory + '" disabled>' + '</input>' +
                          '</div>' +
                      '</div>' +
                      '<div class="col-auto">' +
                          '<button class="btn btn-primary" value="' + categoryId + '"onclick="editCategory(this.value)">Edit category</button>' +
                          '<button class="btn btn-primary" value="' + categoryId + '"onclick="editBudget(this, this.value)">Edit budget</button>' +
                      '</div>' +
                  '</div>'+
              '</div>'+
          '</div>'+
      '</div>';
    categoriesDiv.innerHTML += categoryDiv;
  });
}

function editBudget(button, categoryId){
  button.style.background = "green";
  button.style.border = "none";
  button.innerHTML = "Confirm budget";
  let budgetInput = document.getElementById("editBudget" + categoryId);
  budgetInput.value = "";
  budgetInput.placeholder = "Enter new budget";
  budgetInput.disabled = false;
  budgetInput.focus();
}

async function saveBudget(input){
  let newBudgetValue = input.value;
  let selectedBudgetId = input.id.substring(10);
  input.disabled = true;
  let budgetsRef = db.collection('Budgets');
  let budgets = await budgetsRef.where('UserID', '==', signedInUser.email).get();
  let budgetID = null;

  budgets.forEach(budget => {
    if(budget.data().CategoryID === selectedBudgetId)
      budgetID = budget.id;
  });

  if(budgetID == null){
    const budgetData = {
      Budget: newBudgetValue,
      CategoryID: selectedBudgetId,
      UserID: signedInUser.email,
    };
    const addBudget = await db.collection('Budgets').doc().set(budgetData);
  }

  else{
    const correctBudgetRef = db.collection('Budgets').doc(budgetID);
    // Set the 'capital' field of the city
    const updateBudget = await correctBudgetRef.update({Budget: newBudgetValue});
  }

  location.reload();
}

async function generateBarChartDashboard(totalSpentByCategories){
  // Set new default font family and font color to mimic Bootstrap's default styling
  Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  Chart.defaults.global.defaultFontColor = '#858796';

  function number_format(number, decimals, dec_point, thousands_sep) {
    // *     example: number_format(1234.56, 2, ',', ' ');
    // *     return: '1 234,56'
    number = (number + '').replace(',', '').replace(' ', '');
    var n = !isFinite(+number) ? 0 : +number,
      prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
      sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
      dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
      s = '',
      toFixedFix = function(n, prec) {
        var k = Math.pow(10, prec);
        return '' + Math.round(n * k) / k;
      };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
      s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
      s[1] = s[1] || '';
      s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
  }

  let labels = [];
  let colors = [];
  let totalSpent = [];

  let categoriesRef = db.collection('Categories');
  let categories = await categoriesRef.where('UserID', '==', signedInUser.email).get();

  let maxAmount = 0;

  categories.forEach(category => {
    labels.push(category.data().Name);
    colors.push(category.data().Color);
    totalSpent.push(totalSpentByCategories[category.id]);
    if(totalSpentByCategories[category.id] > maxAmount)
      maxAmount = totalSpentByCategories[category.id];
  });

  // Bar Chart Example
  var ctx = document.getElementById("myBarChart");
  var myBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: "Amount spent",
        backgroundColor: colors,
        hoverBackgroundColor: "gray",
        borderColor: "#black",
        data: totalSpent,
      }],
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0
        }
      },
      scales: {
        xAxes: [{
          time: {
            unit: 'month'
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 6
          },
          maxBarThickness: 25,
        }],
        yAxes: [{
          ticks: {
            min: 0,
            max: maxAmount,
            maxTicksLimit: 5,
            padding: 10,
            // Include a dollar sign in the ticks
            callback: function(value, index, values) {
              return number_format(value) + ' €';
            }
          },
          gridLines: {
            color: "rgb(234, 236, 244)",
            zeroLineColor: "rgb(234, 236, 244)",
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2]
          }
        }],
      },
      legend: {
        display: false
      },
      tooltips: {
        titleMarginBottom: 10,
        titleFontColor: '#6e707e',
        titleFontSize: 14,
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
        callbacks: {
          label: function(tooltipItem, chart) {
            var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
            return datasetLabel + ': ' + number_format(tooltipItem.yLabel) + "€";
          }
        }
      },
    }
  });

}

async function generateBarChart(){
  // Set new default font family and font color to mimic Bootstrap's default styling
  Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  Chart.defaults.global.defaultFontColor = '#858796';

  function number_format(number, decimals, dec_point, thousands_sep) {
    // *     example: number_format(1234.56, 2, ',', ' ');
    // *     return: '1 234,56'
    number = (number + '').replace(',', '').replace(' ', '');
    var n = !isFinite(+number) ? 0 : +number,
      prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
      sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
      dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
      s = '',
      toFixedFix = function(n, prec) {
        var k = Math.pow(10, prec);
        return '' + Math.round(n * k) / k;
      };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
      s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
      s[1] = s[1] || '';
      s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
  }

  let expensesRef = db.collection('Expenses');
  let expenses = await expensesRef.where('UserID', '==', signedInUser.email).get();

  let categoriesRef = db.collection('Categories');
  let categories = await categoriesRef.where('UserID', '==', signedInUser.email).get();

  let totalSpentByCategories = {};

  expenses.forEach(expense => {
    expenseData = expense.data();
    let categoryName = "";
    let categoryColor = "";
    
    categories.forEach(category => {
      if(expenseData.CategoryID === category.id){

        if(!totalSpentByCategories[category.id])
          totalSpentByCategories[category.id] = 0;

        totalSpentByCategories[category.id] += parseFloat(expenseData.Amount);
      }
    });
  });

  let labels = [];
  let colors = [];
  let totalSpent = [];

  let maxAmount = 0;

  categories.forEach(category => {
    labels.push(category.data().Name);
    colors.push(category.data().Color);
    totalSpent.push(totalSpentByCategories[category.id]);
    if(totalSpentByCategories[category.id] > maxAmount)
      maxAmount = totalSpentByCategories[category.id];
  });

  // Bar Chart Example
  var ctx = document.getElementById("myBarChart");
  var myBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: "Amount spent",
        backgroundColor: colors,
        hoverBackgroundColor: "gray",
        borderColor: "#black",
        data: totalSpent,
      }],
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0
        }
      },
      scales: {
        xAxes: [{
          time: {
            unit: 'month'
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 6
          },
          maxBarThickness: 25,
        }],
        yAxes: [{
          ticks: {
            min: 0,
            max: maxAmount,
            maxTicksLimit: 5,
            padding: 10,
            // Include a dollar sign in the ticks
            callback: function(value, index, values) {
              return number_format(value) + ' €';
            }
          },
          gridLines: {
            color: "rgb(234, 236, 244)",
            zeroLineColor: "rgb(234, 236, 244)",
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2]
          }
        }],
      },
      legend: {
        display: false
      },
      tooltips: {
        titleMarginBottom: 10,
        titleFontColor: '#6e707e',
        titleFontSize: 14,
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
        callbacks: {
          label: function(tooltipItem, chart) {
            var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
            return datasetLabel + ': ' + number_format(tooltipItem.yLabel) + "€";
          }
        }
      },
    }
  });

}

async function generatePieChart(){
  // Set new default font family and font color to mimic Bootstrap's default styling
  Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  Chart.defaults.global.defaultFontColor = '#858796';

  // Pie Chart Example
  var ctx = document.getElementById("myPieChart");

  let expensesRef = db.collection('Expenses');
  let expenses = await expensesRef.where('UserID', '==', signedInUser.email).get();

  let categoriesRef = db.collection('Categories');
  let categories = await categoriesRef.where('UserID', '==', signedInUser.email).get();

  let totalSpentByCategories = {};

  expenses.forEach(expense => {
    expenseData = expense.data();
    let categoryName = "";
    let categoryColor = "";
    
    categories.forEach(category => {
      if(expenseData.CategoryID === category.id){

        if(!totalSpentByCategories[category.id])
          totalSpentByCategories[category.id] = 0;

        totalSpentByCategories[category.id] += parseFloat(expenseData.Amount);
      }
    });
  });

  let labels = [];
  let colors = [];
  let totalSpent = [];

  categories.forEach(category => {
    labels.push(category.data().Name);
    colors.push(category.data().Color);
    totalSpent.push(totalSpentByCategories[category.id]);
  });

  var myPieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: totalSpent,
        backgroundColor: colors,
        hoverBorderColor: "rgba(234, 236, 244, 1)",
      }],
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
      },
      legend: {
        display: true
      },
      cutoutPercentage: 80,
    },
  });
}
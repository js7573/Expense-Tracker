let app;
let db;
let auth;
let signedInUser = null;
let analysisBarChart;
let analysisBudgetsChart;
let analysisPieChart;

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
    let categoriesRef = db.collection("Categories");

    // Add user to firebase authentication to allow login
    auth.createUserWithEmailAndPassword(email, password).then(async function(credentials){
      document.getElementById("err").innerHTML = "";
      let res = await usersRef.doc(credentials.user.email).set({
          FirstName: document.getElementById("exampleFirstName").value,
          LastName: document.getElementById("exampleLastName").value,
          Email: credentials.user.email,
          Password: document.getElementById("exampleInputPassword").value
        })
        .catch(err => {
          alert(err);
          return;
        });

        document.getElementById("exampleFirstName").value = "";
        document.getElementById("exampleLastName").value = "";
        document.getElementById("exampleInputEmail").value = "";
        document.getElementById("exampleInputPassword").value = "";
        document.getElementById("exampleRepeatPassword").value = "";

        res = await categoriesRef.doc().set({
            Name: "Rent",
            Color: "#396dbf",
            Budget: null,
            Description: "",
            UserID: credentials.user.email,
        })
        .catch(err => {
          alert(err);
          return;
        });

        res = await categoriesRef.doc().set({
          Name: "Traffic",
          Color: "#a039bf",
          Budget: null,
          Description: "",
          UserID: credentials.user.email,
      })
      .catch(err => {
        alert(err);
        return;
      });

      res = await categoriesRef.doc().set({
        Name: "Vacation",
        Color: "#c92626",
        Budget: null,
        Description: "",
        UserID: credentials.user.email,
    })
    .catch(err => {
      alert(err);
      return;
    });

      res = await categoriesRef.doc().set({
        Name: "Shopping",
        Color: "#62ab27",
        Budget: null,
        Description: "",
        UserID: credentials.user.email,
    })
    .catch(err => {
      alert(err);
      return;
    });

    res = await categoriesRef.doc().set({
        Name: "Subscriptions",
        Color: "#c9c42a",
        Budget: null,
        Description: "",
        UserID: credentials.user.email,
    })
    .catch(err => {
      alert(err);
      return;
    });

    }).catch(err => {
      document.getElementById("err").innerHTML = "Email is badly formatted";
      document.getElementById("exampleFirstName").value = "";
      document.getElementById("exampleLastName").value = "";
      document.getElementById("exampleInputEmail").value = "";
      document.getElementById("exampleInputPassword").value = "";
      document.getElementById("exampleRepeatPassword").value = "";
      return;
    });
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
    if(user){
      user.get().then(doc => {
        const data = doc.data();
        if(data){
          let firstName = data.FirstName;
          let lastName = data.LastName;
          let email = data.Email;
          let balance = data.Balance;

          let displayName = document.getElementsByClassName("mr-2 d-none d-lg-inline text-gray-600 small")[0];
          if(displayName)
            displayName.textContent = firstName + " " + lastName;
    
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
            case "edit-expense.html":
              editExpenseCode(args);
              break;
            case "analysis.html":
              analysisCode();
              break;
          }
        }
      }); 
    }
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
  let allExpenses = await expensesRef.where('UserID', '==', signedInUser.email).orderBy('Date', 'desc').get();

  let budgetsRef = db.collection('Budgets');
  let budgets = await budgetsRef.where('UserID', '==', signedInUser.email).get();

  let categoriesRef = db.collection('Categories');
  let categories = await categoriesRef.where('UserID', '==', signedInUser.email).get();

  let month = new Date().getMonth() + 1 + "";
  let year = new Date().getFullYear();

  let expensesThisMonth = 0;

  let tableColors = [];

  $(document).ready(function() {
      let table = $('#dataTableDashboard').DataTable({searching: false, paging: false, info: false,
        "columnDefs": [
          {
            "targets": [ 2 ],
            "type": "date",
          }
      ], order: [[ 2, "desc" ]]
      });
      let totalSpentByCategories = {};

      let j = 0;
      allExpenses.forEach(expense => {
        expenseData = expense.data();
        let categoryName = "";
        let categoryColor = "";
        let expenseMonth = expenseData.Date.split("-")[1];
        let expenseYear = expenseData.Date.split("-")[0];

        categories.forEach(category => {
          if(expenseData.CategoryID === category.id){
            categoryName = category.data().Name;
            categoryColor = category.data().Color;
            tableColors.push(categoryColor);

            if(!totalSpentByCategories[category.id])
              totalSpentByCategories[category.id] = 0;

            if(parseInt(expenseMonth) === parseInt(month) && parseInt(expenseYear) === parseInt(year))
              totalSpentByCategories[category.id] += parseFloat(expenseData.Amount);
          }
        });

        if(categoryName === ""){
          categoryName = "No category";
          categoryColor = "#858796";
          tableColors.push(categoryColor);

          if(!totalSpentByCategories["No_category"])
            totalSpentByCategories["No_category"] = 0;

          if(parseInt(expenseMonth) === parseInt(month) && parseInt(expenseYear) === parseInt(year))
            totalSpentByCategories["No_category"] += parseFloat(expenseData.Amount);
        }

        let dateValues = expenseData.Date.split("-");

        if(j < 5){
          let node = table.row.add([
            expenseData.Name,
            expenseData.Amount + " €",
            dateValues[2] + "." + dateValues[1] + "." + dateValues[0],
            categoryName,
            expenseData.Description
          ]).draw().node();
          node.childNodes[0].style.borderLeft = "5px solid " + categoryColor;
        }
        j++;
      });

      // Show money spent this month
      allExpenses.forEach(expense => {
        expenseData = expense.data();
        expenseMonth = expenseData.Date.split("-")[1];
        expenseYear = expenseData.Date.split("-")[0];
        if(parseInt(expenseMonth) === parseInt(month) && parseInt(expenseYear) === parseInt(year))
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
          expenseMonth = expenseData.Date.split("-")[1]; 
          expenseYear = expenseData.Date.split("-")[0];
          if(expenseData.CategoryID === budgetData.CategoryID && budgetData.Budget !== "" && parseInt(expenseMonth) === parseInt(month) && parseInt(expenseYear) === parseInt(year)){
              budgetSpent += parseFloat(expenseData.Amount);
          }
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
      });
      generateBarChartDashboard(totalSpentByCategories);
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
      let table = $('#dataTableOverview').DataTable({
        "lengthMenu": [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]], 
        order: [[ 2, "desc" ]],
        "columnDefs": [
          { 
            "targets": -1, 
            "data": null, 
            "defaultContent": "<input id='btnEdit' id='expenseEdit' class='btn btn-primary' style='display:flex; width:60px; margin:0 auto;' value='Edit' />"
          },
          {
              "targets": [ 5 ],
              "visible": false,
              "searchable": false
          },
          {
            "targets": [ 2 ],
            "type": "date",
            "orderable": true
          }
      ]});
      
      expenses.forEach(expense => {
        expenseData = expense.data();

        let categoryName = "";
        let categoryColor = "";

        categories.forEach(category => {
          if(expenseData.CategoryID === category.id){
            categoryName = category.data().Name;
            categoryColor = category.data().Color;
            tableColors.push(categoryColor);
          }
        });

        let dateValues = expenseData.Date.split("-");

        let node = table.row.add([
          expenseData.Name,
          expenseData.Amount + "€",
          dateValues[2] + "." + dateValues[1] + "." + dateValues[0],
          categoryName,
          expenseData.Description,
          "",
          expense.id
        ]).draw().node();
        node.childNodes[0].style.borderLeft = "5px solid " + categoryColor;

        $('#dataTableOverview').on('click', '[id*=btnEdit]', function () {
          var data = table.row($(this).parents('tr')).data();
          var expenseID = data[6];
          window.location.replace("/edit-expense.html?expenseId=" + expenseID);
        });
      });
      
      //document.getElementById("dataTableOverview_length").innerHTML = '<label>Show <input type="number" name="dataTableOverview_length" aria-controls="dataTableOverview" class="custom-select custom-select-sm form-control form-control-sm"></input> entries</label>'
    
  });
 
}

async function editExpenseCode(expenseID){
  expenseID = expenseID.split("=")[1];

  let expense = await db.collection('Expenses').doc(expenseID).get();
  let category = await db.collection('Categories').doc(expense.data().CategoryID).get();

  let select = document.getElementById("editExpenseCategories");
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
    if(category.data().Name === opt)
      el.selected = true;
    select.appendChild(el);
  }

  document.getElementById("editExpenseName").value = expense.data().Name;
  document.getElementById("editExpenseAmount").value = expense.data().Amount;
  document.getElementById("editExpenseDate").value = expense.data().Date;
  document.getElementById("editExpenseDescription").value = expense.data().Description;
}

async function updateExpense(){
  let currentSite = window.location.href.split("/");
  currentSite = currentSite[currentSite.length - 1];
  args = currentSite.split("?")[1];
  currentSite = currentSite.split("?")[0];
  expenseID = args.split("=")[1];

  let expenseName = document.getElementById("editExpenseName").value;
  let expenseAmount = document.getElementById("editExpenseAmount").value;
  let expenseDate = document.getElementById("editExpenseDate").value;
  let expenseCategory = document.getElementById("editExpenseCategories").value;
  let expenseDescription = document.getElementById("editExpenseDescription").value;
  let err = document.getElementById("err");

  //check input
  if(!expenseName || expenseName.length === 0 ){
    err.innerHTML ="Missing expense name.";
    return;
  }
  if(isNaN(parseFloat(expenseAmount))){
    err.innerHTML ="Missing expense amount.";
    return;
  }
  if(!(new Date(expenseDate) !== "Invalid Date" && !isNaN(new Date(expenseDate)))){ 
    err.innerHTML ="Missing expense date.";
    return;
  }
  if(expenseCategory.length === 0){
    err.innerHTML ="Missing expense category.";
    return;
  }


  const expenseData = {
    Name: expenseName,
    Amount: expenseAmount,
    Date: expenseDate,
    CategoryID: expenseCategory,
    Description: expenseDescription,
    UserID: signedInUser.email,
  };

  document.getElementById("editExpenseName").value = "";
  document.getElementById("editExpenseAmount").value = "";
  document.getElementById("editExpenseDate").value = "";
  document.getElementById("editExpenseCategories").value = "";
  document.getElementById("editExpenseDescription").value = "";

  const categoriesRef = db.collection('Categories');
  const categories = await categoriesRef.where('UserID', '==', signedInUser.email).get();

  categoryId = null;

  categories.forEach(category => {
    categoryId = category.id;
    if(category.data().Name === expenseCategory)
      expenseData.CategoryID = category.id;
  });

  const res = await db.collection('Expenses').doc(expenseID).set(expenseData).catch(err => {
    alert(err);
    return;
  });
  
  alert("Expense updated successfully");
  window.location.replace("/expenses-overview.html");
}

async function deleteExpense(){
  let currentSite = window.location.href.split("/");
  currentSite = currentSite[currentSite.length - 1];
  args = currentSite.split("?")[1];
  currentSite = currentSite.split("?")[0];
  expenseID = args.split("=")[1];

  document.getElementById("editExpenseName").value = "";
  document.getElementById("editExpenseAmount").value = "";
  document.getElementById("editExpenseDate").value = "";
  document.getElementById("editExpenseCategories").value = "";
  document.getElementById("editExpenseDescription").value = "";

  res = await db.collection('Expenses').doc(expenseID).delete();

  window.location.replace("/expenses-overview.html");
}

async function manageCategoriesCode(){
  showCategories();
}

async function editCategoryCode(categoryID){
  categoryID = categoryID.split("=")[1];
  let category = await db.collection('Categories').doc(categoryID).get();
  document.getElementById("editCategoryColor").value = category.data().Color;
  document.getElementById("editCategoryName").value = category.data().Name;
  document.getElementById("editCategoryDescription").value = category.data().Description;
  let a = 5;
}

async function addExpense(){
  let expenseName = document.getElementById("expenseName").value;
  let expenseAmount = document.getElementById("expenseAmount").value;
  let expenseDate = document.getElementById("expenseDate").value;
  let expenseCategory = document.getElementById("expenseCategories").value;
  let expenseDescription = document.getElementById("expenseDescription").value;
  let err = document.getElementById("err");

  //check input
  if(!expenseName || expenseName.length === 0 ){
    err.innerHTML ="Missing expense name.";
    return;
  }
  if(isNaN(parseFloat(expenseAmount))){
    err.innerHTML ="Missing expense amount.";
    return;
  }
  if(!(new Date(expenseDate) !== "Invalid Date" && !isNaN(new Date(expenseDate)))){ 
    err.innerHTML ="Missing expense date.";
    return;
  }
  if(expenseCategory.length === 0){
    err.innerHTML ="Missing expense category.";
    return;
  }


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
  const categories = await categoriesRef.where('UserID', '==', signedInUser.email).get();

  categoryId = null;

  categories.forEach(category => {
    categoryId = category.id;
    if(category.data().Name === expenseCategory)
      expenseData.CategoryID = category.id;
  });

  const res = await db.collection('Expenses').doc().set(expenseData).catch(err => {
    alert(err);
    return;
  });
  alert("Expense added successfully");
}

async function addCategory(){
  let categoryColor = document.getElementById("categoryColor").value;
  let categoryName = document.getElementById("categoryName").value;
  let categoryDescription = document.getElementById("categoryDescription").value;
  let categoryBudget = document.getElementById("categoryBudget").value;
  let err = document.getElementById("err");

  if(!categoryName || categoryName.length === 0 ){
    err.innerHTML ="Missing category name.";
    return;
  }

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

  const res = await db.collection('Categories').add(categoryData)
    .then(async function(docRef){
      if(categoryBudget != NaN){
        const budgetData = {
          Budget: categoryBudget,
          CategoryID: docRef.id,
          UserID: signedInUser.email,
        };
        await db.collection('Budgets').add(budgetData).catch(err => {
          alert(err);
          return;
        });
      }
    }).catch(err => {
    alert(err);
    return;
  });

  alert("Category added successfully");
  window.location.replace("/manage-categories.html");
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

  let err = document.getElementById("err");

  if(!categoryName || categoryName.length === 0 ){
    err.innerHTML ="Missing category name.";
    return;
  }

  const categoryData = {
    Name: categoryName,
    Color: categoryColor,
    Description: categoryDescription,
    Budget: null,
    UserID: signedInUser.email,
  };

  document.getElementById("editCategoryColor").value = "";
  document.getElementById("editCategoryName").value = "";
  document.getElementById("editCategoryDescription").value = "";

  const res = await db.collection('Categories').doc(categoryID).set(categoryData).catch(err => {
    alert(err);
    return;
  });
  alert("Category updated successfully");
  window.location.replace("/manage-categories.html");
}

async function deleteCategory(){
  let currentSite = window.location.href.split("/");
  currentSite = currentSite[currentSite.length - 1];
  args = currentSite.split("?")[1];
  currentSite = currentSite.split("?")[0];
  categoryID = args.split("=")[1];

  const budgetsRef = db.collection('Budgets');
  const budgets = await budgetsRef.where('CategoryID', '==', categoryID).get();
  let correctBudget;

  budgets.forEach(budget => {
    correctBudget = budget.id;
  });
  
  res = await db.collection('Categories').doc(categoryID).delete();
  res = await db.collection('Budgets').doc(correctBudget).delete();

  document.getElementById("editCategoryColor").value = "";
  document.getElementById("editCategoryName").value = "";
  document.getElementById("editCategoryDescription").value = "";

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
      if(budget.data().CategoryID === categoryId && budget.data().Budget !== null)
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
                          '<span style="display: inline-block; width:5px;"></span>' +
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
  let newBudgetValue;

  if(input.value === "")
    newBudgetValue = null;
    
  else
    newBudgetValue = parseFloat(input.value);
  
  if(!isNaN(newBudgetValue)){
    let selectedBudgetId = input.id.substring(10);
    input.disabled = true;
    let budgetsRef = db.collection('Budgets');
    let budgets = await budgetsRef.where('UserID', '==', signedInUser.email).get();
    let budgetID = null;

    budgets.forEach(budget => {
      if(budget.data().CategoryID === selectedBudgetId)
        budgetID = budget.id;
    });

    if(newBudgetValue == null && budgetID != null)
      await db.collection('Budgets').doc(budgetID).delete();

    else{
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
    }
  }

  location.reload();
}

async function analysisCode(){
  let currmonth = new Date().getMonth() + 1 + "";
  let curryear = new Date().getFullYear() + "";

  let chosenMonth;
  let monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  let select = document.getElementById("expenseAnalysisMonths");
  let options = [];
  const expensesRef = db.collection('Expenses');
  const expenses = await expensesRef.where('UserID', '==', signedInUser.email).get();

  expenses.forEach(expense => {
    let expenseMonth = expense.data().Date.split("-")[1];
    let expenseYear = expense.data().Date.split("-")[0];

    if(!options.includes(expenseMonth + " " + expenseYear))
      options.push(expenseMonth + " " + expenseYear);
  });

  let el;
  let defidx = 0;

  for(var i = 0; i < options.length; i++) {
    var opt = options[i];
    el = document.createElement("option");
    opt = opt.split(" ");
    el.textContent = monthNames[parseInt(opt[0]) - 1] + " " + opt[1];
    el.value = opt;
    
    select.appendChild(el);
  }

  el = document.createElement("option");
  el.textContent = "Total";
  el.value = "";
  el.selected = true;
  select.appendChild(el);

  for (const option of select) {
    if(currmonth < 10)
      currmonth = "0" + currmonth;

    if(option.value === currmonth + "," + curryear)
      option.selected = true;

    if(currmonth.length == 2)
      currmonth = new Date().getMonth() + 1 + "";
  }

  chosenMonth = select.value;
  generateBarChart(chosenMonth);
  generateBudgetsChart(chosenMonth);
  generatePieChart(chosenMonth);

  select.addEventListener('change', (event) => {
    chosenMonth = select.value;
    generateBarChart(chosenMonth);
    generateBudgetsChart(chosenMonth);
    generatePieChart(chosenMonth);
  });
}
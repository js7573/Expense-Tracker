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
    const res = await db.collection('Users').doc(email).set(userData);
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
  window.location.replace("/dashboard-new.html");
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

      switch(currentSite){
        case "dashboard-new.html":
          dashboardCode(balance);
          break;
        case "addExpense.html":
          addExpenseCode();
          break;
        case "tables-new.html":
          expensesOverviewCode();
          break;
        case "manageCategories.html":
          manageCategoriesCode();
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
  // Populate expenses table (show last 3 expenses by date)
  const expensesRef = db.collection('Expenses');

  let expenses = await expensesRef.where('UserID', '==', signedInUser.email).orderBy('Date', 'desc').limit(3).get();
  let allExpenses = await expensesRef.where('UserID', '==', signedInUser.email).get();

  let budgetsRef = db.collection('Budgets');
  let budgets = await budgetsRef.where('UserID', '==', signedInUser.email).get();

  let categoriesRef = db.collection('Categories');
  let categories = await categoriesRef.get();
  let customCategories = await categoriesRef.where('UserID', '==', signedInUser.email).get();

  let month = new Date().getMonth() + 1 + "";
  let expensesThisMonth = 0;

  $(document).ready(function() {
      let table = $('#dataTable').DataTable({searching: false, paging: false, info: false});
      
      expenses.forEach(expense => {
        expenseData = expense.data();
        table.row.add([
          expenseData.Name,
          expenseData.Amount,
          expenseData.Date,
          expenseData.CategoryID,
          expenseData.Description
        ]).draw(false);
      });

      // Show money spent this month
      allExpenses.forEach(expense => {
        expenseData = expense.data();
        let expenseMonth = expenseData.Date.split("-")[1];
        if(expenseMonth === month)
          expensesThisMonth += parseFloat(expenseData.Amount);
      });
      document.getElementsByClassName("total-amount-spent")[0].innerHTML = "<h1>" + expensesThisMonth.toFixed(2) + " €</h1>";

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
      });
  });
}

async function addExpenseCode(){
  listCategories();
}

async function expensesOverviewCode(){
  const expensesRef = db.collection('Expenses');
  let expenses = await expensesRef.where('UserID', '==', signedInUser.email).orderBy('Date', 'desc').get();

  $(document).ready(function() {
      let table = $('#dataTable').DataTable();
      
      expenses.forEach(expense => {
        expenseData = expense.data();

        table.row.add([
          expenseData.Name,
          expenseData.Amount,
          expenseData.Date,
          expenseData.CategoryID,
          expenseData.Description
        ]).draw(false);
      });
  });
}

async function manageCategoriesCode(){
  showCategories();
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

// Show correct categories in dropdown menus
async function listCategories(){
  let select = document.getElementById("expenseCategories");
  let options = [];

  const categoriesRef = db.collection('Categories');
  const categories = await categoriesRef.get();
  categories.forEach(category => {
    if(!category.data().Name)
      options.push(category.id);
  });

  const customCategories = await categoriesRef.where('UserID', '==', signedInUser.email).get();
  customCategories.forEach(category => {
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
  let categories = await categoriesRef.get();
  let customCategories = await categoriesRef.where('UserID', '==', signedInUser.email).get();
  let categoriesDiv = document.getElementById("allCategories"); 
  
  categories.forEach(category => {
    let categoryId = category.id;
    let categoryData = category.data();
    
    if(!categoryData.Name){
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
                            '<div class="text-xs font-weight-bold text-primary text-uppercase mb-1">' + categoryId +'</div>' +
                            '<div class="h5 mb-0 font-weight-bold text-gray-800">' + 
                              'Budget: <input type="text" onfocusout="saveBudget(this)" id="editBudget' + categoryId + '" class="editBudget" value="' + budgetForCategory + '" disabled>' + '</input>' +
                            ' </div>' +
                        '</div>' +
                        '<div class="col-auto">' +
                            '<button class="btn btn-primary" value="' + categoryId + '"onclick="editBudget(this, this.value)">Edit budget</button>' +
                        '</div>' +
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>';
      categoriesDiv.innerHTML += categoryDiv;
    }
  });

  customCategories.forEach(category => {
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
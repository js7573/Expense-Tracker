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

    // Add user to firebase authentication to allow login
    auth.createUserWithEmailAndPassword(email, password).then(credentials => {
      alert("User created:\n" + credentials);
    });
    
    // Add a new document in collection "users" with email as ID
    const res = await db.collection('Users').doc(email).set(userData);
  }
}

async function signIn(){
  let email = document.getElementById("exampleInputEmail").value;
  let password = document.getElementById("exampleInputPassword").value;
  auth.signInWithEmailAndPassword(email, password).then(credentials => {
  // Signed in 
  user = credentials.user;
  window.location.replace("/dashboard-new.html");
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
      }
    }); 
  }
  else{
    let currentFile = window.location.href.split("/").slice(-1)[0];
    if(currentFile !== "index.html" && currentFile !== "register.html" && currentFile !== "404.html")
      window.location.replace("/index.html");
  }
}

async function dashboardCode(balance){
  // Show current balance
  document.getElementsByClassName("total-amount-spent")[0].innerHTML = "<h1>" + balance + " €</h1>";

  // Populate expenses table (show last 3 expenses by date)
  const expensesRef = db.collection('Expenses');
  let expenses = await expensesRef.where('UserID', '==', signedInUser.email).orderBy('Date', 'desc').limit(3).get();

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

  const res = await db.collection('Categories').doc(categoryName).set(categoryData);
}

async function listCategories(){
  let select = document.getElementById("expenseCategories");
  let options = [];

  const categoriesRef = db.collection('Categories');
  const categories = await categoriesRef.get();
  categories.forEach(category => {
    options.push(category.id);
  });

  for(var i = 0; i < options.length; i++) {
    var opt = options[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
  }
}
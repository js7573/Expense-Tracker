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

      /*
        myUser.get().then(doc => {
        const data = doc.data();
        console.log(data.Username);
        console.log(data.Password);
        });

        let myUser = db.collection('Users').doc('User1');
      */
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
  document.getElementsByClassName("total-amount-spent")[0].innerHTML = "<h1>" + balance + " €</h1>";
}

async function addExpenseCode(){

}

async function addExpense(){
  let expenseName = document.getElementById("expenseName").value;
  let expenseAmount = document.getElementById("expenseAmount").value;
  let expenseDate = document.getElementById("expenseDate").value;
  let expenseCategory = document.getElementById("expenseCategories").value;
  let expenseDescription = document.getElementById("expenseDescription").value;
  let expenseID = 2;
  const expenseData = {
    Name: expenseName,
    Amount: expenseAmount,
    Date: expenseDate,
    CategoryID: expenseCategory,
    Description: expenseDescription,
    UserID: signedInUser.email,
    ExpenseID: 2,
  };

  const res = await db.collection('Expenses').doc(expenseName).set(expenseData);
}
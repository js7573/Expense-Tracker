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

async function generateBarChart(chosenMonth){
let chosenYear = "";
if(chosenMonth !== ""){
    chosenYear = chosenMonth.split(",")[1];
    chosenMonth = chosenMonth.split(",")[0];
}
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

        if(chosenMonth === "")
        totalSpentByCategories[category.id] += parseFloat(expenseData.Amount);

        else{
        let expenseMonth = expenseData.Date.split("-")[1];
        let expenseYear = expenseData.Date.split("-")[0];
        if(expenseMonth === chosenMonth && expenseYear === chosenYear)
            totalSpentByCategories[category.id] += parseFloat(expenseData.Amount);
        }
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

async function generateBudgetsChart(chosenMonth){
let chosenYear = "";
if(chosenMonth !== ""){
    chosenYear = chosenMonth.split(",")[1];
    chosenMonth = chosenMonth.split(",")[0];
}
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

let budgetsRef = db.collection('Budgets');
let budgets = await budgetsRef.where('UserID', '==', signedInUser.email).get();

let totalSpentByBudgets = {};

let labels = [];
let colors = [];
let totalSpent = [];

//Show percentages of defined budgets
budgets.forEach(budget => {

    let budgetData = budget.data();
    let budgetSpent; 
    if(budgetData.Budget !== "")
    budgetSpent = 0;

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

    labels.push(categoryName);
    colors.push(categoryColor);

    expenses.forEach(expense => {
    expenseData = expense.data();
    expenseMonth = expenseData.Date.split("-")[1]; 
    expenseYear = expenseData.Date.split("-")[0]; 
    if(expenseData.CategoryID === budgetData.CategoryID && budgetData.Budget !== "" && expenseMonth === ""){
        budgetSpent += parseFloat(expenseData.Amount);
    }
    else if(expenseData.CategoryID === budgetData.CategoryID && budgetData.Budget !== "" && expenseMonth === chosenMonth && expenseYear === chosenYear){
        budgetSpent += parseFloat(expenseData.Amount);
    }
    });

    let percentage = 0;

    if(budgetSpent > 0){
    percentage = (budgetSpent * 100) / budgetData.Budget;
    percentage = percentage.toFixed(2);
    totalSpentByBudgets[categoryName] = percentage;
    totalSpent.push(totalSpentByBudgets[categoryName]);
    }
});
// Bar Chart Example
var ctx = document.getElementById("budgetSpent");
var myBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
    labels: labels,
    datasets: [{
        label: "Budget spent",
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
            max: 100,
            maxTicksLimit: 5,
            padding: 10,
            // Include a dollar sign in the ticks
            callback: function(value, index, values) {
            return value + ' %';
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
            return datasetLabel + ': ' + number_format(tooltipItem.yLabel) + "%";
        }
        }
    },
    }
});

}

async function generatePieChart(chosenMonth){
let chosenYear = "";
if(chosenMonth !== ""){
    chosenYear = chosenMonth.split(",")[1];
    chosenMonth = chosenMonth.split(",")[0];
}
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

        if(chosenMonth === "")
        totalSpentByCategories[category.id] += parseFloat(expenseData.Amount);

        else{
        let expenseMonth = expenseData.Date.split("-")[1];
        let expenseYear = expenseData.Date.split("-")[0];
        if(expenseMonth === chosenMonth && expenseYear === chosenYear)
            totalSpentByCategories[category.id] += parseFloat(expenseData.Amount);
        }
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

var criteriaArr=[];
var alternativesArr=[];

let criteriasVectors = {};
let CVarr = [];

const RCV = {
    1: 0,
    2: 0,
    3: 0.58,
    4: 0.9,
    5: 1.12,
    6: 1.24,
    7: 1.32,
    8: 1.41,
    9: 1.45,
    10: 1.49
};


function fastCustomRound(val, precision){
    let tmp = Math.pow(10,precision);
    return Math.round(val * tmp)/tmp;
}

let vectors = [];

function continueTo(){
    var criteriaList = document.getElementsByClassName('criteria');
    var alternativesList = document.getElementsByClassName('alternative');
    for (var i=0;i<criteriaList.length;i++){
        criteriaArr.push(criteriaList[i].value);
    }
    for (var i=0;i<alternativesList.length;i++){
        alternativesArr.push(alternativesList[i].value);
    }
    console.log(criteriaArr);
    console.log(alternativesArr);

    processAndCreateTables();
    document.getElementById("tables").click();   
}

function fillComponentDictionary(tableId, dict) {
    let table = document.getElementById(tableId);
    let rows = table.rows;
    //semi-component - geometrical mean of all cells in a row
    let semiComponents = [];
    for (let ind = 1; ind < rows.length; ind++){
        let cells = rows[ind].cells;
        let cellsarr = [];
        for (let cellind = 1; cellind < cells.length; cellind++){
            cellsarr.push(customParseInt(cells[cellind].firstChild.value));
        }
        //geometrical mean
        semiComponents.push(Math.pow(cellsarr.reduce((a, b) => a * b, 1), 1 / (cellsarr.length)));
    }
    console.log("semicomp"+semiComponents);
    let sumOfSemiComponents = semiComponents.reduce((a, b) => a + b, 0);
    //Carefully, from 1!!!
    for (let i = 1; i < rows.length; i++){
        dict[i] = semiComponents[i-1] / sumOfSemiComponents;
        console.log("dict"+dict[i]);
    }
}


function calculate() {
    //clear previous consistency info
    //$('.info').remove();
    criteriasVectors = {};
    vectors = [];
    initializeLowerLevelArrayOfDicts();

    calculateConsistency('critires-prior-table',criteriasVectors,'critirea-prior');
    for (let i=0; i < criteriaArr.length; i++){
        calculateConsistency("alternatives-prior-table"+i, vectors[i], 'alternative-prior'+i);
    }
}

function calculateConsistency(tableid, componentDict, info) {
    fillComponentDictionary(tableid, componentDict);
    console.log(tableid);
    let table = document.getElementById(tableid);
    //sums of every column
    let colSums = [];
    for (let col = 1; col < table.rows[0].cells.length; col++){
        let column = [];
        for (let row = 1; row < table.rows.length; row++){
            column.push(customParseInt(table.rows[row].cells[col].firstChild.value));
        }
        colSums.push(column.reduce((a, b) => a + b, 0));
    }
    console.log("colSums"+colSums);
    console.log("componentDict"+componentDict);


    //every column sum * component from dictionary
    let tempSums = [];
    for (let i = 0; i < colSums.length; i++){
        tempSums.push(colSums[i] * componentDict[i+1]);
    }
    console.log("tempSums"+tempSums);
    let lambdaMax = tempSums.reduce((a, b) => a + b, 0);
    let n;
    if(tableid=="critires-prior-table"){
        n = criteriaArr.length;
    }
    else{
        n = alternativesArr.length;
    }
    //Consistency index
    let CI = (lambdaMax - n)/ (n - 1);
    //Consistency value
    let CV = CI / RCV[n];
    $('#'+info+'lm').html(lambdaMax);
    $('#'+info+'ci').html(CI);
    $('#'+info+'cv').html(CV);
    CVarr.push(CV);
}

function customParseInt(str) {
    if (str.includes("/")) {
        let valNum = str.split("/").map(x => parseInt(x));
        return valNum[0] / valNum[1];
    }
    return parseInt(str);
}

var criteriaLiHtml = " <li class='list-group-item d-flex justify-content-between align-items-center'><input type='text' class='form-control col-sm-9 criteria' id='Criteria' placeholder='Criteria name' value='' required=''><button type='button' class='btn btn-danger col-sm-2' onclick='removeLi(this)'>Remove</button></li>"

function addCriteria(){
    if(document.getElementsByClassName('criteria').length<=9){
        document.getElementById('criteria-list').insertAdjacentHTML("beforeend", criteriaLiHtml);
    }else{
        alert("Too many criterias\nMaximum number is 10")
    }
}

function removeLi(elem){
    var li = elem.parentNode;
    li.parentNode.removeChild(li);
}


var alternativesLiHtml = " <li class='list-group-item d-flex justify-content-between align-items-center'><input type='text' class='form-control col-sm-9 alternative' id='alternative' placeholder='Alternative name' value='' required=''><button type='button' class='btn btn-danger col-sm-2' onclick='removeLi(this)'>Remove</button></li>";
function addAlternative(){
    if(document.getElementsByClassName('alternative').length<=9){
        document.getElementById('alternative-list').insertAdjacentHTML("beforeend", alternativesLiHtml);
    }else{
        alert("Too many alternatives\nMaximum number is 10")
    }
}

function processAndCreateTables() {
    $('critires-conteiner').html('');
    $('alternatives-conteiner').html('');
    createTable("critires-conteiner", "critires-prior-table", "targetTitle", criteriaArr, 'critirea-prior');
    console.log("Process");
    for (let i=0; i < criteriaArr.length; i++){
        createTable("alternatives-conteiner", "alternatives-prior-table"+i, criteriaArr[i], alternativesArr, 'alternative-prior'+i);
    }
}


function initializeLowerLevelArrayOfDicts() {
    criteriaArr.map(() => {
        vectors.push({});
    })
}

function createTable(tableContainerId, tableId, tableTitle, columnsArray, infoId) {
    let tabletag = '<table id="'+tableId+'" class="table table-bordered"></table>';
    let tableContainer = $('#'+tableContainerId);
    tableContainer.html(tableContainer.html() + tabletag);
    //alert(tableContainerId);
    let out = "";
    out += '<tr>' +
        '<th>' + tableTitle + '</th> ';
    for (let cr of columnsArray){
        out += '<th>'+ cr +'</th>'
    }
    out += '</tr>';
    for (let rowtitle of columnsArray){
        out += '<tr ><td>'+ rowtitle +'</td>';
        for (let rowcol of columnsArray){
            if (rowtitle === rowcol){
                out += '<td><select disabled><option>1</option></select></td>';
            }
            else{
                out += '<td><select class="loc-pr-select">' +
                    '<option>9</option>' +
                    '<option>8</option>' +
                    '<option>7</option>' +
                    '<option>6</option>' +
                    '<option>5</option>' +
                    '<option>4</option>' +
                    '<option>3</option>' +
                    '<option>2</option>' +
                    '<option selected>1</option>' +
                    '<option>1/2</option>' +
                    '<option>1/3</option>' +
                    '<option>1/4</option>' +
                    '<option>1/5</option>' +
                    '<option>1/6</option>' +
                    '<option>1/7</option>' +
                    '<option>1/8</option>' +
                    '<option>1/9</option>' +
                    '</select></td>';
            }
        }
        out+='</tr>';
    }
    $('#'+tableId).html(out);

    info = '<div class="info container">' +
        '       <div class="row">' +
        '           <!--max proper number-->' +
        '           <div class="col text-bold">λmax =' +
        '           <span id="'+infoId+'lm"></span></div>' +
        '           <div class="col text-bold">CI =' +
        '           <span id="'+infoId+'ci"></span></div>' +
        '           <div class="col text-bold">CV =' +
        '           <span id="'+infoId+'cv"></span></div>' +
        '</div>' +
        '</div>';
    tableContainer.html(tableContainer.html() + info);

   $('.loc-pr-select').change(function () {
        let curr = $(this).val();
        let newVal = '';
        if(curr.toString().includes('/')){
            newVal = curr.split('/')[1];
        }else if (curr.toString() === '1') {
            newVal = '1';
        }else{
            newVal = '1/'+curr;
        }
        let rowInd = parseInt($(this).closest('tr').index());
        let colInd = parseInt($(this).closest('td').index());
        let table = document.getElementById($(this).closest('table').attr('id'));
        table.rows[colInd].cells[rowInd].firstChild.value = newVal;
    });

}

function finish (){
    if((CVarr.filter(x => x > 20).length) > 0){
        alert("Something is wrong\n" +
            "some tables has CV > 20\n" +
            "Please input valid data and try again.")
    }else{
        //slide next
    let out = '';
    out += '<tr class="bg-primary">' +
        '<th>'+ '</th> ';
    for (let cr of criteriaArr){
        out += '<th>'+ cr +'</th>'
    }
    out += '<th>Global Priority</th></tr>';
    out += '<tr><td>Criteria Priorities</td>';
    let criteriaLocPrValues = Object.keys(criteriasVectors).map(function(key){
        return fastCustomRound(criteriasVectors[key],3);
    });
    for (let i = 0; i < criteriaLocPrValues.length; i++){
        out += '<td>' + criteriaLocPrValues[i] + '</td>';
    }
    out += '<td></td>';

    //result values
    let result = {};
    //filling and computing
    for (let row = 0; row < alternativesArr.length; row++){
        out += '<tr><td>' + alternativesArr[row] + '</td>';
            let rowLocPrValues = [];
            for (let col = 0; col < criteriaArr.length; col++){
                let val = vectors[col][row+1];
                out += '<td>' + fastCustomRound(val,3) + '</td>';
                rowLocPrValues.push(val);
            }
            let foldsum = 0;
            for (let row_i = 0; row_i < rowLocPrValues.length; row_i++){
                foldsum += rowLocPrValues[row_i] * criteriaLocPrValues[row_i];
            }
            foldsum = fastCustomRound(foldsum,3);
            result[alternativesArr[row]] = foldsum;
            out += '<td>' + foldsum + '</td>';
        out += '</tr>';
    }
    res = '';
    let winner = Object.keys(result).reduce(function(a, b){ return result[a] > result[b] ? a : b });
        '= ' + result[winner];

    $('#result').html(res);
    $('#gl-prior-table').html(out);

    document.getElementById("results").click();   

}}
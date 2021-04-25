//TRANSLATE
let valTransformation = 0.15;

function btnSubTranslateXClick() {
  document.getElementById("xAxis").value =
    parseFloat(document.getElementById("xAxis").value) - valTransformation;
}

function btnAddTranslateXClick() {
  document.getElementById("xAxis").value =
    parseFloat(document.getElementById("xAxis").value) + valTransformation;
}

function btnSubTranslateYClick() {
  document.getElementById("yAxis").value =
    parseFloat(document.getElementById("yAxis").value) - valTransformation;
}

function btnAddTranslateYClick() {
  document.getElementById("yAxis").value =
    parseFloat(document.getElementById("yAxis").value) + valTransformation;
}

//SCALE
function btnSubScaleXClick() {
  document.getElementById("xAxisScale").value =
    parseFloat(document.getElementById("xAxisScale").value) - valTransformation;
}

function btnAddScaleXClick() {
  document.getElementById("xAxisScale").value =
    parseFloat(document.getElementById("xAxisScale").value) + valTransformation;
}

function btnSubScaleYClick() {
  document.getElementById("yAxisScale").value =
    parseFloat(document.getElementById("yAxisScale").value) - valTransformation;
}

function btnAddScaleYClick() {
  document.getElementById("yAxisScale").value =
    parseFloat(document.getElementById("yAxisScale").value) + valTransformation;
}

var selectors = [];
var currentElement;
var targetElement;
var completed;

var ignoreClasses = "hover, mouseOver";
var ignoreIdPrefixes = "generic_";

function CalculateSelector() {
    TraverseAndCalculate(targetElement);

    return GenerateSelectorString();
};

function GenerateSelectorString() {
    var selectorString = "";
    for (var i = selectors.length - 1; i >= 0 ; i--) {
        selectorString += selectors[i];
        if (i != 0) { selectorString += " "; }
    }

    return selectorString;
};

function IsAllowedId(sIdName) {
//    if (this.disableConfig) {
//        return true;
//    }
    for (var i = 0; i < ignoreIdPrefixes.length; i++) {
        if (sIdName.toLowerCase().indexOf(ignoreIdPrefixes[i].toLowerCase()) == 0 &&
            this.ignoreIdPrefixes[i] != "") {
            return false;
        }
    }
    return true;
};

function IsAllowedClass(sName) {
//    if (this.disableConfig) {
//        return true;
//    }
    for (var i = 0; i < ignoreClasses.length; i++) {
        if (ignoreClasses[i].toLowerCase() == sName.toLowerCase()) {
            return false;
        }
    }
    return true;
};

function TraverseAndCalculate(element) {
    var sId = element.getAttribute("id");
    var sClass = element.getAttribute("class");

    while (completed == false && currentElement != null) {
        sId = currentElement.getAttribute("id");
        sClass = currentElement.getAttribute("class");

        if (sId != null/* && IsAllowedId(sId)*/) {
            CalculateIdSelector(sId);
        }
        else if (sClass != null && sClass != "") {
            CalculateClassSelector(sClass);
        }
        else {
            CalculateTagSelector();
        }

        currentElement = currentElement.parentElement;
    }

    return selectors;
};

function CalculateIdSelector(sElementId) {
    if (window.document.getElementById(sElementId) != null) {
        selectors.push("#" + sElementId);
        completed = true;
    }
};

function ClassDoesNotAlreadyExistInArray(sClass, pClassArray) {
    for (var x = 0; x < pClassArray.length; x++) {
        if (sClass.toLowerCase() == pClassArray[x].toLowerCase()) {
            return false;
        }
    }
    return true;
};

function ReturnValidClasses(className) {
    var classes = className.split(" ");
    var pClassesToReturn = [];

    for (var i = 0; i < classes.length; i++) {
        if (IsAllowedClass(classes[i])) {
            if (ClassDoesNotAlreadyExistInArray(classes[i], pClassesToReturn)) {
                pClassesToReturn.push(classes[i]);
            }
        }
    }
    return pClassesToReturn;
};

function GenerateSelectorClassesString(sClassName) {
    var pValidClasses = ReturnValidClasses(sClassName);
    var eParent = currentElement.parentElement;

    /* See if we can get a class selector within the current element's parent which is unique */
    for (var i = 0; i < pValidClasses.length; i++) {
        if (eParent.getElementsByClassName(pValidClasses[i]).length == 1 &&
            eParent.getElementsByClassName(pValidClasses[i])[0] == currentElement) {
            return pValidClasses[i];
        }
    }

    /* See if we can get a class + eq(X) selector inside the current element's parent */
    var className = pValidClasses[0];
    var foundElements = eParent.getElementsByClassName(className);
    for (var i = 0; i < foundElements.length; i++) {
        if (foundElements[i] == currentElement) {
            return className + ":nth-child(" + (i + 1) + ")";
        }
    }

    return pValidClasses.join(", ");
};

function CalculateClassSelector(sClass) {
    var selectorForClass = GenerateSelectorClassesString(sClass);	/* remove dupe */
    if (selectorForClass != "") {
        selectors.push("." + selectorForClass);

        var foundElementsInDom = window.document.getElementsByClassName(selectorForClass);
        if (foundElementsInDom.length == 1) {
            completed = true;
        }
    }
    else {
        this.calculateTagSelector();
    }
};

function CalculateTagSelector() {
    var sTagName = currentElement.tagName;
    var eParent = currentElement.parentElement;
    var pChildElementsToConsider = (eParent == null ? [] : eParent.children);
    var pTagElementsToConsider = (eParent == null ? [] : eParent.getElementsByTagName(sTagName));

    if (sTagName.toLowerCase() == "body") {
        selectors.push(sTagName.toLowerCase());
    }

    else if (pTagElementsToConsider.length == 1) {
        selectors.push(sTagName.toLowerCase());
    }

    else {
        for (var i = 0; i < pChildElementsToConsider.length; i++) {
            if (pChildElementsToConsider[i] == currentElement) {
                selectors.push(sTagName.toLowerCase() + ":nth-child(" + (i + 1) + ")");
            }
        }
    }
};

//This recursive function will build a valid XPath in a string and return it, based on a given element.
function getPathTo(element) {
    if (element.id !== '')
        return 'id("' + element.id + '")';
    if (element === window.document.body)
        return element.tagName;

    var ix = 0;
    var siblings = element.parentNode.childNodes;
    for (var i = 0; i < siblings.length; i++) {
        var sibling = siblings[i];
        if (sibling === element)
            return getPathTo(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
            ix++;
    }
}

var entered = "";

//When a key is pressed, communication is made to the application.
document.onkeypress = function notifyType(event) {
    entered += String.fromCharCode(event.keyCode);

    $.ajax({
        type: "POST",
        url: "http://localhost:8055/",
        data: String.fromCharCode(event.keyCode),
        dataType: "text"
    });
};

//This function tries to find a set of elements on the given page which are very likely to contain the best name/label/title of a page.
//The pageObjectIndicators are a set of selectors (from best to worst) which contain text representing the title.
//More indicators should be found and considered!
function getPageObject() {
    var pageObjectIndicators = ["div.page-header h2", "span.breadcrumb-item.active", "#report-name", "div.reportTitle", ".headText", "td.tab-c-sel a"];
    for (var i = 0; i < pageObjectIndicators.length; i++) {
        var po = "";
        if ($(pageObjectIndicators[i]).length > 1) {
            po = $(pageObjectIndicators[i]).eq(0).text().replace(/[^\w!?]/g, '');
        } else {
            po = $(pageObjectIndicators[i]).text().replace(/[^\w!?]/g, '');
        }
        if (po != "") {
            return po;
        }
    }
    return "Main";
}

//This unused function will find the best selector for an element. This is useful when an element has no id, name, or class fields
//because there may be an element directly behind it which does!
function findBestSelector(element) {
    var id = element.getAttribute("id");
    var name = element.getAttribute("name");
    var cname = element.getAttribute("class");

    if (id == null && name == null && cname == null) {
        findBestSelector(element.parentNode);
    } else {
        if (id != null) {
            return "By.Id(\"" + id + "\")";
        }else if (name != null) {
            return "By.Name(\"" + name + "\")";
        }else if (cname != null) {
            return "By.ClassName(\"" + cname + "\")";
        }
//        alert("Got |" + id + name + cname + "|");
    }

    return "BROKEN SELECTOR!";
}

//var prev_path = 'undefined';
var prev_selector = 'undefined';
var count = 0;

//Primary function to be called when an element is clicked. Uses getPathTo and a bunch of metadata to communicate with the
//application.
function notifyClick(event) {

//    Target(event.target);
//    alert(CalculateSelector());

    if (event === undefined) event = window.event;
    var target = 'target' in event ? event.target : event.srcElement;
//
//    var root = document.compatMode === 'CSS1Compat' ? document.documentElement : document.body;
//    var mxy = [event.clientX + root.scrollLeft, event.clientY + root.scrollTop];
//
//    var path = getPathTo(target);
//
//    if (prev_path.valueOf() == path.valueOf()) {
//        return;
//    }

    //    prev_path = path.valueOf();

    var id = target.getAttribute("id");
    var name = target.getAttribute("name");
    var classname = target.getAttribute("class");
    var selector = "";
    if (id != null) {
        selector = "#" + id;
    }else if (name != null) {
        selector = "[name='" + name + "']";
    } else {
        selectors = [];
        currentElement = target;
        targetElement = target;
        completed = false;
        selector = CalculateSelector();
    }
    
    if (prev_selector.valueOf() == selector.valueOf()) {
        return;
    }

    prev_selector = selector.valueOf();
    
//    if (prev_path.valueOf() == path.valueOf()) {
//        return;
//    }

    var label = "item" + count;
    if (id != null) {
        label = id;
    }else if (name != null) {
        label = name;
    }else if (classname != null) {
        label = classname + count;
    }
    
    var payload = {
        Label: label,
        Id: id,
        Name: name,
        ClassName: classname,
        Selector: selector,
        Type: "" + target.getAttribute("type"),
        Node: target.nodeName.valueOf()
    };

//    findBestSelector(target);
//
    $.ajax({
        type: "POST",
        url: "http://localhost:8055/",
        data: JSON.stringify(payload),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    });
//
    count++;
    entered = "";
}

//Everytime the script is loaded, each a, img, and div element on the page will be given the notifyClick onClick event.
function loadElems() {
    var aElems = window.document.getElementsByTagName("a");
    for (i = 0, max = aElems.length; i < max; i++) {
        aElems[i].onclick = notifyClick;
    }
    var imgElems = window.document.getElementsByTagName("img");
    for (i = 0, max = imgElems.length; i < max; i++) {
        imgElems[i].onclick = notifyClick;
    }
    var divElems = window.document.getElementsByTagName("div");
    for (i = 0, max = divElems.length; i < max; i++) {
        divElems[i].onclick = notifyClick;
    }
    var liElems = window.document.getElementsByTagName("li");
    for (i = 0, max = liElems.length; i < max; i++) {
        liElems[i].onclick = notifyClick;
    }
    window.document.onclick = notifyClick;
}

loadElems();
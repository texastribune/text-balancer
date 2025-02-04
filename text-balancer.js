/*
    As required by the license, this is a notice The Texas Tribune
    modified line 31 to include the `var` reserved word.
*/

var candidates = [];

// pass in a string of selectors to be balanced.
// if you didnt specify any, thats ok! We'll just
// balance anything with the balance-text class
var textBalancer = function (selectors) {

    if (!selectors) {
        candidates = document.querySelectorAll('.balance-text');
    } else {
        createSelectors(selectors);
    }

    balanceText();

    var rebalanceText = debounce(function() {
        balanceText();
    }, 100);

    window.addEventListener('resize', rebalanceText);
}

// this populates our candidates array with dom objects
// that need to be balanced
var createSelectors = function(selectors) {
    var selectorArray = selectors.split(',');
    for (var i = 0; i < selectorArray.length; i += 1) {
        var currentSelectorElements = document.querySelectorAll(selectorArray[i].trim());

        for (var j = 0; j < currentSelectorElements.length; j += 1) {
            var currentSelectorElement = currentSelectorElements[j];
            candidates.push(currentSelectorElement);
        }
    }
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
var debounce = function (func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};


// HELPER FUNCTION -- initializes recursive binary search
var balanceText = function () {
    var element;
    var i;

    for (i = 0; i < candidates.length; i += 1) {
        element = candidates[i];

        if (textElementIsMultipleLines(element)) {
            element.style.maxWidth = '';
            squeezeContainer(element, element.clientHeight, 0, element.clientWidth);
        }

    }

}

// Make the element as narrow as possible while maintaining its current height (number of lines). Binary search.
var squeezeContainer = function (element, originalHeight, bottomRange, topRange) {
    var mid;
    if (bottomRange >= topRange) {
        element.style.maxWidth = topRange + 'px';
        return;
    }
    mid = (bottomRange + topRange) / 2;
    element.style.maxWidth = mid + 'px';

    if (element.clientHeight > originalHeight) {
        // we've squoze too far and element has spilled onto an additional line; recurse on wider range
        squeezeContainer(element, originalHeight, mid+1, topRange);
    } else {
        // element has not wrapped to another line; keep squeezing!
        squeezeContainer(element, originalHeight, bottomRange+1, mid);
    }
}

// function to see if a headline is multiple lines
// we only want to break if the headline is multiple lines
//
// We achieve this by turning the first word into a span
// and then we compare the height of that span to the height
// of the entire headline. If the headline is bigger than the
// span by 10px we balance the headline.
var textElementIsMultipleLines = function (element) {
    var firstWordHeight;
    var elementHeight;
    var HEIGHT_OFFSET;
    var elementWords;
    var firstWord;
    var ORIGINAL_ELEMENT_TEXT;

    ORIGINAL_ELEMENT_TEXT = element.innerHTML;

    // usually there is around a 5px discrepency between
    // the first word and the height of the whole headline
    // so subtract the height of the headline by 10 px and
    // we should be good
    HEIGHT_OFFSET = 10;

    // get all the words in the headline as
    // an array -- will include punctuation
    //
    // this is used to put the headline back together
    elementWords = element.innerHTML.split(' ');

    // make span for first word and give it an id
    // so we can access it in le dom
    firstWord = document.createElement('span');
    firstWord.id = 'element-first-word';
    firstWord.innerHTML = elementWords[0];

    // this is the entire headline
    // as an array except for first word
    //
    // we will append it to the headline after the span
    elementWords = elementWords.slice(1);

    // empty the headline and append the span to it
    element.innerHTML = '';
    element.appendChild(firstWord);

    // add the rest of the element back to it
    element.innerHTML += ' ' + elementWords.join(' ');

    // update the first word variable in the dom
    firstWord = document.getElementById('element-first-word');

    firstWordHeight = firstWord.offsetHeight;
    elementHeight = element.offsetHeight;
    // restore the original element text
    element.innerHTML = ORIGINAL_ELEMENT_TEXT;

    // compare the height of the element and the height of the first word
    return elementHeight - HEIGHT_OFFSET > firstWordHeight;

} // end headlineIsMultipleLines

exports.balanceText = textBalancer;
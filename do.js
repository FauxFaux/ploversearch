function start() {
    $('#status').text('JQuery works!  Downloading dictionary...');
    $.getJSON("dict.json", function(dict) {
        $('#status').text('Parsing dictionary...');
        var rot = {};
        // {
        //  'ras': { 'Raspberry': [ 'R-B', 'R*B'] },
        //  'pon': { 'ponies': [ 'P' ], 'pony': [ 'P-P' ] }
        // }
        $.each(dict, function(key, val) {
            if (val.length < 2)
                return true;
            var pre = summarise(val);
            if (typeof rot[pre] !== 'object')
                rot[pre] = new Object();
            if (typeof rot[pre][val] !== 'object')
                rot[pre][val] = new Array();
            rot[pre][val].push(key);
        });
        delete dict;
        $('#search').keyup(function() {
            delay(function() {
                doSearch(rot);
            }, 200);
        });
        resultTable();
        if (window.location.hash) {
            $('#search').val(window.location.hash.substring(1));
            doSearch(rot);
        }
    });
}

function startsWith(haystack, needle) {
    return haystack.substring(0, needle.length) == needle;
}

function summarise(val) {
    return val.substring(0, 3).toLowerCase();
}

var prev='';

// https://stackoverflow.com/questions/1909441/jquery-keyup-delay
var delay = (function(){
    var timer = 0;
    return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    };
})();

function resultTable() {
    var r = $('#result').find('tbody');
    r.empty();
    return r;
}

function doSearch(dict) {
    term = $('#search').val();
    if (term == prev) {
        return;
    }
    prev = term;

    window.location.hash = term;
    history.pushState(term, '', window.location);

    var r = resultTable();
    if (term.length <= 1) {
        return;
    }

    var pre = summarise(term);

    if (!(pre in dict)) {
        return;
    }

    if (dict[pre][term]) {
        $.each(dict[pre][term], function(idx, code) {
            addTr(r, code, term);
        });
    }
    var loading = $('<td>')
        .attr('colspan', '2')
        .css('text-align', 'center')
        .attr('id', 'inexact')
        .text("(inexact results loading...)");

    r.append($('<tr>').append(loading));

    setTimeout(function() {
        var total = addMatchesToTable(dict[pre], r, function(trans, term) {
            var v = trans.toLowerCase();
            return trans == term || !startsWith(v, term.toLowerCase());
        });
        var inex = $('#inexact');
        if (0 != total)
            inex.text('(' + total
                    + ' inexact match' + (total == 1 ? '' : 'es') + ')');
        else
            inex.text('');
    }, 0);
}

function addMatchesToTable(dict, r, reject) {
    var found = 0;
    $.each(dict, function(trans, codes) {
        if (found > 50) {
            return false;
        }
        if (reject(trans, term)) {
            return true;
        }
        ++found;
        $.each(codes, function(idx, code) {
            addTr(r, code, trans);
        });
    });
    return found;
}

function addTr(r, code, trans) {
    var cell = $('<td>');
    var splt = code.split(/\//);
    $.each(splt, function(idx, val) {
        var tab = $('<table>');
        var first = $('<tr>');
        var second = $('<tr>');
        tab.append(first);
        tab.append(second);
        $.each(decompose(val), function(inner, part) {
            var td = $('<td>');
            if (part.strokes.length <= 1)
                td.text(part.strokes)
                    .addClass('notranslate');
            else {
                td.append($('<u>')
                    .css('color', colorFor[part.strokes])
                    .append($('<span>')
                        .css('color', 'black')
                        .addClass('notranslate')
                        .text(part.strokes)
                    ));
            }

            first.append(td);
            second.append($('<td>')
                .css('color', colorFor[part.strokes])
                .addClass('notranslate')
                .text(part.hint));
        });
        if (idx != splt.length - 1) {
            first.append($('<td>').text('/'));
            second.append($('<td>'));
        }
        cell.append(tab);
    });
    r.append($('<tr>')
        .append(cell)
        .append($('<td>').text(trans))
        );
}

var meanings = [
    { from: "STKPW", to: "z" },
    { from: "SKWR", to: "j" },
    { from: "TKPW", to: "g" },
    { from: "PBLG", to: "j" },
    { from: "KWR", to: "y" },
    { from: "TPH", to: "n" },
    { from: "BGS", to: "x" },
    { from: "KHR", to: "cl" }, // not ch-r
    { from: "PHR", to: "pl" }, // not m-r
    { from: "SR", to: "v" },
    { from: "TK", to: "d" },
    { from: "TP", to: "f" },
    { from: "PH", to: "m" },
    { from: "PW", to: "b" },
    { from: "KW", to: "q" },
    { from: "HR", to: "l" },
    { from: "KP", to: "x" },
    { from: "FP", to: "ch" },
    { from: "RB", to: "sh" },
    { from: "PB", to: "n" },
    { from: "PL", to: "m" },
    { from: "BG", to: "k" },
    { from: "GS", to: "ion" },
    { from: "TH", to: "th" },
    { from: "KH", to: "ch" },
    { from: "SH", to: "sh" },
    { from: "AOEU", to: "eye" },
    { from: "AEU", to: "aa" },
    { from: "AOE", to: "ee" },
    { from: "AOU", to: "oo" },
    { from: "OEU", to: "oy" },
    { from: "AU", to: "aw" },
    { from: "EA", to: "ea" },
    { from: "OU", to: "ow" },
    { from: "EU", to: "i" },
    { from: "OE", to: "oh" },
    { from: "AO", to: "oo" },
    { from: "*", to: "" },
    { from: "-", to: "" }
];

function decompose(code) {
    if ('' == code)
        return [];
    var ret;
    for (var i = 0; i < meanings.length; ++i) {
        var en = meanings[i];
        var end;
        if (startsWith(code, en.from))
            end = en.from.length;
        else if (startsWith(code.replace('*', ''), en.from))
            end = en.from.length + 1;
        else
            continue;

        return [{
            strokes: code.substring(0, end),
            hint: en.to
        }].concat(decompose(code.substring(end)));
    }
    var x = code.substring(0, 1);
    return [{
        strokes: x,
        hint: x.toLowerCase()
    }].concat(decompose(code.substring(1)));
}

function rainbow(numOfSteps, step) {
    // Adam Cole, 2011-Sept-14
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch(i % 6){
        case 0: r = 1, g = f, b = 0; break;
        case 1: r = q, g = 1, b = 0; break;
        case 2: r = 0, g = 1, b = f; break;
        case 3: r = 0, g = q, b = 1; break;
        case 4: r = f, g = 0, b = 1; break;
        case 5: r = 1, g = 0, b = q; break;
    }
    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}

var colorFor = {};
for (var i = 0; i < meanings.length; ++i) {
    colorFor[meanings[i].from] = rainbow(meanings.length, i);
}


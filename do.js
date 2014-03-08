function start() {
    $.getJSON("dict.json", function(dict) {
        $('#search').keyup(function() {
            return doSearch(dict);
        });
        if (window.location.hash) {
            $('#search').val(window.location.hash.substring(1));
            doSearch(dict);
        }
    });
}

function startsWith(haystack, needle) {
    return haystack.substring(0, needle.length) == needle;
}

var prev='';
var timer = -1;

function doSearch(dict) {
    term = $('#search').val().toLowerCase();
    if (term == prev) {
        return;
    }
    prev = term;

    window.location.hash = term;
    history.pushState(term, '', window.location);

    var r = $('#result').find('tbody');
    r.empty();
    if (term.length <= 1) {
        return;
    }

    addMatchesToTable(dict, r, function(trans, term) {
        return trans.toLowerCase() != term;
    });

    addMatchesToTable(dict, r, function(trans, term) {
        var v = trans.toLowerCase();
        return v == term || !startsWith(v, term);
    });
}

function addMatchesToTable(dict, r, reject) {
    var found = 0;
    $.each(dict, function(code, trans) {
        if (found > 50) {
            return false;
        }
        if (reject(trans, term)) {
            return true;
        }
        ++found;
        addTr(r, code, trans);
    });
}

function addTr(r, code, trans) {
    var tab = $('<table>');
    var first = $('<tr>');
    var second = $('<tr>');
    tab.append(first);
    tab.append(second);
    var splt = code.split(/\//);
    $.each(splt, function(idx, val) {
        $.each(decompose(val), function(inner, part) {
            var td = $('<td>');
            if (part.strokes.length <= 1)
                td.text(part.strokes);
            else {
                td.append($('<u>')
                    .css('color', colorFor[part.strokes])
                    .append($('<span>')
                        .css('color', 'black')
                        .text(part.strokes)
                    ));
            }

            first.append(td);
            second.append($('<td>')
                .css('color', colorFor[part.strokes])
                .text(part.hint));
        });
        if (idx != splt.length - 1) {
            first.append($('<td>').text('/'));
            second.append($('<td>'));
        }
    });
    r.append($('<tr>')
        .append($('<td>').append(tab))
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
        if (!startsWith(code, en.from))
            continue;
        return [{
            strokes: en.from,
            hint: en.to
        }].concat(decompose(code.substring(en.from.length)));
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


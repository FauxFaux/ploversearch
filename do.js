function start() {
    $.getJSON("dict.json", function(dict) {
        $('#search').keyup(function() {
            return doSearch(dict);
        });
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
                    .css('color', colorFor(part.hint))
                    .append($('<span>')
                        .css('color', 'black')
                        .text(part.strokes)
                    ));
            }

            first.append(td);
            second.append($('<td>')
                .css('color', colorFor(part.hint))
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

function colorFor(str) {
    return 'red';
}


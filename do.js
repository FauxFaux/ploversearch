function start() {
    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str){
            return this.substring(0, str.length) == str;
        };
    }

    $.getJSON("dict.json", function(dict) {
        $('#search').keyup(function() {
            return doSearch(dict);
        });
    });
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
        return v == term || !v.startsWith(term);
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
            first.append($('<td>').html(part.strokes));
            second.append($('<td>').html(part.hint));
        });
        if (idx != splt.length - 1) {
            first.append($('<td>').text('/'));
            second.append($('<td>'));
        }
    });
    r.append($('<tr>')
        .append(tab)
        .append($('<td>').text(trans))
        );
}

function decompose(code) {
    if ('' == code)
        return [];
    var x = code.substring(0, 1);
    return [{
        strokes: x,
        hint: x.toLowerCase()
    }].concat(decompose(code.substring(1)));
}


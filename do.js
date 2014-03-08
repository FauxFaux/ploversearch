function start() {
    $.getJSON("dict.json", function(dict) {
        $('#search').keyup(function() {
            return doSearch(dict);
        });
    });
}

var prev='';

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

    var found = 0;
    $.each(dict, function(code, trans) {
        if (found > 100) {
            return;
        }
        if (trans.slice(0, term.length).toLowerCase() != term) {
            return;
        }
        ++found;
        r.append($('<tr>')
            .append($('<td>').html(code.replace(/\//g, '/&#8203;')))
            .append($('<td>').text(trans))
            );
    });
}

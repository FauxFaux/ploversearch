function start() {
    var prev='';
    $.getJSON("dict.json", function(dict) {
        $('#search').keyup(function() {
            term = $('#search').val().toLowerCase();
            if (term == prev) {
                return;
            }
            prev = term;
            var r = $('#result').find('tbody');
            r.empty();
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
        });
    });
}


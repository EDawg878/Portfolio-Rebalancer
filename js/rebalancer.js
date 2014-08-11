var fn = SchemeNumber.fn;

function getStockData(symbol, price, name) {
    var url = "http://query.yahooapis.com/v1/public/yql";
    var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')");


    $.getJSON(url, 'q=' + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env")
        .done(function (data) {
            price.val(data.query.results.quote.LastTradePriceOnly);
            if(!name.val()) {
                name.val(data.query.results.quote.Name);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
            $("#result").text('Request failed: ' + err);
    });
}

$("#add-row-button").click(function() {
    var row = $("#input-row").clone().appendTo("#input-table-body");
    row.find("input").val("");
    row.find("button").button("enabled");
    row.find("td").last().show().click(function() {
        $(this).parent().remove();
    });
});

$("#calculate-button").click(recalculate);

$('#accordion').on('show.bs.collapse', function () {
    $('#accordion .in').collapse('hide');
});

$(document).on('change', '.ticker', function() {
    var symbol = $(this).val();
    var price = $(this).closest('tr').find('.share-price');
    var name = $(this).closest('tr').find('.asset-name');
    getStockData(symbol, price, name);
});

function updateAssetValue(data) {
    var shares = amountToFraction($(data).val());
    var price = amountToFraction($(data).closest('tr').find('.share-price').val());
    var value = fractionToString(fn["*"](shares, price), 2, fn.round);
    $(data).closest('tr').find('.asset-value').val(value);
}

$(document).on('change', '.shares', function() {
    updateAssetValue(this);
});

$(document).on('change', '.share-price', function() {
    updateAssetValue(this);
});

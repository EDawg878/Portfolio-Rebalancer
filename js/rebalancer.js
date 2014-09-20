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

function parseManualEntry() {
    var assets = [];
    for (var f = document.getElementById("asset-input").value.split("\n"), l = 0, t = amountToFraction("0"), H = amountToFraction("0"), w = 0; w < f.length; ++w)
        if (1E5 > w && 160 > f[w].length && lineRegExp.test(f[w])) {
            var x =
                lineRegExp.exec(f[w]),
                Z = x[1],
                R = amountToFraction(x[2]),
                L = amountToFraction(x[3]),
                m = void 0;
            void 0 !== x[4] && (m = amountToFraction(x[4]));
            fn["="](0, R) ? (  alert(1) ) : void 0 !== m && fn["="](0, m) ? ( alert(2) ) : (assets.push(new Asset(l, Z, R, L, m)), t = fn["+"](t, R), H = fn["+"](H, L), ++l)
        }
    return assets;
}

$("#add-to-table-button").click(function() {
    var assets = parseManualEntry().reverse();
    var x;
    for (x in assets) {
        var asset = assets[x];
        var row = $("#input-row").clone().prependTo("#input-table-body");
        row.find("input").each(function(i) {
            if(i === 0) {
                this.setAttribute("value", asset.assetName);
            } else if(i == 2) {
                this.setAttribute("value", fractionToString(asset.sharePrice, 2, fn.round));
            } else if(i == 3) {
                this.setAttribute("value", asset.targetAllocation);
            } else if(i == 5) {
                this.setAttribute("value", fractionToString(asset.currentValue, 2, fn.round));
            } else {
                this.setAttribute("value", "");
            }
        });
        row.find("button").button("enabled");
        row.find("td").last().show().click(function() {
            $(this).parent().remove();
        });
    }
    $('.panel-collapse').collapse('hide');
    $('.panel-collapse').collapse('show');
});

$("#reset-button").click(function() {
    $("#entry-table").find('tr').slice(0, -1).remove(); // TODO fix breaking future calculations
});

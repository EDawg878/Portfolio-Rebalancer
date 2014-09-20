/*
---------- Optimal lazy rebalancing calculator:
Copyright 2013 Albert H. Mao

This program is free software: you can redistribute it and/or modify it under the terms of the
GNU General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If
not, see <http://www.gnu.org/licenses/>.
*/

var fn = SchemeNumber.fn,
    amountRegExp = /(?:^\d+\.?\d*$)|(?:^\d*\.?\d+$)/,
    htmlMinus = "&minus;";

function amountToFraction(c) {
    var d = "";
    c = c.trim();
    if (!(1 > c.length)) {
        if ("-" === c.charAt(0) || "\u2212" === c.charAt(0)) c = c.substring(1), d = "-";
        if (amountRegExp.test(c)) {
            var g = "1",
                e = c.search("\\.");
            if (0 <= e)
                for (var e = c.length - e - 1, h = 0; h < e; ++h) g += "0";
            return fn.exact(d + c.replace(".", "") + "/" + g)
        }
    }
}

function fractionToString(c, d, g, e) {
    if (void 0 !== c && fn["exact?"](c) && void 0 !== d) {
        var h = fn.exact(d);
        if (fn["integer?"](h) && !fn["<"](h, 0)) {
            void 0 === g && (g = fn.round);
            var f = fn["<"](c, 0) ? htmlMinus : "+";
            c = fn.abs(g(fn["*"](c, fn.expt("10", h))));
            if (fn["integer?"](c)) {
                for (c = fn["number->string"](c); c.length < d + 1;) c = "0" + c;
                e = f === htmlMinus || e ? f : "";
                e += c.substring(0, c.length - d);
                0 < d && (e = e + "." + c.substring(c.length - d));
                return e
            }
        }
    }
}

function Asset(c, d, g, e, h) {
    this.id = c;
    this.assetName = d;
    this.targetAllocation = g;
    this.currentValue = e;
    this.sharePrice = h;
    this.delta = amountToFraction("0");
    this.targetValue = amountToFraction("0");
    this.deviation = amountToFraction("0")
}
Asset.prototype = {
    id: null,
    assetName: null,
    targetAllocation: null,
    currentValue: null,
    sharePrice: null,
    delta: null,
    targetValue: null,
    deviation: null,
    toString: function() {
        return "" + [this.id, this.assetName, this.targetAllocation, this.currentValue, this.sharePrice, this.delta, this.deviation].join(" ")
    },
    toRowHTML: function(c, d) {
        var g = fn["+"](this.currentValue, this.delta),
            e = fn["+"](c, d),
            h = "",
            f = "";
        fn[">"](this.delta, 0) ? (h = "<span class='positive'>", f = "</span>") : fn["<"](this.delta, 0) && (h = "<span class='negative'>", f = "</span>");
        var k = [];
        k.push("<tr class='result'>");
        k.push("<td class='assetname'>" + this.assetName + "</td>");
        k.push("<td>" + (void 0 === this.sharePrice ? "" : fractionToString(this.sharePrice, 2, fn.round)) + "</td>");
        k.push("<td>" + fractionToString(this.currentValue, 2, fn.round) + "</td>");
        k.push("<td>" + (fn["zero?"](d) ? "" : fractionToString(fn["*"]("100", fn["/"](this.currentValue, d)), 1, fn.round) + "%") + "</td>");
        k.push("<td>" + fractionToString(fn["*"]("100", fn["/"](g, e)), 1, fn.round) + "%</td>");
        k.push("<td>" + fractionToString(fn["*"]("100", this.targetAllocation),
            1, fn.round) + "%</td>");
        k.push("<td>" + h + fractionToString(this.delta, 2, fn.truncate, !0) + f + "</td>");
        k.push("<td>" + h + (void 0 === this.sharePrice ? "" : fractionToString(fn["/"](this.delta, this.sharePrice), 2, fn.truncate, !0)) + f + "</td>");
        k.push("</tr>");
        return k.join("")
    }
};

function deviationComparator(c, d) {
    return fn["<"](c.deviation, d.deviation) ? -1 : fn[">"](c.deviation, d.deviation) ? 1 : 0
}

function optimalLazyRebalance(c, d) {
    d = d.slice(0);
    var g = c;
    d.forEach(function(c) {
        g = fn["+"](g, c.currentValue)
    });
    d.forEach(function(c) {
        c.targetValue = fn["*"](g, c.targetAllocation);
        c.deviation = fn["-"](fn["/"](c.currentValue, c.targetValue), amountToFraction("1"))
    });
    var e = deviationComparator;
    fn["<"](c, 0) && (e = function(c, d) {
        return -deviationComparator(c, d)
    });
    d.sort(e);
    for (var h = amountToFraction("0"), f = c, k, e = e = 0; e < d.length && fn[">"](fn.abs(f), 0); ++e) {
        k = d[e].deviation;
        var h = fn["+"](h, d[e].targetValue),
            l = e >= d.length -
            1 ? amountToFraction("0") : d[e + 1].deviation,
            t = fn["*"](h, fn["-"](l, k));
        fn["<="](fn.abs(t), fn.abs(f)) ? (f = fn["-"](f, t), k = l) : (k = fn["+"](k, fn["/"](f, h)), f = amountToFraction("0"))
    }
    for (h = 0; h < e; ++h) d[h].delta = fn["*"](d[h].targetValue, fn["-"](k, d[h].deviation));
    return k
}
var lineRegExp = /^(.+?)\s+((?:\d+\.?\d*)|(?:\d*\.?\d+))%?\s+[\$]?((?:\d+\.?\d*)|(?:\d*\.?\d+))(?:\s+[\$]?((?:\d+\.?\d*)|(?:\d*\.?\d+)))?\s*$/;

function danger(message) {
    return "<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>" + message + "</div>";
}

function warning(message) {
    return "<div class='alert alert-warning alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>" + message + "</div>";
}

function info(message) {
    return "<div class='alert alert-info alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>" + message + "</div>";
}

function isContribution() {
    var clazz = document.getElementById("radio-1").getAttribute("class");
    var end = clazz.substring(clazz.lastIndexOf(" ") + 1);
    return end == "active";
}

function isWithdraw() {
    var clazz = document.getElementById("radio-2").getAttribute("class");
    var end = clazz.substring(clazz.lastIndexOf(" ") + 1);
    return end == "active";}

function recalculate() {
    var valid = true;
    var body = document.getElementById("results-body");
    while (null !== body.firstChild) body.removeChild(body.firstChild);
    var input = document.getElementById("contribution-input");
    var amount = amountToFraction(input.value);
    var notifications = "";

    if(fn["negative?"](amount)) {
        if(isContribution()) {
            notifications += danger("<strong>Error:</strong> Contribution amount cannot be negative.");
        } else if(isWithdraw()) {
            notifications += danger("<strong>Error:</strong> Withdrawal amount cannot be negative.");
        }
        valid = false;
    }

    if(isWithdraw()) {
        amount = fn["-"](amount);
    }

    if (void 0 == amount || fn["="](0, amount)) notifications += danger("<strong>Error:</strong> Invalid contribution amount."), valid = false;

    // old code removed here

    var val = parseAssets(amount);
    var assets = val[0];
    notifications += val[1];

    var sum = sumValues(assets);

    var p = document.createElement("p");
    p.setAttribute("id", "console");
    p.innerHTML = notifications;
    body.appendChild(p);

    if(assets.length == 0) return;

    if (valid) {
        p.innerHTML += info("<strong>Note:</strong> Buy and sell values are rounded towards zero.");
        optimalLazyRebalance(amount,assets);
        var table = document.createElement("table");
        table.setAttribute("id", "results-table");
        table.setAttribute("class", "table");
        var M = [];
        M.push("<thead>");
        M.push("<tr><th id='asset-name'>Asset name</th><th id='share-price'>Share price</th><th id='initial-value'>Initial value</th><th id='initial-portion'>Initial portion</th><th id='final-portion'>Final portion</th><th id='target-allocation'>Target allocation</th><th id='amount-column'>Amount to <span class='positive'>+Buy</span>&nbsp;or&nbsp;<span class='negative'>" + htmlMinus + "Sell</span></th><th id='shares-column'>Shares to <span class='positive'>+Buy</span>&nbsp;or&nbsp;<span class='negative'>" +
            htmlMinus + "Sell</span></th></tr>");
        M.push("</thead>\n<tbody>");
        assets.forEach(function(c) {
            M.push(c.toRowHTML(amount, sum))
        });
        M.push("</tbody>");
        table.innerHTML = M.join("\n");
        body.appendChild(table);
    }
}

function parseAssets(amount) {
    var assets = [];
    var targetSum = amountToFraction("0");
    var valueSum = amountToFraction("0");
    var notifications = "";
    var i = 0;
    var j = 0;
    $('#entry-table tr').each(function(){
        if(i++ == 0) return;
        var row = $(this);
        var name = $(row).find('.asset-name').val();
        var ticker = $(row).find('.ticker').val();
        var price = $(row).find('.share-price').val();
        var target = $(row).find('.target-allocation').val();
        var shares = $(row).find('.shares').val();
        var value = $(row).find('.asset-value').val();
        if(! name || ! target || ! value || ! price) return;
        target = amountToFraction(target);
        value = amountToFraction(value);
        price = amountToFraction(price);
        if(fn["="](0,target)) {
            notifications += warning("Asset " + name + " has a target allocation of zero and was ignored.");
        } else if(fn["="](0,price)) {
            notifications += warning("Asset " + name + " has a share price of zero and was ignored.")
        } else {
            targetSum = fn["+"](targetSum, target);
            valueSum = fn["+"](valueSum, value);
            assets.push(new Asset(j++, name, target, value, price));
        }
    });
    if(!fn["="]("100", targetSum)) {
        notifications = danger("Total target allocation does not equal 100%.");
        assets = [];
    } else if(fn["negative?"](amount) && fn[">="](fn["abs"](amount), valueSum)) {
        notifications = danger("Withdrawal amount is greater than or equal to portfolio value.");
        assets = [];
    }
    return [assets, notifications];
}

function sumValues(assets) {
    var sum = amountToFraction("0");
    for (var i in assets) {
        var asset = assets[i];
        sum = fn["+"](sum, asset.currentValue);
    }
    return sum;
}

recalculate();

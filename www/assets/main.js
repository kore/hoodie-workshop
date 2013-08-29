// Initialize Hoodie
var hoodie  = new Hoodie()

// Initial load of all payment items from the store
function refreshViews() {
  hoodie.store.findAll('payment').then( function(payments) {
    // Refresh Users view
    renderAggregateView(
      _.map(
        _.groupBy(
          payments,
          function (payment) {
            return payment.user;
          }
        ),
        sumUpPayments
      ),
      "#userPayments"
    );

    // Refresh Events view
    renderAggregateView(
      _.map(
        _.groupBy(
          payments,
          function (payment) {
            return payment.event;
          }
        ),
        sumUpPayments
      ),
      "#eventPayments"
    );

    // Refresh most recent paied view
    renderPaymentsView(
      _.sortBy(
        _.filter(
          payments,
          function (payment) {
            return payment.state === "paied";
          }
        ),
        function (a, b) {
          return a.createdAt - b.createdAt;
        }
      ),
      "#recentlyPaied"
    );
  });
}
refreshViews();

// When a new payment gets stored, add it to the UI
hoodie.store.on('add:payment', refreshViews)
// Clear payment list when the get wiped from store
hoodie.account.on(
  'signout',
  function() {
    $('#paymentTable tbody').html('');
  }
);

// Handle creating a new payment
$('#paymentForm').on('submit', function(event) {
  hoodie.store.add(
    'payment', {
      user:  $(event.target).find("input[name='user']").val(),
      event: $(event.target).find("input[name='event']").val(),
      value: parseFloat($(event.target).find("input[name='value']").val(), 10),
      state: "open"
  });

  $(event.target).find("input").val("");

  event.preventDefault();
  return false;
});

// Bootstrap code to activate tabs in view
$('#paymentTabs a').click(function (event) {
  $(this).tab('show');
  event.preventDefault();
  return false
});

function renderAggregateView(aggregatePayments, table) {
  $(table + ' tbody').html("");
  _.map(
    aggregatePayments,
    function(aggregatePayment) {
      $(table + ' tbody').append('<tr>' +
        '<td>' + aggregatePayment.name + '</td>' +
        '<td>' + aggregatePayment.open.toFixed(2) + '€</td>' +
        '<td>' + aggregatePayment.paied.toFixed(2) + '€</td>' +
      '</tr>');
    }
  );
}

function renderPaymentsView(payments, table) {
  $(table + ' tbody').html("");
  _.map(
    payments,
    function(payment) {
      $(table + ' tbody').append('<tr>' +
        '<td>' + payment.user + '</td>' +
        '<td>' + payment.event + '</td>' +
        '<td>' + payment.value.toFixed(2) + '€</td>' +
        '<td class="' + payment.state + '">' + payment.state + '</td>' +
      '</tr>');
    }
  );
}

function sumUpPayments(payments, context) {
  return _.reduce(
    _.flatten(
      _.toArray(
        _.groupBy(
          payments,
            function (payment) {
            return payment.state;
          }
        )
      )
    ),
    function (result, payment) {
      result[payment.state] += payment.value;
      return result;
    },
    {name: context, open: 0, paied: 0}
  );
}


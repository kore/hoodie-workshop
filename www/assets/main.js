// initialize Hoodie
var hoodie  = new Hoodie()

// initial load of all payment items from the store
hoodie.store.findAll('payment').then( function(payments) {
  payments.sort( sortByCreatedAt ).forEach( addPayment )
})

// when a new payment gets stored, add it to the UI
hoodie.store.on('add:payment', addPayment)
// clear payment list when the get wiped from store
hoodie.account.on('signout', clearPayments)

// handle creating a new task
$('#paymentForm').on('submit', function(event) {
  hoodie.store.add(
    'payment', {
      user:  $(event.target).find("input[name='user']").val(),
      event: $(event.target).find("input[name='event']").val(),
      value: parseFloat($(event.target).find("input[name='value']").val(), 10),
      state: "open"
  });

  $(event.target).find("input").val("");

  event.preventDefault(false);
  return false;
})

function addPayment( payment ) { 
  $('#paymentTable tbody').append('<tr>' +
    '<td>' + payment.user + '</td>' +
    '<td>' + payment.event + '</td>' +
    '<td>' + payment.value.toFixed(2) + '</td>' +
    '<td class="' + payment.state + '">' + payment.state + '</td>' +
  '</tr>');
}
function clearPayments() {
  $('#paymentTable tbody').html('');
}
function sortByCreatedAt(a, b) { 
  return a.createdAt > b.createdAt
}

var KioskEvent = Parse.Object.extend("Event");
var SuggestedPayment = Parse.Object.extend("SuggestedPayment");

var KioskRouter = Backbone.Router.extend({
	routes: {
		"event/:eventid/payments": "payments",
		"events": "events",
		"events/create": "createEvent",
		"events/:event_id/edit": "editEvent",
		"*actions": "defaultRoute"
	},

	defaultRoute: function() {
		window.app.navigate('events', { trigger: true });
	},

	payments: function(eventid) {
		var eventQuery = new Parse.Query("Event");
		var myevent = null;
		eventQuery.get(eventid, {
			success: function(object) {
    			// object is an instance of Parse.Object.
    			myevent = object;

    			var query = new Parse.Query("Payment");
				query.include("event");
				query.include("greeting");
				query.equalTo("event", myevent);
				query.find({
					success: function(results) {
						var paymentCollection = new Parse.Collection(results);

						var paymentsView = new PaymentsView({
							childView: PaymentView,
							collection: paymentCollection,
							model: myevent,
						});
						window.appLayout.app.show(paymentsView);
					},
					error: function(error) {
						alert("Error: " + error.code + " " + error.message);
					}
				});
  			},
  			error: function(object, error) {
    			// error is an instance of Parse.Error.
    			alert("Error: " + error.code + " " + error.message);
  			}
		});

		// var Event = Parse.Object.extend("Event");
		// var myevent = new Event();
		// myevent.id = eventid;
	},

	events: function() {
		var currentUser = Parse.User.current();
		if (currentUser) {

	    	// Get all the events for the current user
			var query = new Parse.Query(KioskEvent);
			query.equalTo("user", currentUser);
			query.find({
				success: function(results) {
					var eventCollection = new Parse.Collection(results);

					var eventsView = new EventsView({
						childView: EventView,
						collection: eventCollection,
					});

					window.appLayout.app.show(eventsView);
				},
				error: function(error) {
				    alert("Error: " + error.code + " " + error.message);
				}
			});

		} else {
	    	// show the signup or login page
	    	window.location.href = "index.html";
	    }
	},

	createEvent: function() {
		var newEvent = new KioskEvent();
		newEvent.set({user: Parse.User.current()});
		window.appLayout.app.show(new CreateView({model: newEvent}));
	},

	editEvent: function(eventId) {
		var query = new Parse.Query(KioskEvent);
		query.get(eventId).then(function(eventToEdit) {
			var spQuery = new Parse.Query(SuggestedPayment);
			spQuery.equalTo('event', eventToEdit);
			return spQuery.find().then(function(suggestedPayments){
				return eventToEdit.set({suggestedPayments: new Parse.Collection(suggestedPayments)});
			});
		}).then(function(eventToEdit){
			window.appLayout.app.show(new EditView({model: eventToEdit}));
		});
	}
});

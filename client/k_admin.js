Template.kAdmin.helpers({
	collections: function() {
		return _.keys( Template.instance().config.collections );
	},
	collection: function() {
		return Template.instance().config.collections[Template.instance().currentCollection.get()];
	},
	panelName: function() {
		return Template.instance().config.name || 'Admin';
	},
	currentlyManaging: function() {
		return Template.instance().currentCollection.get() || 'Choose module';
	},
	currentCollection: function() {
		return Template.instance().currentCollection.get();
	},
	rows: function() {
		return eval(Template.instance().currentCollection.get()).find().fetch();
	},
	getAttrs: function(keys) {
		//console.log( _.pluck(keys, 'name') )
		var self = this;
		return _.map(_.pluck(keys, 'name'), function(key){
			return self[key]
		})
	},
	actionCenter: function() {
		return Template.instance().action.get();
	},
	actionCenterCheck: function(action) {
		return Template.instance().action.get() == action;
	},
	currentDoc: function() {
		return Template.instance().currentDoc;
	},
	deleteSuccess: function() {
		var action = Template.instance().action;
		return function() {
			action.set();
			toastr.success('Action completed');
		}
	},
	deleteError: function() {
		return function (error) { 
			toastr.error(error); 
			console.log(error); 
		};
	}
});

Template.kAdmin.events({
	'click #kAdminSelector a': function(e, instance) {
		instance.currentCollection.set( $(e.target).data('collection') );
	},
	'click .action': function(e, instance) {
		// console.log( $(e.target).data('action'), this )
		instance.currentDoc = this;
		instance.action.set( $(e.target).data('action') );
	},
	'click #cancelAction': function(e, instance) {
		instance.action.set();
	}
});

Template.kAdmin.created = function() {
	var instance = this;
	//console.log('[kAdmin] created: ', kAdminConfig.collections);
	instance.config = kAdminConfig;
	instance.currentCollection = new ReactiveVar();
	instance.action = new ReactiveVar();
	instance.currentDoc;

	instance.autorun(function() {
		if( instance.currentCollection.get() != undefined ) {
			// If the current collection is set, subscribe to it
			if( instance.subscription != undefined ) {
				//console.log(instance.subscription)
				// Stop previous subscription, if any.
				instance.subscription.stop();
				// Set current action to none.
				instance.action.set();
			}
			instance.subscription = Meteor.subscribe('kAdminSubscribe', instance.currentCollection.get())
		}
		//var collections = collections.loaded.get();
	});
}

Template.kAdmin.rendered = function() {
	AutoForm.hooks({
		// Rolling with the same ID for all forms currently.
		kAdminForm: {
			onSuccess: function(operation, result, template) {
				$("#cancelAction").trigger('click');
				toastr.success('Action completed');
			},
			onError: function(operation, error, template) {
				console.log(error)
				toastr.error(error)
			}
		}
	});
}

Template.kAdmin.destroyed = function() {
}
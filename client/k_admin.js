Template.kAdmin.helpers({
	// Essentials, seting up collections, active collection, etc
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
	loading: function() {
		return Template.instance().loading.get()
	},
	// Printing the table.
	rows: function() {
		return eval(Template.instance().currentCollection.get()).find().fetch();
	},
	getAttrs: function(cols) {
		var self = this;
		return _.map(cols, function(col){
			keys = _.pick(col, 'name', 'collection', 'collection_property');
			if(keys['collection'] == undefined) {
				// If it does not have an aux collection
				return self[ keys['name'] ]
			} else {
				// If it has an aux collection
				if( self[keys['name']] instanceof Array ) {
					// One to many
					return _.map(
						eval(keys['collection']).find({ _id: { $in: self[keys['name']] } }).fetch(),
						function(foreign_entity) {
							return foreign_entity[keys['collection_property']];
						}
					).join(', ');
				} else {
					// One to one
					return eval(keys['collection']).findOne({ _id: self[keys['name']] })[keys['collection_property']];
				}
			}
		});
	},
	searchable: function(column) {
		// Currently only test search. Foreign-key search could be added later. Need to check.
		return !column.hasOwnProperty('collection');
	},
	// CRUD
	actionCenter: function() {
		return Template.instance().action.get();
	},
	actionCenterCheck: function(action) {
		return Template.instance().action.get() == action;
	},
	currentDoc: function() {
		return Template.instance().currentDoc.get();
	},
	formattedCurrentDoc: function() {
		return JSON.stringify( Template.instance().currentDoc.get(), null, '\t');
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
	},
	// Pagination
	totalRows: function() {
		return Counts.get('currentCollectionCount');
	},
	next: function() {
		return ( Template.instance().pagination.get('skip') + Template.instance().pagination.get('limit') ) <= Counts.get('currentCollectionCount');
	},
	prev: function() {
		return Template.instance().pagination.get('skip') != 0;
	},
	rowsPageStart: function() {
		return Template.instance().pagination.get('skip') + 1;
	},
	rowsPageEnd: function() {
		if( Template.instance().pagination.get('skip') + Template.instance().pagination.get('limit') > Counts.get('currentCollectionCount') )
			return Counts.get('currentCollectionCount');
		else
			return Template.instance().pagination.get('skip') + Template.instance().pagination.get('limit');
	},
});

Template.kAdmin.events({
	// Collection selector
	'click #kAdminSelector a': function(e, instance) {
		instance.currentCollection.set( $(e.target).data('collection') );
		instance.pagination.set('skip', 0);
		instance.pagination.set('limit', instance.perPage.get());
		instance.filters.set();
		$('.filters').val('');
	},
	// CRUD action trigger
	'click .action': function(e, instance) {
		// console.log( $(e.target).data('action'), this )
		instance.currentDoc.set(this);
		instance.action.set( $(e.target).data('action') );
		$('html, body').animate({
			scrollTop: $('#kAdminActionCenter').offset().top
		}, 700);
	},
	// Cancel trigger
	'click #cancelAction': function(e, instance) {
		instance.action.set();
	},
	// Pagination
	'click #next': function(e, instance) {
		instance.pagination.set('skip', instance.pagination.get('skip') + instance.perPage.get())
	},
	'click #prev': function(e, instance) {
		instance.pagination.set('skip', instance.pagination.get('skip') - instance.perPage.get())
	},
	//Filtering
	'change .filters, click #filterTrigger': function(e, instance) {
		var filter = {};
		$('.filters').each(function(index, field) {
			if( $(field).val() ) {
				filter[$(field).attr('name')] = $(field).val();
			}
		});
		instance.filters.set( JSON.stringify(filter) );
		console.log( instance.filters.get() )
	}
});

Template.kAdmin.created = function() {
	var instance = this;
	//console.log('[kAdmin] created: ', kAdminConfig.collections);
	instance.config = kAdminConfig;
	instance.currentCollection = new ReactiveVar('');
	instance.action = new ReactiveVar();
	instance.currentDoc = new ReactiveVar();
	// Next/Prev increments/decrements skip by this value.
	instance.perPage = new ReactiveVar(10);
	instance.loading = new ReactiveVar(true);

	// Use for pagination
	instance.pagination = new ReactiveDict;
	instance.pagination.set('skip', 0);
	instance.pagination.set('limit', instance.perPage.get());

	// Filtering - ReactiveDict did not work too well. Will revisit this once I've used it a bit more elsewhere.
	instance.filters = new ReactiveVar();

	instance.autorun(function() {
		if( instance.currentCollection.get() != '' ) {
			// If the current collection is set, subscribe to it
			instance.loading.set(true);
			if( instance.subscription != undefined ) {
				//console.log(instance.subscription)
				// Stop previous subscription, if any.
				instance.subscription.stop();
				// Set current action to none.
				instance.action.set();
			}
			instance.subscription = Meteor.subscribe(
				'kAdminSubscribe', // Publisher
				instance.currentCollection.get(), // Collection name
				instance.filters.get(),// Add filters here - fields: { field_name: 1 }
				{ skip: instance.pagination.get('skip'), limit: instance.pagination.get('limit') }, // Pagination
				function(ready){
					//console.log('Total count:', instance.pagination.keys )
					instance.loading.set(false);
				}
			);
		} else {
			instance.loading.set(false);
		}
	});
}

Template.kAdmin.rendered = function() {
	AutoForm.hooks({
		// Rolling with the same ID for all forms currently.
		kAdminForm: {
			onSuccess: function(operation, result, template) {
				$('#cancelAction').trigger('click');
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
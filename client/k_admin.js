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
		return window[ Template.instance().currentCollection.get() ].find().fetch();
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
					function index(obj,i) {return obj[i]};
					return _.map(
						window[ keys['collection'] ].find({ _id: { $in: self[keys['name']] } }).fetch(),
						function(foreign_entity) {
							try {
								return keys['collection_property'].split('.').reduce(index, foreign_entity);
							} catch(e) {
								return '';
							}
							//return foreign_entity[keys['collection_property']];
						}
					).join(', ');
				} else {
					// One to one
					// Dot notation to object.
					function index(obj,i) {return obj[i]};
					try {
						return keys['collection_property'].split('.').reduce(index, window[ keys['collection'] ].findOne({ _id: self[keys['name']] }));
					} catch(e) {
						return '';
					}
				}
			}
		});
	},
	searchable: function(column) {
		// Currently only text search. Foreign-key search could be added later. Need to check.
		return !column.hasOwnProperty('collection');
	},
	sortable: function(column) {
		// Currently only own field search. Foreign-key sort could be added later. Need to check. lept separate from searchable as that feature might be possible before this.
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
	// Sorting
	fieldBeingSorted: function(field) {
		return field == Template.instance().sort.get('field')
	},
	sortIcon: function() {
		return parseInt(Template.instance().sort.get('order'))===1?'glyphicon glyphicon-chevron-up':'glyphicon glyphicon-chevron-down';
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
		instance.sort.set('field');
		instance.sort.set('order', 1);
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
	//Sort
	'click .sortable': function(e, instance) {
		if( instance.sort.get('field') == $(e.target).attr('id') ) {
			instance.sort.set('order', instance.sort.get('order') * -1 );
			instance.pagination.set('skip', 0); // Set page number to 1
		} else {
			instance.sort.set('field', $(e.target).attr('id'))
			instance.pagination.set('skip', 0); // Set page number to 1
		}
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
	}
});

Template.kAdmin.created = function() {
	var instance = this;
	if( typeof kAdminConfig != 'undefined' ) {
		instance.config = kAdminConfig;
	} else {
		instance.config = {
			name: 'Please Configure',
			collections: {}
		}
	}

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

	// Use for sort
	instance.sort = new ReactiveDict;
	instance.sort.set('field');
	instance.sort.set('order', 1);

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
			var sort = {};
			if( instance.sort.get('field') ) {
				sort[ instance.sort.get('field') ] = parseInt( instance.sort.get('order') );
			}

			instance.subscription = Meteor.subscribe(
				'kAdminSubscribe', // Publisher
				instance.currentCollection.get(), // Collection name
				instance.filters.get(),// Filters here
				{ 
					skip: instance.pagination.get('skip'), 
					limit: instance.pagination.get('limit'), 
					sort: sort
				}, // Pagination and sort
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
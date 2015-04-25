Template.kAdminPanel.helpers({
	// Essentials, seting up collections, active collection, etc
	collections: function() {
		return _.keys( Template.instance().config.collections );
	},
	getVerbose: function(collectionName) {
		if( 'Choose module' == collectionName )
			return collectionName;
		return Template.instance().config.collections[collectionName].hasOwnProperty("verbose")?Template.instance().config.collections[collectionName].verbose:collectionName;
	},
	collection: function() {
		if( Template.instance().config )
			return Template.instance().config.collections[Template.instance().currentCollection.get()];
	},
	panelName: function() {
		return Template.instance().config.name || 'Admin';
	},
	currentlyManaging: function() {
		return Template.instance().currentCollection.get() || 'Choose module';
	},
	currentCollection: function() {
		if( Template.instance().currentCollection.get() == 'Meteor.users' )
			return "Meteor.users";
		else
			return Template.instance().currentCollection.get();
	},
	loading: function() {
		return Template.instance().loading.get()
	},
	// Printing the table.
	rows: function() {
		if( Template.instance().currentCollection.get() == 'Meteor.users' )
			return Meteor.users.find().fetch()
		else
			return window[ Template.instance().currentCollection.get() ].find().fetch();
	},
	getAttrs: function(cols) {
		var self = this;
		return _.map(cols, function(col){
			keys = _.pick(col, 'name', 'collection', 'collection_property', 'dateFormat', 'dateUnix', 'dontSort', 'collection_helper', 'dateUTC');
			if(keys['collection'] == undefined) {
				// If it does not have an aux collection, return value
				if( keys['dateFormat'] == undefined )
					return self[ keys['name'] ]
				else {
					if( self[ keys['name'] ] ) {
						// If value is set, return time in user preferred format.
						if( keys['dateUTC'] == true ) {
							if( keys['dateUnix'] == true )
								return moment.unix( self[ keys['name'] ] ).format( keys['dateFormat'] )
							else
								return moment( self[ keys['name'] ] ).format( keys['dateFormat'] )
						} else {
							if( keys['dateUnix'] == true )
								return moment.utc( self[ keys['name'] ] * 1000 ).format( keys['dateFormat'] )
							else
								return moment.utc( self[ keys['name'] ] ).format( keys['dateFormat'] )
						}
					}
				}
			} else {
				// If it has an aux collection
				if( keys.hasOwnProperty('collection_helper') ) {
					// substr stuff because yogiben:admin uses function.
					return self[ keys['collection_helper'].substr( 0, keys['collection_helper'].length - 2 ) ]()
				}
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
		// Even dates cannot be filtered currently. needs lot more work like range, before, after, etc, possibly 0.3
		return !(column.hasOwnProperty('collection') || column.hasOwnProperty('dateFormat') );
	},
	sortable: function(column) {
		// Currently only own field search. Foreign-key sort could be added later. Need to check. lept separate from searchable as that feature might be possible before this.
		return !(column.hasOwnProperty('collection') || column.hasOwnProperty('dontSort') );
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
	perPage: function() {
		return Template.instance().pagination.get('limit')
	},
	pageNumber: function() {
		return ( Template.instance().pagination.get('skip') / Template.instance().pagination.get('limit') ) + 1
	},
	perPageSelect: function(val) {
		return ( parseInt(Template.instance().pagination.get('limit')) == val)?'selected':'';
	},
	totalRows: function() {
		return Counts.get('currentCollectionCount');
	},
	next: function() {
		return ( Template.instance().pagination.get('skip') + Template.instance().pagination.get('limit') ) <= Counts.get('currentCollectionCount');
	},
	pages: function() {
		return _.range(1, Counts.get('currentCollectionCount') / Template.instance().pagination.get('limit') + 1 )
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
	omitFieldsForEdit: function() {
		var globalOmit = [];
		if( Template.instance().config.hasOwnProperty('autoForm') )
			if( Template.instance().config.autoForm.hasOwnProperty('omitFields') )
				var globalOmit = Template.instance().config.autoForm.omitFields;
		if( Template.instance().config.collections[Template.instance().currentCollection.get()].hasOwnProperty('omitFields') ) {
			var omit = Template.instance().config.collections[Template.instance().currentCollection.get()].omitFields;
			if( omit.hasOwnProperty('edit') )
				return _.union( omit.edit, globalOmit )
			else
				return _.union( omit, globalOmit )
		}
	},
	omitFieldsForCreate: function() {
		var globalOmit = [];
		if( Template.instance().config.hasOwnProperty('autoForm') )
			if( Template.instance().config.autoForm.hasOwnProperty('omitFields') )
				var globalOmit = Template.instance().config.autoForm.omitFields;
		if( Template.instance().config.collections[Template.instance().currentCollection.get()].hasOwnProperty('omitFields') ) {
			var omit = Template.instance().config.collections[Template.instance().currentCollection.get()].omitFields;
			if( omit.hasOwnProperty('new') )
				return _.union( omit.new, globalOmit )
			else
				return _.union( omit, globalOmit )
		}
	},
	randomId: function() {
		return "randomIdForAutoForm" + Math.ceil( Math.random() * 10000 )
	}
});

Template.kAdminPanel.events({
	// Collection selector
	'click #kAdminSelector a': function(e, instance) {
		instance.currentCollection.set( $(e.target).data('collection') );
		instance.pagination.set('skip', 0);
		instance.pagination.set('limit', 10);
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
		instance.pagination.set( 'skip', instance.pagination.get('skip') + instance.pagination.get('limit'))
	},
	'click #prev': function(e, instance) {
		instance.pagination.set( 'skip', instance.pagination.get('skip') - instance.pagination.get('limit'))
	},
	'click #perPageSelect a': function(e, instance) {
		instance.pagination.set( 'limit', parseInt( $(e.target).text() ) )
		instance.pagination.set( 'skip', 0)
	},
	'click #pageNumberSelect a': function(e, instance) {
		instance.pagination.set( 'skip', ( parseInt( $(e.target).text() ) - 1 ) * instance.pagination.get('limit') )
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
		instance.pagination.set('skip', 0);
		instance.filters.set( JSON.stringify(filter) );
	},
	'click #filterReset': function(e, instance) {
		$('.filters').val('')
		$('#filterTrigger').trigger('click')
	}
});

Template.kAdminPanel.created = function() {
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
	// instance.perPage = new ReactiveVar(10);
	instance.loading = new ReactiveVar(true);

	// Use for pagination
	instance.pagination = new ReactiveDict;
	instance.pagination.set('skip', 0);
	instance.pagination.set('limit', 10 );

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

Template.kAdminPanel.rendered = function() {
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

Template.kAdminPanel.destroyed = function() {
}
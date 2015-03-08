Meteor.publishComposite('kAdminSubscribe', function(collection, filters, pagination){
	//console.log( collection, filters, pagination )
	if ( Roles.userIsInRole(this.userId, ['admin']) ) {
		if( _.keys( kAdminConfig.collections ).indexOf(collection) > -1 ) {
			// If requested collection is a key in kAdminConfig
			return {
				find: function() {
					if( filters == null )
						filters = {}
					else {
						filters = JSON.parse(filters);
						_.each(filters, function(value, index){
							filters[index] = global[collection].simpleSchema()._schema[index].type(value);
						})
					}
					
					Counts.publish(this, 'currentCollectionCount', global[collection].find( filters ), { noReady: true });
					aux_collections = _.compact(_.map(kAdminConfig.collections[collection].tableColumns, function(field){
						if(field.collection)
							return { 'collection': field.collection, 'property': field.collection_property, 'name': field.name }
					}));
					return global[collection].find(filters, pagination);
				},
				children: [
					{
						find: function(primary) {
							//return _.each(aux_collections, function(aux){
								// TBD: Loop through aux_collections if multiple relations are set.
								// Return only the requested field.
								if( aux_collections.length > 0 ) {
									if( primary[aux_collections[0].name] instanceof Array ) {
										// One to Many
										if( aux_collections[0].collection != 'Meteor.users' ) {
											return global[aux_collections[0].collection].find(
												{ _id: { $in: primary[aux_collections[0].name] } }
											);
										} else {
											return Meteor.users.find(
												{ _id: { $in: primary[aux_collections[0].name] } }
											);
										}
									} else {
										if( aux_collections[0].collection != 'Meteor.users' ) {
											return global[aux_collections[0].collection].find(
												{ _id: primary[aux_collections[0].name] }
											);
										} else {
											return Meteor.users.find(
												{ _id: primary[aux_collections[0].name] }
											);
										}
									}
								}
							//})
						}
					}
				]
			}
		} else {
			console.log('Invalid request yo!')
			this.stop();
			return;
		}
		console.log('Non admin user.');
		this.stop();
		return;
	}
});
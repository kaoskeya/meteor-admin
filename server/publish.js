Meteor.publishComposite('kAdminSubscribe', function(collection, filter, pagination){
	if ( Roles.userIsInRole(this.userId, ['admin']) ) {
		if( _.keys( kAdminConfig.collections ).indexOf(collection) > -1 ) {
			// If requested collection is in kAdminConfig
			return {
				find: function() {
					// eval below, but we've already checked for the collection name match and also admin user level. Can be better.
					Counts.publish(this, 'currentCollectionCount', eval(collection).find(), { noReady: true });
					aux_collections = _.compact(_.map(kAdminConfig.collections[collection].tableColumns, function(field){
						if(field.collection)
							return { 'collection': field.collection, 'property': field.collection_property, 'name': field.name }
					}));
					return eval(collection).find({}, pagination);
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
										return eval(aux_collections[0].collection).find(
											{ _id: { $in: primary[aux_collections[0].name] } }
										);
									} else {
										return eval(aux_collections[0].collection).find(
											{ _id: primary[aux_collections[0].name] }
										);
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
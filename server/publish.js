Meteor.publishComposite('kAdminSubscribe', function(collection, filters, pagination){
	// console.log( collection, filters, pagination )
	var self = this;
	if ( Roles.userIsInRole(self.userId, kAdminConfig.roles || ['admin'] ) ) {
		if( _.keys( kAdminConfig.collections ).indexOf(collection) > -1 ) {
			// If requested collection is a key in kAdminConfig
			return {
				find: function() {
					if( filters == null )
						filters = {}
					else {
						filters = JSON.parse(filters);
						_.each(filters, function(value, index){
							if( kAdminConfig.collections[collection].hasOwnProperty("searchType") && kAdminConfig.collections[collection].searchType.hasOwnProperty(index) ) {
								var specialSearch = kAdminConfig.collections[collection].searchType[index];
								switch( specialSearch ) {
									case "regex":
										filters[index] = { $regex: global[collection].simpleSchema()._schema[index].type(value) };
										break;
									case "regex-ci":
										filters[index] = { $regex: global[collection].simpleSchema()._schema[index].type(value), "$options": "i" };
										break;
									default:
										filters[index] = global[collection].simpleSchema()._schema[index].type(value);
										break;
								}
							}
							else {
								filters[index] = global[collection].simpleSchema()._schema[index].type(value);
							}
						})
					}

					if( collection == "Meteor.users" )
						var coll = Meteor.users
					else
						var coll = global[collection]

					Counts.publish(this, 'currentCollectionCount', coll.find( filters ), { noReady: true });
					aux_collections = _.compact(_.map(kAdminConfig.collections[collection].tableColumns, function(field) {
						if(field.collection)
							return { 'collection': field.collection, 'property': field.collection_property, 'name': field.name }
					}));
					return coll.find(filters, pagination);
				},
				children: [
					{
						find: function(primary) {
							a = _.map(aux_collections, function(aux){
								// TBD: Loop through aux_collections if multiple relations are set.
								// Return only the requested field.
								if( primary[aux.name] instanceof Array ) {
									// One to Many
									if( aux.collection != 'Meteor.users' ) {
										return global[aux.collection].find(
											{ _id: { $in: primary[aux.name] } }
										);
									} else {
										return Meteor.users.find(
											{ _id: { $in: primary[aux.name] } }
										);
									}
								} else {
									if( aux.collection != 'Meteor.users' ) {
										return global[aux.collection].find(
											{ _id: primary[aux.name] }
										);
									} else {
										return Meteor.users.find(
											{ _id: primary[aux.name] }
										);
									}
								}
							})
							return a[0];
						}
					},
					{
						find: function(primary) {
							if( a.length > 1 ) {
								return a[1]
							}
						}
					},
					{
						find: function(primary) {
							if( a.length > 2 ) {
								return a[2]
							}
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
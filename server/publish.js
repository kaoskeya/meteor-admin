Meteor.publish('kAdminSubscribe', function(collection){
	// Check if collection is a string
	check(collection, String);
	if ( Roles.userIsInRole(this.userId, ['admin']) ) {
		// If is admin - TOD: User levels
		// console.log( 'Someone asked for', collection );
		if( _.keys( kAdminConfig.collections ).indexOf(collection) > -1 ) {
			// If requested collection is in kAdminConfig
			// Yes eval is dangerous, but we've already checked for the collection name match and also admin user level. Can be better.
			return eval(collection).find();
		} else {
			console.log('Invalid request yo!')
			this.stop();
			return;
		}
	}
})
// Meteor.users updation and other methods here.
// TBD: Create user, Update user, Change user password, Send enrollment email

Meteor.methods({
	kAdminSetUserPassword: function(userId, newPassword) {
		console.log( Meteor.userId(), this.userId )
		if ( Roles.userIsInRole(this.userId, ['admin']) ) {
			Accounts.setPassword(userId, newPassword)
		}
	}
})
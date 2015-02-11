# meteor-admin
`$ meteor add kaoskeya:admin`

**Loads of updates in the upcoming days. Ideally a feature a day. Will accept PRs.**

Heavily uses [autoform](https://github.com/aldeed/meteor-autoform).
[yogiben:admin](https://github.com/yogiben/meteor-admin) was not working out too well for us, so built this.

#### Dependencies ####

* Bootstrap. Not added as a dependency. You are free to use the CSS/LESS versions.
* aldeed's awesome simple-schema, collection2, autoform packages and your collections configured. You need your collections configured using these for the admin panel to work.
* Add the publish-counts package `meteor add tmeasday:publish-counts`
* Roles created using `meteor add alanning:roles`

Create the kAdminConfig object in common code.
Will try to maintain the structure of yogiben:admin AdminConfig so as to switch between packages easily, incase either break.

E.g:
Note: In the example given below, Products.owner is a one-to-one and Business.admins is a one-to-many.

```
kAdminConfig = {
	name: 'Your Panel Name',
	collections: {
		Products : {
			tableColumns: [
				{label: 'Friendly ID', name: 'friendly_id'},
				{label: 'Type', name: 'type'},
				{label: 'Target Price', name: 'target_price' },
				{label: 'Delivery Terms', name: 'delivery_terms' },
				{label: 'Owner', name: 'owner', collection: 'User', collection_property: 'email' }
			]
		},
		Enquiry: {
			tableColumns: [
				{label: 'Name', name: 'name'},
				{label: 'Email', name: 'email'},
				{label: 'Requirements', name: 'requirements'}
			]
		},
		Business: {
			tableColumns: [
				{label: 'Business Name', name: 'business_name'},
				{label: 'City', name: 'city'},
				{label: 'Phone', name: 'phone'},
				{label: 'Primary Business Type', name: 'primary_business_type'},
				{label: 'Admin', name: 'admins', collection: 'User', collection_property: 'email' }
			]
		},
	}
}
```

Add `{{>kAdmin}}` to any page where you want the admin panel and you are set. We're tried to keep it very simple and something that will work with your existing app design.

## TODO ##

* Tests.
* ~~Pagination (basic done).~~
* Advanced Pagination: Page numbers, Jump to page, Set page size etc. Pretty easy to buld but will concentrate on related collections and filtering and later get to this, possibly for 0.2.0. Will accept pull.
* Filter.
* ~~Publish related collections (reywood:publish-composite and the auxCollections in yogiben:admin). One-to-one and one-to-many~~
* Publish only whats required.
* [Uses eval()](https://github.com/kaoskeya/meteor-admin/blob/master/server/publish.js#L7-8) in server code, after the necessary checks are done. If you have other ways to implement this, please open an issue or send a pull request.
# meteor-admin
`$ meteor add kaoskeya:admin`

**Loads of updates planned in upcoming days.**

Uses [autoform](https://github.com/aldeed/meteor-autoform) heavily.
[yogiben:admin](https://github.com/yogiben/meteor-admin) was not working out too well for us, so built this.

#### Dependencies ####

* Bootstrap. Not added as a dependency. You are free to use the CSS/LESS versions.
* Aldeed's awesome simple-schema, collection2, autoform packages and your collections configured.

Create the kAdminConfig object in common code.
Will try to maintain the structure of yogiben:admin AdminConfig so as to switch easily.

E.g:

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
				{label: 'Owner', name: 'owner' },
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
			]
		},
	}
}
```
Add `{{>kAdmin}}` to any page where you want the admin panel and you are set. We're tried to keep it very simple and something that will work with your existing app design.

## TODO ##
* Tests.
* Pagination (next push).
* Filter.
* Publish related collections (reywood:publish-composite and the auxCollections in yogiben:admin).
* Publish only whats required.
* Uses eval() in server code, after the necessary checks are done. If you have other ways to implement this, please open an issue or send a pull request. [Link to eval](https://github.com/kaoskeya/meteor-admin/blob/master/server/publish.js#L8-10)

# meteor-admin
`$ meteor add kaoskeya:admin`

**Loads of updates in the upcoming days. Ideally a feature a day. Will accept PRs.**

Heavily uses [autoform](https://github.com/aldeed/meteor-autoform).
[yogiben:admin](https://github.com/yogiben/meteor-admin) was not working out too well for us, so built this.

- [Dependencies](#dependencies)
- [Setup](#setup)
- [Config File](#config-file)
- [Screeshots](#screenshots)
- [TODO](#todo)

#### Dependencies ####

* Bootstrap. Not added as a dependency. You are free to use the CSS/LESS versions.
* aldeed's awesome simple-schema, collection2 and autoform packages. You need your collections configured using these for the admin panel to work.
* Add the publish-counts package `meteor add tmeasday:publish-counts`
* Roles created using `meteor add alanning:roles`

#### Setup ####

Create the kAdminConfig object in common code.

Then add `{{>kAdmin}}` to any page where you want the admin panel and you are set.

We're tried to keep it very simple and something that will work with your existing app design.

#### Config file ####

Note: In the example given below, `Answer.user` is a one-to-one to the Meteor.users collection, `Answer.question` is a one-to-one to a simple-schema collection `Question` and `Business.admins` is a one-to-many to a simple-schema collection `User`.

E.g:

```
kAdminConfig = {
	name: 'Your Panel Name',
	collections: {
		Answer: {
			tableColumns: [
				{label: 'Question', name: 'question', collection: 'Question', collection_property: 'question'},
				{label: 'Answer Type', name: 'answer_type'},
				{label: 'Posted by', name: 'user', collection: 'Meteor.users', collection_property: 'profile.name' } // Dot notation
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

Will try to maintain the structure of yogiben:admin AdminConfig so as to switch between packages easily, incase either break.

You will have to check for user authentication and level before you send them to a page with the `kAdmin` template. The publish functions currently publishes only if the user is an 'admin'.

### Screenshots ###

Fitler forms fields take your webiste styling.

![kaoskeya:admin on site 1](https://raw.githubusercontent.com/kaoskeya/meteor-admin/master/screenshots/sample1.png "Sample Site 2")

![kaoskeya:admin on site 2](https://raw.githubusercontent.com/kaoskeya/meteor-admin/master/screenshots/sample2.png "Sample Site 1")

Filtering example below.

![kaoskeya:admin on site 3](https://raw.githubusercontent.com/kaoskeya/meteor-admin/master/screenshots/sample3.png "Sample Site 3")

## TODO ##

* Tests.
* Create/View/Edit/Delete custom templates. (The user password editing issue [#13](https://github.com/kaoskeya/meteor-admin/issues/13) could be handled with this feature).
* Demo Site. [#8](https://github.com/kaoskeya/meteor-admin/issues/8)
* Advanced Pagination: Page numbers, Jump to page, Set page size etc. Possibly for 0.2.0. [#6](https://github.com/kaoskeya/meteor-admin/issues/6)
* Advanced and Foreign key filtering. [#11](https://github.com/kaoskeya/meteor-admin/issues/11) [#12](https://github.com/kaoskeya/meteor-admin/issues/12)
* Publish only whats required. While Viewing/Editing, publish all keys.
* [Uses eval()](https://github.com/kaoskeya/meteor-admin/blob/master/server/publish.js#L12-15) in server code, after the necessary checks are done. If you have other ways to implement this, please open an issue or send a pull request.
* ~~Filter.~~
* ~~Basic Pagination.~~
* ~~Publish related collections (reywood:publish-composite and the auxCollections in yogiben:admin). One-to-one and one-to-many~~
* ~~Sorting. [#9](https://github.com/kaoskeya/meteor-admin/issues/9)~~

## Future course ##

* i18n. Allow for package user to define words for buttons, messages (View/vista, edit/editar) etc. 
* Admin panel demo script using bootstraptour or linkedin hopscotch? Could be a different package.

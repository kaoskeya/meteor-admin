# meteor-admin
`$ meteor add kaoskeya:admin`

**Under active development currently. [2015-2-19]**

Heavily uses [autoform](https://github.com/aldeed/meteor-autoform).
[yogiben:admin](https://github.com/yogiben/meteor-admin) was not working out too well for us, so built this.

- [Dependencies](#dependencies)
- [Setup](#setup)
- [Config File](#config-file)
- [Custom Template Instructions](#custom-template-instructions)
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
For a fluid admin panel that takes the entire width, use `{{>kAdminFluid}}` - for this to take complete width, ensure it is not inside any `.container` or `.row`.

We're tried to keep it very simple and something that will work with your existing app design.

#### Config file ####

Note: In the example given below, 
`Enquiry.user` is a one-to-one to the `Meteor.users` collection.
`Answer.question` is a one-to-one to a simple-schema collection `Question`.
`Business.admins` is a one-to-many to a simple-schema collection `User`.
`Enquiry` has custom views for `new`, `edit` and `view`.

E.g:

```
kAdminConfig = {
	name: 'Your Panel Name',
	collections: {
		Enquiry: {
			tableColumns: [
				{label: 'Message', name: 'message'},
				{label: 'Posted by', name: 'user', collection: 'Meteor.users', collection_property: 'profile.name' }, // Dot notation
				{ label: 'Added On', name: 'addedOn', dateFormat: 'Do MMM YY hh:mm:ss', dateUnix: true} // Do not set `dateUnix` if not storing unix timestamp.
			]
			templates: {
				"new": { name: 'yourCustomNewTemplate' },
				"edit": { name: 'yourCustomEditTemplate' },
				"view": { name: 'yourCustomViewTemplate' }
			}
		},
		Answer: {
			tableColumns: [
				{label: 'Question', name: 'question', collection: 'Question', collection_property: 'question'},
				{label: 'Answer Type', name: 'answer_type'}
			]
		},
		Business: {
			tableColumns: [
				{label: 'Business Name', name: 'business_name'},
				{label: 'City', name: 'city'},
				{label: 'Phone', name: 'phone', dontSort: true}, // Cannot sort by this field
				{label: 'Primary Business Type', name: 'primary_business_type'},
				{label: 'Admin', name: 'admins', collection: 'User', collection_property: 'email' }
			]
		},
        Slide: {
            tableColumns: [
                {label: 'Title', name: 'title'},
                {label: 'Priority', name: 'priority'}
            ],
            omitFields: {
            	new: [ 'time' ], // Ommitted in create form
                edit: [ 'image' ] // Ommitted in update form
            },
        },
        Sport: {
            tableColumns: [
                {label: 'Name', name: 'name'},
                {label: 'Priority', name: 'priority'}
            ],
            omitFields: [ 'name' ] // Omitted in both create and update forms.
        },
	},
	autoForm: {
        omitFields: ['createdAt', 'updatedAt'] // Ommitted in all forms
	}
}
```

Will try to maintain the structure of yogiben:admin AdminConfig so as to switch between packages easily, incase either break.

You will have to check for user authentication and level before you send them to a page with the `kAdmin` template. The publish functions currently publishes only if the user is an 'admin'.

#### Custom Template instructions ####

On completion of new/edit action in your custom templates' AutoForm, to close the open window, use the following code to trigger the appropriate actions.

```
AutoForm.hooks({
	// Rolling with the same ID for all forms currently.
	yourCustomFormId: {
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
```


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
* ~~Uses eval() in server code, after the necessary checks are done. If you have other ways to implement this, please open an issue or send a pull request.~~
* ~~Filter.~~
* ~~Basic Pagination.~~
* ~~Publish related collections (reywood:publish-composite and the auxCollections in yogiben:admin). One-to-one and one-to-many~~
* ~~Sorting. [#9](https://github.com/kaoskeya/meteor-admin/issues/9)~~

## Future course ##

* i18n. Allow for package user to define words for buttons, messages (View/vista, edit/editar) etc. 
* Admin panel demo script using bootstraptour or linkedin hopscotch? Could be a different package.

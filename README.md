# meteor-admin
`$ meteor add kaoskeya:admin`

Adding non autoform support soon to the same package. AutoForm support will continue.

#### Can I use this? ####

If you use the following:

* [simple-schema](https://github.com/aldeed/meteor-simple-schema) and [autoform](https://github.com/aldeed/meteor-autoform) for your collections.
* Bootstrap.
* Roles created using `meteor add alanning:roles`

Then yes.

#### Right. Set me up ####

Create the `kAdminConfig` object in your common code:

```
kAdminConfig = {
	name: 'Your Panel Name',
	roles: [ "admin", "rajini", "chucknorris", "superadmin" ],
	collections: {
	}
}
```

We've stuck to the yogiben:admin structure to a certain extent.

Then add `{{>kAdmin}}` or `{{>kAdminFluid}}` to any page where you want the admin panel and you are set.

Only the roles specified will be able to view the documents. You will have to check for user level before rendering the `kAdmin` template.

We're tried to keep it very simple and something that will work with your existing app design.

#### Where are my collections? ####

Add your collections inside `kAdminConfig.collections`:

##### Regular fields and helper fields #####

This would require you use [dburles:collection-helpers](https://atmospherejs.com/dburles/collection-helpers) and specify the helper as given below:

```
Categories: {
	tableColumns: [
		{ label: 'Category', name: 'category' },
		{ label: 'Slug', name: 'slug' },
		{ label: 'Order', name: 'order' },
        { label: 'Created At', name: 'formattedCreateTime()' }
	]
}
```

```
Categories.helpers({
	formattedCreateTime: function() {
		return moment(this.createdAt).format("Do MMM YYYY HH:mm");
	}
});
```

##### There are foreign fields #####


```
Subcategory: {
	tableColumns: [
		{ label: 'Sub Category', name: 'subcategory'},
		{ label: 'Slug', name: 'slug'},
		{ label: 'Order', name: 'order'},
		{ label: 'Category', name: 'category', collection: Category, collection_helper: 'category_name()' }
	]
}
```

and your collection helper looks like:

```
Subcategory.helpers({
	category_name: function() {
		return Category.findOne({ _id: this.category_id }).category;
	}
});
```

#### Neat. But the search looks for an exact text match and I want to show something cooler instead of my collection name in the dropdown  ####

```
Product: {
	verbose: "ACME Products",
	tableColumns: [
		{ label: 'Prouct Title', name: 'title' },
		{ label: 'Category', name: 'category_name()' },
		{ label: 'Description', name: 'description' }
	],
	searchType: {
		"title": "regex",
		"description": "regex-ci"
	},
}
```

`title` search now looks within the string and does not look for an exact match. `description` pushed it further with a case insensitive search.

Date and number range filters will be worked on.

For better performance, you might want to create indexes for these fields that the user is most likely to use to search.

#### How about managing users and roles? ####

For User and roles management, check package: [kaoskeya:accounts-autoform-admin](https://atmospherejs.com/kaoskeya/accounts-autoform-admin)

#### I want to customize how my table, view, new and delete template look! ####

Add templates as shown below:

```
Enquiry: {
	tableColumns: [
		{label: 'Message', name: 'message'},
		{label: 'Posted at', name: 'createdAt', collection_helper: 'prettifyTime()' }
	],
	templates: {
		"crud": { name: 'yourFancyTable' },
		"new": { name: 'yourFancyNewTemplate' },
		"edit": { name: 'yourFancyEditTemplate' },
		"view": { name: 'yourFancyViewTemplate' }
	}
}
```

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

### Old Screenshots ###

Filter forms fields take your website styling.

![kaoskeya:admin on site 1](https://raw.githubusercontent.com/kaoskeya/meteor-admin/master/screenshots/sample1.png "Sample Site 2")

![kaoskeya:admin on site 2](https://raw.githubusercontent.com/kaoskeya/meteor-admin/master/screenshots/sample2.png "Sample Site 1")

Filtering example below.

![kaoskeya:admin on site 3](https://raw.githubusercontent.com/kaoskeya/meteor-admin/master/screenshots/sample3.png "Sample Site 3")

## TODO ##

* Tests.
* Demo Site. [#8](https://github.com/kaoskeya/meteor-admin/issues/8)
* Advanced and Foreign key filtering. [#11](https://github.com/kaoskeya/meteor-admin/issues/11) [#12](https://github.com/kaoskeya/meteor-admin/issues/12)
* Publish only whats required. While Viewing/Editing, publish all keys.

## Future course ##

* i18n. Allow for package user to define words for buttons, messages (View/vista, edit/editar) etc. 
* Admin panel demo script using bootstraptour or linkedin hopscotch? Could be a different package.
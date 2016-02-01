/*
 * Define our dependencies explicitly so we can run
 * tests either in the browser or via node.js command
 * line without having to add AMD support for the
 * browser version.
 *
 * The statements below are only required for node.js
 * testing (since node.js isn't as permissive with
 * respect to global variables). They don't do any
 * harm in the browser, though.
 */

var jQuery   = jQuery   || require("jquery");
var _        = _        || require("underscore");
var Backbone = Backbone || require("backbone");
Backbone.$   = jQuery;

/*
 * To avoid conflicts with miscellaneous Javascript libraries
 * that might one day be part of the our pages, we put all of
 * our variables in their own name space. If that name space
 * doesn't already exist (because some other part of the
 * application has been included before us), create it now.
 *
 * By not using an explicit variable declaration (var ...),
 * we're starting with the global name space (window.). That
 * lets all the components find each other.
 *
 * Note that the common approach
 *    var todoApp = todoApp || {};
 * doesn't work in node.js because variable definitions
 * in node.js default to module rather than global scope.
 * The statement below works fine in both environments,
 * however.
 */

if (typeof todoApp === "undefined") todoApp = {};

/*
 * The fundamental model for the app is a Todo. The only
 * action supported in this demo is toggling the status 
 * (e.g. from pending to complete or vice versa).
 */
 
todoApp.Todo = Backbone.Model.extend({
  defaults: {
    title:    "",
    complete: false
  },
  initialize: function() {
    // keep the server updated on changes
    // note: can't use the more concise
    //           this.on("change",this.save);
    //       because it creates an infinite loop
    //       in backbone.
    this.on("change", function(){ this.save(); });
  },
  toggleStatus: function() {
    // invert the value of the complete attribute
    this.set("complete",!this.get("complete"));
  }
})

/*
 * The complete list of todos is stored in a
 * collection, naturally. All we need to specify
 * is the URL of the REST API to access todos.
 */

todoApp.Todos = Backbone.Collection.extend({
  model: todoApp.Todo,
  url:   "api/todos"
})

/*
 * As a quick and simple demo, we'll just render each
 * todo as a list item. The item text consists of
 * the todo title, and we'll add a checkbox to
 * represent the status.
 *
 * We hook events that catch changes to the input
 * checkbox so we can update the model appropriately.
 *
 * We also watch for changes in the model so we can
 * update (or remove) the view as needed.
 */
 
todoApp.TodoListItem = Backbone.View.extend({
  tagName: "li",
  template: _.template(
      "<label>"
    +   "<input type='checkbox' <% if(complete) print('checked') %>/>"
    +   " <%= title %> "
    + "</label>"),
  events: {
    "click input": "statusChanged"
  },
  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  },
  statusChanged: function() {
    this.model.toggleStatus();
  },
  initialize: function() {
    this.model.on("change", this.render, this);
    this.model.on("destroy", this.remove, this);
  },
  remove: function() {
    this.$el.remove();
  }
})

/* 
 * Define a view for the list of all todos. We
 * watch for changes to the collection so we can
 * update the view appropriately.
 */

todoApp.TodosList = Backbone.View.extend({
  tagName: "ul",
  initialize: function() {
    this.collection.on("add", this.addOne, this);
    this.collection.on("reset", this.addAll, this);
  },
  render: function() {
    this.addAll();
    return this;
  },
  addAll: function() {
    this.collection.each(this.addOne, this);
  },
  addOne: function(todo) {
    var item = new todoApp.TodoListItem({model: todo});
    this.$el.append(item.render().el);
  }
})

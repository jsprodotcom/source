/*
 * Sorry about the following, but we need to know if
 * we're running under node.js or in the browser. That
 * turns out to be really hard to determine reliably,
 * but the following code should work in all but the
 * really really extreme cases.
 */

if (typeof exports !== 'undefined' && this.exports !== exports) {
	
	/*
	 * Here's why the node.js environment needs special
	 * treatment: 
	 *
	 *   -  We need to identify dependencies so node.js
	 *      can load the necessary libraries. (In the
	 *      browser, these will be handled by explicit
	 *      includes, either of individual script files
	 *      or of concatenated, possibly minified versions.)
	 *
	 *   -  Node.js doesn't have a DOM into which we
	 *      can insert our views to test interactions.
	 *      We can simulate a DOM with jsdom.
	 *
	 */

  global.jQuery = require("jquery");
  global.$ = jQuery;
  global.chai = require("chai");
  global.sinon = require("sinon");
  chai.use(require("sinon-chai"));

	global.jsdom = require("jsdom").jsdom;
	var doc = jsdom("<html><body></body></html>");
	global.window = doc.createWindow();

}

var should = chai.should();

describe("Application", function() {
	it("creates a global variable for the name space", function () {
		should.exist(todoApp);
	})
})

describe("Todo Model", function(){
	describe("Initialization", function() {
		beforeEach(function() {
			this.todo = new todoApp.Todo();
		})
		it("should default the status to 'pending'",function() {
			this.todo.get('complete').should.be.false;
		})
		it("should default the title to an empty string",function() {
			this.todo.get('title').should.equal("");
		})
	})
	describe("Attributes", function() {
		beforeEach(function() {
			this.todo = new todoApp.Todo();
			this.save_stub = sinon.stub(this.todo, "save");
		})
		afterEach(function() {
			this.save_stub.restore();
		})
		it("should support setting the title", function() {
			this.todo.set('title',"Test");
			this.todo.get('title').should.equal("Test");
		})
		it("should support setting the status", function() {
			this.todo.set('complete',true);
			this.todo.get('complete').should.be.true;
		})
		it("should toggle status from 'pending' to 'complete'", function() {
			this.todo.toggleStatus();
			this.todo.get('complete').should.be.true;
		})
	})
	describe("Persistence", function() {
		beforeEach(function() {
			this.todo = new todoApp.Todo();
			this.save_stub = sinon.stub(this.todo, "save");
		})
		afterEach(function() {
			this.save_stub.restore();
		})
		it("should update server when title is changed", function() {
			this.todo.set("title", "New Todo");
			this.save_stub.should.have.been.calledOnce;
		})
		it("should update server when status is changed", function() {
			this.todo.set('complete',true);
			this.save_stub.should.have.been.calledOnce;
		})
	})
})

describe("Todo List Item View", function() {
	beforeEach(function(){
		this.todo = new todoApp.Todo({title: "Todo"});
	  this.item = new todoApp.TodoListItem({model: this.todo});
		this.save_stub = sinon.stub(this.todo, "save");
	})
	afterEach(function() {
		this.save_stub.restore();
	})
	it("render() should return the view object", function() {
		this.item.render().should.equal(this.item);
	});
	it("should render as a list item", function() {
	  this.item.render().el.nodeName.should.equal("LI");
	})
	describe("Template", function() {
		beforeEach(function(){
			this.item.render();
		})	
		it("should contain the todo title as text", function() {
			this.item.$el.text().should.have.string("Todo");
		})
		it("should include a label for the status", function() {
			this.item.$el.find("label").should.have.length(1);
		})
		it("should include an <input> checkbox", function() {
			this.item.$el.find("label>input[type='checkbox']").should.have.length(1);
		})
		it("should be clear by default (for 'pending' todos)", function() {
			this.item.$el.find("label>input[type='checkbox']").is(":checked").should.be.false;
		})
		it("should be set for 'complete' todos", function() {
			this.todo.set("complete", true);
			this.item.render();
			this.item.$el.find("label>input[type='checkbox']").is(":checked").should.be.true;
		})
	})
	describe("Model Interaction", function() {
		it("should update model when checkbox clicked", function() {
      $("<div>").attr("id","fixture").css("display","none").appendTo("body");
			this.item.render();
			$("#fixture").append(this.item.$el);
			this.item.$el.find("input").click();
			this.todo.get('complete').should.be.true;
			$("#fixture").remove();
		})
	})
})

describe("Todos Collection", function() {
	it("should support explicit initialization with multiple todos", function() {
		this.todos = new todoApp.Todos([
			{title: "Todo 1"},
			{title: "Todo 2"}
		]);
		this.todos.length.should.equal(2);
	})
})

describe("Todos List View", function() {
	beforeEach(function(){
		this.todos = new todoApp.Todos([
			{title: "Todo 1"},
			{title: "Todo 2"}
		]);
		this.list = new todoApp.TodosList({collection: this.todos});
	})
	it("render() should return the view object", function() {
		this.list.render().should.equal(this.list);
	});
	it("should render as an unordered list", function() {
		this.list.render().el.nodeName.should.equal("UL");
	})
	it("should include list items for all models in collection", function() {
		this.list.render();
		this.list.$el.find("li").should.have.length(2);
	})
})

/*
 * For extra credit, the following code can be used to 
 * test interaction with a REST API. It's not really
 * appropriate for unit tests of the todos module
 * because it's actually testing the backbone library.
 *
 * You might need to mock a REST API if your server doesn't
 * provide the standard backbone responses (e.g. using
 * ._id instead of .id) and the model has to adjust for
 * that.
 */

describe("Collection's Interaction with REST API", function() {
	it("should load using the API", function() {
		this.ajax_stub = sinon.stub($, "ajax").yieldsTo("success", [
			{ id: 1, title: "Mock Todo 1", complete: false },
		  { id: 2, title: "Mock Todo 2", complete: true  }
		]);
		this.todos = new todoApp.Todos();
		this.todos.fetch();
		this.todos.should.have.length(2);
		this.todos.at(0).get('title').should.equal("Mock Todo 1");
		this.todos.at(1).get('title').should.equal("Mock Todo 2");
		this.ajax_stub.restore();
	})
})

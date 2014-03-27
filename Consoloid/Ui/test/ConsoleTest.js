require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../Console");

describeUnitTest('Consoloid.Ui.Console', function(){
  var prompt = { focus: function() {}, render: function() {}, node:$('<div />') };
  var css_loader = { load: function() { return css_loader; } };
  var tutorial;

  beforeEach(function() {
    env.addServiceMock('dom', { baseNode: $('<div />').appendTo($(document.body)) });
    env.addServiceMock('prompt', prompt);
    env.addServiceMock('css_loader', css_loader);
    env.readTemplate(__dirname + '/../templates.jqote', 'utf8');

    tutorial = { start: sinon.stub() };
    env.addServiceMock('tutorial', tutorial);
  });

  describe('#start()', function() {
    var
      console,
      leader_spy,
      prompt_spy;

    beforeEach(function() {
      console = env.create('Consoloid.Ui.Console', {});
      console.loadTopic = sinon.stub();
      loader_spy = sinon.spy(css_loader, "load");
      prompt_spy = sinon.spy(prompt, "focus");
    });

    it('should load resources and render the console', function() {
      console.start();

      loader_spy.called.should.be.equal(true);
      prompt_spy.calledOnce.should.be.equal(true);
    });

    it('should load the tutorial topic and start it', function() {
      console.start();

      console.loadTopic.calledWith("tutorial").should.be.ok;
      tutorial.start.calledOnce.should.be.ok;
    });

    it('should not load tutorial if it was already once dismissed', function() {
      document.cookie = "consoloid_tutorial_was_dismissed=true";
      console.start();

      console.loadTopic.calledWith("tutorial").should.not.be.ok;
      tutorial.start.called.should.not.be.ok;
      document.cookie = "consoloid_tutorial_was_dismissed=false";;
    });

    afterEach(function() {
      loader_spy.restore();
      prompt_spy.restore();
    });
  });

  describe("#startWithDialog(serviceName)", function() {
    var
      dialog,
      console;

    beforeEach(function() {
      dialog = { startWithoutExpression: sinon.stub() };
      console = env.create('Consoloid.Ui.Console', {});
      console.loadTopic = sinon.stub();
      env.addServiceMock('some_dialog', dialog);
      sinon.spy(console, "start");
    });

    it("should start dialog after starting console, if tutorial was once dismissed", function() {
      document.cookie = "consoloid_tutorial_was_dismissed=true";
      console.startWithDialog("some_dialog");

      console.start.calledOnce.should.be.ok;
      tutorial.start.called.should.not.be.ok;
      dialog.startWithoutExpression.calledOnce.should.be.ok;
      document.cookie = "consoloid_tutorial_was_dismissed=false";;
    });

    it("should not start it if it's time for a tutorial", function() {
      console.startWithDialog("some_dialog");

      console.start.calledOnce.should.be.ok;
      tutorial.start.calledOnce.should.be.ok;
      dialog.startWithoutExpression.called.should.not.be.ok;
    });
  });

  describe("#getDialogItWasStartedWith()", function() {
    var
      dialog,
      console;

    beforeEach(function() {
      dialog = { startWithoutExpression: sinon.stub() };
      console = env.create('Consoloid.Ui.Console', {});
      console.loadTopic = sinon.stub();
      env.addServiceMock('some_dialog', dialog);
      sinon.spy(console, "start");
    });

    it("should return the dialog created in startWithDialog", function() {
      console.startWithDialog("some_dialog");

      console.getDialogItWasStartedWith().should.equal(dialog);
    });
  });

  describe('#createNewDialog(dialog)', function() {
    it('should return new dom node for the dialog', function() {
      var console = env.create('Consoloid.Ui.Console', {});
      var dialog = {};

      console.render();
      var div = console.createNewDialog(dialog);

      $('#'+div.attr('id')).should.have.lengthOf(1);
    });

    it('should create a unique id for each dialog', function() {
      var console = env.create('Consoloid.Ui.Console', {});
      var dialog = {};

      console.render();
      var div1 = console.createNewDialog(dialog);
      var div2 = console.createNewDialog(dialog);

      $('.dialog').should.have.lengthOf(2);
      div1.attr('id').should.not.be.eql(div2.attr('id'));
    });
  });

  describe("#isTopicLoaded(topic)", function() {
    it('should check if topic is loaded', function() {
      var console = env.create('Consoloid.Ui.Console', {});
      console.loadedTopics = [ 'gintopic' ];

      console.isTopicLoaded('foobar').should.equal(false);
      console.isTopicLoaded('gintopic').should.equal(true);
    });

    it('should assume framework and console topics are loaded, since without them it would not even exist', function() {
      var console = env.create('Consoloid.Ui.Console', {});
      console.loadedTopics = [];

      console.isTopicLoaded('framework').should.equal(true);
      console.isTopicLoaded('console').should.equal(true);
    });
  });

  describe("#getLastDialog()", function() {
    it('should return with the last dialog', function() {
      var console = env.create('Consoloid.Ui.Console', {});
      console.createNewDialog({name: 'foo'});
      var convo = {name: 'bar'}
      console.createNewDialog(convo);

      console.getLastDialog().name.should.equal('bar');

      console.removeDialog(convo);
      console.getLastDialog().name.should.equal('foo');
    });
  });

  describe("#removeDialog(dialog)", function() {
    it("should remove said dialog", function() {
      var console = env.create('Consoloid.Ui.Console', {});
      var convoMock = { name: "foo" };
      console.dialogs = { 1: convoMock };
      console.nextId = 2;

      console.removeDialog(convoMock);

      (console.dialogs[1] == undefined).should.be.ok;
    });
  })

  afterEach(function() {
    $(document.body).empty();
    env.shutdown();
  });
});

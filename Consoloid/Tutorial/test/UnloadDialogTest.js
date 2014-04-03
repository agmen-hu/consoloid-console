require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/Widget");
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require("../../Ui/Dialog");
require("../UnloadDialog");
describeUnitTest('Consoloid.Tutorial.UnloadDialog', function() {
  var
    consoleService,
    dialog;

  beforeEach(function() {
    consoleService = {
      unloadTopic: sinon.stub()
    };

    env.addServiceMock('console', consoleService);
    dialog = env.create(Consoloid.Tutorial.UnloadDialog, {});
  });

  describe("#setup()", function() {
    it("should unload tutorial topic and set cookie", function() {
      dialog.setup();

      consoleService.unloadTopic.calledOnce.should.be.ok;
      consoleService.unloadTopic.calledWith("tutorial").should.be.ok;
      document.cookie.indexOf("consoloid_tutorial_was_dismissed=true").should.not.equal(-1);
    });
  });

  afterEach(function() {
    document.cookie = "consoloid_tutorial_was_dismissed=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  });
});

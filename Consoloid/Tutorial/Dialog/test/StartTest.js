require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/Widget");
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require("../../../Ui/Dialog");
require("../../../Ui/MultiStateDialog");
require("../../../Ui/Volatile/Dialog");
require("../Start");
describeUnitTest('Consoloid.Tutorial.Dialog.Start', function() {
  var
    tutorial,
    dialog;

  beforeEach(function() {
    tutorial = {
      start: sinon.stub()
    };

    env.addServiceMock('tutorial', tutorial);
    dialog = env.create(Consoloid.Tutorial.Dialog.Start, {});
    dialog.__addToVolatileContainer = sinon.stub();
  });

  describe("#setup()", function() {
    it("should start tutorial", function() {
      dialog.setup();

      tutorial.start.calledOnce.should.be.ok;
      dialog.__addToVolatileContainer.calledOnce.should.be.ok;
    });
  });
});

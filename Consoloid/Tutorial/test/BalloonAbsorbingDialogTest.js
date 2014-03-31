require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/Widget");
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("../../Ui/Dialog");
require("../BalloonAbsorbingDialog");

describeUnitTest('Consoloid.Tutorial.BalloonAbsorbingDialog', function() {
  var
    consoleService,
    balloon,
    tutorial,
    dialog;

  beforeEach(function() {
    consoleService = {
      createNewDialog: function() { return new $('<div />'); },
      animateMarginTopIfNecessary: sinon.spy(),
      getVisibleDialogsHeight: sinon.stub().returns(500)
    };
    env.addServiceMock('console', consoleService);

    balloon = {
      node: {
        insertAfter: sinon.stub()
      },
      outerHeight: sinon.stub().returns(300),
      moveBellowLeftOf: sinon.stub().yields(),
      removeShadow: sinon.spy(function() {
        return balloon;
      }),
      setToRelativePosition: sinon.stub(),
    };

    tutorial = {
      getBalloon: sinon.stub().returns(balloon)
    };

    env.addServiceMock('tutorial', tutorial);

    env.readTemplate(__dirname + '/../../Ui/templates.jqote', 'utf8');
    env.readTemplate(__dirname + '/../templates.jqote', 'utf8');

    dialog = env.create(Consoloid.Tutorial.BalloonAbsorbingDialog, { responseTemplateId: 'Consoloid-Tutorial-BalloonAbsorbingDialog' });
  });

  describe("render()", function() {
    it("should absorb the tutorial balloon", function() {
      sinon.spy($.fn, "height");
      dialog.render();

      balloon.outerHeight.calledOnce.should.be.ok;

      $.fn.height.calledWith(300).should.be.ok;
      balloon.moveBellowLeftOf.calledWith(dialog.node.find(".balloon.anchor")).should.be.ok;

      balloon.removeShadow.called.should.be.ok;
      balloon.setToRelativePosition.called.should.be.ok;

      balloon.node.insertAfter.calledOnce.should.be.ok;
      balloon.node.insertAfter.calledWith(dialog.node.find(".balloon.anchor")).should.be.ok;

      $.fn.height.restore();
    });
  });
});
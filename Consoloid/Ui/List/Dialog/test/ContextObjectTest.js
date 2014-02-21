require('consoloid-console/Consoloid/Interpreter/Token');
require('consoloid-console/Consoloid/Interpreter/Tokenizable');
require('consoloid-console/Consoloid/Context/Object');
require('../ContextObject');

require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.Dialog.ContextObject', function() {
  var
    object,
    list;
  beforeEach(function() {
    list = {};
    object = env.create('Consoloid.Ui.List.Dialog.ContextObject', { name: "Foo Bar", list: list });
  });

  describe("#__constructor(options)", function() {
    it("should require a list", function() {
      (function() {
        object = env.create('Consoloid.Ui.List.Dialog.ContextObject', { name: "Foo Bar" });
      }).should.throwError();
    });
  });

  describe("#getList()", function() {
    it("should return the list", function() {
      object.getList().should.equal(list);
    });
  });
});
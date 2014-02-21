require('should');
var sinon = require('sinon');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../BaseField");
require("../AutoValidatingField");
require("../TextArea");

describe('Consoloid.Form.TextArea', function() {
  var env;

  beforeEach(function() {
    env = new Consoloid.Test.Environment();
  });

  describe('#parseUserInput()', function() {
    it('should read value from input field', function() {
      $(document.body).append($('<textarea id="bar-foo">testValue</textarea>'));
      var textField = env.create(Consoloid.Form.TextArea, { name: 'foo', prefix: 'bar' });

      textField.parseUserInput();
      textField.getValue().should.equal('testValue');
    });
  });

  afterEach(function() {
    $(document.body).empty();
    env.shutdown();
  });
});

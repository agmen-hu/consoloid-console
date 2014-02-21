require('should');
var sinon = require('sinon');
require("../BaseValidator");
require("../NonEmpty");

describe('Consoloid.Form.Validator.NonEmpty', function() {
  var
    env,
    validator,
    field,
    form,
    translator;

  beforeEach(function() {
    field = {
      getValue: sinon.stub(),
      setErrorMessage: sinon.spy(),
      addValidator: sinon.spy()
    };

    form = {
      getField: function() {
        return field;
      }
    };

    translator = {
        trans: function(msg) { return msg; }
      };

    env = new Consoloid.Test.Environment();
    env.addServiceMock('form', form);
    env.addServiceMock('translator', translator);

    validator = env.create(Consoloid.Form.Validator.NonEmpty, {
      fieldNames: [ 'f1' ],
      message: 'test error message'
    });
  });

  describe("#validate()", function() {
    it('should return true if field has a value', function() {
      field.getValue.returns(5);
      validator.validate().should.be.ok;

      field.getValue.returns('test');
      validator.validate().should.be.ok;
    });

    it('should return false if field does not have a value', function() {
      field.getValue.returns('');
      validator.validate().should.not.be.ok;

      field.getValue.returns(null);
      validator.validate().should.not.be.ok;
    });

    it("should set an error message on field if it isn't empty", function() {
      field.getValue.returns('');
      validator.validate();
      field.setErrorMessage.calledWith('test error message').should.be.ok;
    });
  });

  afterEach(function() {
    env.shutdown();
  });
});

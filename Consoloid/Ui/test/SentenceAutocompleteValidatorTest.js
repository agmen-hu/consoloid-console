require('consoloid-framework/Consoloid/Test/UnitTest');
require("../../Form/Validator/BaseValidator");
require("../SentenceAutocompleteValidator");

describeUnitTest('Consoloid.Ui.SentenceAutocompleteValidator', function() {
  var
    validator,
    fooField,
    barField,
    form,
    dialogLauncher,
    expression;

  beforeEach(function() {
    fooField = {
      getValue: sinon.stub().returns("fooValue"),
      setErrorMessage: sinon.stub(),
      addValidator: sinon.stub(),
      getName: sinon.stub().returns("fancyArgumentName"),
      parseUserInput: sinon.stub()
    };

    barField = {
      getValue: sinon.stub().returns("barValue"),
      setErrorMessage: sinon.stub(),
      addValidator: sinon.stub(),
      getName: sinon.stub().returns("okayArgumentName"),
      parseUserInput: sinon.stub()
    }

    form = {
      getField: sinon.stub(),
      getValue: sinon.stub().returns({
        fancyArgumentName: fooField.getValue(),
        okayArgumentName: barField.getValue()
      })
    };

    form.getField.withArgs("fancyArgumentName").returns(fooField);
    form.getField.withArgs("okayArgumentName").returns(barField);

    dialogLauncher = {
      getAllAutocompleteOptions: sinon.stub().returns([{
        arguments: {
          fancyArgumentName: {
            erroneous: true,
            message: "This object you seek could not be summoned from the mighty context."
          },
          okayArgumentName: {}
        }
      }])
    };

    expression = {
      getTextWithArguments: sinon.stub().returns("foo bar sentence text")
    };

    env.addServiceMock('form', form);
    env.addServiceMock('dialogLauncher', dialogLauncher);

    validator = env.create(Consoloid.Ui.SentenceAutocompleteValidator, {
      fieldNames: [ 'fancyArgumentName', 'okayArgumentName' ],
      expression: expression
    });
  });

  describe("#__constructor(options)", function() {
    it('should require expression property', function() {
      (function () {
        env.create(Consoloid.Ui.SentenceAutocompleteValidator, { fieldNames: [ 'fancyArgumentName' ] });
      }).should.throwError(/expression must be injected/);
    });
  });

  describe("#validate()", function() {
    it("should call the the dialog launcher with the expression", function() {
      validator.validate();

      expression.getTextWithArguments.calledTwice.should.be.ok;
      expression.getTextWithArguments.calledWith({ fancyArgumentName: { value: "fooValue" }, okayArgumentName: { value: "barValue" } }).should.be.ok;

      dialogLauncher.getAllAutocompleteOptions.calledTwice.should.be.ok;
      dialogLauncher.getAllAutocompleteOptions.calledWith("foo bar sentence text").should.be.ok;
    });

    it('should return true if the argument in the first result from dialog launcher is not erroneous', function() {
      dialogLauncher.getAllAutocompleteOptions()[0].arguments.fancyArgumentName = {};
      validator.validate().should.be.ok;
    });

    it('should return false if the argument in the first result from dialog launcher is erroneous', function() {
      validator.validate().should.not.be.ok;
    });

    it("should set an error message on field if the argument in the first result from dialog launcher is erroneou", function() {
      validator.validate();
      fooField.setErrorMessage.calledWith('This object you seek could not be summoned from the mighty context.').should.be.ok;
    });
  });
});

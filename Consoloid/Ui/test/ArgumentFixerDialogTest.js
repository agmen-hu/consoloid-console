require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require("consoloid-framework/Consoloid/Widget/Widget");
require("../Dialog");
require("../MultiStateDialog");
require("../ArgumentFixerDialog");
require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.ArgumentFixerDialog', function() {
  var
    dialog,
    dialogLauncher,
    sentence,
    form;

  beforeEach(function() {
    sentence = {
      arguments: {
        required1: {
          isRequired: sinon.stub().returns(true)
        },
        required2: {
          isRequired: sinon.stub().returns(true)
        },
        optional1: {
          isRequired: sinon.stub().returns(false)
        },
      }
    };

    form = {
      setValue: sinon.spy(),
      getValue: sinon.stub(),
      getField: sinon.stub().returns({
        setErrorMessage: sinon.stub()
      }),
      parseUserInput: sinon.spy(),
      validate: sinon.stub()
    };

    dialog = env.create(Consoloid.Ui.ArgumentFixerDialog, {});
    dialog.expression = {};
    dialog._renderExpressionAndResponse = sinon.spy();
    dialog._animateDialogShowup = sinon.spy();

    dialog.create = sinon.stub().returns(form);
    dialog.arguments = {
      text: 'test message',
      options: {
        expression: {
          getTextWithArguments: sinon.stub().returns('test')
        },
        sentence: sentence,
        arguments: {
          required1: { value: 'value' },
          optional1: { value: 'other value' }
        }
      }
    };
  });

  describe('#setup()', function() {
    it('should create a form including a field for each required argument', function() {
      dialog.setup();

      dialog.should.have.property('form');
      dialog.form.should.equal(form);

      dialog.create.calledOnce.should.be.ok;
      dialog.create.args[0][0].should.equal('Consoloid.Form.Form');
      dialog.create.args[0][1].fieldDefinitions.should.eql({
        required1: {
          cls: 'Consoloid.Form.Text',
          options: {
            title: 'required1'
          }
        },
        required2: {
          cls: 'Consoloid.Form.Text',
          options: {
            title: 'required2'
          }
        }
      });

      dialog.create.args[0][1].validatorDefinitions.should.eql({
        nonEmpty: {
          cls: 'Consoloid.Form.Validator.NonEmpty',
          options: {
            fieldNames: [ 'required1', 'required2' ]
          }
        }
      });
    });

    it('should not include optional arguments in form normally', function() {
      dialog.setup();
      dialog.create.calledOnce.should.be.ok;
      dialog.create.args[0][1].should.have.property('fieldDefinitions');
      dialog.create.args[0][1].fieldDefinitions.should.not.have.property('optional1');
    });

    it('should fill default value for arguments that already has value specified', function() {
      dialog.setup();

      dialog.form.setValue.calledOnce.should.be.ok;
      dialog.form.setValue.args[0][0].should.eql({ required1: 'value' });
    });

    it('should include optional arguments in the form if they are filled and erroneous', function() {
      dialog.arguments.options.arguments.optional1.erroneous = true;
      dialog.arguments.options.arguments.optional1.message = "Something terrible has happened.";
      dialog.setup();
      dialog.create.calledOnce.should.be.ok;
      dialog.create.args[0][1].should.have.property('fieldDefinitions');
      dialog.create.args[0][1].fieldDefinitions.should.have.property('optional1');

      dialog.form.setValue.args[0][0].should.eql({ required1: 'value', optional1: 'other value' });
      form.getField().setErrorMessage.called.should.be.ok;
    });
  });

  describe('#startDialog()', function() {
    var prompt;

    beforeEach(function() {
      form.validate.returns(true);
      form.getValue.returns({ required1: 'foo', required2: 'bar' });

      prompt = {
          launchDialog: sinon.spy()
      };

      env.addServiceMock('console', { prompt: prompt });

      dialog.form = form;
    });

    it('should read required argument values from form and start dialog', function() {
      dialog.startDialog();

      prompt.launchDialog.calledOnce.should.be.ok;
      prompt.launchDialog.calledWith('test').should.be.ok;
    });

    it('should validate the form before start dialog', function() {
      form.validate.returns(false);
      dialog.startDialog();

      form.validate.calledOnce.should.be.ok;
    });

    it('should preserve values of optional arguments', function() {
      dialog.startDialog();

      dialog.arguments.options.expression.getTextWithArguments.args[0][0].should.eql({
        required1: { value: 'foo' },
        optional1: { value: 'other value' },
        required2: { value: 'bar' }
      });
    });
  });
});

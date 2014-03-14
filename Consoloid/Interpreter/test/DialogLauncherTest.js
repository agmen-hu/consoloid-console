require('../../Interpreter/Token');
require('../../Interpreter/Tokenizable');
require('../../Interpreter/Sentence');
require('../../Interpreter/Expression');
require('../../Interpreter/Letter');
require('../../Interpreter/LetterTree');
require('../../Interpreter/Argument');
require('../../Interpreter/ArgumentTree');
require('../../Interpreter/Advisor');
require('../../Interpreter/TreeBuilder');
require('../../Context/Tree');
require('../../Context/Queue');

require("../DialogLauncher");
require("../../Test/ConsoleUnitTest");
describeConsoleUnitTest('Consoloid.Interpreter.DialogLauncher', function() {
  var
    dialogLauncher;

  beforeEach(function() {
    env.addServiceMock('translator', { trans: function(item) { return item; } });

    var dummyExpression = { doIt: function() { return false; } };
    var dummySentence = { getExpressions: function() { return [ dummyExpression ]; } };
    env.container.addSharedObject('default_fallback_sentence', dummySentence)
    env.container.addSharedObject('default_ambiguousity_avoider_sentence', dummySentence)
    env.container.addSharedObject('default_argument_fixer_sentence', dummySentence)
    env.container.addSharedObject('letter_tree', env.create(Consoloid.Interpreter.LetterTree, {}));
    env.container.addSharedObject('context', env.create(Consoloid.Context.Queue, {}));

    env.container.addDefinition('dialog_handler_test_sentence', {
      cls: Consoloid.Interpreter.Sentence,
      options: {
        patterns: ['hello world'],
        service: 'hello_world_dialog',
        method: 'start',
        arguments: {
          name: {
            type: 'string',
            pattern: 'with name <value>',
            required: false
          }
        }
      },
      tags: ['sentence']
    });

    dialogLauncher = env.create(Consoloid.Interpreter.DialogLauncher, {});
    sinon.spy(dialogLauncher, 'getAllAutocompleteOptions');
    sinon.spy(dialogLauncher, 'get');
  });

  function addSentenceToAdvisor(text, arguments) {
    var sentence = env.create(Consoloid.Interpreter.Sentence, {
        patterns: [text],
        service: 'service',
        method: 'start',
        arguments: arguments
      });
    dialogLauncher.advisor.tree.addEntity(sentence.getExpressions()[0]);
  }

  describe('#__constructor()', function() {
    it('should create own advisor and build own tree when not given in options', function() {
      dialogLauncher.should.have.property('advisor');
      dialogLauncher.advisor.should.be.instanceOf(Consoloid.Interpreter.Advisor);
      var sentences = dialogLauncher.advisor.autocomplete('hel wor');
      sentences.should.have.lengthOf(1);
      sentences[0].value.should.equal('hello world');
    });
  });

  describe('#autocompleteExpression(text)', function(){
    it('should autocomplete sentence options', function() {
      var options = dialogLauncher.autocompleteExpression('hel wor');

      options.length.should.be.eql(1);
      options[0].value.should.be.eql('hello world');
    });

    it('should autocomplete arguments', function() {
      var options = dialogLauncher.autocompleteExpression('hel wor, wi na foo');
      options.length.should.be.eql(1);
      options[0].value.should.be.eql('hello world, with name foo');
      options[0].arguments.should.be.eql({
          name: {value: 'foo', exactMatch: true}
        });

      options = dialogLauncher.autocompleteExpression('hel wor, wi na');
      options.length.should.be.eql(1);
      options[0].value.should.be.eql('hello world, with name ');
      options[0].arguments.should.be.eql({
          name: {value: null, exactMatch: true}
        });
    });

    it('autocomplete should provide all possible arguments', function() {
      addSentenceToAdvisor('complex sentence', {
          name: {
            type: 'string',
            pattern: 'with name <value>',
            required: false
          },
          allow: {
            type: 'boolean',
            pattern: 'allow something',
            required: false
          },
          disallow: {
            type: 'boolean',
            pattern: 'disallow something',
            required: false
          }
        });

      var options = dialogLauncher.autocompleteExpression('co se, some');

      options.length.should.be.eql(2);
      options[0].value.should.be.eql('complex sentence, allow something');
      options[0].arguments.should.be.eql({
          allow: {value: true, exactMatch: true}
        });
      options[1].value.should.be.eql('complex sentence, disallow something');
      options[1].arguments.should.be.eql({
          disallow: {value: true, exactMatch: true}
        });
    });

    it('should not return the with erroneous arguments', function() {
      dialogLauncher.advisor = {
        autocomplete: sinon.stub().returns([{
          arguments: {
            something: {
              erroneous: true
            }
          }
        }, {
          arguments: {
            something: {
            }
          }
        }])
      };

      var options = dialogLauncher.autocompleteExpression('foo bar');
      options.length.should.equal(1);
    });
  });

  describe('#startFromText(text)', function() {
    beforeEach(function(){
      sinon.stub(dialogLauncher, '__startDialog', function(){});
    });

    it('should do nothing when not has text', function() {
      dialogLauncher.startFromText();
      dialogLauncher.getAllAutocompleteOptions.called.should.be.false;

      dialogLauncher.startFromText('');
      dialogLauncher.getAllAutocompleteOptions.called.should.be.false;
    });

    it('should return false on tokenizer syntax error', function() {
      dialogLauncher.startFromText(' ').should.be.false;
    });

    it('should start dialog using current sentence on enter', function() {
      dialogLauncher.startFromText('hel wor');

      dialogLauncher.getAllAutocompleteOptions.calledWith('hel wor').should.be.true;
      dialogLauncher.get.called.should.be.false;
      var startDialogArgument = dialogLauncher.__startDialog.args[0][0];
      startDialogArgument.value.should.be.eql('hello world');
    });

    it('enter should start fallback dialog when sentence was not found', function() {
      dialogLauncher.startFromText('no such sentence');

      dialogLauncher.getAllAutocompleteOptions.calledWith('no such sentence').should.be.true;
      dialogLauncher.get.calledWith('default_fallback_sentence').should.be.true;
      var startDialogArgument = dialogLauncher.__startDialog.args[0][0];
      startDialogArgument.value.should.be.eql('no such sentence');
    });

    it('should start fallback dialog on invalid arguments', function() {
      dialogLauncher.startFromText('hello wor, invalid arg');

      dialogLauncher.getAllAutocompleteOptions.calledWith('hello wor, invalid arg').should.be.true;
      dialogLauncher.get.calledWith('default_fallback_sentence').should.be.true;
      var startDialogArgument = dialogLauncher.__startDialog.args[0][0];
      startDialogArgument.value.should.be.eql('hello wor, invalid arg');
    });

    it('should start exact-match sentence on multiple matches', function() {
      addSentenceToAdvisor('hello somebody', {});
      addSentenceToAdvisor('hello world again', {});

      dialogLauncher.startFromText('hel wor');

      dialogLauncher.getAllAutocompleteOptions.calledWith('hel wor').should.be.true;
      dialogLauncher.get.called.should.be.false;
      var startDialogArgument = dialogLauncher.__startDialog.args[0][0];
      startDialogArgument.value.should.be.eql('hello world');
    });

    it('should not start first sentence on multiple exact-match sentences', function() {
      addSentenceToAdvisor('hello work', {});

      dialogLauncher.startFromText('hel wor');

      dialogLauncher.getAllAutocompleteOptions.calledWith('hel wor').should.be.true;
      dialogLauncher.get.calledWith('default_ambiguousity_avoider_sentence').should.be.true;
      var startDialogArgument = dialogLauncher.__startDialog.args[0][0];
      startDialogArgument.value.should.be.eql('hel wor');
    });

    it('should start sentence with all words matching when multiple matches but others has at least one extra word that is not matching', function() {
      addSentenceToAdvisor('test sentence matching', {});
      addSentenceToAdvisor('test sentence nomatch', {});

      dialogLauncher.startFromText('te se ma');

      dialogLauncher.getAllAutocompleteOptions.calledWith('te se ma').should.be.true;
      dialogLauncher.get.called.should.be.false;
      var startDialogArgument = dialogLauncher.__startDialog.args[0][0];
      startDialogArgument.value.should.be.eql('test sentence matching');
    });
  });

  describe('#__startDialog(options)', function(){
    it('should emit an Consoloid.Interpreter.DialogLauncher.FailedToStartDialog event when starting a dialog fails', function() {
      var spy = sinon.spy();
      $(document).bind('Consoloid.Interpreter.DialogLauncher.FailedToStartDialog', spy);

      (function(){
        dialogLauncher.__startDialog({
          expression: {
            doIt: function(){
              throw new Error('test')
            },
            areArgumentsValid: sinon.stub().returns(true)
          }
        });
      }).should.throw();

      spy.calledOnce.should.be.true;
    });

    it('should start default_argument_fixer_sentence when a required argument is missing', function() {
      dialogLauncher.__startDialog({
        expression: {
          areArgumentsValid: sinon.stub().returns(false)
        }
      });

      dialogLauncher.get.calledWith('default_argument_fixer_sentence').should.be.true;
    });
  });
});
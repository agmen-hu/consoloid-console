require('../Tokenizable');
require('../Letter');
require('../LetterTree');
require('../Token');
require('../Expression');
require('../ExpressionTree');

require("../../Test/ConsoleUnitTest");
describeConsoleUnitTest('Consoloid.Interpreter.ExpressionTree', function() {
  var
    tree,
    testExpression1,
    testExpression2;

  beforeEach(function() {
    tree = env.create(Consoloid.Interpreter.ExpressionTree, {});

    testExpression1 = env.create(Consoloid.Interpreter.Expression, {
      pattern: 'foo bar',
      sentence: {
        getTopic: sinon.stub().returns("foobar")
      }
    });

    testExpression2 = env.create(Consoloid.Interpreter.Expression, {
      pattern: 'foo rab',
      sentence: {
        getTopic: sinon.stub().returns("foorab")
      }
    });

    tree.addEntity(testExpression1);
    tree.addEntity(testExpression2);
  });

  describe("#removeExpressionsOfTopic(topic)", function() {
    it("should remove expressions of topic", function() {
      tree.removeExpressionsOfTopic("foorab");

      tree.children.should.not.have.property("r");
      tree.children.should.have.property("f");
      tree.children.should.have.property("b");
    });
  });
});
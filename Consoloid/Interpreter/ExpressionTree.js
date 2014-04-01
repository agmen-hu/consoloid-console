defineClass('Consoloid.Interpreter.ExpressionTree', 'Consoloid.Interpreter.LetterTree',
  {
    removeExpressionsOfTopic: function(topic)
    {
      var expressionsOfTopic = this.__getAllExpressions(this).filter(function(expression) {
        return expression.getSentence().getTopic() == topic;
      });

      expressionsOfTopic.forEach(function(expression) {
        this.removeEntity(expression);
      }.bind(this));
    },

    __getAllExpressions: function(node)
    {
      var expressions = node.entities.map(function(entity) {
        return entity.entity;
      });
      $.each(node.children, function(index, child) {
        expressions = this.__mergeExpressionsWithoutDuplicates(expressions, this.__getAllExpressions(child));
      }.bind(this));

      return expressions;
    },

    __mergeExpressionsWithoutDuplicates: function(oldExpressions, newExpressions)
    {
      newExpressions.forEach(function(newExpression) {
        var found = false;
        oldExpressions.forEach(function(oldExpression) {
          if (newExpression === oldExpression) {
            found = true;
          }
        });
        if (!found) {
          oldExpressions.push(newExpression);
        }
      });
      return oldExpressions;
    }
  }
);

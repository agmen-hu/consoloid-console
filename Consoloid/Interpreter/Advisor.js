defineClass('Consoloid.Interpreter.Advisor', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base(options);

      this.context = this.get('context');
      this.tree = this.get('letter_tree');
      builder = this.create('Consoloid.Interpreter.TreeBuilder', { tree: this.tree, container: this.container });
      builder.build();
    },

    autocomplete: function(text, args)
    {
      args = args || [];
      var result = [];
      var $this = this;
      var words = this.tree.getWords(text);
      $.each(this.tree.autocomplete(text), function(index, hit) {
        var expression = hit.entity;
        var sentence = expression.getSentence();

        if (!sentence.requiredContextIsAvailable()) {
          return;
        }

        $.each(sentence.autocompleteArguments(args), function(index, argumentValues) {
          if ($this.__hasInlineArgumentForAnArgumentValue(expression, argumentValues)) {
            return;
          }

          var autocompletedArgumentValues = $this.__autocompleteArgumentValues(sentence, $.extend(null, hit.values, argumentValues));
          var argumentValueVersionList = $this.__buildAutocompletedArgumentValueOptions(autocompletedArgumentValues, sentence);

          for (var i = 0, len = argumentValueVersionList.length; i < len; i++) {
            result.push({
              sentence: sentence,
              expression: expression,
              value: expression.getTextWithArguments(argumentValueVersionList[i]),
              arguments: argumentValueVersionList[i],
              score: expression.getAutocompleteScore(words, argumentValueVersionList[i])
            });
          }
        });
      });

      result.sort(function(a, b) {
        return b.score - a.score;
      });

      return result;
    },

    __hasInlineArgumentForAnArgumentValue: function(expression, values)
    {
      var result = false;
      $.each(values, function(name, value) {
        if (expression.hasInlineArgument(name)) {
          result = true;
        }
      });

      return result;
    },

    __autocompleteArgumentValues: function(sentence, mergedArgumentValues)
    {
      var autocompletedArgumentValues = {};
      var arg;
      var convertedObj;
      for (var argumentName in mergedArgumentValues) {
        arg = sentence.arguments[argumentName];
        if (arg.isComplexType()) {
          autocompletedArgumentValues[argumentName] = this.context.autocomplete(mergedArgumentValues[argumentName], arg.getType());

          if (autocompletedArgumentValues[argumentName][0] == undefined || !autocompletedArgumentValues[argumentName][0].exactMatch) {
            try {
              convertedObj = this.__createContextObjectFromString(mergedArgumentValues[argumentName], arg.getType());
              autocompletedArgumentValues[argumentName].unshift({entity: convertedObj, value: convertedObj.toString(), exactMatch: true});
            } catch (e) {
              autocompletedArgumentValues[argumentName].push({value: mergedArgumentValues[argumentName], erroneous: true, message: e.message});
            }
          }
        } else {
          autocompletedArgumentValues[argumentName] = [{
            value: mergedArgumentValues[argumentName],
            exactMatch:true
          }];
        }
      }
      return autocompletedArgumentValues;
    },

    __createContextObjectFromString: function(str, cls)
    {
      if (typeof cls == 'string') {
        cls = getClass(cls);
      }

      return cls.fromString(str, this.container);
    },

    __buildAutocompletedArgumentValueOptions: function(autocompletedArgumentValues, sentence)
    {
      var nodes = [{availableOptions: autocompletedArgumentValues, values:{}}];
      var result = [];
      while(nodes.length > 0) {
        var node = nodes.shift();
        var argumentName = this.__getFirstObjectProperty(node.availableOptions);
        if (argumentName === undefined) {
          if (sentence.validateArguments(node.values)) {
            result.push(node.values);
          }
          continue;
        }
        for (var i = 0,len = node.availableOptions[argumentName].length; i < len; i++) {
          nodes.push(this.__createArgumentOption(node, argumentName, i));
        }
      }
      return result;
    },

    __getFirstObjectProperty: function(obj)
    {
      return Object.keys(obj)[0];
    },

    __createArgumentOption: function(node, argumentName, elementIndex)
    {
      var argumentValue = node.availableOptions[argumentName][elementIndex];
      var newOptions = $.extend(null, node.availableOptions);
      delete newOptions[argumentName];
      var newValues = $.extend(null, node.values);
      newValues[argumentName] = argumentValue;

      return {availableOptions: newOptions, values: newValues};
    }
  }
);

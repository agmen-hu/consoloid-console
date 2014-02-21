defineClass('Consoloid.Interpreter.LetterTree', 'Consoloid.Interpreter.Letter',
  {
    addEntity: function(entity)
    {
      var $this = this;
      $.each(entity.getTokens(), function(index, token) {
        if (token.getType() == Consoloid.Interpreter.Token.LITERAL) {
          $this.__addToken.apply($this, [ token ]);
        }
      });
    },

    __addToken: function(token)
    {
      var node = this;
      var text = token.getText();
      for (var i = 0 ; i < text.length ; i++) {
        var letter = text[i];
        node = node.getOrCreateChild(letter.toLowerCase());
        node.addEntity(token);
      }
    },

    removeEntity: function(entity)
    {
      var $this = this;
      $.each(entity.getTokens(), function(index, token) {
        if (token.getType() == Consoloid.Interpreter.Token.LITERAL) {
          $this.__removeToken(token);
        }
      });
    },

    __removeToken: function(token)
    {
      var node = this;
      var text = token.getText();
      for (var i = 0 ; i < text.length ; i++) {
        var letter = text[i];
        try {
          var child = node.getChild(letter.toLowerCase());
          child.removeEntity(token);
          if (child.getEntities().length == 0) {
            delete node.children[letter.toLowerCase()];
          }
        } catch (err) {
        }

        node = child;
      };
    },

    /**
     * Search for entities matching given text.
     *
     * @param String text Text to match.
     * @return Array Array of added entities matching given text.
     */
    autocomplete: function(text)
    {
      var $this = this;

      var words = [];
      try {
        words = this.getWords(text);
      } catch(error) {
        return [];
      }

      var word = words.shift();
      var result = this.__initializeAutocompleteResults(word);

      $.each(words, function(index, word) {
        result = $this.__filterAutocompleteResults.apply($this, [word, result]);
      });

      result = this.__removeDuplicateEntites(result);
      return result;
    },

    getWords: function(text)
    {
      return this.get('tokenizer').parse(text);
    },

   /**
   * Initializes autocomplete result set by searching for the first word.
   *
   * @param {Object} word
   * @return Array [{ entity: entity, tokens: [ token, ... ], values: { argument_name: value } }, ...]
   */
    __initializeAutocompleteResults: function(word)
    {
      var result = [];
      $.each(this._findTokens(word), function(index, token) {
        result.push({
          entity: token.getEntity(),
          tokens: [ token ],
          values: {}
        });
      });

      return result;
    },

    _findTokens: function(word)
    {
      var result = [];
      var node = this;
      var $this = this;
      try {
        $.each(word, function(index, letter) {
          node = node.getChild(letter.toLowerCase());
        });

        $.each(node.getEntities(), function(index, token) {
          if (!$this.__isEntityIsReferredInTokens.apply($this, [token, result])) {
            result.push(token);
          }
        });
      } catch(err) {
      }

      return result;
    },

    __isEntityIsReferredInTokens: function(currentToken, tokens)
    {
      var result = false;
      $.each(tokens, function(index, token) {
        if (token.getEntity() === currentToken.getEntity() && token.getIndex() === currentToken.getIndex()) {
          result = true;
        }
      });

      return result;
    },

    __filterAutocompleteResults: function(word, result)
    {
      if (!word.length) {
        return result;
      }

      var tokens = this._findTokens(word);
      var length = result.length;
      for (var index = 0; index < length ; index++) {
        var hit = result[index];
        var token = this.__getNextMatchingTokenForAutocompleteResult(hit, tokens);

        if (token) {
          result[index].tokens.push(token);
          if (token.getType() == Consoloid.Interpreter.Token.ARGUMENT_VALUE) {
            result[index].values[token.getText()] = word;
          }
        } else {
          result.splice(index, 1);
          index--;
          length--;
        }
      };

      return result;
    },

    __getNextMatchingTokenForAutocompleteResult: function(hit, tokens)
    {
      var lastTokenIndex = hit.tokens[hit.tokens.length - 1].getIndex();
      var nextLiteralToken = null;

      $.each(tokens, function(index, token) {
        if (token.getEntity() == hit.entity &&
            token.getIndex() > lastTokenIndex &&
            token.getType() == Consoloid.Interpreter.Token.LITERAL &&
            (nextLiteralToken === null || nextLiteralToken.getIndex() > token.getIndex())
        ) {
          nextLiteralToken = token;
        }
      });

      return nextLiteralToken ? nextLiteralToken : this.__getNextMatchingArgumentValueToken(hit, tokens);
    },

    __getNextMatchingArgumentValueToken: function(hit, tokens)
    {
      var lastTokenIndex = hit.tokens[hit.tokens.length - 1].getIndex();

      var nextArgumentValueToken = null;
      var hitEntityTokens = hit.entity.getTokens();
      var length = hitEntityTokens.length;
      for (var i = lastTokenIndex + 1 ; i < length ; i++) {
        var token = hitEntityTokens[i];
        if (token.getType() == Consoloid.Interpreter.Token.ARGUMENT_VALUE) {
          nextArgumentValueToken = token;
          break;
        }
      }

      return nextArgumentValueToken;
    },

    __removeDuplicateEntites: function(elements) {
      var result = [], needsInsertion;
      $.each(elements, function(index, element) {
        needsInsertion = true;
        $.each(result, function (resultIndex, resultElement) {
          if (element.entity === resultElement.entity) {
            needsInsertion = false;
            if (element.tokens.length > resultElement.tokens.length) {
              result[resultIndex] = element;
            }
          }
        });
        if (needsInsertion) {
          result.push(element);
        }
      })

      return result;
    }
  }
);

defineClass('Consoloid.Ui.SentenceAutocompleteValidator', 'Consoloid.Form.Validator.BaseValidator',
  {
    __constructor: function(options)
    {
      this.__base(options);
      this.requireProperty('expression');
    },

    validate: function()
    {
      return this.__base();
    },

    validateField: function(field)
    {
      this.__getFirstAutocompleteResultFromDialogLauncher();

      var argument = this.autocompleteResult.arguments[field.getName()];
      if (argument.erroneous) {
        field.setErrorMessage(argument.message);
        return false;
      }

      return true;
    },

    __getFirstAutocompleteResultFromDialogLauncher: function() {
      var args = {};
      this.fieldNames.forEach(function(key) {
        args[key] = {
          value: this.get('form').getField(key).getValue()
        };
      }.bind(this));

      this.autocompleteResult = this.get("dialogLauncher").getAllAutocompleteOptions(this.expression.getTextWithArguments(args))[0];
    }
  }
);
defineClass('Consoloid.Ui.ArgumentFixerDialog', 'Consoloid.Ui.MultiStateDialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        states: {
          'active': 'Consoloid-Ui-ArgumentFixerDialogActive',
          'done': 'Consoloid-Ui-ArgumentFixerDialogDone'
        },
        activeState: 'active'
      }, options));

      this
        .addEventListener('a.arguments-read', 'click', this.startDialog);
    },

    startDialog: function()
    {
      this.form.parseUserInput();
      if (!this.form.validate()) {
        return;
      }

      var args = {};

      $.each($.extend({}, this.arguments.options.arguments, this.__getMappedFormValues()), function(name, value) {
        args[name] = value;
      });

      this.argumentsRead = this.form.getValue();
      this.switchState('done');

      this.get('console').prompt.launchDialog(this.arguments.options.expression.getTextWithArguments(args));
    },

    __getMappedFormValues: function()
    {
      var result = {};
      $.each(this.form.getValue(), function(name, value) {
        result[name] = {
          value: value
        };
      });

      return result;
    },

    setup: function()
    {
      this.expression.text = this.arguments.text;
      this.form = this.create('Consoloid.Form.Form', {
        name: 'readArguments',
        fieldDefinitions: this.__getFieldDefinitions(),
        validatorDefinitions: this.__getValidatorDefinitions(),
        container: this.container
      });
      this.__setFieldInitialValues();
    },

    __getFieldDefinitions: function()
    {
      var result = {};
      $.each(this.arguments.options.sentence.arguments, function(name, argument) {
        if (!argument.isRequired() && !((name in this.arguments.options.arguments) && this.arguments.options.arguments[name].erroneous)) {
          return;
        }

        result[name] = {
          cls: 'Consoloid.Form.Text',
          options: {
            title: name
          }
        };
      }.bind(this));

      return result;
    },

    __getValidatorDefinitions: function()
    {
      var fields = [];
      $.each(this.arguments.options.sentence.arguments, function(name, argument) {
        if (!argument.isRequired()) {
          return;
        }

        fields.push(name);
      });

      return {
        nonEmpty: {
          cls: 'Consoloid.Form.Validator.NonEmpty',
          options: {
            fieldNames: fields
          }
        }
      };
    },

    __setFieldInitialValues: function()
    {
      var values = {};
      var $this = this;

      $.each(this.arguments.options.sentence.arguments, function(name, argument) {
        if (!argument.isRequired() && !((name in $this.arguments.options.arguments) && $this.arguments.options.arguments[name].erroneous)) {
          return;
        }

        if (name in $this.arguments.options.arguments) {
          values[name] = $this.arguments.options.arguments[name].value;
        }
      });

      this.form.setValue(values);

      $.each(values, function(name) {
        $this.form.getField(name).setErrorMessage($this.arguments.options.arguments[name].message);
      });
    },

    render: function()
    {
      this._updateResponseTemplate();
      this._renderExpressionAndResponse();
      this._renderForm();
      this._animateDialogShowup();
      this._bindEventListeners();
      return this;
    },

    _renderForm: function()
    {
      if (this.activeState != 'active') {
        return;
      }

      this.form
        .setNode(this.node.find('div.form'))
        .render()
        .focus();
    }
  }
);

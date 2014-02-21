defineClass('Consoloid.Ui.ArgumentReaderDialog', 'Consoloid.Ui.MultiStateDialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        states: {
          'active': 'Consoloid-Ui-ArgumentReaderDialogActive',
          'done': 'Consoloid-Ui-ArgumentReaderDialogDone'
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

      $.each($.extend({}, this.arguments.options.arguments, this.form.getValue()), function(name, value) {
        args[name] = { value: value };
      });

      this.argumentsRead = this.form.getValue();
      this.switchState('done');

      this.get('console').prompt.launchDialog(this.arguments.options.expression.getTextWithArguments(args));
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
        if (!argument.isRequired()) {
          return;
        }

        result[name] = {
          cls: 'Consoloid.Form.Text',
          options: {
            title: name
          }
        };
      });

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
          options: fields
        }
      };
    },

    __setFieldInitialValues: function()
    {
      var values = {};
      var $this = this;

      $.each(this.arguments.options.sentence.arguments, function(name, argument) {
        if (!argument.isRequired()) {
          return;
        }

        if (name in $this.arguments.options.arguments) {
          values[name] = $this.arguments.options.arguments[name];
        }
      });

      this.form.setValue(values);
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

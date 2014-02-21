defineClass('Consoloid.Ui.Dialog', 'Consoloid.Widget.Widget',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        node: $('<div />'),
        templateId: 'Consoloid-Ui-Dialog'
      }, options));

      this.requireProperty('responseTemplateId');
      this.responseTemplate = this.create('Consoloid.Widget.JQoteTemplate', {
        id: this.responseTemplateId,
        container: this.container
      });

      this.expression = null;
      this.response = null;

      this
        .addEventListener('a.remove', 'click', this.remove);
    },

    start: function(args, expression)
    {
      this.handleArguments(args, expression);
      this.setup();
      this.render();
    },

    handleArguments: function(args, expression)
    {
      this.arguments = args;
      this.expression = this.create('Consoloid.Ui.Expression', {
        templateId: this.get('resource_loader').getParameter('dialog.expressionTemplate'),
        model: expression,
        arguments: args,
        container: this.container
      });

      this.node = this.get('console').createNewDialog(this);
    },

    setup: function()
    {
    },

    render: function()
    {
      this._renderExpressionAndResponse();
      this._animateDialogShowup();
      this._bindEventListeners();
      return this;
    },

    _renderExpressionAndResponse: function()
    {
      this.node.empty().jqoteapp(this.template.get(), this);

      this.expression.node = this.node.find('div.request');
      this.expression.render();

      this.response = this.node.find('div.response');
      this.response.empty().jqoteapp(this.responseTemplate.get(), this);
    },

    _animateDialogShowup: function()
    {
      var responseHeight = this.response.height();
      var topOfDialog = $('body').height() - this.node.height();
      var scrollTo = topOfDialog - (window.innerHeight - this.get('console').getVisibleDialogsHeight());

      this.response.height(0).animate({height: responseHeight+'px'}, 400, 'swing', function() {
        this.response.css({ height: '' });
      }.bind(this));
      $('body,html').animate({ scrollTop: scrollTo }, 400);
      this.get('console').animateMarginTopIfNecessary(responseHeight);
    },

    bindToDom: function(node)
    {
      this.node = node;
      this._bindEventListeners();
    },

    remove: function()
    {
      this.get('console').removeDialog(this);
      $('body,html').animate({'scrollTop':$(window).scrollTop()}, 400);
      this.get('console').animateMarginTopIfNecessary(this.node.height()*-1);
      this.node.animate({height:0}, 400, function(){ this.node.remove(); }.bind(this));
      return false;
    },

    __lookupContextObject: function(cls, index, errorMessage)
    {
      var contextObjects = this.container.get('context').findByClass(cls);

      if (contextObjects.length == 0) {
        throw this.create('Consoloid.Error.UserMessage', { message: this.get('translator').trans(errorMessage || "Can't find object.") });
      }

      return contextObjects[index || 0];
    }
  }
);

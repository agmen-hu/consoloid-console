defineClass('Consoloid.Tutorial.BalloonAbsorbingDialog', 'Consoloid.Ui.Dialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        responseTemplateId: 'Consoloid-Tutorial-BalloonAbsorbingDialog',
      }, options));
    },

    _renderExpressionAndResponse: function()
    {
      this.__base();
      this.balloon = this.container.get("tutorial").getBalloon();

      this.reservedHeight = this.balloon.node.outerHeight(true);
      this.node.find(".reserved.space.for.balloon").height(this.reservedHeight);
      this.node.find("div.response").css("padding", 0);
    },

    setAfterShownUpCallback: function(callback)
    {
      this.afterShownUpCallback = callback;
    },

    _afterAnimateDialogShowup: function()
    {
      this.__base();
      this.afterShownUpCallback();
    },

    absorbBalloon: function(balloon)
    {
      this.node.find(".reserved.space.for.balloon").height(0);
      balloon.node.insertBefore(this.node.find(".balloon.anchor"));
    }
  }
);
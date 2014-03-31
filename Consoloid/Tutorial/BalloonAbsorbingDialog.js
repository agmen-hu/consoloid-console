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

      this.node.find(".reserved.space.for.balloon").height(this.balloon.outerHeight());
      this.node.find("div.response").css("padding", 0);
    },

    setAfterShownUpCallback: function(callback)
    {
      this.afterShownUpCallback = callback;
    },

    _afterAnimateDialogShowup: function()
    {
      this.__base();
      this.balloon.moveBellowLeftOf(this.node.find(".balloon.anchor"), this.absorbBalloon.bind(this));
    },

    absorbBalloon: function()
    {
      this.balloon
        .removeShadow()
        .setToRelativePosition();

      this.node.find(".reserved.space.for.balloon").hide();
      this.balloon.node.insertAfter(this.node.find(".balloon.anchor"));
    }
  }
);
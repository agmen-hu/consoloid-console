defineClass('Consoloid.Tutorial.Controller', 'Consoloid.Base.Object',
  {
    start: function()
    {
      this.get('css_loader').load('Consoloid-Tutorial-tutorial')
      this.balloon = this.create("Consoloid.Tutorial.Balloon", { container: this.container, addedClass: "center" });
      this.balloon.render();
      this.balloon.center().addShadow().fadeIn();

      global.balloon = this.balloon;

      setTimeout(function() {
        this.balloon.setWidth(100).addContent("Consoloid-Tutorial-Balloon-OtherRandomContent").moveAboveLeftOf(".prompt .human-text").addBottomLeftTail();
      }.bind(this), 3000);

      setTimeout(function() {
        this.balloon.setHeight(500).moveAboveRightOf("#prompt-mic").addBottomRightTail();
      }.bind(this), 10000);

      setTimeout(function() {
        this.balloon.turnIntoADialog();
      }.bind(this), 15000);

      setTimeout(function() {
        this.balloon.fadeOut();

        var dialog = this.container.get("console").getDialogItWasStartedWith();
        dialog.startWithoutExpression();
      }.bind(this), 20000);
    }
  }
);
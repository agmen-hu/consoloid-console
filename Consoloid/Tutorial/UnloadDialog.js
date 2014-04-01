defineClass('Consoloid.Tutorial.UnloadDialog', 'Consoloid.Ui.Dialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        responseTemplateId: 'Consoloid-Tutorial-UnloadDialog',
      }, options));
    },

    setup: function() {
      this.get("console").unloadTopic("tutorial");
      document.cookie = "consoloid_tutorial_was_dismissed=true";
    }
  }
);
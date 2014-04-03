defineClass('Consoloid.Tutorial.Dialog.Start', 'Consoloid.Ui.Volatile.Dialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        message: __('Started the tutorial.'),
      }, options));
    },

    setup: function() {
      this.__base();
      this.get("tutorial").start();
    }
  }
);
defineClass('Consoloid.Ui.List.View.Mousewheel', 'Consoloid.Ui.List.View.Base',
  {
    __constructor: function(options)
    {
      this.__base(options);

      this.__loadResources();
    },

    __loadResources: function()
    {
      var resourceLoader = this.get('resource_loader');

      if ($.fn.mousewheel === undefined) {
        eval(resourceLoader.getJs('Consoloid/Ui/List/jquery.mousewheel'));
      }
    },

    __renderCompleteList: function(data, fromIndex)
    {
      this.__base(data, fromIndex);

      this.list
        .bind(
          'mousewheel',
          function(event, delta) {
            this.__mouseWheelHandler(delta);
            event.stopPropagation();
            return false;
          }.bind(this)
        );
    },

    __mouseWheelHandler: function(delta)
    {
      if (this.scrollState != "none" && this.scrollState != "mousewheel") {
        return;
      }

      var targetScrollTopChanged = this.__updateTargetScrollTop(delta);

      if (targetScrollTopChanged) {
        if (this.scrollState == "none") {
          this.__setScrollState('mousewheel');
        }

        this.list
          .stop()
          .animate({
            scrollTop: this.targetScrollTop
          }, {
            complete: this.__mouseWheelAnimationDone.bind(this)
          });
      }
    },

    __updateTargetScrollTop: function(delta)
    {
      var target = (this.targetScrollTop === undefined) ?
        this.list.scrollTop() :
        this.targetScrollTop;

      target -= delta * this.elementHeight;

      if (this.__isValidScrollTarget(target)) {
        this.targetScrollTop = target;
        return true;
      } else {
        return false;
      }
    },

    __isValidScrollTarget: function(target)
    {
      return target >= 0 &&
        target <= (this.list[0].scrollHeight - this.elementHeight * this.numPerPage);
    },

    __mouseWheelAnimationDone: function() {
        this.targetScrollTop = undefined;
        this.__adjustScrolledList();
    },

    __cancelScrolling: function()
    {
      this.__base();

      this.targetScrollTop = undefined;
    },


    __detachEventListenersDrawThrobber: function()
    {
      this.__base();

      this.list.unbind('mousewheel');
    },
  }
);

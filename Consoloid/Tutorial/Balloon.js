defineClass('Consoloid.Tutorial.Balloon', 'Consoloid.Widget.Widget',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        templateId: "Consoloid-Tutorial-Balloon",
        contentTemplateId: "Consoloid-Tutorial-Balloon-RandomContent",
        width: undefined,
        height: undefined
      }, options));
    },

    render: function()
    {
      this.__base();
      this.node.addClass("tutorial balloon");
      this.node.css("position", "fixed");
      this.addContent();
      this.node.hide();
      this.node.prependTo($("body"));
      this.__setStartSize();
    },

    addContent: function(contentTemplateId)
    {
      var contentNode = this.node.find(".content");
      this.contentTemplateId = contentTemplateId || this.contentTemplateId;
      var content = this.create('Consoloid.Widget.Widget', {
        templateId:this.contentTemplateId,
        container: this.container,
        node: contentNode
      });

      contentNode.fadeOut(function() {
        contentNode.empty();
        content.render();
        contentNode.fadeIn();
      });

      return this;
    },

    __setStartSize: function()
    {
      this.width = this.width || this.node.width();
      this.height = this.height || this.node.height();

      this.node.width(this.width);
      this.node.height(this.height);
    },

    outerWidth: function()
    {
      return this.width + this.__horizontalPaddingAndMargin();
    },

    __horizontalPaddingAndMargin: function()
    {
      return parseInt(this.node.css("margin-left")) + parseInt(this.node.css("margin-right")) + parseInt(this.node.css("padding-left")) + parseInt(this.node.css("padding-right"));
    },

    outerHeight: function()
    {
      return this.height + this.__verticalPaddingAndMargin();
    },

    __verticalPaddingAndMargin: function()
    {
      return parseInt(this.node.css("margin-top")) + parseInt(this.node.css("margin-bottom")) + parseInt(this.node.css("padding-top")) + parseInt(this.node.css("padding-bottom"));
    },

    addShadow: function()
    {
      this.node.removeClass("without shadow").addClass("with shadow").animate({
        marginTop: "1rem",
        margLeft: "1rem",
        marginBottom: "1.2rem",
        marginRight: "1.1rem"
      }, 1000);
      return this;
    },

    removeShadow: function()
    {
      this.node.removeClass("with shadow").addClass("without shadow").animate({
        marginTop: "1.2rem",
        marginLeft:"1.1rem",
        marginBottom: "1rem",
        marginRight: "1rem"
      }, 1000);
      return this;
    },

    setWidth: function(width)
    {
      return this.setSize(width, "auto");
    },

    setSize: function(width, height)
    {
      var
        oldWidth = this.width,
        oldHeight = this.height;

      this.node.css({
        width: width,
        height: height
      });

      this.width = Math.min(this.node.width(), $(window).width() - this.__horizontalPaddingAndMargin());
      this.height = Math.min(this.node.height(), $(window).height() - this.__verticalPaddingAndMargin());

      this.node.css({
        width: oldWidth,
        height: oldHeight
      });

      this.node.animate({
        width: this.width,
        height: this.height
      });
      return this;
    },

    setHeight: function(height)
    {
      return this.setSize("auto", height);
    },

    center: function()
    {
      this.removeTail();
      this.node.animate({
        bottom: ($(window).height() - this.outerHeight()) / 2 + "px",
        left: ($(window).width() - this.outerWidth()) / 2 + "px",
      });
      return this;
    },

    removeTail: function()
    {
      this.node.removeClass("bottom left right tail");
      return this;
    },

    moveAboveLeftOf: function(selector, complete)
    {
      return this.__moveTo(selector, this.__self.DIRECTION_ABOVE_LEFT, complete);
    },

    moveAboveRightOf: function(selector, complete)
    {
      return this.__moveTo(selector, this.__self.DIRECTION_ABOVE_RIGHT, complete);
    },

    moveBelowLeftOf: function(selector, complete)
    {
      return this.__moveTo(selector, this.__self.DIRECTION_BELOW_LEFT, complete);
    },

    __moveTo: function(selector, direction, complete)
    {
      var targetOffset = this.__getTargetOffset(selector);
      var
        left = 0
        bottom = 0;
      switch(direction) {
        case this.__self.DIRECTION_ABOVE_LEFT:
          left = targetOffset.left;
          bottom = $(window).height() - targetOffset.top;
          break;
        case this.__self.DIRECTION_ABOVE_RIGHT:
          left = targetOffset.left - this.outerWidth() + $(selector).outerWidth();
          bottom = $(window).height() - targetOffset.top;
          break;
        case this.__self.DIRECTION_BELOW_LEFT:
          left = targetOffset.left - this.outerWidth() + $(selector).outerWidth();
          bottom = $(window).height() - targetOffset.top - $(selector).outerHeight(true) - this.outerHeight();
          break;
        default:
          throw new Error("Unknown balloon move direction");
      }

      var maximalLeftOffset = $(window).width() - this.outerWidth();

      this.node.animate({
        bottom: bottom,
        left: Math.min(Math.max(left, 0), maximalLeftOffset),
      },{
        complete: complete
      });
      return this;
    },

    __getTargetOffset: function(selector)
    {
      var targetOffset = $(selector).offset();
      targetOffset.top -= ($(document).height() - $(window).height());
      targetOffset.left -= ($(document).width() - $(window).width());
      return targetOffset;
    },

    addBottomLeftTail: function()
    {
      this.removeTail();
      this.node.addClass("bottom left tail");
      return this;
    },

    addBottomRightTail: function()
    {
      this.removeTail();
      this.node.addClass("bottom right tail");
      return this;
    },

    fadeIn: function()
    {
      this.node.fadeIn();
      return this;
    },

    fadeOut: function()
    {
      this.node.fadeOut();
      return this;
    },

    turnIntoADialog: function()
    {
      this.dialog = this.container.get("balloon_absorbing_dialog");
      this
        .setSize("100%", "100px")
        .removeTail();

      this.dialog.start({}, this.__createWhatIsADialogExpression());
      return this;
    },

    __createWhatIsADialogExpression: function() {
      return this.create(
          'Consoloid.Interpreter.Expression',
        {
          sentence: this.container.get("what_is_a_dialog_sentence"),
          pattern: __("What is a dialog?"),
          container: this.container,
        }
      );
    },

    setToRelativePosition: function()
    {
      this.node.css({
        position: "relative",
        left: 0,
        bottom: 0
      });
    }

  }, {
    DIRECTION_ABOVE_LEFT: 0,
    DIRECTION_ABOVE_RIGHT: 1,
    DIRECTION_BELOW_LEFT: 2,
  }
);
defineClass('Consoloid.I18n.ClientSideTranslator', 'Consoloid.I18n.Translator',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        domains: Consoloid.I18n.ClientSideTranslator.CACHED_DOMAINS
      }, options));
      this.requireProperty('language');
      this.translatorRepository = this.translatorRepository || this.container.get('translator_repository');
    },

    setLanguage: function(language)
    {
      this.language = language;
      this.domains = { _default: {} };
    },

    resolveMissing: function(message)
    {
      try {
        var domain = this.translatorRepository.retrieveDomainHavingMessage(this.language, message);
        this.addMessages(domain.messages, domain.name);
        return domain.messages;
      } catch(e) {
        this.domains._default[message] = message;
        return this.domains._default;
      }
    }
  },
  {
    CACHED_DOMAINS: { _default: {} }
  }
);
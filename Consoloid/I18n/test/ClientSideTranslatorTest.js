var should = require("should");
var sinon = require("sinon");

require('../Translator');
require('../ClientSideTranslator');
describe('Consoloid.I18n.ClientSideTranslator', function(){
  var
    env,
    repository,
    translator;

  var mockRepositoryRetrieveDomainHavingMessage = function(callback) {
    repository.retrieveDomainHavingMessage = function(lang, message) {
      return callback(lang, message);
    }
    return sinon.spy(repository, 'retrieveDomainHavingMessage');
  }

  beforeEach(function() {
    env = new Consoloid.Test.Environment();
    repository = {};
    translator = env.create('Consoloid.I18n.ClientSideTranslator', {
      language: 'hu',
      translatorRepository: repository,
      domains: { _default: {} }
    });
  });

  describe('#resolveMissing(text)', function() {
    it('should try to download string in remote vocabulary (blocking) and add all received string to local vocabulary', function() {
      var spy = mockRepositoryRetrieveDomainHavingMessage(function(lang, message) {
        return { name: 'Consoloid.Test', messages: { 'Apply': 'TestResult' } };
      });

      translator.trans('Apply')
        .should.be.equal('TestResult');

      spy.calledOnce.should.be.ok;
      spy.alwaysCalledWith('hu', 'Apply');
    });

    it('should return original message when string is missing from remote vocabulary', function() {
      var spy = mockRepositoryRetrieveDomainHavingMessage(function(lang, message) {
        throw new Error('Unable to translate message "' + message + '"');
      });

      translator.trans('Apply')
        .should.be.equal('Apply');

      spy.calledOnce.should.be.ok;
    });

    it('should not download already downloaded package', function() {
      var spy = mockRepositoryRetrieveDomainHavingMessage(function(lang, message) {
        return { name: 'Consoloid.Test', messages: { 'Apply': 'TestResult' } };
      });

      translator.trans('Apply')
      translator.trans('Apply');

      spy.calledOnce.should.be.ok;
    });
  });

  describe('#setLanguage(lang)', function() {
    it('should clear vocabulary', function() {
      translator.addMessages({ 'test': 'teszt' });
      translator.trans('test').should.be.equal('teszt');
      translator.setLanguage('en');
      translator.trans('test').should.be.equal('test');
    });
  });
});

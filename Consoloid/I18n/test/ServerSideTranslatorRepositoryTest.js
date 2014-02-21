var should = require("should");
var sinon = require("sinon");

require('../Translator');
require('../ServerSideTranslator');
require('../ServerSideTranslatorRepository');
describe('Consoloid.I18n.ServerSideTranslatorRepository', function(){
  var
    env,
    repository;

  beforeEach(function() {
    env = new Consoloid.Test.Environment();
    repository = env.create('Consoloid.I18n.ServerSideTranslatorRepository', {});
  });

  describe('#addYamlCatalogsFromDirectory(directoryName)', function() {
    it('should add each file using its name as language to repository', function() {
      repository.addYamlCatalogsFromDirectory(__dirname + '/test-messages');
      repository.setLanguage('hu');
      repository.trans('Apply')
        .should.be.equal('Alkalmaz');
    });
  });

  describe('#setLanguage(language)', function() {
    it('should set default language', function() {
      repository.setLanguage('hu');
      repository.getLanguage()
        .should.be.equal('hu');
      repository.addYamlCatalogsFromDirectory(__dirname + '/test-messages');
      repository.trans('Apply')
        .should.be.equal('Alkalmaz');
    });
  });

  describe('#trans(message)', function() {
    it('should translate message to default language', function() {
      // Note that this test expects that the default language is en.
      repository.addYamlCatalogsFromDirectory(__dirname + '/test-messages');
      repository.trans('Apply')
        .should.be.equal('Translated Apply');
    });
  });

  describe('#retrieveDomainHavingMessage(language, message)', function() {
    it('should return package vocabulary for given language and message', function() {
      repository.addYamlCatalogsFromDirectory(__dirname + '/test-messages');
      repository.retrieveDomainHavingMessage('hu', 'Apply')
        .should.be.eql({ name: 'testpkg', messages: {
          'Apply': 'Alkalmaz',
          'Add': 'Hozzáad',
          'Foo Bar': 'Árvíztűrő tükörfúrógép'
        }});
    });

    it('should throw error when message was not found given language', function() {
      repository.addYamlCatalogsFromDirectory(__dirname + '/test-messages');
      (function() { repository.retrieveDomainHavingMessage('pl', 'Apply'); })
        .should.throwError(/Message "Apply" was not found in any domain/);
    });
  })

  afterEach(function() {
    env.shutdown();
  });
});

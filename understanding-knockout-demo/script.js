document.addEventListener('DOMContentLoaded', function() {
  function PhonesViewModel() {
    var self = this;
    self.phones = ko.observableArray([{
      name: 'Sony Xperia Z1',
      os: 'Android',
      price: 599
    }, {
      name: 'Apple iPhone 5S',
      os: 'iOS',
      price: 199
    }, {
      name: 'Google Nexus 5',
      os: 'Android',
      price: 299
    }]);


    self.currentPhone = ko.mapping.fromJS({
      name: '',
      os: '',
      price: ''
    });

    self.addPhone = function() {
      self.phones.push(ko.mapping.toJS(self.currentPhone));
      self.currentPhone.name('');
      self.currentPhone.os('');
      self.currentPhone.price('');
    };
    self.removePhone = function() {
      self.phones.remove(this);
    };
  }
  ko.applyBindings(new PhonesViewModel());
});
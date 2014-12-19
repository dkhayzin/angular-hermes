angular
  .module("dkhayzin.hermes", [])
  .factory("hermes", [function() {
    var toString = Object.prototype.toString;
    var eventChannels = {};

    function Hermes(name) {
      this._name = name;
      this._events = {};
      this._wildcardRgx = {};
      eventChannels[name] = this;
    }

    Hermes.prototype = {
      on: function(eventName, listener, $scope) {
        console.log(this);
        var self = this;
        var args = arguments;

        if(eventName.indexOf('*') > -1) {
          this._wildcardRgx[eventName] = this._wildcardRgx[eventName] || new RegExp('^' + eventName.replace(/\./g, '\\.').replace(/\*/g, "[^\.:]+?") + '$');
        }

        this._events[eventName] = this._events[eventName] || [];
        if(toString.apply(listener) !== "[object Function]") {
          throw new Error("handler is not a function");
        }
        this._events[eventName].push(listener);

        var unbind = function() {
          self.off.apply(self, args);
        };

        $scope.$on('$destroy', unbind);

        return unbind;
      },
      off: function(eventName, listener) {
        if(listener) {
          var events = this._events[eventName];
          delete events[_.indexOf(events, listener)];
        } else {
//          delete this._events[eventName];
        }
      },
      trigger: function(eventName, data) {
        var self = this;
        var keys = _.filter(Object.keys(this._events), function(key) {
          return key === eventName || self._wildcardRgx[key] && self._wildcardRgx[key].exec(eventName);
        });

        _.each(keys, function(key) {
          _.each(self._events[key], function(method) {
            method.apply({
              event: eventName
            }, data);
          })
        })
      }
    };

    return {
      messengerBag: function(channel, $scope) {
        var chan = eventChannels[channel] || new Hermes(channel);
        return _.extend({}, chan, {on: _.partial(chan.on, _, _, $scope)});
      }
    }
  }]);



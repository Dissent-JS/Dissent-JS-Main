export default class dataBinding {
  constructor(element) {
    this.element = element
  }

  async init() {
    if (process.env.NODE_ENV !== 'production') {
      try {
        const response = await fetch('components/dataBinding/dataBinding.html');
        const dataBindinghtml = await response.text();
        this.element.innerHTML = dataBindinghtml;
      } catch (error) {
        console.error('Failed to load dataBinding component:', error);
        return;
      }
    }

    ((container) => {
      var elements = container.querySelectorAll('[data-tw-bind]'),
        scope = {};
      elements.forEach(function (element) {

        if (element.type === 'text' || element.type === 'textarea') {
          var propToBind = element.getAttribute('data-tw-bind');
          addScopeProp(propToBind);
          element.onkeyup = function () {
            scope[propToBind] = element.value;
          }
        };

        function addScopeProp(prop) {

          if (!scope.hasOwnProperty(prop)) {

            var value;
            Object.defineProperty(scope, prop, {
              set: function (newValue) {
                value = newValue;
                elements.forEach(function (element) {

                  if (element.getAttribute('data-tw-bind') === prop) {
                    if (element.type && (element.type === 'text' ||
                      element.type === 'textarea')) {
                      element.value = newValue;
                    }
                    else if (!element.type) {
                      element.textContent = newValue;
                    }
                  }
                });
              },
              get: function () {
                return value;
              },
              enumerable: true
            });
          }
        }
      });
    })(this.element);
  }
}

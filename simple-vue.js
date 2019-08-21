function SimpleVue(dataObj) {
  // 1- Initiate dependencies object
  let deps = {};

  // 2- Convert data object to reactive properties
  convertDateToReactiveProperties(dataObj);

  function convertDateToReactiveProperties(data) {
    for (prop in data) {
      if (data.hasOwnProperty(prop)) {
        let val = data[prop];

        Object.defineProperty(data, prop, {
          get() {
            return val;
          },
          set(newVal) {
            val = newVal;

            // 5- In property setter, notify other dependencies that property has changed
            notifyOtherDeps(prop);
          }
        });
      }
    }

    // 3- After converting data object to reactive properties, parse DOM
    parseDOM(data);
  }

  function notifyOtherDeps(prop) {
    if (!deps[prop] || !deps[prop].length) return;
    deps[prop].map(dep => dep());
  }

  function parseDOM(reactiveDataObj) {
    let nodes = document.querySelectorAll('[v-model]');

    if (nodes && nodes.length)
      Array.from(nodes).map(node => {
        let propName = node.attributes['v-model'].value;
        let dep = () => (node.textContent = reactiveDataObj[propName]);

        // 4- Attach dependencies to the reactive property
        setReactivePropertyDeps(propName, dep);
      });
  }

  function setReactivePropertyDeps(propName, dep) {
    if (!deps[propName]) deps[propName] = [];

    deps[propName].push(dep);
  }

  return {
    data: dataObj
  };
}

let simpleVue = SimpleVue({
  title: 'Hello all'
});

function updateNode(prop, event) {
  simpleVue.data[prop] = event.target.value;
}

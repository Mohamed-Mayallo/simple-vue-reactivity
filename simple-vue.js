class SimpleVue {
  constructor(dataObj) {
    // 1- Initiate dependencies object
    this.deps = {};

    this.data = dataObj;

    // 2- Convert data object to reactive properties
    this.convertDateToReactiveProperties(this.data);
  }

  convertDateToReactiveProperties(data) {
    for (let prop in data) {
      if (data.hasOwnProperty(prop)) {
        let val = data[prop];

        Object.defineProperty(data, prop, {
          get: () => val,
          set: newVal => {
            val = newVal;

            // 5- In property setter, notify other dependencies that property has changed
            this.notifyOtherDeps(prop);
          }
        });
      }
    }

    // 3- After converting data object to reactive properties, parse DOM
    this.parseDOM(data);
  }

  notifyOtherDeps(prop) {
    if (!this.deps[prop] || !this.deps[prop].length) return;
    this.deps[prop].map(dep => dep());
  }

  parseDOM(reactiveDataObj) {
    let nodes = document.querySelectorAll('[v-model]');

    if (nodes && nodes.length)
      Array.from(nodes).map(node => {
        // Get property name "title"
        let propName = node.attributes['v-model'].value;

        // To set initial value
        node.textContent = reactiveDataObj[propName];

        // Callback that will be attached to the reactive property
        let dep = () => (node.textContent = reactiveDataObj[propName]);

        // 4- Attach dependencies to the reactive property
        this.setReactivePropertyDeps(propName, dep);
      });
  }

  setReactivePropertyDeps(propName, dep) {
    if (!this.deps[propName]) this.deps[propName] = [];

    this.deps[propName].push(dep);
  }
}

let simpleVue = new SimpleVue({
  title: 'Hello all'
});

function updateNode(prop, event) {
  simpleVue.data[prop] = event.target.value;
}

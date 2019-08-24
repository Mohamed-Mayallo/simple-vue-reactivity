class SimpleVue {
  constructor($options) {
    // 1- Initiate dependencies object
    this.deps = {};

    this.data = $options.data;
    this.computed = $options.computed;

    this.reactiveTags = [];

    // 2- Convert data object to reactive properties
    this.convertDateToReactiveProperties(this.data);

    // Wrap constructor accessed property with proxy [ACCESS MODIFIER REPLACEMENT]
    return new Proxy(this, {
      get(instance, property) {
        if (property in instance) return instance[property];
        return (
          instance.data[property] ||
          instance.computed[property] ||
          new Error('This property does not exist')
        );
      },
      set(target, prop, value) {
        console.log(target, prop, value, 'MAY BE USEFUL ....');
      }
    });
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
        this.setReactiveTags(reactiveDataObj, propName);

        node.value = reactiveDataObj[propName];
        node.addEventListener('input', event => {
          reactiveDataObj[propName] = event.target.value;

          this.updateReactiveTagsValues(reactiveDataObj);
        });
      });
  }

  setReactiveTags(reactiveDataObj, property) {
    let boundedElements = [
      ...this.loopOverNodesToBindProps(document.body, property)
    ];

    Array.from(boundedElements).map(n => {
      // To set initial value
      n.textContent = reactiveDataObj[property];
      let dataAttribute = `data-${property}`;
      let dataAttributeValue = Math.floor(Math.random(5) * 123456);
      n.setAttribute(dataAttribute, dataAttributeValue);

      this.reactiveTags.push({
        data: property,
        value: dataAttributeValue
      });

      // Callback that will be attached to the reactive property
      let dep = () => (n.textContent = reactiveDataObj[property]);

      // 4- Attach dependencies to the reactive property
      this.setReactivePropertyDeps(property, dep);
    });
  }

  updateReactiveTagsValues(reactiveDataObj) {
    this.reactiveTags.map(tag => {
      let nodes = document.querySelectorAll(
        `[data-${tag.data.toLowerCase()}="${tag.value}"]`
      );

      Array.from(nodes).map(node => {
        node.textContent = reactiveDataObj[tag.data];

        // Callback that will be attached to the reactive property
        let dep = () => (node.textContent = reactiveDataObj[tag.data]);

        // 4- Attach dependencies to the reactive property
        this.setReactivePropertyDeps(tag.data, dep);
      });
    });
  }

  loopOverNodesToBindProps(parent, propName) {
    let children = parent.children;
    let regex = new RegExp(`\\s*{*\\s*{*\\s*${propName}\\s*}*\\s*}*\\s*`);

    let boundedElements = [];
    if (children && children.length) {
      // Get elements contain the same prop name
      Array.from(children).map(child => {
        if (regex.test(child.textContent)) boundedElements.push(child);
      });
    }
    return boundedElements;
  }

  setReactivePropertyDeps(propName, dep) {
    if (!this.deps[propName]) this.deps[propName] = [];

    this.deps[propName].push(dep);
  }
}

let simpleVue = new SimpleVue({
  data: {
    fName: 'Mohamed',
    lName: 'Mayallo'
  },
  computed: {
    fullName() {
      return `${this.fName} ${this.lName}`;
    }
  }
});

function updateNode(prop, event) {
  simpleVue.data[prop] = event.target.value;
}

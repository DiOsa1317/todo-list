function createElement(tag, attributes, children) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(key, attributes[key]);
    });
  }

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });
  } else if (typeof children === "string") {
    element.appendChild(document.createTextNode(children));
  } else if (children instanceof HTMLElement) {
    element.appendChild(children);
  }

  return element;
}

class Component {
  constructor() {
    this._domNode = null;
  }

  render() {
    throw new Error("Render должен быть переопределен.")
  }

  getDomNode() {
    if(!this._domNode)
      this._domNode = this.render();
    return this._domNode;
  }

  update() {
    const newDomNode = this.render();
    if (this._domNode && this._domNode.parentNode) {
      this._domNode.parentNode.replaceChild(newDomNode, this._domNode);
    }
    this._domNode = newDomNode;
  }
}

class TodoList extends Component {

  constructor() {
    super();
    this.state = {
      tasks : ["Сделать домашку", "Сделать практику", "Пойти домой"],
    }
  }

  render() {
    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      createElement("div", { class: "add-todo" }, [
        createElement("input", {
          id: "new-todo",
          type: "text",
          placeholder: "Задание",
        }),
        createElement("button", { id: "add-btn" }, "+"),
      ]),
      
      createElement("ul", { id: "todos" }, 
        this.state.tasks.map(task => 
          createElement("li", {}, [
            createElement("input", { type: "checkbox" }),
            createElement("label", {}, task),
            createElement("button", {}, "🗑️")
          ])
        )
      )
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});

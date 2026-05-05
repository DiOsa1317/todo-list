function createElement(tag, attributes, children, callbacks) {
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

  if (callbacks) {
    Object.keys(callbacks).forEach(e => {
      element.addEventListener(e, callbacks[e])
    });
  }

  // callbacks = { click: onClick, keydown: onKey }

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
    if (!this._domNode)
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

class TaskItem {
  constructor(label) {
    this.label = label;
    this.status = false;
  }
}

class Task extends Component {
  constructor(task, onToggle, onDelete) {
    super();
    this.task = task;
    this.onToggle = onToggle;
    this.onDelete = onDelete;
    this.state = {
      isDeleting: false
    };
  }

  render() {
    return createElement("li", {}, [
      createElement("input", {
        type: "checkbox",
        ...(this.task.status ? { checked: "checked" } : {})
      }, "", {
        change: e => this.onToggle(e.target.checked)
      }),
      createElement("label", {
        style: `color: ${this.task.status ? "gray" : "black"}`
      }, this.task.label),
      createElement("button", {
        style: this.state.isDeleting ? "background-color: red" : ""
      }, "🗑️", {
        click: () => {
          if (this.state.isDeleting) {
            this.onDelete();
          } else {
            this.state.isDeleting = true;
            this.update();
          }
        }
      })
    ])
  }
}

class TodoList extends Component {

  constructor() {
    super();
    this.state = {
      tasks: ["Сделать домашку", "Сделать практику", "Пойти домой"],
      task_name: null
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
        }, null, {
          input: (e) => this.onAddInputChange(e)
        }),
        createElement("button", { id: "add-btn" }, "+", {
          click: () => this.onAddTask()
        }),
      ]),

      createElement("ul", { id: "todos" },
        this.state.tasks.map((task, index) =>
          createElement("li", {"data-index": index}, [
            createElement("input", { type: "checkbox" }, null, {
              change: (e) => this.onDoTask(index, e)
            }),
            createElement("label", {}, task),
            createElement("button", {"data-delete": index}, "🗑️", {
              click: () => this.onDeleteTask(index)
            })
          ])
        )
      )
    ]);
  }

  onAddTask() {
    this.state.tasks.push(new Task(this.state.task_name.trim()))
    this.state.task_name = "";
    this.update();
  }

  onAddInputChange(e) {
    this.state.task_name = e.target.value;
  }

  onDoTask(index, e) {
    const label = this._domNode.querySelector(`label[data-index="${index}"]`);
    if (label) {
      label.style.color = e.target.checked ? "gray" : "";
    }
  }

  onDeleteTask(index) {
    this.state.tasks.splice(index, 1);
    this.update();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});

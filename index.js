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
    Object.keys(callbacks).forEach((event) => {
      element.addEventListener(event, callbacks[event]);
    });
  }

  return element;
}

class Component {
  constructor() {
  }

  getDomNode() {
    this._domNode = this.render();
    return this._domNode;
  }

  update() {
    const newNode = this.render();
    this._domNode.parentNode.replaceChild(newNode, this._domNode);
    this._domNode = newNode;

    this.save();
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
        change: (e) => this.onToggle(e.target.checked)
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
    ]);
  }
}


class AddTask extends Component {
  constructor(onAddTask) {
    super();
    this.onAddTask = onAddTask;
    this.taskName = "";
  }

  render() {
    return createElement("div", { class: "add-todo" }, [
      createElement("input", {
        type: "text",
        placeholder: "Задание"
      }, "", {
        input: (e) => { this.taskName = e.target.value; }
      }),
      createElement("button", {}, "+", {
        click: () => {
          if (this.taskName.trim()) {
            this.onAddTask(this.taskName);
            this.taskName = "";
          }
        }
      }),
    ]);
  }
}


class TodoList extends Component {
  constructor(...taskList) {
    super();
    const saved = localStorage.getItem("todo-state");
    this.state = {
      tasks: saved ? JSON.parse(saved) : []
    };
  }

  save() {
    localStorage.setItem("todo-state", JSON.stringify(this.state.tasks));
  }

  onAddTask() {
    this.state.tasks.push(new Task(this.state.task_name));
    this.update();
  }

  onAddInputChange(e) {
    this.state.task_name = e.target.value;
  }

  render() {
    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      new AddTask((label) => {
        this.state.tasks.push(new TaskItem(label));
        this.update();
      }).getDomNode(),
      createElement("ul", { id: "todos" },
        this.state.tasks.map((item, i) =>
          new Task(
            item,
            (status) => {
              item.status = status;
              this.update();
            },
            () => {
              this.state.tasks.splice(i, 1);
              this.update();
            }
          ).getDomNode()
        )
      )
    ]);
  }
}
// "Сделать домашку"
// "Сделать практику"
// "Пойти домой"
// "Пупупу"

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});

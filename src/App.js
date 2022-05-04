import React, { useContext, useReducer, useEffect, useRef, useState, createContext } from 'react';

const HOST_API = "http://localhost:8080/api";
const initialState = {
  todo: { list: [], item: {} }
};
const Store = createContext(initialState)


const Form = () => {
  const formRef = useRef(null);
  const { dispatch, state: { todo } } = useContext(Store);
  const item = todo.item;
  const [name, setName] = useState(item);
  const [responsible, setResponsible] = useState(item);

  const onAdd = (event) => {
    event.preventDefault();

    const request = {
      name: name.name,
      id: null,
      responsible: responsible.responsible,
      completed: false
    };


    fetch(HOST_API + "/todo", {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then((todo) => {
        dispatch({ type: "add-item", item: todo });
        setName({ name: "" });
        setResponsible({ responsible: "" });
        formRef.current.reset();
      });
  }

  const onEdit = (event) => {
    event.preventDefault();

    const request = {
      name: name.name,
      responsible: responsible.responsible,
      id: item.id,
      isCompleted: item.isCompleted
    };


    fetch(HOST_API + "/todo", {
      method: "PUT",
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then((todo) => {
        dispatch({ type: "update-item", item: todo });
        setName({ name: "" });
        setResponsible({ responsible: "" });
        formRef.current.reset();
      });
  }   

  return <form className='' ref={formRef}>
    <input
      className='input-group-text col-md-8 mb-2'
      type="text"
      name="name"
      placeholder="¿Qué piensas hacer hoy?"
      defaultValue={item.name}
      onChange={(event) => {
        setName({ ...name, name: event.target.value })
      }}  ></input>
       <input
      className='input-group-text col-md-6 mb-2'
      type="text"
      name="responsible"
      placeholder="Responsable"
      defaultValue={item.responsible}
      onChange={(event) => {
        setResponsible({ ...responsible, responsible: event.target.value })
      }}  ></input>
    {item.id && <button className='btn btn-primary mb-2' onClick={onEdit}>Actualizar</button>}
    {!item.id && <button className='btn btn-primary mb-2' onClick={onAdd }  >Crear</button>}
  </form>
}


const List = () => {
  const { dispatch, state: { todo } } = useContext(Store);
  const currentList = todo.list;

  useEffect(() => {
    fetch(HOST_API + "/todos")
      .then(response => response.json())
      .then((list) => {
        dispatch({ type: "update-list", list })
      })
  }, [dispatch]);


  const onDelete = (id) => {
    fetch(HOST_API + "/" + id + "/todo", {
      method: "DELETE"
    }).then((list) => {
      dispatch({ type: "delete-item", id })
    })
  };

  const onEdit = (todo) => {
    dispatch({ type: "edit-item", item: todo })
  };

  const onChange = (event, todo) => {
    const request = {
      name: todo.name,
      responsible: todo.responsible,
      id: todo.id,
      completed: event.target.checked
    };
    fetch(HOST_API + "/todo", {
      method: "PUT",
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then((todo) => {
        dispatch({ type: "update-item", item: todo });
      });
  };

  const decorationDone = {
    textDecoration: 'line-through'
  };
  return <div >
    <table className='table table-striped table-hover'>
      <thead>
        <tr scope="row">
          <td>ID</td>
          <td>Tarea</td>
          <td>Responsable</td>
          <td>¿Completado?</td>
          <td>Acciones</td>
        </tr>
      </thead>
      <tbody>
        {currentList.map((todo) => {
          return <tr key={todo.id} style={todo.completed ? decorationDone : {}}>
            <td>{todo.id}</td>
            <td>{todo.name}</td>
            <td>{todo.responsible}</td>
            <td><input type="checkbox" className='form-check-input mt-0' defaultChecked={todo.completed} onChange={(event) => onChange(event, todo)}></input></td>
            <td>
              <button className='btn btn-danger' onClick={() => onDelete(todo.id)}> Eliminar </button> 
              <button className='btn btn-primary' onClick={() => onEdit(todo)}> Editar </button>
            </td>
          </tr>
        })}
      </tbody>
    </table>
  </div>

}



function reducer(state, action) {
  switch (action.type) {
    case 'update-item':
      const todoUpItem = state.todo;
      const listUpdateEdit = todoUpItem.list.map((item) => {
        if (item.id === action.item.id) {
          return action.item;
        }
        return item;
      });
      todoUpItem.list = listUpdateEdit;
      todoUpItem.item = {};
      return { ...state, todo: todoUpItem }
    case 'delete-item':
      const todoUpDelete = state.todo;
      const listUpdate = todoUpDelete.list.filter((item) => {
        return item.id !== action.id;
      });
      todoUpDelete.list = listUpdate;
      return { ...state, todo: todoUpDelete }
    case 'update-list':
      const todoUpList = state.todo;
      todoUpList.list = action.list;
      return { ...state, todo: todoUpList }
    case 'edit-item':
      const todoUpEdit = state.todo;
      todoUpEdit.item = action.item;
      return { ...state, todo: todoUpEdit }
    case 'add-item':
      const todoUp = state.todo.list;
      todoUp.push(action.item);
      return { ...state, todo: {list: todoUp, item: {}} }
    default:
      return state;
  }
}

const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return <Store.Provider value={{ state, dispatch }}>
    {children}
  </Store.Provider>

}

function App() {
  return <StoreProvider>
    <h1 className='text'>To-Do List</h1>
    <Form />
    <List />
  </StoreProvider>
}

export default App;
import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  VirtualizedList,
} from 'react-native'
import 'react-native-get-random-values'
import {v4 as uuid} from 'uuid'
import {CheckBox} from 'react-native-btr'




const App = () => {

  const [isSelecting, setIsSelecting] = useState(false)


  const [todos, setTodos] = useState([{id: 1, text: "Todo: Load items"}])

    useEffect(() => {
      loadItems()
    }, [])


  const addTodo = (text) => {
    if(text === '') return
    const newTodo = {id: uuid() , text: text}
    setTodos([...todos, newTodo])
  }

  const addTodos = (texts) => {
    const newTodos = texts.map(text => {
      return {id: uuid(), text: text}
    })
    setTodos([...todos, ...newTodos])
  }


  const removeTodo = (id) => {
    const todosWithoutId = todos.filter(todo => todo.id !== id)
    setTodos(todosWithoutId)
  }

  const joinTodos = (idArr) => {
    if(idArr.length < 2) return
    const todosTextWithIds = todos.map(todo => {
      if (idArr.includes(todo.id)) return todo.text
    })
    const todosWithoutIds = todos.filter(todo => !idArr.includes(todo.id))
    const newTodoText = todosTextWithIds.join('::')
    const newTodo = {id: uuid(), text: newTodoText}
    setTodos([...todosWithoutIds, newTodo])
  }

  const splitTodo = (id) => {
    const todoWithId = todos.find(todo => todo.id === id)
    if(!todoWithId.text.includes('::')) return
    const todoTexts = todoWithId.text.split('::')
    addTodos(todoTexts)
  }

  const toggleSelecting = () => {
    setIsSelecting(!isSelecting)
  }

  const saveItems = () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const outgoingTodos = [...todos]

    const json = JSON.stringify({"items": outgoingTodos})

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: json,
      redirect: 'follow'
    };

    fetch("https://cs.boisestate.edu/~scutchin/cs402/codesnips/savejson.php?user=erooney", requestOptions)
        .then(response => response.text())
        .catch(error => console.log('error', error));
  }

  const newTodos = (newTodos) => {
    setTodos(newTodos)
  }

  const loadItems = () => {


    const requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };

    fetch("https://cs.boisestate.edu/~scutchin/cs402/codesnips/loadjson.php?user=erooney", requestOptions)
        .then(response => response.json())
        .then(body => {
          console.log(`Got data from the network.`)
          newTodos(body.items)
        })
        .catch(error => console.log('error', error));
  }

  return (
      <View style={styles.container}>
        <Header
            isSelectingMode={isSelecting}
            toggleSelectingFxn={toggleSelecting}
            saveFxn={saveItems}
            loadFxn={loadItems}
        />
        <AddBar addFxn={addTodo}/>
        <TodoList
            itemsList={todos}
            removeFxn={removeTodo}
            joinFnx={joinTodos}
            splitFnx={splitTodo}
            setSelectionModeFxn={toggleSelecting}
            isSelectable={isSelecting}
        />
      </View>
  )

}


const Header = ({
  isSelectingMode,
  toggleSelectingFxn,
  saveFxn,
  loadFxn
}) => {

  return (
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { saveFxn() }}>
            <Text style={styles.headerText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { loadFxn() }}>
        <Text style={styles.headerText}>Load</Text>
        </TouchableOpacity>

        {
          isSelectingMode?
              <TouchableOpacity onPress={() => { toggleSelectingFxn() }}>
                <Text style={styles.headerText}>Cancel</Text>
              </TouchableOpacity> : null


        }

      </View>

  )
}

const AddBar = ({addFxn}) => {

  const [text, setText] = useState('')
  const onChange = textValue => setText(textValue)

  return (
      <View style={styles.addBarContainer}>
        <TextInput placeholder="Type todo..." style={styles.textInput} onChangeText={onChange} value={text}/>
        <TouchableOpacity onPress={() => { addFxn(text); setText("") }}>
          <Text style={styles.addBarPlusButton} >{'+'}</Text>
        </TouchableOpacity>
      </View>
  )
}

const TodoItem = ({
                    id,
                    text,
                    removeFxn,
                    isSelectable,
                    joinSelectedFxn,
                    toggleSelectedFxn,
                    splitFxn
                  }) => {

  const [isSelected, setSelection] = useState(false)

  const setSelected = () => {
    toggleSelectedFxn(id)
    setSelection(!isSelected)
  }

  return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>{text}</Text>

        { isSelectable ?
            <TouchableOpacity onPress={() => { joinSelectedFxn() }}>
              <Text style={styles.joinBtn}>Join all selected!</Text>
            </TouchableOpacity> : null
        }

        { isSelectable ?
            <CheckBox
                checked={isSelected}
                onPress={setSelected}
                style={styles.checkbox}
            /> : null
        }

        <TouchableOpacity onPress={() => { splitFxn(id) }}>
          <Text style={styles.splitButton} >{'Split!'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { removeFxn(id) }}>
          <Text style={styles.removeButton} >{'x'}</Text>
        </TouchableOpacity>
      </View>
  )
}

const TodoList = ({
                    itemsList,
                    removeFxn,
                    joinFnx,
                    splitFnx,
                    setSelectionModeFxn,
                    isSelectable,
                  }) => {

  //list of IDs
  const [selected, setSelected] = useState([])

  const toggleSelected = (id) => {
    if(selected.includes(id)) {
      console.log(`removing selected: ${id}`)
      setSelected(selected.filter(it => it !== id))
    } else {
      console.log(`adding selected: ${id}`)
      setSelected([...(selected), id])
    }
  }

  const joinSelected = () => {
    console.log(`selected: ${selected}`)
    joinFnx([...selected])
  }

  const getItemCount = () => {
    if(!itemsList){
      return 0
    }
    return itemsList.length
  }

  const getItem = (data, index) => {
    return itemsList[index]
  }

  return (
      <SafeAreaView>
        <TouchableOpacity onLongPress={() => {setSelectionModeFxn()}}>
          <VirtualizedList
              data={itemsList}
              renderItem={ ({item}) => (
                  <TodoItem
                      id={item.id}
                      text={item.text}
                      removeFxn={removeFxn}
                      isSelectable={isSelectable}
                      joinSelectedFxn={joinSelected}
                      toggleSelectedFxn={toggleSelected}
                      splitFxn={splitFnx}
                  />
              )}
              keyExtractor={ item => item.id.toString() }
              getItemCount={ getItemCount }
              getItem={ getItem }
          />
        </TouchableOpacity>
      </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%'
  },
  addBarContainer: {
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    height: 50,
    padding: 0,
    backgroundColor: '#ddccff',
  },
  addBarPlusButton: {
    height: '100%',
    width: 20,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 10,
    paddingRight: 40,
    justifyContent:'center',
    color: 'white',
    fontSize: 40,
    textAlign: 'center',
  },
  textInput: {
    flexGrow: 1,
    height: '100%',
    padding: 0,
    justifyContent:'center',
    overflow:'scroll'
  },
  header: {
    paddingTop: 20,
    display:'flex',
    justifyContent:'space-between',
    flexDirection:'row',
    height: 75,
    padding: 0,
    backgroundColor: 'darkslateblue',
  },
  headerText: {
    color: 'white',
    fontSize: 30,
    textAlign: 'left',
    overflow:'hidden',
  },
  headerButton: {
    color: 'white',
    fontSize: 40,
    textAlign: 'center',
    overflow:'hidden',
  },
  itemContainer: {
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    height: 50,
    padding: 0,
    margin: 10,
    backgroundColor: '#ddccff',
  },
  splitButton: {
    margin:10,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: 'green',
    paddingTop: 10,
    paddingRight: 20,
    color:'green',
    backgroundColor: 'lightgreen'
  },
  joinBtn: {
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: 'green',
    paddingTop: 10,
    paddingRight: 20,
    color:'green',
    backgroundColor: 'lightgreen'
  },
  itemText: {
    flexGrow: 2,
    justifyContent:'flex-start',
    textAlign:'left'
  },
  checkbox: {
    height: 40,
    width: 70
  },
  removeButton: {
    flexGrow: 1,
    height: '100%',
    width: 20,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 10,
    paddingRight: 40,
    justifyContent:'center',
    color: 'red',
    fontSize: 30,
    textAlign: 'center',
  },


});


export default App
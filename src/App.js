import React from 'react'
import './App.css'
import { Route } from 'react-router-dom'
import ListBooks from './ListBooks'
import SearchBooks from './SearchBooks'
import * as BooksAPI from './BooksAPI'
import * as _ from 'lodash'


class BooksApp extends React.Component {
  state = {
    /**
     * TODO: Instead of using this state variable to keep track of which page
     * we're on, use the URL in the browser's address bar. This will ensure that
     * users can use the browser's back and forward buttons to navigate between
     * pages, as well as provide a good URL they can bookmark and share.
     */
    books: {},
    searchList: []
  }
  //init
  componentDidMount() {
    BooksAPI.getAll().then((books) => {
      let obj = {}
      for(let i = 0; i < books.length; i++){
        if(!obj[books[i].shelf]){
          obj[books[i].shelf] = new Array(books[i]);
        }else{
          obj[books[i].shelf].push(books[i]);
        }
      }
      this.setState({ books: obj })
    })
  }

  //drop-down menu
  changeSelect(shelf, key, item) {
    BooksAPI.update(item, shelf).then((book) => {
      this.setState((state) => {
        const { books, searchList} = this.state
        item.shelf = shelf;

        if(shelf !== 'none'){
          books[shelf] = books[shelf].concat([ item ])
        }

        if(typeof key === 'number'){
          searchList.splice(key,1)
          this.setState((state) => ({
            searchList: searchList
          }))
        }else if(typeof key === 'string'){
          books[key] = books[key].filter((book) => item.id !== book.id)
        }
        return {
          books: books
        }
      })
    })
  }

  // search
  searchBooks = _.debounce((query) => {
    if(query){
      BooksAPI.search(query).then((list) => {
        if(Array.isArray(list)){
          this.setState((state) => {
            let books = Object.values(state.books)
            let booksList = []
            for(let i = 0; i < books.length; i++){

              booksList = [...booksList, ...books[i]]
            }

            books = booksList

            const newSearchList = list.map((book) => {
              const searchListInshelfBook = books.find(
                shelfBook => shelfBook.id === book.id
              )

              return {
                ...book,
                shelf: searchListInshelfBook ? searchListInshelfBook.shelf : 'none'
              }
            })
            return {
              searchList: newSearchList
            }
          })
        }else{
          this.setState({
            searchList: []
          })
        }
      })
    }else{
      this.setState({
        searchList: []
      })
    }
  }, 400)

  render() {
    return (
      <div className="app">
        <Route exact path="/" render={() => (
          <ListBooks
            onChangeSelect={(shelf, key, item) => {
              this.changeSelect(shelf, key, item)
            }}
            books={this.state.books} />
        )} />
        <Route path="/search" render={() => (
          <SearchBooks
            onSearch={(query) => {
              this.searchBooks(query)
            }}
            searchList={this.state.searchList}
            onChangeSelect={(shelf, index, item) => {
              this.changeSelect(shelf, index, item)
            }}
          />
        )} />
      </div>
    )
  }
}

export default BooksApp

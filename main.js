function reducer(model, action) {
  switch (action.type) {
    case 'ADD-TO-THE-BASKET':
      model.basket.push(action.payload);
      return model;
    case 'REMOVE-FROM-THE-BASKET':
      model.basket.splice(model.basket.indexOf(action.payload), 1);
      return model;
    case 'CLEAR-THE-BASKET':
      model.basket = [];
      model.showBasketWarning = false;
      return model;
    case 'WARN-USER-BEFORE-CLEARING-BASKET':
      model.showBasketWarning = true;
      return model;
    case 'CHANGE-CATEGORY':
      model.category = action.payload;
      return model;
    default:
      return model;
  }
}

var store = Redux.createStore(reducer, {
  inventory: window.books.store,
  basket: [],
  category: null,
  showBasketWarning: false
});

const e = React.createElement;

function div(attrs, children) { return e('div', attrs, children); }
function button(attrs, children) { return e('button', attrs, children); }
function img(attrs) { return e('img', attrs, null); }

function render() {
  ReactDOM.render(
    e(ReactRedux.Provider, { store: store }, [
      (store.getState().showBasketWarning
      ? e('div', {className: 'alert'}, [
          div({className: 'modal-bg'}, [
            div({}, [
              e('p', {className: 'warning-message'}, 'Warning! All basket items will be removed!'),
              button({ className: 'clear-basket', onClick: function() {
                store.dispatch({type: 'CLEAR-THE-BASKET'})
              }}, 'Ok')
            ])
          ])
        ])
      : null),
      // products
      div({className: 'list-of-items'}, [
        e('form', { className: 'filter-by-categories'}, [
          e('label', {className: 'label'}, 'Sort by'),
          e('select', {className: 'options', onChange: function(event) {
            store.dispatch({type: 'CHANGE-CATEGORY', payload: event.target.value})
          }},
            e('option', {value: 'business'}, 'Business'),
            e('option', {value: 'science'}, 'Science'),
            e('option', {value: 'fiction'}, 'Fiction'),
            e('option', {value: 'hobbies'}, 'Hobbies'),
            e('option', {value: 'biography'}, 'Biography')
          )
        ]),
      // heading
        e('h1', {className: 'heading'}, 'Books'),
        store.getState().inventory.filter(function(categoryWithBooks) {
          if (store.getState().category) {
            return categoryWithBooks.category === store.getState().category
          } else {
            return true;
          }
        }).map(function(category) {
          return category.books.map(function(book) {
            book.category = category.category;
            book.price = currency(12);
            return book;
          });
        }).flat().map(function(book) {
          return (
            div({className: 'book', key: book.categories}, [
              img({className: 'item-img', src: './images/' + book.image}),
              div({className: 'book-name'}, book.name),
              div({className: 'book-author'}, book.author),
              div({className: 'category'}, book.category),
              div({className: 'book-rates'}, new Array(Math.round(book.rate)).fill(
                img({className: 'rating-star', src: './images/star.png'})) ),
              div({className: 'book-voters'}, 'Voters: ' + book.voters),
              div({className: 'book-price'}, book.price.value + '€'),
              button({className: 'add-to-basket', onClick: function() {
                store.dispatch({type: 'ADD-TO-THE-BASKET', payload: book})}
              }, 'Add to the basket ⇒'),
            ])
          )
        })
      ]),

    // basket
    e('div', { className: 'basket' }, [
      e('h1', {className: 'basket-heading'}, 'Basket'),
      store.getState().basket.length === 0
      ? e('p', {className: 'empty-basket'}, 'Basket is empty')
      : store.getState().basket.reduce(function(accumulator, currentValue) {
          if (accumulator.find(function(bookWithQuantity) { return bookWithQuantity.book === currentValue })) {
            var index = accumulator.findIndex(function(bookWithQuantity) {return bookWithQuantity.book === currentValue});
            accumulator[index].quantity += 1
            return accumulator;
          } else  {
            return accumulator.concat({book: currentValue, quantity: 1 });
          }
        }, []).map(function(basketItem) {
        return (
          div({className: 'basket-item', key: basketItem.name}, [
            img({className: 'item-img', src: './images/' + basketItem.book.image}, null),
            div({className: 'book-name'}, basketItem.book.name),
            div({className: 'book-author'}, basketItem.book.author),
            div({className: 'book-rate'}, basketItem.book.rate),
            div({className: 'book-price'}, 'Price: ' + basketItem.book.price.value + '€'),
            div({className: 'quantity'}, 'Quantity: ' + basketItem.quantity),
            button({className: 'add-book', onClick: function() {
              store.dispatch({type: 'ADD-TO-THE-BASKET', payload: basketItem.book})
            }}, 'Quantity'),
            button({className: 'remove-item', onClick: function() {
              store.dispatch({type: 'REMOVE-FROM-THE-BASKET', payload: basketItem})
            }}, 'Remove')
          ])
        )
      }),
      (store.getState().basket.length
        ? button({className: 'clear-the-basket', onClick: function() {
            store.dispatch({type: 'WARN-USER-BEFORE-CLEARING-BASKET'})
          }}, 'Clear the basket')
        : null),
      e('div', {className: 'total-price'}, 'Total ' + store.getState().basket.reduce(function(accumulator, currentValue){
        return accumulator.add(currentValue.price) }, currency(0)) + ' €'
      ),
      button({className: 'order', onClick: function() {
        return (console.log(store.getState().basket));
      }}, 'Order')
    ])
    ]),
    document.getElementById('root')
  );
}
store.subscribe(function() { render(); });
render();
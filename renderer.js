// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const PouchDB = require('pouchdb')
const Vue = require('./node_modules/vue/dist/vue.min.js')

// PouchDB plugins
PouchDB.plugin(require('pouchdb-find'))

// Create or open our local database
let db = new PouchDB('local_db')

// Create an index on the type field to query all users
db.createIndex({
  index: {fields: ['type']}
})
// db.destroy()    // uncomment to destroy the database and recreate

// Initialize our Vue application
let app = new Vue({
  el: '#app',
  data: {
    users: [],
    user: {
      _id: '',
      first_name: '',
      last_name: '',
      type: 'user'
    }
  },
  methods: {
    createUser: function(){
      let self = this
      db.put(this.user).then(function (response) {
        self.user = {}
      }).catch(function (err) {
        alert(err.message)
      })
    }// end function createUser
  },
  created: function () {
    let self = this
    db.find({
      selector: {
        type: 'user'
      }
    }).then(function(response){
      self.users = response.docs
    })
  }// end created function
})

// listen for live databases changes and update our user list
db.changes({
  since: 'now',
  include_docs: true,
  live: true
}).on('change', function(change){
  app.users.push(change.doc)
})

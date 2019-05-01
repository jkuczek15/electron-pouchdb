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
      db.put(this.user).then((response) => this.user = {type: 'user'}).catch((err) => alert(err.message))
    },// end function createUser

    clearUsers: function(){
      if(confirm('Are you sure you want to delete all users?')){
        db.find({selector: {type: 'user'}}).then((response) => {
          response.docs.forEach((user) => { user._deleted = true })
          db.bulkDocs(response.docs)
        })
      }// end if confirmed delete
    }// end function clearUsers
  },
  created: function () {
    db.find({selector: {type: 'user'}}).then((response) => this.users = response.docs)
  }// end vue created function
})

// listen for live databases changes and update our user list
db.changes({
  since: 'now',
  include_docs: true,
  live: true
}).on('change', (change) => {
  if(change.deleted){
    app.users = []
  }else{
    app.users.push(change.doc)
  }// end if cleared all users
})

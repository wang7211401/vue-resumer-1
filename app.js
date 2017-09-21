
import Vue from 'vue'
import AV from 'leancloud-storage'

var APP_ID = 'nkiykFU7nT78x35oWE3HCRkP-gzGzoHsz';
var APP_KEY = 'XQcFGxVQXa3kHMQXVnK1mpt9';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});

var app = new Vue({
  el: '#app',
  data: {
    actionType:'signUp',
    formData:{
      username:'',
      password:''
    },
    newTodo:'',
    todoList:[],
    currentUser:null
  },
  created:function(){
    this.currentUser = this.getCurrentUser();
    this.fetchTodos()
  },
  methods:{
    fetchTodos:function(){
      if(this.currentUser){
        var query = new AV.Query('AllTodos');
        query.find().then((todos)=>{
          let avAllTodos = todos[0]
          let id = avAllTodos.id
          this.todoList = JSON.parse(avAllTodos.attributes.content)
          this.todoList.id = id
        },(error)=>{
          console.log(error)
        })
      }
    },
    updateTodos:function(){
      let dataString = JSON.stringify(this.todoList)
      let avTodos = AV.Object.createWithoutData('AllTodos',this.todoList.id)
      avTodos.set('content',dataString)
      avTodos.save().then(()=>{
        console.log('更新成功')
      })
    },
    saveTodos:function(){
      let dataString = JSON.stringify(this.todoList)
      var AVTodos = AV.Object.extend('AllTodos');
      var avTodos = new AVTodos();
      var acl = new AV.ACL()
      acl.setReadAccess(AV.User.current(),true)
      acl.setWriteAccess(AV.User.current(),true)
      avTodos.set('content', dataString);
      avTodos.setACL(acl)
      avTodos.save().then((todo)=>{
        this.todoList.id = todo.id
        console.log('保存成功')
        console.log(todo)
      }, function (error) {
        console.log('保存失败');
      });
    },
    saveOrUpdateTodos:function(){
      console.log(this.todoList.id)
      if(this.todoList.id){
        this.updateTodos()
      }else{
        this.saveTodos()
      }
    },
    addTodo:function(){
      if(!this.newTodo){alert('请输入代办事项名称'); return false}
      this.todoList.push({
        id:todo.id,
        title:this.newTodo,
        createdAt:new Date(),
        done:false
      })
      this.newTodo = ''
      this.saveOrUpdateTodos()
    },
    removeTodo:function(todo){
      let index = this.todoList.indexOf(todo)
      this.todoList.splice(index,1)
      this.saveOrUpdateTodos()
    },
    signUp:function(){
      if( !this.formData.username || !this.formData.password){ alert('表单不能为空!'); return false;}
      var user = new AV.User();
      // 设置用户名
      user.setUsername(this.formData.username);
      // 设置密码
      user.setPassword(this.formData.password);
      user.signUp().then((loginedUser)=> {
        this.currentUser = this.getCurrentUser()
      },(error)=>{
        alert('注册失败')
        console.log(error)
      });
    },
    login:function(){
      if( !this.formData.username || !this.formData.password){ alert('表单不能为空!'); return false;}
      AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser)=> {
        this.currentUser = this.getCurrentUser()
        this.fetchTodos()
      },(error)=>{
        alert('登录失败')
        consolelog(error)
      });
    },
    getCurrentUser:function(){
      let current = AV.User.current()
      if(current){
        let {id,createdAt,attributes:{username}} = current
        return {id,username,createdAt}
      }else{
        return null
      }
    },
    logout:function(){
      this.currentUser = AV.User.logOut();
      window.location.reload()
    }
  }
});

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-task-manager',
  templateUrl: './task-manager.component.html',
  styleUrls: ['./task-manager.component.css']
})
export class TaskManagerComponent implements OnInit {

  today = new Date();  
  today_string = new Date().toISOString().slice(0, 10); 
  minutes= 0; //remaining worktime for the day
  remainWork=""
  tomorrow=this.getTomorrow(); //tomorrow's day as string
  tasks: any[] = []; //Array of every task object
  displayModal=["none","taskform-in"]; //is the modal window active? -> Controller: changeModalDisplay
  displayUpdateModal=["none","taskform-in"]
  task_deleted:any[]=[]; //Array with every task, allows adding them classes


  form = { id:"",
      title: "",
      body:"",
      saved_date:"",
      minutes:"",
      target_date:this.today_string,
      status:false
    }

  refresh(){
    this.getStoredData() //retrieve tasks from localStorage
    this.task_deleted=Array.apply(null, Array(this.tasks.length)).map(Number.prototype.valueOf,0);
    this.getWorkTime() 
    this.displayModal=["none","taskform-in"];
  }

  ordering_dates( a:any, b:any ){
    //sort objects by deadline
    if ( a.target_date.toLowerCase() < b.target_date.toLowerCase()){
      return -1;
    }
    if ( a.target_date.toLowerCase() > b.target_date.toLowerCase()){
      return 1;
    }
    return 0;
  }

  getWorkTime(){
    /*
    INPUT: this.task:Array
    ITERATES OVER THIS.TASK AND RETURNS THE AMOUNT OF REQUIRED MINUTES AS HH:MM.
    OUTPUT: this.remainWork:String
    */

    this.minutes=0;
    for (let i = 0; i< this.tasks.length; i++ ){
      if (this.tasks[i].target_date==this.today_string && this.tasks[i].minutes!= "" && this.tasks[i].status == false){
        this.minutes=this.minutes+parseInt(this.tasks[i].minutes);
      }
    }

    var hours = Math.floor(this.minutes/60); //hours quant.
    var min = this.minutes % 60; //module

    this.remainWork =`${hours}:${min}`; 
  }

  getStoredData(){
    //load the localStorage data
    //OUTPUT: this.tasks 

    var stored_data=window.localStorage || '{}';

    this.tasks.length = 0 //reset this.tasks


    for(var i=0; i<stored_data.length; i++) {
      var key = stored_data.key( i );      
      if (key!= null ){
        var item = window.localStorage.getItem(key);
        if(item != null){
          var f = JSON.parse(item)
          if (!this.tasks.includes(f)) {
            this.tasks.push(f);
          }
        }
      }
    }

    this.tasks.sort(this.ordering_dates);
  }

  getTomorrow () {
    let d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  clearDataBase(){
    //Delete all the task in the list
    window.localStorage.clear()
  }

  changeModalDisplay(){
    if (this.displayModal[0]=="none"){
      this.displayModal=["block","taskform-in"];
    }else{
      this.displayModal[1]="taskform-out";
        setTimeout(() => {
          this.displayModal[0] = "none";
        }, 180);

    }
  }

  changeStatus(taskId:string){
    /*
    INPUT: task.id:string
    Searchs for the localStorage object, 
    changes the status and reloads the stored data (refresh elements)
    */

    var t = window.localStorage.getItem(taskId)
    var p = t ? JSON.parse(t):{};
    if (p.status){
      p.status=false;
    }else{
      p.status=true;
    }
    window.localStorage.setItem(p.id, JSON.stringify(p)) //updates db
    this.getStoredData() //refresh
    this.getWorkTime() //refresh
  }

  newTask(title:String, body:String, minutes:String, target_date:String, form:Object){
    //Input: title, body/description, how long the task is supposed to durate and the target date.
    //Output: Data stored in localStorage + task_list refreshed
    var id = Date.now().toString()
    let data = { id:id,
      title: title,
      body:body,
      saved_date:this.today_string,
      minutes:minutes,
      target_date:target_date,
      status:false
    }

    this.formReset()

    window.localStorage.setItem(data.id , JSON.stringify(data)); //save data
    this.refresh()
  }

  deleteTask(item:String, task_deleted_index:any){
    /*
    INPUT: item id (for localStorage) and task_deleted array's index.
    Runs the task-deleted animation and after 180ms removes the data from the db and reloads everything.
    */
    this.task_deleted[task_deleted_index] = "task-deleted";

      setTimeout(() => {
        window.localStorage.removeItem(item.toString()); //delete item
        this.getStoredData() //reset the current task_list
        this.refresh()
        this.task_deleted[task_deleted_index]=""
      }, 180);
  }
  
  formReset(){
    this.form = { id:"",
      title: "",
      body:"",
      saved_date:"",
      minutes:"",
      target_date:this.today_string,
      status:false
    }
  }

  showEditTask(taskId:string, index:any){ 

    this.formReset() //reseting the form

    //if the modal is hidden...
    if (this.displayUpdateModal[0]=="none"){
      var data = this.tasks[index];

      //filling the form
      this.form.id=data.id
      this.form.title=data.title;
      this.form.body=data.body;
      this.form.minutes=data.minutes;
      this.form.target_date=data.target_date;
      this.form.status=false;

      //showing the form
      this.displayUpdateModal=["block","taskform-in"];

    //closing the modal & reseting the form
    }else if (taskId=="close"){
      this.displayUpdateModal[1]="taskform-out";
        setTimeout(() => {
          this.formReset()
          this.displayUpdateModal[0] = "none";
        }, 180);

    }
  }
    

  updateTask(title:string, body:string, minutes:string, target_date:string, form:Object){
    var id = this.form.id //retriving taskId

    //updating the form
    this.form.title=title;
    this.form.body=body;
    this.form.minutes=minutes;
    this.form.target_date=target_date;

    //updating the data
    window.localStorage.setItem(id.toString(), JSON.stringify(this.form)); //update
    
    this.displayUpdateModal[1]="taskform-out";
    setTimeout(() => {
      this.formReset()
      this.displayUpdateModal[0] = "none";
    }, 180);
    this.refresh()
  }

  constructor() { }

  ngOnInit(): void {
    //this.clearDataBase()
    this.refresh()
  }

}

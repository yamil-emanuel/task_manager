import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-task-manager',
  templateUrl: './task-manager.component.html',
  styleUrls: ['./task-manager.component.css']
})
export class TaskManagerComponent implements OnInit {

  today = new Date();  
  today_string = new Date().toISOString().slice(0, 10);


  tomorrow=this.getTomorrow();
  tasks: any[] = [];

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

  setDone(taskId:string){
    /*
    INPUT: task.id:string
    Searchs for the localStorage object, updates it and reloads the stored data (refresh elements)*/
    var t = window.localStorage.getItem(taskId)
    var p = t ? JSON.parse(t):{};
    p.status=true;
    window.localStorage.setItem(p.id, JSON.stringify(p))
    this.getStoredData()
  }

  newTask(title:String, body:String, minutes:String, target_date:String){
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

    window.localStorage.setItem(data.id , JSON.stringify(data)); //save data
    this.getStoredData() //reset the current task_list
  }

  deleteTask(item:String){
    window.localStorage.removeItem(item.toString()); //delete item
    this.getStoredData() //reset the current task_list
  }
  constructor() { }

  ngOnInit(): void {

    this.getStoredData() //retrieve tasks from localStorage
  }

}

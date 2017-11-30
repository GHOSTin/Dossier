import {Journal} from "/lib/collections/students";
import {Disciplines} from "/lib/collections/students";

Template.semester.helpers({
  journal(){
    return Journal.find({semester: Template.instance().data.toString()});
  },
  discipline(id){
    return Disciplines.findOne({_id: id});
  },
  points(journal){
    journal = journal.fetch();
    let res = 0, count = 0;
    for (item of journal){
      if(item.point!=="" && item.point !=="зачет"){
        res += parseInt(item.point);
        count ++;
      }
    }
    let avg = count ? (res/count).toFixed(2) : "";
    let debt = _.where(journal, {point: ""}).length;
    return journal ? {avg: avg, debt: debt} : {avg: "", debt: ""}
  }
})
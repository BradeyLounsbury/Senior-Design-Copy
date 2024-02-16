
//contains helper functions for error checking events

const helpers = {
    // Slot Checking
    checkParticipant: function(totalSlots){
        if(totalSlots >= 2 && totalSlots <= 100){
          return true;
        }
    
        return false;
      },
    //  Title Checking
    checkTitle: function(title){
        if(title.trim() == ""){
          return false;
        }
    
        return true;
      },
    //   Location Checking
    checkLocation:  function(location){
        if(location.trim() == ""){
          return false;
        }
    
        return true;
      },
    //   Checks if its today
    isToday:  function(date){
        //Todays Date
        var today = new Date();
        //Current Date
        var todayYear = today.getFullYear();
        var todayMonth = today.getMonth();
        var todayDate = today.getDate();
        var inputDateArray = date.split('');
        //User input dates
        var inputYear = "";
        var inputMonth = "";
        var inputDay = "";
        //For parsing
        var hyphenCounter = 0;
        //Gets Date
        for(let i = 0; i <= inputDateArray.length - 1; i++ ){
          //Gets year
          if(inputDateArray[i] != '-' && hyphenCounter == 0){
            inputYear = inputYear + inputDateArray[i];
          }
          //Gets month
          else if(inputDateArray[i] != '-' && hyphenCounter == 1){
            inputMonth = inputMonth + inputDateArray[i];
          }
          //gets day
          else if(inputDateArray[i] != '-' && hyphenCounter == 2){
            inputDay = inputDay + inputDateArray[i];
          }
          else if (inputDateArray[i] == '-'){
            hyphenCounter++;
          }
        }
        if(inputYear == todayYear && inputMonth - 1 == todayMonth && inputDay == todayDate){
         return true;
        }
        else{
         return false;
        }
   },
    // Checks date
    checkDate: function(date){
        //Todays Date
        var today = new Date();
        //Current Date
        var todayYear = today.getFullYear();
        var todayMonth = today.getMonth();
        var todayDate = today.getDate();
        var inputDateArray = date.split('');
        //User input dates
        var inputYear = "";
        var inputMonth = "";
        var inputDay = "";
        //For parsing
        var hyphenCounter = 0;
        //IF date is realistic
        var isTrue = false;
        //Gets Date
        for(let i = 0; i <= inputDateArray.length - 1; i++ ){
        //Gets year
        if(inputDateArray[i] != '-' && hyphenCounter == 0){
            inputYear = inputYear + inputDateArray[i];
        }
        //Gets month
        else if(inputDateArray[i] != '-' && hyphenCounter == 1){
            inputMonth = inputMonth + inputDateArray[i];
        }
        //gets day
        else if(inputDateArray[i] != '-' && hyphenCounter == 2){
            inputDay = inputDay + inputDateArray[i];
        }
        else if (inputDateArray[i] == '-'){
            hyphenCounter++;
        }
        }
        //Check if Year is greater than current Year
        if(inputYear > todayYear){
        isTrue = true;
        }
        //Checks date if current year is same as input year
        else if(inputYear == todayYear && inputMonth - 1 == todayMonth && inputDay >= todayDate){
        isTrue = true;
        }
        else if(inputYear == todayYear && inputMonth - 1 > todayMonth){
        isTrue = true;
        }
        if(isTrue){
        return true;
        }
        else{
        return false;
        }
    },
    // Checks Time
    checkTime: function(startTime, endTime, date){
        //current time
        var today = new Date();
        var currentHour = today.getHours();
        var currentMinute = today.getMinutes();
        // inputs for parsing
        var inputStartHour = "";
        var inputStartMinute = "";
        var inputEndHour = "";
        var inputEndMinute = "";
        // for parsing ":"
        var colonCounter = 0;
        //Time Arrays
        var startTimeArray = startTime.split('');
        var endTimeArray = endTime.split('');
        //Parse Start Time
        for(let i = 0; i <= startTimeArray.length - 1; i++){
          if(startTimeArray[i] != ':' && colonCounter == 0){
            inputStartHour = inputStartHour + startTimeArray[i];
          }
          else if(startTimeArray[i] != ':' && colonCounter == 1){
            inputStartMinute = inputStartMinute + startTimeArray[i];
          } 
          else if(startTimeArray[i] == ':'){
            colonCounter++;
          }
        }
        colonCounter = 0;
        //Parse end time
        for(let i = 0; i <= endTimeArray.length - 1; i++){
          if(endTimeArray[i] != ':' && colonCounter == 0){
            inputEndHour = inputEndHour + endTimeArray[i];
          }
          else if(endTimeArray[i] != ':' && colonCounter == 1){
            inputEndMinute = inputEndMinute + endTimeArray[i];
          } 
          else if(endTimeArray[i] == ':'){
            colonCounter++;
          }
        }
        if(inputEndHour > inputStartHour && helpers.checkDate(date) == true){
          //8:30 -> 9:30 real time 8:00
          if(helpers.isToday(date) == true && inputStartHour == currentHour && inputStartMinute >= currentMinute){
            return true;
          }
          //8:30 -> 9:30 real time 7:30
          else if(helpers.isToday(date) == true && inputStartHour > currentHour){
            return true;
          }
          //8:30 -> 9:30 real time 9:00
          else if(helpers.isToday(date) == true && inputStartHour < currentHour){
            return false;
          }
          return true;
        }
        else if(inputEndHour == inputStartHour 
          && inputEndMinute > inputStartMinute 
          && helpers.checkDate(date) == true){
            //8:30 -> 8:40  real time 8:20
            if(helpers.isToday(date) == true && inputStartHour == currentHour && inputStartMinute >= currentMinute){
              return true;
            }
            //8:30 -> 8:40 real time 7:30
            else if(helpers.isToday(date) == true && inputStartHour > currentHour){
              return true;
            }  
            //8:30 -> 8:40 real time 9:00
            else if(helpers.isToday(date) == true && inputStartHour < currentHour){
              return false;
            }
          return true;
        }
        else{
          return false;
        }
    },
    // converts months to days
    monthToDays: function(month){
      
        if(month === "01")
          return 31;
        if(month === "02")
          return 59;
        if(month === "03")
          return 90;
        if(month === "04")
          return 120;
        if(month === "05")
          return 151;
        if(month === "06")
          return 181;
        if(month === "07")
          return 212;
        if(month === "08")
          return 243;
        if(month === "09")
          return 273;
        if(month === "10")
          return 304;
        if(month === "11")
          return 334;
        if(month === "12")
          return 365;
      
    },
    // Parses year-month-day to 3 separate variables and combines it all into only days
    getDate: function(date){

      var startDateArray = date.split('');
      var startYear = "", endYear = "";
      var startMonth = "", endMonth = "";
      var startDay = "", endDay = "";
      var hyphenCounter = 0;
      for(let i = 0; i <= startDateArray.length - 1; i++ ){
        //Gets year
        if(startDateArray[i] != '-' && hyphenCounter == 0){
            startYear = startYear + startDateArray[i];
        }
        //Gets month
        else if(startDateArray[i] != '-' && hyphenCounter == 1){
            startMonth = startMonth + startDateArray[i];
        }
        //gets day
        else if(startDateArray[i] != '-' && hyphenCounter == 2){
            startDay = startDay + startDateArray[i];
        }
        else if (startDateArray[i] == '-'){
            hyphenCounter++;
        }
      }
      hyphenCounter = 0;
      return (startYear * 365 + helpers.monthToDays(startMonth) + startDay)
    },
    isOutdated:function(date){ // checks if given date has already passed or is currently happening
      const dateInput = new Date(date); // using constructor decrements day by 1 due to timezone problems (assume we are EST)
      const dateCurrent = new Date();
      //console.log("Input Date: ", dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate()+1);
      //console.log("Todays Date: ", dateCurrent.getFullYear(), dateCurrent.getMonth(), dateCurrent.getDate());
      if (dateInput.getFullYear() === dateCurrent.getFullYear() &&
          dateInput.getMonth()    === dateCurrent.getMonth() &&
          dateInput.getDate()+1   === dateCurrent.getDate()){
            return true;
      }
      else {
        if (dateInput.getFullYear() < dateCurrent.getFullYear()){
          return true; // out of date by year
        }
        else {
          if (dateInput.getFullYear() === dateCurrent.getFullYear()){
            if (dateInput.getMonth() < dateCurrent.getMonth()){
              return true; // out of date by month
            }
            else {
              if (dateInput.getMonth() === dateCurrent.getMonth()){
                if (dateInput.getDate()+1 < dateCurrent.getDate()){
                  return true; // out of date by day
                }
                else return false;
              }
              else return false; // ahead by month(s)
            }
          }
          else return false; // ahead by year(s)
        }
      }
    } 
}
export default helpers;
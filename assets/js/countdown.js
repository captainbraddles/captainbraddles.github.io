(function () {
    const second = 1000,
          minute = second * 60,
          hour = minute * 60,
          day = hour * 24;

    var eventDate = "2025-07-09 00:00:00"; //Use the YYYY-MM-DD format.
    
    var countDown = new Date(eventDate).getTime();

        x = setInterval(function() {    
  
          var now = new Date().getTime();
                distance = countDown - now;
  
          document.getElementById("days").innerText = Math.floor(distance / (day)),
            document.getElementById("hours").innerText = Math.floor((distance % (day)) / (hour)),
            document.getElementById("minutes").innerText = Math.floor((distance % (hour)) / (minute)),
            document.getElementById("seconds").innerText = Math.floor((distance % (minute)) / second);
          //seconds
        }, 0)
    }());
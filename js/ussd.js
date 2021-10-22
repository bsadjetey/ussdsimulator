        $(function(){
			/***********************/
			/*
			#Get saved phone number in local storage
			#Redirect to settings page if phone number is not set
			#Call runUSSD function to run USSD session.			
			
			*/
            var phone_number = localStorage.getItem("phone_number");

            if(phone_number == null || phone_number == "undefined"){
				alert("Please enter the USSD app's URL and phone number to be used for sending the request");
               window.location.replace("./settings.html");
            }
            $('#start-ussd').on('click',function(){
                runUSSD("",phone_number);
            });
            $('#btn-send').on('click',function(){		
                runUSSD($('#txt-input').val(),phone_number);
            });
            $('.clear-ussd-session').on('click',function(){
                clearSession();
            })

			/************ USSD Main function**********/
			/***
			This sends ussd data entered to provided USSD app url. -- ajax call
			#text: input from user
			#phone_number: phone number of user
			#session_id: You have to generate unique session id per user per session.

			##NOTE on text/response from USSD app
			#con - prepend text with "con" to enable simulator show input box. 
				eg. Reponse like "Welcome to USSD \n 1. Register \n. Help"
				will have to be returned as 
				con Welcome to USSD \n 1. Register \n. Help
			#end - prepend text with "end" to enable simulator show terminal message and clear session
				eg. Response like "Thank you for using our service".
				will have to be returned as 
				end Thank you for using our service.
			*/
            function runUSSD(text,phone_number){				
				/******************************/
				var app_url = localStorage.getItem("app_url");
                $('#loader-4').show();

                $.ajax({                    
                    url:app_url,
                    contentType: "application/json; ",
                    data: {'text': text,'phone_number':phone_number,'session_id':'ATUid_d07d1c85038f7eaebd81b500970d48bd'},
                    type:'GET',
                    // Set to 5 seconds for timeout limit
                    timeout: 5000,
                    success: function (response){
                        $('#loader-4').hide(); //hide loader
                        $('#txt-input').val(""); //clear input text
                        
                        $('#start-ussd').hide();                        
                        						
                        var restype = response.slice(0,3);//Get response type
                        var message = response.slice(3);//Get returned text/message

                        if(restype == "con"){                      
                            $('.con-session').show();//show input screen
                        }
                        else{
                            $('.con-session').hide();//hide input screen
                            $('.end-session').show();//show terminal screen
                        }
                        $('.ussd-content').html(message);//set message in ussd content class
						$('.ussd-content').show();//display ussd content class
                    },
                    // If the time exceeds 5 seconds
                    // then throw error message
                    error: function(xhr, textStatus, errorThrown) {                                               
                        $('#loader-4').hide();
                        if (textStatus == 'timeout') {
                            $('.ussd-content').html("Sorry session timed out!");
                        }
                        else{
                            $('.ussd-content').html("Sorry some error occured!");                           
                        }						
                    }

                });
            }
			/************End of USSD Main function**********/
			
			/************clearSession function**********/
			function clearSession() {            				
				$(".ussd-display").hide();
				$("#start-ussd").show();        
				$(".ussd-start").show();        
			}
			/************End clearSession**********/
        })
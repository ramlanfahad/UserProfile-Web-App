function divide(x,y,callback){
    callback(x/y,x%y);
    }
    
    function result(quotient,remainder){
    console.log("quotient="+ quotient + "remainder="+ remainder);
    }
    
    divide(4,2,result);
var fs = require('fs');
console.log("Incrementing build number...");
fs.readFile('src/metadata.json',function(err,content){
    if(err) throw err;
    var metadata = JSON.parse(content);
   let  build1 = metadata.build1 ;
   let  build2 = metadata.build2 ;
   let  build3 = metadata.build3 ;

   if(build3>=9){
    metadata.build3=0;
       if(build2>=9){
        metadata.build3=build3 +1
       }
       else{
        metadata.build2=build2+1
       }
   }
   else{
    metadata.build3 = build3 + 1
   }
   
    fs.writeFile('src/metadata.json',JSON.stringify(metadata),function(err){
        if(err) throw err;
        metadata.build1=build1;
        metadata.build2=build2;
        metadata.build3=build3;
        console.log("Current build number: " +metadata.build1,metadata.build2,metadata.build3);
    })
});
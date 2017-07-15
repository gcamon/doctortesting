app.controller("secrController",["$scope","$rootScope","$resource",function($scope,$rootScope,$resource){

  $scope.getService = function(id){
    var service = $resource("/user/gcamon/get-unavailable-service/:centerId",{centerId:id})
    service.query(function(data){
      console.log('========')
      console.log(data);
      $rootScope.sList = data;
    })
  }  

  var secr_m = $resource("/user/gcamon/m-status");
  secr_m.query(function(data){
    console.log('========')
    console.log(data)
    $rootScope.mList = data
  })
}]);

app.controller("createRoomSecr",["$scope","$rootScope","mySocket","localManager",function($scope,$rootScope,mySocket,localManager){
  var user = localManager.getValue("resolveUser");
  mySocket.emit('join_secr',{userId: user.user_id});

  mySocket.on("s-r",function(data){
    console.log(data);
  });

  mySocket.on("m-r",function(data){
    console.log(data);
  });
}]);
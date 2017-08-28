angular.module('services.cart', [])
    .service('Cart', ['$rootScope', 'Reviewer', function ($rootScope, Reviewer) { 
        var getCart = function(){};
 
        var addItem = function(){};
 
        var addItems = function() {};
 
        var persist = function() {};
 
        var remove = function () {};
 
        var clear = function() {};
 
        var persist = function() {};
 
        var changeQuantity = function (){};
 
        var refresh = function() {};
}]);


var app = angular.module("ShoppingCart",[]);

app.factory("localManager",function(){
  return {
    setValue: function(key, value) {
      $window.localStorage.setItem(key, JSON.stringify(value));
    },
    getValue: function(key) {       
      return JSON.parse($window.localStorage.getItem(key)); 
    },
    removeItem: function(key) {
      $window.localStorage.removeItem(key);
    }
  };
});

app.service("Reviewer",["localManager",function(localManager){
    this.review = function(cart){
      var list = localManager.getValue("cart");
      if(list) {
        console.log(list)
      }
    }
}]);

app.service("Cart",["$rootScope","Reviewer",function($rootScope,Reviewer){

    this.getCart = function(){
      return $rootScope.getCart();
    };

    this.addItem = function(id){
      $rootScope.addItem(id);
    };

    this.addItems = function(arr){
      $rootScope.addItems(arr);
    };

    this.persist = function(){
      $rootScope.persist();
    };

    this.remove = function(id){
      $rootScope.remove(id);
    };

    this.clear = function(){
      $rootScope.clear();
    };

    this.persist = function(){
      $rootScope.persist();
    };

    this.changeQuantity = function(id){
      $rootScope.changeQuantity(id);
    };

    this.refresh = function(){
      $rootScope.refresh();
    };

}]);

app.controller("cartController",["$scope","$rootScope","localManager","Cart","Reviewer",function($scope,$rootScope,localManager,Cart,Reviewer){
    
    var cartList = $rootScope.getCart();

    $rootScope.getCart = function(){
      return localManager.getValue("cart") || [];
    }

    $rootScope.addItem = function(id){      
      var random = Math.floor(Math.random() * 99999999);      
      if(cartList.length > 0) {
        var elemPos = cartList.map(function(x){return x.id}).indexOf(id);
        if(elemPos !== -1) {
          cartList[elemPos].quantity++;
        } else {
          cartList.push({
            id: random,
            quantity: 1
          });
        }
      } else {
        cartList.push({
          id: random,
          quantity: 1
        });
      }
      
    }

    $rootScope.addItems = function (arr) {
      if(Object.prototype.toString.call( arr ) === '[object Array]') {
        for(var i = 0;i < arr.length; i++) {
          $rootScope.addItem(arr[i]);
        }
      } else {
        console.log("Error: requires a list of item's id");
      }
    }

    $rootScope.save = function(){      
     Reviewer.review(cartList);
    }
   

    $rootScope.remove = function(id) {
      if(id !== undefined) {    
        var elempos = cartList.map(function(x){return x.id}).indexOf(id);
        if(elempos !== -1) {
          var remove = cartList.splice(elempos,1);
          $rootScope.changeQuantity(id)
          $rootScope.persist()
        } else {
          console.log("item not in the list")
        }      
      } else {
        console.log("requires id of item to be removed")
      }
    } 

    $rootScope.clear = function(){      
      if(cartList.length > 0) {
        var emptyCart = cartList.splice(0);
      }      
      $rootScope.persist();
    };

    $rootScope.persist = function(){        
      localManager.setValue("cart",cartList);
      $rootScope.refresh();   
    }

    $rootScope.changeQuantity = function(id){
      var elemPos = cartList.map(function(x){return x.id}).indexOf(id)
      cartList[elemPos].quantity--;
    };

    $rootScope.refresh = function(){
      Cart.getCart();
    };


}]);
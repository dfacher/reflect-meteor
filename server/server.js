// Meteor Methods
Meteor.methods({
  insertTag: function (reflectionItem) {
      for (tag in reflectionItem.tags) {
          newTag = {
            'tag': reflectionItem.tags[tag],
            'direction': reflectionItem.direction,
            'reflectId': reflectionItem._id
          }
          Tags.insert(newTag);
          }
  }
});


Meteor.startup(function () {
    RESTstop.configure({use_auth: false});
    
    
    RESTstop.add('save', {method: 'GET'}, function() {
        //console.log(this.response);
        this.response.setHeader('Access-Control-Allow-Origin', '*');
        //console.log(this.params);
        var newPost = {date: new Date(this.params.date), 
                        body: this.params.body, 
                        direction: parseInt(this.params.direction), 
                        tags: genTags(this.params.body)
                        }
        
        var insertedItem;
        Reflections.insert(newPost, function(error, idd){
            if(idd) {
                console.log('successful insert');
                insertedItem = Reflections.findOne({_id: idd});
                Meteor.call('insertTag', insertedItem);
                return insertedItem;
            }
            else {
                console.log('error on insert');
                insertedItem = null;
            }
        }); 
      });
    
    //
    //Reflections endpoint to query for whole Collection (only get); Post for /reflection endpoint
    //
    RESTstop.add('reflections', {method: 'GET', require_login: false }, function() {
        this.response.setHeader('Access-Control-Allow-Origin', '*');
        var res = [];
        Reflections.find({}).forEach(function(post) {
          res.push(post);
        });
        return {json: res};
    });
    
    //Reflections endpoint to query for single element or post new entry
    RESTstop.add('reflection/:id?', {method: ['GET', 'POST'], require_login: false }, function() {
        this.response.setHeader('Access-Control-Allow-Origin', '*');
        
        if(this.request.method == 'GET'){    
            if(this.params.id){
                var res = Reflections.findOne({_id: this.params.id});
                if(res){ return res; }
                else{ return [404, {success: false, message: "No item with this Id in database"}]; }
            
            } else { return [400, {success: false, message: "No item Id specified"}]; }

        } else if(this.request.method == 'POST'){
            //console.log(this.request);
            //check for right call format
            if(this.params.id){
                return [400, {success: false, message: "POST does not accept item Id"}];
            
            } else{ //All is right 
                 //Validate reflection object
                if(this.request.body 
                   && this.request.body.hasOwnProperty('body') 
                   && this.request.body.hasOwnProperty('direction') 
                   && this.request.body.hasOwnProperty('date')){
                        
                    var newPost = {
                        date: new Date(this.request.body.date), 
                        body: this.request.body.body, 
                        direction: parseInt(this.request.body.direction), 
                        tags: genTags(this.request.body.body)
                        }
            
                    //Create new item and get id; because no callback is provided on insert, the call is blocking on server
                    var postId = Reflections.insert(newPost); 
                    
                    //After call if postId successful return success and id for client; else throw error 
                    //In addition generate callback for creating a new tag in Tags collection
                    if(postId) {
                        Meteor.call('insertTag', Reflections.findOne({_id: postId}));
                        return [201, {success: true, message: "object inserted", id:postId}];
                    } else{ return [500, {success: false, message: "Server Error on Insert; Contact Service"}]; }
    
                } else{  //Not a valid reflection pobject
                    return [406, {success: false, message: "Not a valid reflection object; needs direction, body, date."}];
                }
            }
            
        } else { return [403, {success: false, message: "Not a valid REST method for this API. Use GET or POST"}]; }
        
    });
 });

var genTags = function(text){
    if (typeof text !== "string") return [];
    text = text.toLowerCase();

    var pattern = /#\w+/g;
    return text.match(pattern);
}


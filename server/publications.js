Meteor.publish('reflections', function(){
    return Reflections.find({user: this.userId});
});

Meteor.publish('tags', function(){
    return Tags.find({user: this.userId});
});
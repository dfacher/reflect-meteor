Meteor.publish('reflections', function(){
    return Reflections.find();
});

Meteor.publish('tags', function(){
    return Tags.find();
});
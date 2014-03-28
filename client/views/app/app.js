/*

*/


//////////////////// Data & Stores ////////////////////

Meteor.startup(function () {
 
});

Meteor.subscribe('reflections');
Meteor.subscribe('tags');

//////////////////// Session setters ////////////////////
Session.set('isChangeDate', false);

// Sort options
Session.set('sort_options', {date: -1, direction: -1});
Session.set('filters', {});
Session.set('tags', []);
Session.set('editing', null);


//////////////////// Helpers ///////////////////////////
Template.selectedTags.helpers({
    // display string of tag for each tag loop in handlebars
    displayTag: function(){
        return this.toString();
    },
    
    tags: function(){
        return Session.get('tags');
    }

});

Template.newNote.helpers({
    isChangeDate: function(){
        return Session.get('isChangeDate');
    },
    
    currentDate: function(){
        return moment(new Date()).format("MMMM DD");
    }

});


Template.noteList.helpers({
    reflection: function(){
        return Reflections.find(Session.get('filters'), {sort: Session.get('sort_options')});
    }

});


Template.reflectionElement.helpers({
    // convert text of datepicker into Date object
    dateText: function(date){
        return moment(date).format("MMMM DD, YYYY");
    },
    
    // convert into of direction into output text
    directionText: function(direction){
        if (direction === 1) return "positive";
        else if (direction === -1) return "negative";
        return "";
    },
    
    // display string of tag for each tag loop in handlebars
    displayTag: function(){
        return this.toString();
    },

    // check for editing of current element
    editing: function(){
        return this._id === Session.get('editing');
    }
});

//////////////////// Event Handlers ////////////////////
Template.header.events({    
    'submit form': function(e, tmpl) {
        e.preventDefault();
        var str = $(e.target).find('[name=searchString]').val();
        var query = Session.get('filters');
        
        if(str === ""){
            delete query['body'];
        }
        else{
            query['body'] = {$regex: str, $options: 'i'};
        }
        Session.set('filters', query);
        
    }
});

Template.selectedTags.events({
    'click .tag': function (e) {
        //delete tag from tags array (deselect)
        var tags = Session.get('tags');
        tags = _.without(tags, this.toString());
        
        
        //update session variable for holding tags
        Session.set('tags', tags);
        
        //update search query for selected tags
        var query = Session.get('filters');
        if(tags.length < 1){
            delete query['tags'];
        }
        else{
            query['tags'] = {$all: tags};
        }
        Session.set('filters', query);
        
  }
});



Template.newNote.events({
    'click #changeDateLink': function (e) {
        e.preventDefault();
        Session.set('isChangeDate', true);
  },
    
    'submit form': function(e, tmpl) {
        e.preventDefault();
        
        var date;
        var body = $(e.target).find('[name=textBody]').val();
        var direction = parseInt($(e.target).find('[name=options]:checked').val());
        if (!Session.get('isChangeDate')){
            date = moment().toDate();
        }
        
        else {
            var dateString = $(e.target).find('[name=date]').val();
            try {
                date = moment(dateString).toDate();
            }
            catch(e) {
                date = moment().toDate();
                }
            Session.set('isChangeDate', false);
        }
        
        var tags = genTags(body);
        
        Reflections.insert({date: date, body: body, direction: direction, tags: tags}, 
                           function(error, idd){
                                if(idd) {
                                    insertedItem = Reflections.findOne({_id: idd});
                                    Meteor.call('insertTag', insertedItem);
                                    //return insertedItem;
                                }
                                else {
                                    console.log('error on insert');
                                    insertedItem = null;
                                }
                           });
    }

});


Template.reflectionElement.events({
    'click .tag': function (e) {
        //manage array of currently selected tags
        var tags = Session.get('tags');
        if(_.indexOf(tags, this.toString()) === -1){
            tags.push(this.toString());
        }
        
        //update session variable for holding tags
        Session.set('tags', tags);
        
        //update search query for selected tags
        var query = Session.get('filters');
        query['tags'] = {$all: tags};
        Session.set('filters', query);
  },
    
    'click #removeReflection': function (e) {
      e.preventDefault();
      Reflections.remove(this._id);
  },

    'click #editReflection': function (e) {
        e.preventDefault();
        Session.set('editing', this._id);
    },

    // Update database element: Find current element, replace body, insert again
    'submit form': function(e, tmpl) {
        e.preventDefault();
        var newBodyText = $(e.target).find('[name=updatedBodyText]').val();

        Reflections.update({_id: Session.get('editing')},
                           {$set: {body: newBodyText, tags: genTags(newBodyText)}});
        Session.set('editing', null);
    }
});

//////////////////// Others ////////////////////////////

var genTags = function(text){
    if (typeof text !== "string") return [];
    text = text.toLowerCase();
    
    var pattern = /#\w+/g;
    return text.match(pattern);
}

var buildFilterQuery = function() {
    var query = {};
    
}
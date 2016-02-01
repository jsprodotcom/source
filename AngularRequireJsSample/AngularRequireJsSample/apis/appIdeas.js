var _ = require('underscore');

var appIdeasArr=[{
    id:1,
    name:'Todo List',
    description:'Maintains the list of tasks that you need to perform today with their current status',
    technologies:'HTML, CSS, JavaScript, PhoneGap',
    platform:'iOS, Android, Windows Phone 8',
    contactMailId:'todolist@ideadumper.com',
    status:'Under Development',
    devsNeeded:2,
    comments:[{name:'Rick',message:'Can I join in?'},
        {name:'Mark',message:'Enjoying working with this team!'},
        {name:'Lakshmi',message:'Why another todo list app?'}]
},
    {
        id:2,
        name:'Appointment Notifier',
        description:'Have lots of meetings/appointments at your work? We make it easier to manage them.',
        technologies:'Java',
        platform:'Android',
        contactMailId:'appointment_notifier@ideadumper.com',
        status:'Yet to start',
        devsNeeded:10,
        comments:[{name:'Rick',message:'Great idea'},
            {name:'Daniel',message:'I am learning Android development now. Can I join in?'}]
    },
    {
        id:3,
        name:'Nutrition tracker',
        description:'Manage your calorie and protein consumption',
        technologies:'PhoneGap',
        platform:'Cross Platform',
        contactMailId:'nutrition_tracker@ideadumper.com',
        status:'In Progress',
        devsNeeded:0,
        comments:[{name:'James',message:'I need this app'},
            {name:'Carl',message:'Enjoying working with this team!'}]
    },
    {
        id:4,
        name:'Run4Health',
        description:'Run daily? Manage your data without entering even a single digit!',
        technologies:'Objective C',
        platform:'iOS',
        contactMailId:'run4health@ideadumper.com',
        status:'Completed',
        devsNeeded:0,
        comments:[{name:'John',message:'Started using it last week and it is nice so far'},
            {name:'Jessica',message:'I am running because of this app. Thanks!'}
            ]
    },
    {
        id:5,
        name:'Daily Expenses',
        description:'Finding hard to keep up with your spendings? We make it easier for you!',
        technologies:'PhoneGap',
        platform:'Cross Platform',
        contactMailId:'daily_expenses@ideadumper.com',
        status:'In Progress',
        devsNeeded:3,
        comments:[{name:'Rich',message:'I need this app'},
            {name:'Sean',message:'I just joined this team and it is awesome so far!'},
            {name:'Ken',message:'I would like to join this project'}]
    }];

exports.allIdeas = function(){
    return appIdeasArr;
};

exports.getIdea = function(id) {
    var idea = _.find(appIdeasArr, function (item) {
        return item.id == id
    });
    return idea;
};
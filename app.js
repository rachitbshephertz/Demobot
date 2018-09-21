/*-----------------------------------------------------------------------------
A simple Language Understanding (LUIS) bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var user1 = 'rachit';
var user2 = 'nitesh';
var pass1 = 'qwerty';
var pass2 = 'qwerty';
var UserName = 'user';
var validUser = false;
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user.
// This default message handler is invoked if the user's utterance doesn't
// match any intents handled by other dialogs.
var bot = new builder.UniversalBot(connector, function (session, args) {
   
    if (session.message && session.message.value) {
        console.log(session.message.value);
        if(session.message.value.type==="Leaves"){
        if (session.message.value.USERNAME === user1 && session.message.value.PASSWORD === pass1){
        validUser = true;
        UserName = session.message.value.USERNAME;
        session.send('Sure %s!! I see you have total 21 leaves left. Here is the breakup:- <br /> Casual: 6 <br /> Earned: 12 <br /> Sick: 3.', session.message.value.USERNAME);
        session.endDialog();    
        }else if (session.message.value.USERNAME === user2 && session.message.value.PASSWORD === pass2){
        validUser = true;
        UserName = session.message.value.USERNAME;
        session.send('Sure %s. I see you have total 15 leaves left. Here is the breakup:- <br /> Casual: 6 <br /> Earned: 7 <br /> Sick: 2.', session.message.value.USERNAME);
        session.endDialog();    
        }else{
        session.send('I cant log you in. Either Username or Password is invalid. Please try again.');
        session.send('Psss. Dont tell them i told you but try USERNAME as rachit and PASSWORD as qwerty.');
        session.beginDialog('HIMSLeaveStatusDialog');
       
        } 
            
        }
       
        if(session.message.value.type==="authenticate"){
        if (session.message.value.USERNAME === 'rachit' && session.message.value.PASSWORD === pass1){
        validUser = true;
        UserName = session.message.value.USERNAME;
        session.send('Hello %s!! You have been succesfully logged in.', session.message.value.USERNAME);
        session.endDialog();    
        }else if (session.message.value.USERNAME === 'nitesh' && session.message.value.PASSWORD === pass2){
        validUser = true;
        UserName = session.message.value.USERNAME;
        session.send('Hello %s!! You have been succesfully logged in.', session.message.value.USERNAME);
        session.endDialog();    
        }else{
        session.send('I cant log you in. Either Username or Password is invalid. Please try again.');
        session.send('Psss. Dont tell them i told you but try USERNAME as rachit and PASSWORD as %s.', pass1);
        session.beginDialog('HIMSLogin');
        }    
        }
        
        if(session.message.value.type==="UpdateLogin"){
        if (session.message.value.USERNAME === 'rachit' && session.message.value.PASSWORD === pass1){
        validUser = true;
        UserName = session.message.value.USERNAME;
        session.send('Hello %s!! You have been succesfully logged in. Please uodate your password.', session.message.value.USERNAME);
        session.beginDialog('HIMSChangePasswordDialog');    
        }else if (session.message.value.USERNAME === 'nitesh' && session.message.value.PASSWORD === pass2){
        validUser = true;
        UserName = session.message.value.USERNAME;
        session.send('Hello %s!! You have been succesfully logged in. Please update your password.', session.message.value.USERNAME);
        session.beginDialog('HIMSChangePasswordDialog');    
        }else{
        session.send('I cant log you in. Either Username or Password is invalid.!!!!!!!! Please try again.');
        session.send('Psss. Dont tell them i told you but try USERNAME as rachit and PASSWORD as qwerty.');
        session.beginDialog('HIMSChangePasswordDialog'); 
        }    
        }
        
        if(session.message.value.type==="UpdatePassword"){
        if(session.message.value.PASSWORD1===session.message.value.PASSWORD2){
        if (UserName === 'rachit'){
        validUser = false;
        session.send('Hey %s!!, I have successfully updated your password. Please login again.', UserName);
        pass1 = session.message.value.PASSWORD1;
        session.beginDialog('HIMSLogin');    
        }else if (UserName === 'nitesh'){
        validUser = false;
        pass2 = session.message.value.PASSWORD1;
        session.send('Hey %s!!, I have successfully updated your password. Please login again.', UserName);
        session.beginDialog('HIMSLogin');    
        }else{
        session.send('I cant update your Password. Please try again.');
        session.beginDialog('HIMSChangePasswordDialog');
        }
        }else{
             session.send('Oops!! Password mismatch. Please try again.');
             session.beginDialog('HIMSChangePasswordDialog');
        }    
        }
    }else{
        session.send("Hey! I didnt understand that. But, You can ask me to do things like  leave status, update account password or tell me a little about yourself.");
    }
   // If the object for storing notes in session.userData doesn't exist yet, initialize it
   if (!session.userData.notes) {
       session.userData.notes = {};
       console.log("initializing userData.notes in default message handler");
   }
   
  
});



bot.set('storage', tableStorage);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, 'welcome');
            }
        });
    }
});


bot.dialog("welcome", [
    function (session) {
        var msg = `Namste InfrasSoft!. I am a HR chatbot. I can do many things with the power vested in me by my creator Rachit`;
        validUser = false; 
        session.send(msg);  
    },
    function (session, results) {
        var msg = "Thank you. Have a nice day!";
        //mongoUtil.insertMessageJson(msg, chatbot, session);
        session.send(msg);
        session.endConversation();
        session.endDialog();
    }
]);
// Add a dialog for each intent that the LUIS app recognizes.
// See https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-recognize-intent-luis 
bot.dialog('GreetingDialog',
    (session) => {
        session.send('Hey! Welcome to HMEL India. I am HRari and I am your personal HR assistant.');
        session.endDialog();
    }
).triggerAction({
    matches: 'Greeting'
})

bot.dialog('HIMSWHATYOUDODIALOG',
    (session) => {
        session.send('You can ask me to do things like, check my leave status, update account password or tell me a little about yourself.');
        session.endDialog();
    }
).triggerAction({
    matches: 'HIMS.WHATYOUDO'
})

bot.dialog('HIMSWHOYOUDIALOG',
    (session) => {
        session.send('Long story short I am a chatbot.');
        session.endDialog();
    }
).triggerAction({
    matches: 'HIMS.WHOYOU'
})


bot.dialog('OKAYDialog',
    (session) => {
        session.send('Hey, i am always happy to help.');
        session.endDialog();
    }
).triggerAction({
    matches: 'OKAY'
})


bot.dialog('HIMSChangePasswordDialog', function(session) {
   if(!validUser){
    var adaptiveCardMessage = new builder.Message(session)
    .addAttachment({
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'version': '1.0',
            'body': [
                {
                    'type': 'Container',
                    'speak': '<s>Hello user!</s><s>You need to login!</s>',
                    'items': [
                        {
                            'type': 'ColumnSet',
                            'columns': [
                                {
                                    'type': 'Column',
                                    'size': 'auto',
                                    'items': [
                                        {
                                            'type': 'Image',
                                            'url': 'https://placeholdit.imgix.net/~text?txtsize=65&txt=Adaptive+Cards&w=300&h=300',
                                            'size': 'medium',
                                            'style': 'person'
                                        }
                                    ]
                                },
                                {
                                    'type': 'Column',
                                    'size': 'stretch',
                                    'items': [
                                      
                                        {
                                            'type': 'TextBlock',
                                            'text': 'You need to login.',
                                            'weight': 'bolder',
                                            'wrap': true
                                        },
                                        {
                                             'type': 'Input.Text',
                                             'id': 'USERNAME',
                                             'speak': '<s>Please enter your username</s>',
                                             'placeholder': 'username',
                                             'style': 'text'
                                        },
                                        {
                                              'type': 'Input.Text',
                                              'id': 'PASSWORD',
                                              'speak': '<s>Please enter your password</s>',
                                              'placeholder': 'password',
                                               'style': 'password'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            'actions': [{
                                'type': 'Action.Submit',
                                'title': 'LOGIN',
                                'speak': '<s>login</s>',
                                'data': {
                                    'type': 'UpdateLogin'
                                }
            }]
        }
    });
    session.send(adaptiveCardMessage);
    session.endDialog();
   }
   else{
        
       var adaptiveCardMessage = new builder.Message(session)
    .addAttachment({
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'version': '1.0',
            'body': [
                {
                    'type': 'Container',
                    'speak': '<s>Hello user!</s><s>You need to login!</s>',
                    'items': [
                        {
                            'type': 'ColumnSet',
                            'columns': [
                                {
                                    'type': 'Column',
                                    'size': 'auto',
                                    'items': [
                                        {
                                            'type': 'Image',
                                            'url': 'https://placeholdit.imgix.net/~text?txtsize=65&txt=Adaptive+Cards&w=300&h=300',
                                            'size': 'medium',
                                            'style': 'person'
                                        }
                                    ]
                                },
                                {
                                    'type': 'Column',
                                    'size': 'stretch',
                                    'items': [
                                        {
                                            'type': 'TextBlock',
                                            'text': 'Hello ' + UserName,
                                            'weight': 'bolder',
                                            'isSubtle': true
                                        },
                                        {
                                            'type': 'TextBlock',
                                            'text': 'You need to update your password.',
                                            'wrap': true
                                        },
                                        {
                                             'type': 'Input.Text',
                                             'id': 'PASSWORD1',
                                             'speak': '<s>Please enter your password</s>',
                                             'placeholder': 'Password',
                                             'style': 'text'
                                        },
                                        {
                                              'type': 'Input.Text',
                                              'id': 'PASSWORD2',
                                              'speak': '<s>Please confirm your password</s>',
                                              'placeholder': ' Confirm password',
                                               'style': 'password'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            'actions': [{
                                'type': 'Action.Submit',
                                'title': 'UPDATE',
                                'speak': '<s>login</s>',
                                'data': {
                                    'type': 'UpdatePassword'
                                }
            }]
        }
    });
    session.send(adaptiveCardMessage);
    session.endDialog();
              
         
   }
}).triggerAction({ 
    matches: 'HIMS.ChangePassword',
    confirmPrompt: "This will log you out. Are you sure?" 
}).cancelAction('cancelCreateNote', "Note canceled.", {
    matches: /^(cancel|nevermind)/i,
    confirmPrompt: "Are you sure?"
});

bot.dialog('HIMSLogin', function(session) {
    if(!validUser){
    var adaptiveCardMessage = new builder.Message(session)
    .addAttachment({
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'version': '1.0',
            'body': [
                {
                    'type': 'Container',
                    'speak': '<s>Hello user!</s><s>You need to login!</s>',
                    'items': [
                        {
                            'type': 'ColumnSet',
                            'columns': [
                                {
                                    'type': 'Column',
                                    'size': 'auto',
                                    'items': [
                                        {
                                            'type': 'Image',
                                            'url': 'https://placeholdit.imgix.net/~text?txtsize=65&txt=Adaptive+Cards&w=300&h=300',
                                            'size': 'medium',
                                            'style': 'person'
                                        }
                                    ]
                                },
                                {
                                    'type': 'Column',
                                    'size': 'stretch',
                                    'items': [
                                       
                                        {
                                            'type': 'TextBlock',
                                            'text': 'You need to login.',
                                            'weight': 'bolder',
                                            'wrap': true
                                        },
                                        {
                                             'type': 'Input.Text',
                                             'id': 'USERNAME',
                                             'speak': '<s>Please enter your username</s>',
                                             'placeholder': 'username',
                                             'style': 'text'
                                        },
                                        {
                                              'type': 'Input.Text',
                                              'id': 'PASSWORD',
                                              'speak': '<s>Please enter your password</s>',
                                              'placeholder': 'password',
                                               'style': 'password'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            'actions': [{
                                'type': 'Action.Submit',
                                'title': 'LOGIN',
                                'speak': '<s>login</s>',
                                'data': {
                                    'type': 'authenticate'
                                }
            }]
        }
    });
    session.send(adaptiveCardMessage);
    session.endDialog();
    }else{
    session.send("you are already logged in as %s. ",UserName);
    session.endDialog();
    }
}).triggerAction({ 
    matches: 'HIMS.Login',
    confirmPrompt: "This will cancel the creation of the note you started. Are you sure?" 
}).cancelAction('cancelCreateNote', "Note canceled.", {
    matches: /^(cancel|nevermind)/i,
    confirmPrompt: "Are you sure?"
});

bot.dialog('HIMSLogout',
    (session) => {
        if(validUser){
        validUser = false;
        session.send('Goodbye %s. You have been succesfully logged out.', UserName);
        session.endDialog();
        }else{
        session.send('You have not logged in yet', UserName);
        session.endDialog();
        }
    }
).triggerAction({ 
    matches: 'HIMS.Logout',
    confirmPrompt: "This will cancel the creation of the note you started. Are you sure?" 
}).cancelAction('cancelCreateNote', "Note canceled.", {
    matches: /^(cancel|nevermind)/i,
    confirmPrompt: "Are you sure?"
});

bot.dialog('HIMSLeaveStatusDialog', function(session) {
   if(!validUser){
    var adaptiveCardMessage = new builder.Message(session)
    .addAttachment({
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'version': '1.0',
            'body': [
                {
                    'type': 'Container',
                    'speak': '<s>Hello user!</s><s>You need to login!</s>',
                    'items': [
                        {
                            'type': 'ColumnSet',
                            'columns': [
                                {
                                    'type': 'Column',
                                    'size': 'auto',
                                    'items': [
                                        {
                                            'type': 'Image',
                                            'url': 'https://placeholdit.imgix.net/~text?txtsize=65&txt=Adaptive+Cards&w=300&h=300',
                                            'size': 'medium',
                                            'style': 'person'
                                        }
                                    ]
                                },
                                {
                                    'type': 'Column',
                                    'size': 'stretch',
                                    'items': [
                                       
                                        {
                                            'type': 'TextBlock',
                                            'text': 'You need to login.',
                                            'weight': 'bolder',
                                            'wrap': true
                                        },
                                        {
                                             'type': 'Input.Text',
                                             'id': 'USERNAME',
                                             'speak': '<s>Please enter your username</s>',
                                             'placeholder': 'username',
                                             'style': 'text'
                                        },
                                        {
                                              'type': 'Input.Text',
                                              'id': 'PASSWORD',
                                              'speak': '<s>Please enter your password</s>',
                                              'placeholder': 'password',
                                               'style': 'password'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            'actions': [{
                                'type': 'Action.Submit',
                                'title': 'LOGIN',
                                'speak': '<s>login</s>',
                                'data': {
                                    'type': 'Leaves'
                                }
            }]
        }
    });
    session.send(adaptiveCardMessage);
    session.endDialog();
   }
   else{
        if (UserName ==='rachit'){
        session.send('Sure %s!! I see you have total 21 leaves left. Here is the breakup:- <br /> Casual: 6 <br /> Earned: 12 <br /> Sick: 3.', UserName);
        session.endDialog();}
        else if (UserName ==='nitesh'){
        session.send('Sure %s. I see you have total 15 leaves left. Here is the breakup:- <br /> Casual: 6 <br /> Earned: 7 <br /> Sick: 2.', UserName);
        session.endDialog();}
        else {
        session.send('Sorry. But i cant seem to find your records.');
        session.endDialog();
        }
         
   }
}).triggerAction({ 
    matches: 'HIMS.LeaveStatus',
    confirmPrompt: "This will cancel the creation of the note you started. Are you sure?" 
}).cancelAction('cancelCreateNote', "Note canceled.", {
    matches: /^(cancel|nevermind)/i,
    confirmPrompt: "Are you sure?"
});

bot.dialog('CancelDialog',
    (session) => {
        session.send('Alrighty.');
        session.endDialog();
    }
).triggerAction({
    matches: 'Cancel'
})

